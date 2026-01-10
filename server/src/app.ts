import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import authRoutes from "./routes/user";
import adminRoutes from "./routes/admin";
import studentRoutes from "./routes/students";
import mentorRoutes from "./routes/mentor";
import dashboardRoutes from "./routes/dashboard";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

async function bootstrap() {
  try {
    await connectDB(); //  BLOCK until Mongo connects

    app.use("/api", authRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/mentor", mentorRoutes);
    app.use("/api", studentRoutes);
    app.use("/api/dashboard", dashboardRoutes);

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
