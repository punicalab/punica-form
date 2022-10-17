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
  coverageReporters: ['clover', 'json', 'lcov', ['text', { skipFull: true }]]
};
