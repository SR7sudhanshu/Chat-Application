const mongoose=require("mongoose");

const projectschema=new mongoose.Schema({
    name : {
        type : String,
        required : true,
        lowercase : true,
        unique : true,
        trim : true
    },
    users :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ] 
},{timestamps : true});

const projectmodel=mongoose.model("projects",projectschema);

module.exports=projectmodel;