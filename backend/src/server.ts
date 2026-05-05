import "dotenv/config";
import app from "./app.js";
import config from "./config/config.js";
import { seedAdmin } from "./seed.js";
import { startDeadlineJob } from "./jobs/deadline.job.js";

seedAdmin()
    .then(() => {
        app.listen(config.server.port, () => {
            console.log(`Server is running on port ${config.server.port}`);
            startDeadlineJob();
        });
    })
    .catch((err) => {
        console.error("Failed to seed admin:", err);
        process.exit(1);
    });
