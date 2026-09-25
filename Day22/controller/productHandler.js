export const ProductsMiddleWare = (req, res, next) => {
   throw new Error("had a problem");
   console.log("HELLO THIS PRODUCT MIDDILE WARE HAS RAN")
   next();
}

export const handleProducts = (req, res) => {
   console.log("this is the cookies", req.cookies);
   const userToken = req.cookies.authtoken

   const userData = Buffer.from(userToken, "base64").toString('utf8');
	console.log("Hi from bibek bibek path"); 
   const userObj = JSON.parse(userData);
	res.json(userObj);
}

