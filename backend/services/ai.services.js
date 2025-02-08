const { GoogleGenerativeAI } = require("@google/generative-ai");
const env=require('dotenv');
env.config();
const genAI = new GoogleGenerativeAI("AIzaSyBYGVt1Qs1NEDD8hDOt-LXbqYeJ49gisec");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const getresult=async (prompt)=>{
    console.log("the prompt is - ",prompt)
    const result = await model.generateContent(prompt);
    // console.log(result.response.text());
    return result.response.text();
}
module.exports={
    getresult
}
