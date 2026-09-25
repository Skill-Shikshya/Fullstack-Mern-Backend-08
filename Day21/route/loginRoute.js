import express from "express"

const SingUp = express.Router({mergeParams: true});
export const UsersCredArr = [
]

SingUp.post('/', (req,res) => {
   const {email, pass} = req.body;
   console.log("email and password", email, pass);
   const newPass = Buffer.from(pass).toString('base64');
   UsersCredArr.push({email,pass:newPass});
   console.log("hi from user post route");
   res.send("Hi from users route");
})

export default SingUp;
