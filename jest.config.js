// Every test runs twice: with the legacy decorators of TypeScript
// (experimentalDecorators) and with the standard ones.
const project = (displayName, tsconfig) => ({
  displayName,
  roots: ['<rootDir>/packages'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig }]
  },
  testEnvironment: 'jsdom',
  testRegex: '/__test__/.*\\.test\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^@punica/form$': '<rootDir>/packages/form/lib',
    '^@punica/form-service$': '<rootDir>/packages/service/lib',
    '^@punica/form-react$': '<rootDir>/packages/react/lib',
    '^@punica/form-json$': '<rootDir>/packages/json/lib',
    '^@punica/form-schema$': '<rootDir>/packages/schema/lib',
    '^@punica/form-json/definition$': '<rootDir>/packages/json/lib/definition',
    // The custom elements are not loaded in unit tests
    '^@punica/components/components/.*$':
      '<rootDir>/packages/kit/lib/__test__/elements.ts'
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
