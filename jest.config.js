/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    globalSetup: "./src/tests/e2e/setup.ts",
    globalTeardown: "./src/tests/e2e/teardown.ts",
    testEnvironment: "node",
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },
};
