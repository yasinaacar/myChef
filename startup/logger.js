const { createLogger, format, transports }=require("winston");
const { combine, prettyPrint, timestamp }=format;


const logger=createLogger({
        level:"debug",
        format: combine(
            timestamp({format:"DD/MM/YYYY HH:mm:ss"}),
            prettyPrint()
        ),
        transports:[
            new transports.Console(),
            new transports.File({filename: "logs/logs.log", level:"error"}),
            new transports.File({filename: "logs/info.log", level:"info"})
        ]                
});

module.exports=logger;