const {Schema,model}=require("mongoose");

const blacklistschema = new Schema ({
    token : {
        type : String,
        trim : true,
    }
},{timestamps : true})

const blacklistmodel=model( "blacklistmodel" , blacklistschema );
module.exports=blacklistmodel;