import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import authRoutes from "./routes/user";
import adminRoutes from "./routes/admin";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

async function bootstrap() {
  try {
    await connectDB(); // 🔥 BLOCK until Mongo connects

    app.use("/api", authRoutes);
    app.use("/api/admin", adminRoutes);

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ App failed to start");
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
