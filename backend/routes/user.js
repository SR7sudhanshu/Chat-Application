const express=require('express');
const router=express.Router();
const {createuser,loginuser}=require("../controllers/user");
const { body } = require('express-validator');
const { auth } = require('../middelewares/auth');
const usermodel = require('../models/user');

router.get("/",(req,res)=>{
    res.status(200).send("<h1>this is the homepage</h1>")
})



router.post("/signup",body('email').isEmail().withMessage("email must be a valid email address")
,body('fullname').isString().withMessage("fullname should only have characters and not numbers")
,body('password').isLength({min : 3}).withMessage("password must be 3 or more characters"),createuser);

router.post("/login",loginuser);

router.get("/profile",auth,(req,res)=>{
    res.status(200).send("this is the profile page");
});

router.get("/allusers",async (req,res)=>{

    const userid=req.user._id;
    if(!userid) return res.status(400).json({"error":"user not authorized"});
  
    const allUsers = await usermodel.find({ _id: { $ne: userid } });

    if(!userid) return res.status(404).json({error : "unathurized user"});
   
    res.status(202).json({"allusers" : allUsers});
})

router.get("/curruser",async (req,res)=>{
    const user=req.user;
    if(!user) return res.status(404).json({error : "unathurized user"});

        return res.status(200).json({user : user})
})

module.exports=router;