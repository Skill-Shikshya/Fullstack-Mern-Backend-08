import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });

const answer = await rl.question("What is your input? ");
console.log("this is the answer:", answer);

rl.close();
