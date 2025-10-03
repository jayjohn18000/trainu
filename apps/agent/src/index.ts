import { logger } from "./logger";

async function main() {
  await logger.runStart("PF-dev", crypto.randomUUID());
  await logger.event("PF-dev", "boot", "info", "Agent dev started");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
