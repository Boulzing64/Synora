import { config } from "dotenv";

import { initializeDatabase } from "../storage/repositories.js";

config({ path: ".env.local" });

await initializeDatabase();

console.log("SYNORA database migrations completed.");