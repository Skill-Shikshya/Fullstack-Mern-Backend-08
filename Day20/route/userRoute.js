import express from "express"

const User = express.Router({mergeParams: true});

User.get('/', (req,res) => {
   console.log("this is Params", req.params);
   console.log("hi from root users");
   res.send("Hi from users route");
});

User.get('/:id', (req,res) => {
   console.log("req params", req.params);
   res.send("Hi from users ID route");
});

User.post('/', (req,res) => {
   console.log("hi from user post route");
   res.send("Hi from users route");
})

export default User;
