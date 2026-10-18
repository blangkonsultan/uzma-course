import pg from "pg";

const { Client } = pg;

export async function withPostgresTransaction(databaseUrl, callback) {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original database error; rollback failure is already terminal.
    }
    throw error;
  } finally {
    await client.end();
  }
}
