import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import helmet from "helmet"
import SignUpRouter from "./route/loginRoute.js"
import * as ProductHandler from "./controller/productHandler.js"
import UserRouter from "./route/userRoute.js"

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(helmet());
app.use(cookieParser("my-secret"));
app.use(cors({
   origin: "*",
   credentials:true,
}));
dotenv.config();
console.log(process.env.PORT);

const userData = {
   id: 1,
   name: "myname",
   age: 222,
   address: "addressOne",
}
const userData2 = {
   id: 2,
   name: "myname",
   age: 222,
   address: "addressOne",
}
const firstToken = jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: '1d'});

const tokenArr = firstToken.split(".");
console.log("TOKEN arr", tokenArr);
console.log("payload", Buffer.from(tokenArr[1], "base64").toString("utf8"));
tokenArr[1] = tokenArr[1] + "APPLE";
const newToken = tokenArr.join(".");
console.log("NEWTOKEN", newToken);

//   const decodeFirstToken = jwt.decode(firstToken, {complete:true});
//console.log("The token generated was", firstToken);
//console.log("Decoded token", decodeFirstToken);
// jwt.verify(newToken, process.env.JWT_SECRET, (err, decoded)=> {
//       if(err) {
//          console.log("SOME ERR OCCUR", err);
//          return null
//       }
//    console.log("DECODED", decoded);
// });

app.use('/signup', SignUpRouter);
app.use('/users', UserRouter);
//app.use('/users/:myname', UserRouter);
app.get("/product", ProductHandler.ProductsMiddleWare, ProductHandler.handleProducts); 
 
app.all("/*splat", (req, res) => {
	console.log("Hi this is catch all");
   res.status(404).send("Not Found");
});

app.listen(process.env.PORT, ()=> console.log(`listing on ${process.env.PORT}`));
