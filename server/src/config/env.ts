import zod from "zod";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const envSchema = zod.object({
  PORT: zod
    .string()
    .optional() // allow undefined
    .default("5000") // use 5000 if not provided
    .transform((val) => parseInt(val, 10)), // convert to number
  MONGO_URI: zod.string().min(1, "DB_URL is required"),
  JWT_SECRET: zod.string().min(1, "JWT_SECRET is required"),
  JWT_ACCESS_SECRET: zod.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: zod.string().min(1, "JWT_REFRESH_SECRET is required"),
  NODE_ENV: zod.string().optional(),
  GITHUB_TOKEN: zod.string().optional(),
});

const env = envSchema.safeParse(process.env);

// Check if env variables are valid
if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.format());
  throw new Error("Invalid environment variables");
}

// Export validated env variables

export default env;
