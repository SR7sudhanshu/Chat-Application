const { Router }=require("express");
const { createproject } = require("../controllers/project");
const { body } = require("express-validator");
const projectmodel = require("../models/project");
const usermodel = require("../models/user");
const mongoose=require("mongoose");

const router=Router();

router.get("/",async (req,res)=>{
    const userid=req.user._id;
    console.log(userid);
    try{

        const allprojects=await projectmodel.find({
            users : userid
        })
        res.status(200).json({"projects" : allprojects});
    }catch(err){
        console.log(err);
        res.status(400).json({ error : "there was problem getting the projects"})
    }
})

router.post("/",body('name').isString().withMessage("enter a valid name")
,createproject);


//we get the user id and the project id need to add the user id in the project 

router.put("/adduser", async (req, res) => {
    const projectid = req.body.projectId;
    const userIds = req.body.userId; // Expecting an array of user IDs
    
    console.log("the adduser put portal",projectid,userIds)

    if (!mongoose.Types.ObjectId.isValid(projectid)) {
      console.log("Invalid Project ID");
      return res.status(404).json({ message: "Invalid project ID" });
    }
  
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "User IDs should be a non-empty array" });
    }
  
    let updatedProject;
    try {
      updatedProject = await projectmodel.findByIdAndUpdate(
        projectid,
        { $addToSet: { users: { $each: userIds } } }, // Use $each to add all user IDs
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  
    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }
  
    return res.status(200).json({ updatedProject });
  });

router.get("/users/:id",async (req,res)=>{
    const projectid=req.params.id;
    const project=await projectmodel.findById(projectid).populate("users");
    if(!project) return res.status(404).json({error : "project not found"});
    const usersofproject=project.users;
    return res.status(202).json({users : usersofproject});
     
})

module.exports=router