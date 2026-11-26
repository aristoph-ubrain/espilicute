import "server-only";
import { MongoClient, type Db } from "mongodb";

declare global {
  var _espilicuteMongo: Promise<MongoClient> | undefined;
}

export class BancoNaoConfigurado extends Error {
  constructor() {
    super("MONGODB_URI não configurada. Veja .env.example.");
  }
}

export function bancoConfigurado() {
  return Boolean(process.env.MONGODB_URI);
}

function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new BancoNaoConfigurado();
  // Reaproveita a conexão entre recargas (dev) e invocações quentes (Vercel).
  if (!globalThis._espilicuteMongo) {
    const client = new MongoClient(uri, { appName: "espilicute", maxPoolSize: 10 });
    globalThis._espilicuteMongo = client.connect().catch((err) => {
      globalThis._espilicuteMongo = undefined;
      throw err;
    });
  }
  return globalThis._espilicuteMongo;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(process.env.MONGODB_DB || "espilicute");
}
