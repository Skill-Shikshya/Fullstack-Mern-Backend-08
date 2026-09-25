import express from "express"
import morgan from "morgan"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import multer from "multer"
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan("dev"));
app.use(cors({
   origin: "*",
   credentials:true,
}));
app.use((req,res,next) => {
   console.log(req.myname);
   console.log(req.path);
   console.log(req.body);
   console.log(req.method);
   next();
})

app.use((req,res,next) => {
   req.myname = "bibek"
   console.log(req.body)
   next();
})


const middleRun = (req,res,next) => {
   console.log(req.myname)
   next()
}

app.use(cookieParser("my-secret"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'assets/'); // Directory where files will be saved
  },
  filename: function (req, file, cb) {
    // Extract the original extension (e.g., '.jpg', '.png', '.pdf')
    const ext = path.extname(file.originalname);
    
    // Generate a unique filename using timestamp + random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Append the original extension to the new filename
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const uploads = multer({storage: storage});


app.get("/api", middleRun, uploads.single("photo"),
   (req, res) => {
   console.log("Just the request Body", req.body);
   console.log("print the file name", req.file);
   res.cookie("token", "value-token1", {signed: true});
   res.send("api reveived the request");
});

app.get("/product",
   (req, res) => {
   console.log("this is the cookies", req.cookies);
	console.log("Hi from bibek bibek path"); 
	res.send("okay done");
});

app.all("/*splat", (req, res) => {
	console.log("Hi this is catch all");
   res.status(404).send("Not Found");
});

app.listen(3000, ()=> console.log("listing on 3000"));
