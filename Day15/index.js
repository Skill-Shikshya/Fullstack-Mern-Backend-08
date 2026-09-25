import express from "express"

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use((req,res,next) => {
	console.log("method:", req.method);
	console.log("path:", req.path);
	console.log("query:", req.query);
	console.log("params:", req.params);
	next();
});

app.get("/", (req,res,next)=>{console.log("only run on root");next()} , (req, res) => {
	console.log("Hi from root path");
	res.end();
});

app.get("/*splat", (req, res) => {
	console.log("Hi this is GET catch all");
});


app.all("/*splat", (req, res) => {
	console.log("Hi this is catch all");
});

app.listen(3000, ()=> console.log("listing on 3000"));
