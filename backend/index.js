import "./config/loadEnv.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./config/cors.js";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

connectDB();

const app = express();
app.set("trust proxy", 1);

app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Learning Platform API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/catalog", catalogRoutes);

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});

export default app;
