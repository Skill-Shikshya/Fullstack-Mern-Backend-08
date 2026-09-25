import express from "express"
import pg from "pg"
import "dotenv/config"
const app = express();
const {Pool} = pg
app.use(express.json())
app.use(express.urlencoded({extended:true}));
// export const db = new Pool({
//    user: "jhon",
//    password: "password",
//    database: "bibek",
//    host: "localhost",
//    port: 5432,
//  })

console.log("neon string", process.env.NEON_DB);
export const db = new Pool({
  connectionString: process.env.NEON_DB,
   ssl: {
      rejectUnauthorized: true
   }
 })

try{
   const client = await db.connect();
   console.log("Connected succesfully to the DB");
   client.release();
}catch(err){
   console.log("Something went wrong", err);
}

async function GetUserData(_, res, next) {
try{
   const users = await db.query("SELECT * FROM users");
   //console.log("the users data", users.rows);
   res.json({data: users.rows});
}catch(err){
   console.log("SOME ERR:", err);
   next(err);
}
}

import * as userHandler from "./controller/UsersHandlers.js"
app.get('/users', GetUserData)
app.get('/users/:id', async (req,res) => {
    const singleUser = await db.query("SELECT * FROM users WHERE id=$1", [req.params.id]);
    res.json({data:singleUser.rows});
});

app.post('/users', userHandler.PostUsers);
//app.patch('/users')

app.delete('/users/:id', userHandler.DeleteUser);


app.use((err, _, res, _next) => {
   res.json({message: err});
});

app.listen(process.env.PORT, () =>
   {console.log(`the server listing on port ${process.env.PORT}`)});
