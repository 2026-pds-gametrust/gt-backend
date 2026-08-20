import express, {
  Request,
  Response,
  Application,
  NextFunction,
  RequestHandler,
} from 'express';
import { ContextAsyncHooks, Logger } from 'traceability';
import { Server as httpServer } from 'http';
import { IController } from './interfaces/IController';
import mongoose from 'mongoose';
import * as OpenApiValidator from 'express-openapi-validator';
import cors from 'cors';
import helmet from 'helmet';
import { HttpError } from 'express-openapi-validator/dist/framework/types';
import { EErrorCode } from '../common/errors/enums/EErrorCode';

export class Server {
  public app: Application;

  public port: number;

  public apiSpecLocation?: string;

  public DATABASE_URI?: string;

  private readonly timeoutMilliseconds?: number;

  private readonly originAllowed: string[] | RegExp[];

  private readonly corsWithCredentials: boolean;

  constructor(appInit: {
    port: number;
    originAllowed?: string[] | RegExp[];
    corsWithCredentials?: boolean;
    middlewaresToStart?: Array<RequestHandler>;
    controllers?: Array<IController>;
    apiSpecLocation?: string;
    databaseURI?: string;
    customizers?: Array<
      (application: Application, fileDestination: string) => void
    >;
    timeoutMilliseconds?: number;
  }) {
    this.app = express();
    this.port = appInit.port;
    this.apiSpecLocation = appInit.apiSpecLocation;
    this.DATABASE_URI = appInit.databaseURI;
    this.timeoutMilliseconds = appInit.timeoutMilliseconds;
    this.originAllowed = appInit.originAllowed ?? [];
    this.corsWithCredentials = appInit.corsWithCredentials ?? false;

    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'OK' });
    });

    this.middlewares([
      ...this.buildStartMiddlewares(),
      ...(appInit.middlewaresToStart || []),
    ]);

    this.routes(appInit.controllers || []);

    this.customizers();
  }

  private buildStartMiddlewares(): RequestHandler[] {
    return [
      express.json({ limit: '3mb' }),
      express.urlencoded({ limit: '3mb', extended: true }),
      ContextAsyncHooks.getExpressMiddlewareTracking(),
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
      cors({
        origin: this.originAllowed.length > 0 ? this.originAllowed : false,
        credentials: this.corsWithCredentials,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
        optionsSuccessStatus: 204,
      }),
    ];
  }

  private middlewares(middleWares: Array<RequestHandler>) {
    middleWares.forEach((middleWare) => this.app.use(middleWare));
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: this.apiSpecLocation || '',
        validateApiSpec: true,
        validateResponses: true,
        validateSecurity: false,
      }),
    );
  }
  private customizers() {
    this.app.use(
      (err: Error, _req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof HttpError) {
          if (err.status === 500) {
            const validationErrors = Array.isArray(err.errors)
              ? err.errors.map((item) => ({
                  path: item.path,
                  message: item.message,
                  errorCode: item.error_code,
                }))
              : undefined;
            Logger.error(
              JSON.stringify({
                eventName: 'openapi.validator.error',
                status: err.status,
                method: _req.method,
                path: _req.path,
                errors: validationErrors,
              }),
            );
            res.status(500).json({ message: 'Internal Server Error' });
            return;
          }
          if (err.status === 401) {
            res.status(401).json({
              error: 'Unauthorized. Send a valid Bearer token.',
              code: EErrorCode.AUTH_UNAUTHORIZED,
            });
            return;
          }
          res.status(err.status || 400).json({
            error: 'Invalid request',
            code:
              err.status === 404
                ? EErrorCode.RESOURCE_NOT_FOUND
                : EErrorCode.FIELD_INVALID,
          });
          return;
        }
        if (err instanceof Error) {
          Logger.error(
            JSON.stringify({
              eventName: 'server.error',
              message: err.message,
              stack: err.stack,
            }),
          );
        }
        res.status(500).json({
          message: 'Internal Server Error',
        });
      },
    );
  }

  private routes(controllers: Array<IController>, pathRoute = '/') {
    controllers.forEach((controller) =>
      this.app.use(pathRoute, controller.getRoutes()),
    );
  }

  public async databaseSetup() {
    if (!this.DATABASE_URI) {
      Logger.error('Database URI not provided');
      return;
    }
    mongoose.connection.once('connected', () => {
      Logger.info('connect to MongoDB ');
    });
    mongoose.connection?.on('error', (err) => {
      Logger.info(`error to connect - MongoDB: Error: ${err.message}`);
    });
    await mongoose.connect(this.DATABASE_URI);
  }

  public async closeDatabase() {
    mongoose.connection.once('disconnected', () => {
      Logger.info(`Mongoose disconnected`);
    });
    await mongoose.disconnect();
  }

  public listen(): httpServer {
    return this.app
      .listen(this.port, () => {
        Logger.info(`App listening on the http://localhost:${this.port}`, {
          eventName: 'start_listening',
          process: 'Application',
        });
      })
      .setTimeout(this.timeoutMilliseconds || 30000);
  }
}
