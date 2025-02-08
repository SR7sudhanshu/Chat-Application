const express=require("express");
const router=express.Router();
const {getresult}=require("../services/ai.services")

router.get("/getresult",async (req,res)=>{
    const prompt=req.body.prompt;
    try {
        const result=await getresult(prompt);
        return res.status(200).json({message : result})
        
    } catch (error) {
        console.log(error)
       return res.status(500).json({error : "server error"}) ;
    }
})

module.exports=router;