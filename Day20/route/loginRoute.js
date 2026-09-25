import express from "express"

const Login = express.Router({mergeParams: true});

Login.post('/', (req,res) => {
   console.log("hi from user post route");
   res.send("Hi from users route");
})

export default Login;
