import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { writeFile } from "node:fs/promises";

const ir = createInterface({ input, output });

console.log("***************");
console.log("this is a password manager APP \n");
console.log("***************");

const whatDoYouWantToDo = await ir.question("What do you want to do: encrypt: E or decrypt: D? ");

if (whatDoYouWantToDo.toUpperCase() === "E") {
  await encryptFn();
} else {
  dcryptFn();
}

function dcryptFn() {
  console.log("decrypted");
}

// Added async keyword to allow top-level await inside function
async function encryptFn() {
  const password = await ir.question("What is your password? \n");
  
  // Return the shifted character explicitly inside .map()
  const cipher = password
    .split("")
    .map((char) => String.fromCharCode(char.charCodeAt(0) + 7))
    .join("");

  await writeFile("password.txt", cipher);

  // Moved logs inside the function where 'cipher' is defined
  console.log("cipher-->", cipher);
  console.log("Password Saved!");
}

ir.close();
