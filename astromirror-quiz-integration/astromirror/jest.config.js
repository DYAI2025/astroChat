/**
 * Jest Configuration for AstroMirror
 * Next.js 14 App Router compatible
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Path to Next.js app
  dir: './',
})

const customJestConfig = {
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Coverage
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!app/**/_*.{js,jsx,ts,tsx}', // Exclude private Next.js files
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
}

module.exports = createJestConfig(customJestConfig)
