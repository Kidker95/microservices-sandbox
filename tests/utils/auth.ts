import { UserRole } from "@ms/common";
import type { AuthContext } from "@ms/common";

type PartialAuth = Partial<AuthContext>;

export const makeAuthContext = (
    role: UserRole,
    overrides: PartialAuth = {}
): AuthContext => ({
    _id: "507f1f77bcf86cd799439011",
    email: "user@example.com",
    role,
    ...overrides
});
