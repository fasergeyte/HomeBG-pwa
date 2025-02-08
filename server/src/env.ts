import dotenv from "dotenv";

dotenv.config();

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

export const PORT = process.env.PORT as string;

export const FRONT_BASE_URL = process.env.FRONT_BASE_URL as string;
export const BACK_BASE_URL = process.env.BACK_BASE_URL as string;

export const DATA_DIR = process.env.DATA_DIR as string;

export const JWT_SECRET = process.env.JWT_SECRET as string;
