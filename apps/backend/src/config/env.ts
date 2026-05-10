import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(currentDir, "../../../../.env") });

const readMultiline = (value: string | undefined): string | undefined => value?.replace(/\\n/g, "\n");

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "",
  mongoDbName: process.env.MONGODB_DB_NAME ?? "skillbridge_ai",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: readMultiline(process.env.FIREBASE_PRIVATE_KEY),
  corsOrigins: (process.env.CORS_ORIGIN ?? process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};

export const flags = {
  mongoEnabled: Boolean(env.mongoUri),
  firebaseEnabled: Boolean(env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey)
};
