/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup-jest.ts"],
  modulePathIgnorePatterns: [
    "<rootDir>/packages/ms-common/dist",
    "<rootDir>/services/.*/dist"
  ],
  moduleNameMapper: {
    "^@ms/common$": "<rootDir>/packages/ms-common/src/index.ts",
    "^@ms/common/(.*)$": "<rootDir>/packages/ms-common/src/$1"
  },
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.jest.json" }]
  }
};
