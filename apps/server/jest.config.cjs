module.exports = {
    displayName: 'server',
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    moduleNameMapper: {
        '^@balance/dto/auth$': '<rootDir>/../../libs/dto/src/lib/auth/index.ts',
        '^@balance/dto/users$': '<rootDir>/../../libs/dto/src/lib/users/index.ts',
        '^@balance/dto/accounts$': '<rootDir>/../../libs/dto/src/lib/accounts/index.ts',
        '^@balance/dto/categories$': '<rootDir>/../../libs/dto/src/lib/categories/index.ts',
        '^@balance/dto/transactions$': '<rootDir>/../../libs/dto/src/lib/transactions/index.ts',
        '^@balance/dto/common$': '<rootDir>/../../libs/dto/src/lib/common/index.ts',
        '^@balance/dto/currencies$': '<rootDir>/../../libs/dto/src/lib/currencies/index.ts',
        '^@balance/domain/money$': '<rootDir>/../../libs/domain/src/lib/money/index.ts',
        '^@balance/domain/currency$': '<rootDir>/../../libs/domain/src/lib/currency/index.ts',
        '^@balance/domain/duration$': '<rootDir>/../../libs/domain/src/lib/duration/index.ts',
    },
    maxWorkers: 1,
};
