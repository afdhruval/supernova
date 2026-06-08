export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/db/**',
    '!src/app.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 120000,
};
