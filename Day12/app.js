import express from "express"

const app = express();
const users = [
	{
	name:"bibek",
	"phoneNo":"454545454",
	}
]


app.get('/', (req,res) => {
	res.send("I have received the request");
});
app.get('/users', (req,res) => {
	res.json(users);
});



app.listen(3000, () => console.log("app listening of 3000"));
