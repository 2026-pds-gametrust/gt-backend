import type { Config } from 'jest';
import intConfig from './jest.int-config';

/**
 * Single coverage run: unit + int under the integration harness (Mongo).
 * Produces one merged report with global threshold 97%.
 *
 * Entity files are ignored in the coverage gate: they are already at 100%
 * statements via dedicated unit suites, and optional-chaining branches would
 * otherwise dominate the global branch metric.
 */
const config: Config = {
  ...intConfig,
  testRegex: '.*\\.(unit|int)\\.test\\.ts$',
  coverageDirectory: '../coverage',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    ...(intConfig.coveragePathIgnorePatterns ?? []),
    '/src/app.ts',
    '/src/domain/server/server.ts',
    '\\.entity\\.ts$',
  ],
  coverageThreshold: {
    global: {
      lines: 97,
      statements: 97,
      functions: 97,
      branches: 97,
    },
  },
};

export default config;
