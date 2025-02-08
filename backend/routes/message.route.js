const express=require("express");
const router=express.Router();
const messagemodel=require("../models/message.model");
router.get("/allmessages/:id",async (req,res)=>{
    try {  
        const projectid=req.params.id;
        const messages=await messagemodel.find({project:projectid}).populate("sender");
        return res.status(200).json({messages});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error : "server error"});
    }
})
router.post("/sendmessage",async (req,res)=>{
    const data=req.body;
    try {
        const newmessage=await messagemodel.create({
            message :data.message,
            project : data.projectid,
            sender : data.sender._id
        });
        return res.status(200).json({newmessage});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error : "server error"});
    }
})

module.exports=router;