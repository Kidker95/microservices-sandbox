import request from "supertest";

const loadFortuneApp = (fortunes: any) => {
    let app: any;
    jest.isolateModules(() => {
        jest.doMock("../../services/fortune-service/src/clients/api-client", () => ({
            apiClient: {
                getRandomFortune: jest.fn().mockResolvedValue(fortunes)
            }
        }));
        ({ app } = require("../../services/fortune-service/src/app-for-test"));
    });
    return { app };
};

describe("fortune-service", () => {
    test("health returns service name", async () => {
        const { app } = loadFortuneApp({ fortune: "ok", author: "x", source: "y", fetchedAt: "now" });
        const res = await request(app).get("/health").expect(200);
        expect(res.body.service).toBe("fortune-service");
    });

    test("returns a fortune", async () => {
        const { app } = loadFortuneApp({ fortune: "Lucky", author: "Anon", source: "test", fetchedAt: "now" });
        const res = await request(app).get("/api/fortune").expect(200);
        expect(res.body.fortune).toBe("Lucky");
    });
});
