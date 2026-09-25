console.log("this prints 1");
setImmediate(()=> console.log("set Immidiate"));

setTimeout(()=>{console.log("this runs 2")}, 0);

setTimeout(()=>console.log("this runs 5"), 2000);

Promise.resolve("okay done").then((e) => console.log(e));

process.nextTick(()=>console.log("next tick"));


console.log("this runs last");
