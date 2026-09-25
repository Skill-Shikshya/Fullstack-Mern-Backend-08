import express from "express"
import morgan from "morgan"
import cors from "cors"
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan("dev"));
app.use(cors({
   origin: "*",
   methods: ["GET"],
}));

const middleFn = (req,res,next)=>{
   console.log("only run on root");
   next()
}  

app.get("/", middleFn,
   (req, res) => {
	console.log("Hi from inside route root path");
	res.send("okay done");
});

app.get("/bibek" , middleFn,
   (req, res) => {
	console.log("Hi from bibek bibek path");
	res.send("okay done");
});

app.all("/*splat", (req, res) => {
	console.log("Hi this is catch all");
   res.status(404).send("Not Found");
});

app.listen(3000, ()=> console.log("listing on 3000"));
