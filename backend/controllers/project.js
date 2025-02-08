const projectmodel=require("../models/project");
const { validationResult } = require('express-validator');

async function createproject(req,res) {
    const error=validationResult(req);
    if(!error.isEmpty()){
        console.log(error.array());
        return res.status(400).json({errors : error.array() });
    }

    const {name}=req.body;
    console.log(name);
    console.log(req.user);

    const user=req.user;
    if(!user) return res.status(404).json({error : "unathurized user"});
    const userid=user._id;

try {
    const project=await projectmodel.create({
        name,
        users : [ userid ]
    })
    res.project=project;
    console.log("the projectd created is ",project);
    return res.status(202).json({"project" : project});
} catch (err) {
    console.log(err);
    return res.status(400).json({"error" : "something went wrong"})
}

}

module.exports={
    createproject
}