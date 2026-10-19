import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, mkdirSync, unlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

async function hashFile(filePath) {
  const hash = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

export async function createRemoteBackup(
  databaseUrl,
  outputDirectory = path.join(os.tmpdir(), "uzma-course-backups"),
  options = {}
) {
  mkdirSync(outputDirectory, { recursive: true, mode: 0o700 });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputPath = path.join(outputDirectory, `remote-prune-${timestamp}.dump`);
  const command = options.command || process.env.PG_DUMP_BIN || "pg_dump";
  const args = options.args || ["--format=custom", databaseUrl];
  const output =
    options.createOutput?.(outputPath) ??
    createWriteStream(outputPath, { mode: 0o600 });

  try {
    await new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stderr = "";
      let childExited = false;
      let streamFinished = false;
      let settled = false;
      const fail = (error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };
      const resolveIfReady = () => {
        if (settled || !childExited || !streamFinished) return;
        settled = true;
        resolve();
      };
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      child.on("error", fail);
      child.on("close", (code) => {
        if (code !== 0) {
          fail(new Error(`Backup PostgreSQL gagal dengan exit code ${code}.`));
          return;
        }
        childExited = true;
        resolveIfReady();
      });
      output.on("error", fail);
      output.on("finish", () => {
        streamFinished = true;
        resolveIfReady();
      });
      child.stdout.pipe(output);
      void stderr;
    });
  } catch (error) {
    output.destroy();
    try {
      unlinkSync(outputPath);
    } catch {
      // The backup file may not have been created.
    }
    throw error;
  }

  return {
    path: outputPath,
    sha256: await hashFile(outputPath),
  };
}
