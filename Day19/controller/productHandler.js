export const ProductsMiddleWare = (req, res, next) => {
   console.log("HELLO THIS PRODUCT MIDDILE WARE HAS RAN")
   console.log("Process Env Mid2", process.env);
   next();
}

export const handleProducts = (req, res) => {
   console.log("this is the cookies", req.cookies);
	console.log("Hi from bibek bibek path"); 
	res.send("okay done");
}

