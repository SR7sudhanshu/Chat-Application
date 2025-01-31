const jwt=require("jsonwebtoken");

const authenticationforall = async function(req,res,next){
    const token=req.cookies?.token || (req.headers.authorization?.split(' ')[ 1 ]);

    if(!token){
        return next();
    }

    const user=jwt.verify(token,process.env.SECRET);
    req.user=user;
    console.log("user at the token function is - ",req.user);
    return next();
}

module.exports={
    authenticationforall
}