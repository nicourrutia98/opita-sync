// @ts-nocheck
import fs from "node:fs";
import crypto from "node:crypto";

const dbPath = process.env.OPITA_MOCK_API_DB_PATH ?? "scripts/mock-remote-db.json";

function randomPassword(prefix) {
  return `${prefix}${crypto.randomBytes(4).toString("hex")}!`;
}

const adminEmail = "admin.seed@mock.opita.test";
const tecnicoEmail = "tecnico.seed@mock.opita.test";
const adminPassword = randomPassword("Adm-");
const tecnicoPassword = randomPassword("Tec-");

const payload = {
  users: {
    [adminEmail]: { password: adminPassword, role: "admin" },
    [tecnicoEmail]: { password: tecnicoPassword, role: "tecnico" }
  },
  createdAt: new Date().toISOString()
};

fs.writeFileSync(dbPath, JSON.stringify(payload, null, 2));

console.log("Mock DB seeded.");
console.log(`OPITA_SMOKE_ADMIN_EMAIL=${adminEmail}`);
console.log(`OPITA_SMOKE_ADMIN_PASSWORD=${adminPassword}`);
console.log(`OPITA_SMOKE_TECNICO_EMAIL=${tecnicoEmail}`);
console.log(`OPITA_SMOKE_TECNICO_PASSWORD=${tecnicoPassword}`);
console.log(`OPITA_MOCK_API_DB_PATH=${dbPath}`);
