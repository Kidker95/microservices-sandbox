import { BadRequestError } from "./errors";

type HasValidateSync = {
    validateSync: () => { message?: string } | undefined;
};

export function throwIfMongooseValidationError(doc: HasValidateSync): void {
    const validation = doc.validateSync?.();
    if (!validation) return;

    throw new BadRequestError(validation.message ?? "Validation error");
}
