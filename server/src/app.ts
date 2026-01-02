import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

async function bootstrap() {
  try {
    await connectDB(); // 🔥 BLOCK until Mongo connects

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
