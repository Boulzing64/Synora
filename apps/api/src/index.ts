import { config } from "dotenv";

import { createSynoraApp } from "./app.js";
import { initializeBetaStorage } from "./beta/repository.js";
import { logger } from "./observability/logger.js";
import { initializeRewardsStorage } from "./rewards/repository.js";
import { initializeDatabase } from "./storage/repositories.js";

config({ path: ".env.local" });

const apiPort = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);

await initializeDatabase();
await initializeRewardsStorage();
await initializeBetaStorage();

const app = createSynoraApp();

app.listen(apiPort, "0.0.0.0", () => {
  logger.info("server.started", { port: apiPort });
});
