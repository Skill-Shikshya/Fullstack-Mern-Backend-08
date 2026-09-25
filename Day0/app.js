import express from "express";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.js";
import UserSchema from "./schema/user.js";
import { createClient } from "redis";
//import { rateLimit } from "express-rate-limit"

// const limit = rateLimit({
//    windowMs: 3 * 60 * 1000,
//    max: 2,
//    standardHeaders: "draft-8",
//    legacyHeaders: false,
//    message: {
//       status: 429,
//       error: "Tooo Many Requests"
//    }
// })

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

// 1. Initialize Redis Client
const client = createClient({ url: "redis://localhost:6379" });
client.on("error", (err) => console.error("Redis Error:", err));

// MUST connect Redis before accepting requests
await client.connect();

const limiter = async (req,res,next) => {
   const key = `rl:${req.ip}`

   const limit = await client.incr(key);
   console.log("the limit", limit);

   if(limit == 1){
      client.expire(key, 30)
   }

   if(limit > 2){
      return res.status(429).json({message: "Too many request"})
   }

   next()
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Validation Middleware
const validate = (schema) => (req, _res, next) => {
  const validateUsers = schema.safeParse(req.body);
  if (validateUsers.success) {
    req.body = validateUsers.data;
    next();
  } else {
    next({ status: 400, message: validateUsers.error.flatten().fieldErrors });
  }
};

// Fixed Cache Middleware
const cacheData = (keyPrefix, TTL) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const fullKey = `${keyPrefix}${id}`; // Fix: Construct key FIRST

    // Check Redis
    const data = await client.get(fullKey);
    if (data) {
      return res.json({ source: "cache", data: JSON.parse(data) });
    }

    // Convert id to Integer if your SQLite schema uses Int IDs
    const parsedId = isNaN(Number(id)) ? id : Number(id);

    const user = await prisma.user.findFirst({
      where: { id: parsedId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    // Cache the user payload
    await client.setEx(fullKey, TTL, JSON.stringify(user));
    next();
  } catch (error) {
    next(error); // Pass errors safely to global error handler
  }
};

app.get("/users/:id", cacheData("user:", 60), async (req, res) => {
  res.json({ source: "db", data: req.user });
});

app.post("/users", validate(UserSchema), async (req, res) => {
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

// Fixed Global Error Handler (Serializes error messages properly)
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || err,
  });
});

app.listen(3000, () => {
  console.log("App listening on port 3000");
});
