module.exports = {
  testRegex: '(/__tests__/.*|(\\.|/)(spec|test))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  coverageReporters: ['html', 'text-summary'],
};

