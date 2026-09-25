import express from "express"
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const app = express();

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/sqlite.db",
});
const prisma = new PrismaClient({ adapter });

try{
   const user = await prisma.user.findMany();
   console.log("successfully connected", user);
}catch(err){
   console.log("Some err", err);
}

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(3000, () => {
   console.log("server listening on 3000");
});
