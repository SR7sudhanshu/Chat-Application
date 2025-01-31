require('dotenv').config()
const jwt=require("jsonwebtoken");

function createtokenforuser(user){
    console.log("user for token",user);
    const payload={
        _id : user._id,
        fullname : user.fullname,
        email : user.email,
    }

    const token=jwt.sign(payload ,process.env.SECRET);

    return token;
}

function checktoken(token){
    const payload=jwt.verify(token,process.env.SECRET);
    return payload;
}

module.exports={
    createtokenforuser,
    checktoken,
}