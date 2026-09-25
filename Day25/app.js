import express from "express"
import pg from "pg"
import "dotenv/config"
const app = express();
const {Pool} = pg
app.use(express.json())

export const db = new Pool({
   user: "jhon",
   password: "password",
   database: "bibek",
   host: "localhost",
   port: 5432,
 })

async function GetUserData(_, res) {
try{
   const users = await db.query("SELECT * FROM users");
   //console.log("the users data", users.rows);
   res.json({data: users.rows});
}catch(err){
   console.log("SOME ERR:", err);
}
}

import * as userHandler from "./controller/UsersHandlers.js"
app.get('/users', GetUserData)
app.post('/users', userHandler.PostUsers);
//app.patch('/users')
//app.delete('/users')

app.use((err, _, res) => {
   res.json({message: err});
});

app.listen(process.env.PORT, () =>
   {console.log(`the server listing on port ${process.env.PORT}`)});
