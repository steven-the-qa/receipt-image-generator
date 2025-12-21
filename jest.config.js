/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/test'],
  
  // Look for test files in 'test/jest' that end in '.test.ts(x)' or '.test.js(x)'
  testRegex: '/test/jest/.*\\.test\\.(tsx?|jsx?)$',
  
  // Declare TypeScript files first as recommended
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  
  moduleNameMapper: {
    // CSS modules and static assets
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/test/mocks/fileMock.js',
  },
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/playwright-.*',
    '/test-results/',
    'test/playwright',
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
  ],
  coveragePathIgnorePatterns: [
    'test/',
    'node_modules/',
    'build/',
    'coverage/',
    'public/',
    '.*\\.(css|scss|png|svg|ico|json)$',
    '.*\\.config\\.(js|ts)$',
    '.*\\.d\\.ts$',
  ],
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Enable path alias
  modulePaths: ['<rootDir>'],
  
  // Test run configs
  resetMocks: true, // Reset mocks before every test
  
  // Suppress logs output unless the DEBUG env is set to 'true'
  silent: process.env.JEST_DEBUG === 'true' ? false : true,
  
  errorOnDeprecated: false,
  
  workerIdleMemoryLimit: '1024MB',
  
  verbose: true, // Output detailed list of tests
};
