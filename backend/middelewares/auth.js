const jwt=require("jsonwebtoken");

const auth = async function(req,res,next){
    const token=req.cookies?.token || (req.headers.authorization?.split(' ')[ 1 ]);

    if(!token){
        return res.status(401).json({ error : "unathurized user "});
    }
    try {
        const user=jwt.verify(token,process.env.SECRET);
        req.user=user;
        console.log("user at the token function is - ",req.user);
        return res.status(202).json({"user" : req.user});
        
    } catch (error) {
        console.log(error);
        return res.status(404).json({errormessage : error})
    }
}

module.exports={
    auth
}