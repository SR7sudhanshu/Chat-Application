const mongoose=require("mongoose");

function connectDB(){
    return mongoose.connect(process.env.MONGOURL || "mongodb://localhost:27017/newchatapp")
}

module.exports={
    connectDB
}