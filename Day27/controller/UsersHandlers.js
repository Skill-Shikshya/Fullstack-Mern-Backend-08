import {db} from "../app.js";

export async function PostUsers(req,res){
   const userData = Object.values(req.body);
   console.log("here is the values", userData);

   const QueryGen = "INSERT INTO users (name,age,email) VALUES($1,$2,$3)";
   await db.query(QueryGen, userData);

   res.json({message: "success"});
}

export async function DeleteUser(req,res){
   const id = req.params.id;
   console.log("what is in params", req.params);
   //re.send(`this was the id: ${req.params.id}`);
   await db.query(`DELETE FROM users WHERE id=$1`, [id]);
   res.send("DONE");
}
