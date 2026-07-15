import express from "express";
import messagesRouter from "./routes/messages.js";
import coachRouter from "./routes/coach.js";
import analysisRouter from "./routes/analysis.js";
import workoutsRouter from "./routes/workouts.js";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Mount API modular routers
  app.use("/api", messagesRouter);
  app.use("/api", coachRouter);
  app.use("/api", analysisRouter);
  app.use("/api", workoutsRouter);

  return app;
}
