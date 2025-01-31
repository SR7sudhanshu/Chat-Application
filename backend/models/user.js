const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
const {Schema,model}=require("mongoose")
const { createHmac } = require('node:crypto');

const usershcema=new Schema({
    fullname : {
        type : String,
        required : true,
        trim : true,
        lowercase :true,
        minlength:[1,"name should be more than 1 letter"]
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
    },
    password : {
        type : String
    }
},{timestamps : true})

usershcema.pre("save",async function (next){
    const user=this;
    
    if(!user.isModified("password")) {console.log("not modified password"); return ;}
    
    const hash = createHmac('sha256', process.env.SECRET2 || "sr7isgreat")
    .update(this.password)
    .digest('hex');
    
        this.password=hash;
        this.salt=process.env.SECRET2;

            next();
})

usershcema.static("matchpassword",async function (email,password) {
    const user=await this.findOne({email});
                
    if(!user ) return false;
                
    const givenpasswordHash = createHmac('sha256', process.env.SECRET2 || "sr7isgreat")
        .update(password)
        .digest('hex');
                
    if(givenpasswordHash === user.password ) return user;
    else return false;
})

const usermodel=model("User",usershcema);
module.exports=usermodel;