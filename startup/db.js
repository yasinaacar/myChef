const config=require("config");
const logger=require("./logger");
const mongoose=require("mongoose");
const session = require("express-session");
const MongoDBStore=require("connect-mongodb-session")(session)

const username=config.get("db.username");
const password=config.get("db.password");
const database=config.get("db.database");

const store=new MongoDBStore({
    uri: `mongodb+srv://${username}:${password}@cluster0.slrguhg.mongodb.net/${database}?retryWrites=true&w=majority`,
    collection: "sessions"
});

store.on("error",(error)=>{
    logger.error("MongoDB session store connection error:", error);
})

const connectMongoDb=async()=>{
    try {
        await mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.slrguhg.mongodb.net/${database}?retryWrites=true&w=majority`);
        logger.info("mongodb connection is complete....")
    } catch (err) {
        logger.error("mongodb connection is failed!!!",err);
    }
}

module.exports={ connectMongoDb, store};