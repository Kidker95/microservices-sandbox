import { fetchWithTimeout } from "../http/fetch-with-timeout";
import { ServiceUnavailableError, UnauthorizedError } from "../errors/errors";
import type { AuthContext } from "../types/auth-context";
import { throwForCommonStatuses } from "../http/response-helpers";

export class AuthClient {
  public constructor(
    private readonly authServiceBaseUrl: string,
    private readonly timeoutMs = 5000
  ) {}

  public async verifyToken(token: string): Promise<AuthContext> {
    try {
      const res = await fetchWithTimeout(
        `${this.authServiceBaseUrl}/api/auth/verify`,
        { headers: { Authorization: `Bearer ${token}` } },
        this.timeoutMs
      );

      if (!res.ok) await throwForCommonStatuses(res, "Invalid token");

      return (await res.json()) as AuthContext;
    } catch (err: any) {
      if (err?.name === "AbortError") throw new ServiceUnavailableError("Auth service timeout");
      if (err instanceof UnauthorizedError) throw err;

      throw new ServiceUnavailableError("Auth service unavailable");
    }
  }
}
