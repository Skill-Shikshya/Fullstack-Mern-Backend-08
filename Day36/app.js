import express from "express";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import userSchema from "./schema/userSchema.js";
import { createClient } from "redis";
import rateLimiter from "express-rate-limit"
const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const rateLimiter = async (req, res, next) => {
//    const key = "limiter"
//    const limit = await client.incr(key);
//    console.log("what is limit", limit);
//
//    if(limit == 1){
//       await client.expire(key, 30)
//    }
//
//    if(limit > 2){
//       return res.send("limit exceeded")
//    }
//
//    next()
// }

const limiter = rateLimiter({
   windowMs: 60 * 1000,
   max: 2,
   standardHeaders: "draft-7",
   legacyHeaders: false,
   message: {
      status: 429,
      error: "toooo  many request"
   }
})

app.use(limiter);


const client = createClient({
  host: "localhost",
  port: 6379,
});
client.on("error", (err) => console.log("Redis error", err));
await client.connect();

const cacheMiddleware = (key, ttl) => async (req,res,next) => {

   const lastKey = req.params.id ? key + req.params.id : key

   const cachedData = await client.get(lastKey)
   console.log("cachedData here", cachedData)

   if(cachedData){
      res.json({
         source: "cache",
         data: json.parse(cachedData)
      })
   }

   const originalReq = res.json.bind(res)
   
   res.json = async (body) => {
      if(key && ttl){
         console.log("here is the body", body);
         await client.setEx(lastKey, ttl, JSON.stringify(body))
      }
      return originalReq(body)
   }

   next();
}

app.get("/users/:id", cacheMiddleware("users:", 30), async(req,res) => {
   const uniqueUser = await prisma.user.findUnique({
      where: {
         id: parseInt(req.params.id)
      }
   });
 
   res.json(uniqueUser)
})

app.post("/users",  async (req, res) => {
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
  //check in the cache
  //if exists res with the cached data
  
  const users = await prisma.user.findMany();

  //if miss add the user data requested to cache
  res.json({source:"db", data: users });
});

app.use((err, _req, res, _next) => {
  res.json({ err });
});

app.listen(3000, () => {
  console.log("App listening on port 3000");
});
