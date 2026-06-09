import { config } from "dotenv";

import { createSynoraApp } from "./app.js";
import { initializeDatabase } from "./storage/repositories.js";

config({ path: ".env.local" });

const apiPort = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);

await initializeDatabase();

const app = createSynoraApp();

app.listen(apiPort, "0.0.0.0", () => {
  console.log(`SYNORA API listening on http://localhost:${apiPort}`);
});