module.exports = {
  roots: ['<rootDir>/packages'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  testEnvironment: 'jsdom',
  testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  clearMocks: true,
  setupFiles: ['<rootDir>jest/jest-setup-file.ts'],
  collectCoverage: true,
  coverageReporters: ['lcov', 'text-summary', 'text', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  coveragePathIgnorePatterns: ['/node_modules/']
};
