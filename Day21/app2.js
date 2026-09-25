import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
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

app.use('/signup', SignUpRouter);
app.use('/users', UserRouter);
//app.use('/users/:myname', UserRouter);
app.get("/product", ProductHandler.ProductsMiddleWare, ProductHandler.handleProducts); 
 
app.all("/*splat", (req, res) => {
	console.log("Hi this is catch all");
   res.status(404).send("Not Found");
});

app.listen(process.env.PORT, ()=> console.log(`listing on ${process.env.PORT}`));
