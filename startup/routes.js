const userRoutes=require("../routes/userRoutes");
const adminRoutes=require("../routes/adminRoutes");
const notFound=require("../middlewares/404");
const error=require("../middlewares/error");

module.exports=function(app){
    app.use("/admin",adminRoutes);
    app.use(userRoutes);
    app.use("*", notFound);
    app.use(error);
}