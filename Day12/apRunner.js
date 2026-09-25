import express from "express"
import {readFile, writeFile} from "node:fs/promises"
const app = express();
app.use(express.static('public'));
	
app.listen(3000, () => {
	console.log('woo app is running on 3000');
});
