import bibek from "express"
import {readFile} from "node:fs/promises"

const app = bibek();

app.get("/", (req, res) => {
	console.log("req", req);
	res.header("Content-Type", "text/plain");
	res.send("<h1>hello there</h1>");
})

app.get("/index.html", async (req, res) => {
	console.log("req on index file");
	const htmlFile = await readFile('./index.html', 'utf-8');
	console.log("typeof", typeof(htmlFile));
	console.log("html file content:", htmlFile);
	res.send(htmlFile);
})

app.get("/bscript.js", async (req, res) => {
	console.log("req on script file");
	const scriptFile = await readFile('./bscript.js', 'utf-8');
	console.log("this is script:", scriptFile);
	res.type('js').send(scriptFile);
});

	
app.listen(3001, () => console.log("server is listening"));

