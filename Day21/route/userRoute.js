import express from "express"
import { UsersCredArr } from "./loginRoute.js";
const User = express.Router({mergeParams: true});

User.get('/', (req,res) => {
   console.log("this is Params", req.params);
   console.log("hi from root users");
   res.json(UsersCredArr);
});

User.get('/:id', (req,res) => {
   console.log("req params", req.params);
   res.send("Hi from users ID route");
});

User.post('/', (req,res) => {
   const {email, pass} = req.body;
   const newPass = Buffer.from(pass).toString('base64');
   const newObj = {email, pass:newPass};
   console.log(newObj);
   const found = UsersCredArr.find(e => {
      console.log("what is in e", e);
      return e.email == newObj.email && e.pass == newObj.pass
   });
   console.log("this is what is in found", found);
   if(found){
      const signedData = Buffer.from(JSON.stringify(found)).toString('base64');
      res.cookie("authtoken", signedData , {maxAge: 60*60*1000, path: "/"});
      res.json({message: "user found", data:signedData });
   }else{
      res.status(404).send("Not Found");
   }
})

export default User;
