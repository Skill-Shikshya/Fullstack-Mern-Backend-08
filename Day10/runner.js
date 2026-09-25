import {createReadStream, createWriteStream} from "node:fs"

const reader = createReadStream('./package.json');
const writer = createWriteStream('./printer.js');

reader.pipe(writer);

reader.on('finish', () => {
	console.log("copying the file completed");
});
