import express from "express";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import userSchema from "./schema/userSchema.js";
import { createClient } from "redis";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = createClient({
  host: "localhost",
  port: 6379,
});
client.on("error", (err) => console.log("Redis error", err));
await client.connect();

const validator = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  console.log(result);

  if (result.success) {
    console.log(result.data);
    req.body = result.data;
    next();
  } else {
    const err = result.error?.flatten().fieldErrors;
    console.error(err);
    next(err);
  }
};

app.post("/cache", async (req, res) => {
  const { value } = req.body;

  await client.set("someKey", value);
  res.send("okay");
});

app.get("/cache", async (req, res) => {
  console.log("req came here");
  const key = await client.get("someKey");
  console.log("the key", key);
  res.send(key);
});

app.post("/users", validator(userSchema), async (req, res) => {
  const user = req.body;
  const createdUser = await prisma.user.create({
    data: {
      name: user?.name,
      email: user?.email,
    },
  });

  res.status(201).json({ message: "User created", data: createdUser });
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({ message: "success", data: users });
});

app.use((err, _req, res, _next) => {
  res.json({ err });
});

app.listen(3000, () => {
  console.log("App listening on port 3000");
});
