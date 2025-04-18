const jwt=require("jsonwebtoken");
const { checktoken } = require("../services/authentication");

const authenticationforall = async function(req,res,next){
    const token=req.cookies?.token || (req.headers.authorization?.split(' ')[ 1 ]);

    if(!token){
        return next();
    }
    try {
        
        const user=checktoken(token)
        req.user=user;
        console.log("user at the token function is - ",req.user);
    } catch (error) {
        console.log("the user not found");
        return next();
    }
    return next();
}

module.exports={
    authenticationforall
}