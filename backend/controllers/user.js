const { validationResult } = require('express-validator');
const usermodel=require('../models/user')
const {createtokenforuser , checktoken}=require("../services/authentication");
const blacklistmodel = require('../models/blacklist');
// async function createuser(req,res){
//     const {fullname,email,password}=req.body;
//     if(!fullname) return res.status(400).json({message : 'fullname cannot be empty'})
//     if(!email || email.length < 3 ) return res.status(400).json({message : 'length must me at least 3'})
//     if(!password || password.length < 6) return res.status(400).json({message : 'password must be at least 6 digits'})

//         try{
//             await usermodel.create({
//                 fullname,email,password
//             });
            
//         }catch(err){
//             return res.status(400).json({message : "email already exists"});
//         }

//         return res.status(202).json({success : "user created successfully"});
// }

async function createuser(req,res){
    const error=validationResult(req);
    if(!error.isEmpty()){
        console.log(error.array());
        return res.status(400).json({errors : error.array() });
    }

    try{
        const {fullname,email,password}=req.body;
        await usermodel.create({
            fullname, email, password
        });

    } catch (err) {
        console.log(err);
        return res.status(401).json({ message: "email already exists" });
    }

    return res.status(202).json({ success: "user created successfully" });

}


async function loginuser(req,res) {
    const {email,password}=req.body;
    const user=await usermodel.matchpassword(email,password);
    console.log(user);

    if(!user) return res.status(401).json({message : "wrong user credentials"})
    
        const token=createtokenforuser(user);
        res.cookie("token", token);
        return res.status(200).json({"token" : token,"user":user});
}

async function signout(req,res){
    const token=req.cookies?.token || (req.headers.authorization?.split(' ')[ 1 ]);
    const expiretoken=await blacklistmodel.create({
        token
    })
    return res.status(200).json({"success" : "user logged out succesfully"});
}

module.exports={
    createuser,
    loginuser,
    signout
}