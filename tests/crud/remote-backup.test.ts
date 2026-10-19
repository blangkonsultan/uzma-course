import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import { Writable } from "node:stream";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createRemoteBackup } from "@/../scripts/lib/remote-backup.mjs";

describe("remote backup", () => {
  it("waits for the backup stream to finish after the child exits", async () => {
    const outputDirectory = await mkdtemp(
      path.join(os.tmpdir(), "uzma-remote-backup-test-")
    );
    const releaseDirectory = path.join(outputDirectory, "release");
    await mkdir(releaseDirectory);
    const payload = "backup-payload";

    try {
      const createOutput = (outputPath: string) => {
        const chunks: Buffer[] = [];
        const output = new Writable({
          write(
            chunk: Buffer,
            _encoding: BufferEncoding,
            callback: (error?: Error | null) => void
          ) {
            chunks.push(Buffer.from(chunk));
            callback();
          },
          final(callback: (error?: Error | null) => void) {
            writeFileSync(outputPath, Buffer.concat(chunks), { mode: 0o600 });
            callback();
          },
        });

        output.on("finish", () => {
          writeFileSync(path.join(releaseDirectory, "ready"), "");
        });
        return output;
      };
      const report = await createRemoteBackup(
        "postgresql://unused.example/postgres",
        outputDirectory,
        {
          command: process.execPath,
          args: [
            "-e",
            `const { watch } = require("node:fs");
const watcher = watch(${JSON.stringify(releaseDirectory)}, () => {
  watcher.close();
  process.exit(0);
});
process.stdout.write(${JSON.stringify(payload)});
process.stdout.end();`,
          ],
          createOutput,
        }
      );

      expect(await readFile(report.path, "utf8")).toBe(payload);
      expect(report.sha256).toBe(
        createHash("sha256").update(payload).digest("hex")
      );
    } finally {
      await rm(outputDirectory, { recursive: true, force: true });
    }
  });
});
