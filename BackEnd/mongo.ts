import { MongoClient, Db } from 'mongodb';

const URL = Bun.env.MONGO_URI!;
const DB_NAME = Bun.env.MONGO_DB_NAME;

let client: MongoClient
let db: Db

export async function connectMongo() {
  if (db) return db

  client = new MongoClient(URL)
  await client.connect()

  db = client.db(DB_NAME)
  return db
}
