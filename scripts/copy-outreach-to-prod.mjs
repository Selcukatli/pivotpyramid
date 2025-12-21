#!/usr/bin/env node

/**
 * Copy Outreach Contacts from Dev to Prod
 *
 * This script exports all outreach contacts from the dev Convex deployment
 * and imports them to the prod deployment.
 *
 * Usage:
 *   node scripts/copy-outreach-to-prod.mjs
 *
 * Prerequisites:
 *   - Must be logged in to Convex CLI
 *   - Both dev and prod deployments must exist
 *
 * What it does:
 *   1. Exports all contacts from dev using `npx convex export`
 *   2. Filters to only the outreachContacts table
 *   3. Imports to prod using `npx convex import`
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temp directory for export files
const TEMP_DIR = path.join(__dirname, ".temp-export");
const DEV_EXPORT_PATH = path.join(TEMP_DIR, "dev-export.zip");
const CONTACTS_JSON_PATH = path.join(TEMP_DIR, "outreachContacts.jsonl");

function log(message) {
  console.log(`[copy-outreach] ${message}`);
}

function error(message) {
  console.error(`[copy-outreach] ERROR: ${message}`);
}

function runCommand(command, options = {}) {
  log(`Running: ${command}`);
  try {
    const result = execSync(command, {
      encoding: "utf-8",
      stdio: options.silent ? "pipe" : "inherit",
      ...options,
    });
    return result;
  } catch (err) {
    if (options.ignoreError) {
      return null;
    }
    throw err;
  }
}

async function main() {
  log("Starting outreach contacts copy from dev to prod...");

  // Clean up any existing temp directory first
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  // Create fresh temp directory
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  try {
    // Step 1: Export from dev
    log("Step 1: Exporting data from dev deployment...");
    runCommand(`npx convex export --path "${DEV_EXPORT_PATH}"`);

    // Step 2: Extract the export
    log("Step 2: Extracting export...");
    runCommand(`unzip -o "${DEV_EXPORT_PATH}" -d "${TEMP_DIR}"`);

    // Step 3: Check if outreachContacts table exists
    // Convex export structure: tableName/documents.jsonl
    const possiblePaths = [
      path.join(TEMP_DIR, "outreachContacts", "documents.jsonl"),
      path.join(TEMP_DIR, "outreachContacts.jsonl"),
      path.join(TEMP_DIR, "documents", "outreachContacts.jsonl"),
      path.join(TEMP_DIR, "_tables", "outreachContacts.jsonl"),
    ];

    let found = false;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        fs.copyFileSync(p, CONTACTS_JSON_PATH);
        found = true;
        log(`Found contacts at: ${p}`);
        break;
      }
    }

    if (!found) {
      // List what we have in temp dir
      const files = execSync(`find "${TEMP_DIR}" -type f`, { encoding: "utf-8" });
      log(`Files in export: ${files}`);
      error("outreachContacts/documents.jsonl not found in export!");
      process.exit(1);
    }

    // Step 4: Read and display the contacts count
    const contactsData = fs.readFileSync(CONTACTS_JSON_PATH, "utf-8");
    const lines = contactsData.trim().split("\n").filter(l => l.trim());
    log(`Found ${lines.length} contacts to copy`);

    if (lines.length === 0) {
      log("No contacts found in dev. Nothing to copy.");
      cleanup();
      return;
    }

    // Step 5: Create import-ready zip with just outreachContacts
    // Convex import expects: tableName/documents.jsonl structure
    log("Step 3: Creating import package for prod...");
    const importDir = path.join(TEMP_DIR, "import-package");
    const outreachDir = path.join(importDir, "outreachContacts");
    fs.mkdirSync(outreachDir, { recursive: true });
    fs.copyFileSync(CONTACTS_JSON_PATH, path.join(outreachDir, "documents.jsonl"));

    // Also copy the schema if it exists
    const schemaPath = path.join(TEMP_DIR, "outreachContacts", "generated_schema.jsonl");
    if (fs.existsSync(schemaPath)) {
      fs.copyFileSync(schemaPath, path.join(outreachDir, "generated_schema.jsonl"));
    }

    const importZipPath = path.join(TEMP_DIR, "prod-import.zip");
    runCommand(`cd "${importDir}" && zip -r "${importZipPath}" outreachContacts/`);

    // Step 6: Import to prod
    log("Step 4: Importing contacts to prod deployment...");
    log("");
    log("=".repeat(60));
    log("IMPORTANT: This will import contacts to your PROD deployment.");
    log("The import command will ask you to confirm.");
    log("=".repeat(60));
    log("");

    // For zip format, we can't use --table, but --replace only affects tables
    // that exist in the zip. Since our zip only contains outreachContacts,
    // only that table will be replaced.
    runCommand(`npx convex import --prod "${importZipPath}" --replace -y`);

    log("");
    log("=".repeat(60));
    log("SUCCESS! Contacts have been copied to prod.");
    log("=".repeat(60));

  } catch (err) {
    error(`Failed: ${err.message}`);
    process.exit(1);
  } finally {
    cleanup();
  }
}

function cleanup() {
  log("Cleaning up temp files...");
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

// Handle interrupts
process.on("SIGINT", () => {
  log("\nInterrupted. Cleaning up...");
  cleanup();
  process.exit(1);
});

main().catch((err) => {
  error(err.message);
  cleanup();
  process.exit(1);
});
