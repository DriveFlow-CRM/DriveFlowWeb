/**
 * Jest Configuration for Angular
 * @type {import('jest').Config}
 */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
    '^@store/(.*)$': '<rootDir>/src/app/store/$1',
    '^@models/(.*)$': '<rootDir>/src/app/models/$1'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '.html$',
    '.css$'
  ],
  testMatch: [
    '**/*.spec.ts'
  ],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|@ngrx|rxjs)'
  ],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ],
  testEnvironment: 'jsdom',
  verbose: true,
  // Clear mocks between tests
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.routes.ts',
    '!src/main.ts',
    '!src/app/app.config.ts'
  ]
};
