/**
 * Script to generate context update args for the outreach contacts
 *
 * Run with:
 *   npx convex run outreach:updateContextInternal "$(node scripts/seed-outreach-notes.mjs)"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "seed-outreach-data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Extract email and context fields
const contactContext = data.contacts
  .filter((c) => c.background || c.relationship || c.context)
  .map((c) => ({
    email: c.email,
    background: c.background || undefined,
    relationship: c.relationship || undefined,
    context: c.context || undefined,
  }));

// Output the args JSON for use with convex run
console.log(JSON.stringify({ contactContext }));
