
import express from "express"
//import prisma from "./client.js"
import {PrismaClient} from "@prisma/client";
//import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const app = express();
app.use(express.json());

// const adapter = new PrismaBetterSqlite3({
//   url: "file:./sqlite.db",
// });

//const prisma = new PrismaClient({adapter});
const prisma = new PrismaClient();

app.get("/users", async (_,res) => {
   try{
      const user = await prisma.user.findMany();
      console.log("successfully connected", user);
      res.send({data: user});
   }catch(err){
      console.log("Some err", err);
      res.send("no User Found");
   }
});

app.post("/users", async (req,res) => {
    const {name, email} = req.body;
    const createUser = await prisma.user.create({
       data: {name, email}
    });
    res.json({msg: "Done", data: createUser});
});

app.get('/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        category: true,
      },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const { name, user_id, category_ids } = req.body; // category_ids expected as an array, e.g., [1, 2]
    
    const post = await prisma.post.create({
      data: {
        name,
        user_id: user_id,
        category: category_ids ? {
          connect: category_ids.map((id) => ({ id: id })),
        } : undefined, 
      },
      include: {
        user: true,
       // category: true,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.listen(3000, () => {
   console.log("server listening on 3000");
});
