const { Schema, model }=require("mongoose");
const Joi=require("joi");

const tableSchema=new Schema({
    tableCode: String,
    tableName: {
        type: String,
        unique: true
    },
    url: {
        type: String,
        unique: true
    },
});

const Table=model("Table",tableSchema);

async function validateTable(table){
    const schema=Joi.object({
        tableName: Joi.string().required().min(1)
    })
    return schema.validate(table)
}

module.exports={ Table, validateTable };