import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import stageRouter from "./routes/stage.routes.js";
import stageResultRouter from "./routes/stageResult.routes.js";
import gradeRouter from "./routes/grade.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import fileAttachmentRouter from "./routes/fileAttachment.routes.js";
import stageMaterialRouter from "./routes/stageMaterial.routes.js";
import finalGradeRouter from "./routes/finalGrade.routes.js";
import userRouter from "./routes/user.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost"],
    credentials: true
}));
app.use(helmet());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/projects/:projectId/stages", stageRouter);
app.use("/api/projects/:projectId/stages/:stageId/results", stageResultRouter);
app.use("/api/results/:stageResultId/grade", gradeRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/results/:stageResultId/files", fileAttachmentRouter);
app.use("/api/projects/:projectId/stages/:stageId/materials", stageMaterialRouter);
app.use("/api/projects/:projectId/final-grades", finalGradeRouter);
app.use("/api/users", userRouter);
app.use(errorHandler);
export default app;