const logger=require("../startup/logger");
module.exports=function(err, req, res, next){
    logger.error(err.message);
    return res.render("error/500",{
        title: "Error"
    });
}