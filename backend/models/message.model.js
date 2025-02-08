const {model, Schema}=require("mongoose")

const messageSchema=new Schema({
    message : {
        type : String,
        required : true
    },
    sender : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    project : {
        type : Schema.Types.ObjectId,
        ref : "projects"
    }
},{timestamps : true});

const messageModel=model("Message",messageSchema);

module.exports=messageModel;