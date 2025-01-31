const jwt=require("jsonwebtoken");

const auth = async function(req,res,next){
    const token=req.cookies?.token || (req.headers.authorization?.split(' ')[ 1 ]);

    if(!token){
        return res.status(401).json({ error : "unathurized user "});
    }

    const user=jwt.verify(token,process.env.SECRET);
    req.user=user;
    console.log("user at the token function is - ",req.user);
    return res.status(202).json({"user" : req.user});
}

module.exports={
    auth
}