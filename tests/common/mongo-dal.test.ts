jest.mock("mongoose", () => ({
    __esModule: true,
    default: {
        connect: jest.fn(),
        disconnect: jest.fn()
    }
}));

import mongoose from "mongoose";
import { createMongoDal } from "@ms/common";
import { ServiceUnavailableError } from "@ms/common";

describe("mongo-dal", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("connect calls mongoose.connect", async () => {
        const connectMock = mongoose.connect as unknown as jest.Mock;
        connectMock.mockResolvedValueOnce(undefined);

        const dal = createMongoDal({ serviceName: "svc", mongoUri: "mongodb://does-not-exist.local/test" });
        await dal.connect();

        expect(connectMock).toHaveBeenCalledWith("mongodb://does-not-exist.local/test");
    });

    test("connect wraps errors as ServiceUnavailableError", async () => {
        const connectMock = mongoose.connect as unknown as jest.Mock;
        connectMock.mockRejectedValueOnce(new Error("boom"));

        const dal = createMongoDal({ serviceName: "svc", mongoUri: "mongodb://does-not-exist.local/test" });
        await expect(dal.connect()).rejects.toBeInstanceOf(ServiceUnavailableError);
    });

    test("disconnect calls mongoose.disconnect", async () => {
        const disconnectMock = mongoose.disconnect as unknown as jest.Mock;
        disconnectMock.mockResolvedValueOnce(undefined);

        const dal = createMongoDal({ serviceName: "svc", mongoUri: "mongodb://does-not-exist.local/test" });
        await dal.disconnect();

        expect(disconnectMock).toHaveBeenCalled();
    });
});
