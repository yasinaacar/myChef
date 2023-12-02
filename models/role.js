const { Schema, model }=require("mongoose");
const Joi=require("joi");


const roleSchema=new Schema({
    roleCode: String,
    roleName: {
        type: String,
        unique: true,
    },
    url:String,
});

roleSchema.pre('save', function(next) {
    if (this.roleName) {
      this.roleName = this.roleName.toLowerCase();
    }
    next();
  });

const Role=model("Role", roleSchema);

async function validateRole(role){
    const schema=Joi.object({
        roleName: Joi.string().required().min(2).max(30)
    })
    return schema.validate({roleName: role.roleName.toLowerCase()})
}

module.exports={ Role, validateRole };