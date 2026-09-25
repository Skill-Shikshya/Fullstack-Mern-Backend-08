import bibek from "express"

const app = bibek();
app.use(bibek.static('public'));

app.listen(3000, ()=> console.log("listing on 3000"));
