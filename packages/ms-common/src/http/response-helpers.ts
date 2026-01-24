import { StatusCode } from "../enums";
import { NotFoundError, ServiceUnavailableError, UnauthorizedError, ForbiddenError, BadRequestError } from "../errors/errors";

export async function readErrorTextSafe(res: Response): Promise<string> {
    try {
        const text = await res.text();
        return text || res.statusText || "Request failed";
    } catch { return res.statusText || "Request failed"; }
}

export async function throwForCommonStatuses(res: Response, notFoundMessage?: string): Promise<never> {
    const message = await readErrorTextSafe(res);

    switch (res.status) {
        case StatusCode.BadRequest: throw new BadRequestError(message);
        case StatusCode.Unauthorized: throw new UnauthorizedError(message);
        case StatusCode.Forbidden: throw new ForbiddenError(message);
        case StatusCode.NotFound: throw new NotFoundError(notFoundMessage ?? message);
        case StatusCode.ServiceUnavailable: throw new ServiceUnavailableError(message);
        default: throw new ServiceUnavailableError(message);
    }
}
