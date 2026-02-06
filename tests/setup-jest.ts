jest.setTimeout(10000);

// Silence expected console noise during tests.
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});
