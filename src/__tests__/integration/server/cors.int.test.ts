import supertest from 'supertest';
import { app } from '../../../../jest/setup-integration-tests';

const VITE_ORIGIN = 'http://localhost:5173';

describe('when a browser sends a CORS preflight for search', () => {
  it('should respond 204 with Access-Control-Allow-Origin', async () => {
    const response = await supertest(app.app)
      .options('/search')
      .set('Origin', VITE_ORIGIN)
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'accept');

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(VITE_ORIGIN);
    expect(response.headers['cross-origin-resource-policy']).toBe(
      'cross-origin',
    );
  });
});

describe('when a browser GETs search with Origin', () => {
  it('should include Access-Control-Allow-Origin on the response', async () => {
    const response = await supertest(app.app)
      .get('/search')
      .set('Origin', VITE_ORIGIN)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe(VITE_ORIGIN);
    expect(response.headers['cross-origin-resource-policy']).toBe(
      'cross-origin',
    );
  });
});
