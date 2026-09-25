
import pkg from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const {PrismaClient} = pkg
const adapter = new PrismaBetterSqlite3({
  url: "file:./sqlite.db",
});

const prisma = new PrismaClient({adapter});
export default prisma
