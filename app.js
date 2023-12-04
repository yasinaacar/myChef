//modules
require("express-async-errors");
const express=require("express");
const path=require("path");
const cookieParser=require("cookie-parser");
const session=require("express-session");
const MongoDBStore=require("connect-mongodb-session")(session);
const { connectMongoDb, store }=require("./startup/db");


const app=express();

app.set("view engine", "ejs");

//middlewares
app.use("/libs",express.static(path.join(__dirname, "node_modules")));
app.use("/static",express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true }));
app.use(cookieParser());
app.use(session({
    secret: "keybord cat",
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 1000*60*60*12,
    },
    store: store
}))
app.use(require("./middlewares/locals"));
//routes
require("./startup/routes")(app);

//database connection
connectMongoDb();

const port=process.env.PORT;
app.listen(port,()=>{
    console.log(`listening port ${port}...`);
})