import {createReadStream, createWriteStream} from "node:fs"

const read = createReadStream('./read.txt');
let ReadFileJSON;
let textData;

console.log("this line should print 1st");
read.on('data', (c) => {
	console.log('buffer', c);
	console.log('type of:', typeof(c));
	const data = JSON.stringify(c);
	ReadFileJSON = JSON.parse(data);
	console.log("data converted");
});
read.on('end', () => {
	console.log("done raading data: ", ReadFileJSON);
	textData = Buffer.from(ReadFileJSON.data);
	console.log(textData);
});
read.on('error', () => console.log('data err'));

console.log("This line will print 2nd");

