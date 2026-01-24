import { BadRequestError } from "./errors";

type HasValidateSync = {
    validateSync: (...args: any[]) => { message?: string } | null;
};

export function throwIfMongooseValidationError(doc: HasValidateSync): void {
    const validation = doc.validateSync?.();
    if (!validation) return;

    throw new BadRequestError(validation.message ?? "Validation error");
}
