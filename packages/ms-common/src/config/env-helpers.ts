import { BadRequestError } from "../errors";

const requireEnv = (key:string):string => {
    const value = process.env[key]; 
    if (!value) throw new BadRequestError(`Environment variable ${key} is not set`);
    return value;
}

const getEnv = (key:string, fallback?:string):string | undefined => {
    const value = process.env[key]; 
    if (!value) return fallback;
    return value;
}

const getNumberEnv = (key:string, fallback?:number):number | undefined => {
    const value = process.env[key]; 
    if (!value) return fallback;
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
        throw new BadRequestError(`Environment variable ${key} is not a number`);
    }
    return numberValue;
}

const getBooleanEnv = (key: string, fallback?: boolean): boolean | undefined => {
    const value = process.env[key];
    if (!value) return fallback;

    const normalized = value.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;

    throw new BadRequestError(`Environment variable ${key} is not a boolean`);
};


const getUrlEnv = (key: string, fallback?: string): string | undefined => {
    const value = process.env[key];
    if (!value) return fallback;

    try {new URL(value);} 
    catch {throw new BadRequestError(`Environment variable ${key} is not a valid URL`);}
    return value;
};



export const envHelpers = {
    requireEnv,
    getEnv,
    getNumberEnv,
    getBooleanEnv,
    getUrlEnv
};