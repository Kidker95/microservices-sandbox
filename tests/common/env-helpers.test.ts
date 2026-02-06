import { envHelpers } from "@ms/common";
import { BadRequestError } from "@ms/common";

describe("envHelpers", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test("requireEnv returns value when set", () => {
        process.env.TEST_KEY = "value";
        expect(envHelpers.requireEnv("TEST_KEY")).toBe("value");
    });

    test("requireEnv throws when missing", () => {
        delete process.env.MISSING_KEY;
        expect(() => envHelpers.requireEnv("MISSING_KEY")).toThrow(BadRequestError);
    });

    test("getEnv returns fallback when missing", () => {
        delete process.env.OPTIONAL_KEY;
        expect(envHelpers.getEnv("OPTIONAL_KEY", "fallback")).toBe("fallback");
    });

    test("getNumberEnv returns number and throws on invalid", () => {
        process.env.NUM_KEY = "42";
        expect(envHelpers.getNumberEnv("NUM_KEY")).toBe(42);
        process.env.NUM_KEY = "bad";
        expect(() => envHelpers.getNumberEnv("NUM_KEY")).toThrow(BadRequestError);
    });

    test("getBooleanEnv returns boolean and throws on invalid", () => {
        process.env.BOOL_KEY = "true";
        expect(envHelpers.getBooleanEnv("BOOL_KEY")).toBe(true);
        process.env.BOOL_KEY = "false";
        expect(envHelpers.getBooleanEnv("BOOL_KEY")).toBe(false);
        process.env.BOOL_KEY = "nope";
        expect(() => envHelpers.getBooleanEnv("BOOL_KEY")).toThrow(BadRequestError);
    });

    test("getUrlEnv and requireUrlEnv validate URLs", () => {
        process.env.URL_KEY = "https://example.com";
        expect(envHelpers.getUrlEnv("URL_KEY")).toBe("https://example.com");
        expect(envHelpers.requireUrlEnv("URL_KEY")).toBe("https://example.com");

        process.env.URL_KEY = "not-a-url";
        expect(() => envHelpers.getUrlEnv("URL_KEY")).toThrow(BadRequestError);
        expect(() => envHelpers.requireUrlEnv("URL_KEY")).toThrow(BadRequestError);
    });
});
