module.exports = {
    displayName: 'api',
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    moduleNameMapper: {
        '^@balance/contracts/auth$': '<rootDir>/../../libs/contracts/src/lib/auth/index.ts',
        '^@balance/contracts/users$': '<rootDir>/../../libs/contracts/src/lib/users/index.ts',
        '^@balance/contracts/common$': '<rootDir>/../../libs/contracts/src/lib/common/index.ts',
        '^@balance/contracts/currencies$': '<rootDir>/../../libs/contracts/src/lib/currencies/index.ts',
        '^@balance/domain/money$': '<rootDir>/../../libs/domain/src/lib/money/index.ts',
        '^@balance/domain/currency$': '<rootDir>/../../libs/domain/src/lib/currency/index.ts',
        '^@balance/domain/duration$': '<rootDir>/../../libs/domain/src/lib/duration/index.ts',
    },
    maxWorkers: 1,
};
