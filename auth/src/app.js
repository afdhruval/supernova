import morgan from "morgan";
import cookieParser from "cookie-parser";
import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);

export default app;
