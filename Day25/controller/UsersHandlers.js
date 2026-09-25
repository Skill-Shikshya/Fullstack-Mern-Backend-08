import {db} from "../app.js";

export async function PostUsers(req,res){
   const userData = Object.values(req.body);
   console.log("here is the values", userData);

   const QueryGen = "INSERT INTO users (name,age,email,phone,address) VALUES($1,$2,$3,$4,$5)";
   await db.query(QueryGen, userData);

   res.json({message: "success"});
}
