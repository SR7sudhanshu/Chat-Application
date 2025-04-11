const mongoose=require("mongoose");
require('dotenv').config()
function connectDB(){
    return mongoose.connect(process.env.MONGOURL)
}

module.exports={
    connectDB
}