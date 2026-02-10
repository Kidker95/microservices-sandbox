import { BadRequestError } from "@ms/common/errors";
import { isMongoObjectId, assertMongoObjectId } from "@ms/common/http";

describe("isMongoObjectId", () => {
    test("returns true for valid 24-char hex", () => {
        expect(isMongoObjectId("507f1f77bcf86cd799439011")).toBe(true);
        expect(isMongoObjectId("abcdef0123456789abcdef01")).toBe(true);
        expect(isMongoObjectId("ABCDEF0123456789ABCDEF01")).toBe(true);
    });

    test("returns false for invalid values", () => {
        expect(isMongoObjectId("")).toBe(false);
        expect(isMongoObjectId("short")).toBe(false);
        expect(isMongoObjectId("507f1f77bcf86cd7994390112")).toBe(false); // 25 chars
        expect(isMongoObjectId("507f1f77bcf86cd79943901g")).toBe(false); // non-hex
        expect(isMongoObjectId(null as any)).toBe(false);
        expect(isMongoObjectId(undefined as any)).toBe(false);
    });
});

describe("assertMongoObjectId", () => {
    test("does not throw for valid id", () => {
        expect(() => assertMongoObjectId("507f1f77bcf86cd799439011")).not.toThrow();
    });

    test("throws BadRequestError for invalid id", () => {
        expect(() => assertMongoObjectId("bad")).toThrow(BadRequestError);
        expect(() => assertMongoObjectId("bad")).toThrow(/Invalid id/);
    });

    test("uses custom field name in error message", () => {
        expect(() => assertMongoObjectId("bad", "_id")).toThrow(/Invalid _id/);
    });
});
