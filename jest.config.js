// Every test runs twice: with the legacy decorators of TypeScript
// (experimentalDecorators) and with the standard ones.
const project = (displayName, tsconfig) => ({
  displayName,
  roots: ['<rootDir>/packages'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig }]
  },
  testEnvironment: 'jsdom',
  testRegex: '/__test__/.*\\.test\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^@punica/form$': '<rootDir>/packages/form/lib',
    '^@punica/form-service$': '<rootDir>/packages/service/lib'
  },
  clearMocks: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/__example__/', '/dist/']
});

module.exports = {
  projects: [
    project('legacy decorators', '<rootDir>/tsconfig.jest.json'),
    project('standard decorators', '<rootDir>/tsconfig.standard.json')
  ],
  collectCoverage: true,
  coverageReporters: ['lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 80,
      lines: 90,
      statements: 88
    }
  }
};
