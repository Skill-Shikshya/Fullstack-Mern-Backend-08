import Bibek from "events"

const kk = new Bibek();

kk.on('pizza', (name, method)=> console.log(`WOW, ${name} PIZZA ${method}`));

const someObj = {
	get(name){
	kk.emit("pizza", name, "GET");
	},
	post(name){
	kk.emit("pizza", name, "POST");
	}
}

someObj.get("Chicken");


export default someObj;
