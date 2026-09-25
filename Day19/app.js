import express from "express"
import morgan from "morgan"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
//import {createWriteStream} from "fs"
import {createStream} from "rotating-file-stream"
import * as ProductHandler from "./controller/productHandler.js"
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(helmet());
app.use(cookieParser("my-secret"));
app.use(cors({
   origin: "*",
   credentials:true,
}));

const write = createStream( "logger.log", {
   size: "10M",
   interval: "1d",
   maxFiles: 3,
   path: "./log"
})
app.use(morgan("combined", {stream: write})); 

app.get("/api", 
   (req, res) => {
   console.log("process env", process.env);
   console.log("Just the request Body", req.body);
   console.log("print the file name", req.file);

   res.send("api reveived the request");
});

app.get("/product", ProductHandler.ProductsMiddleWare, ProductHandler.handleProducts); 
 
app.all("/*splat", (req, res) => {
	console.log("Hi this is catch all");
   res.status(404).send("Not Found");
});

app.listen(3000, ()=> console.log("listing on 3000"));
