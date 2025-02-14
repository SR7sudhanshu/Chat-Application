const express=require('express');
const env=require('dotenv');
env.config();
const http=require("http");
const morgan=require("morgan");
const {connectDB}=require("./db/db")
const port=process.env.port || 5005;
const cookieparer=require("cookie-parser");
const cors=require("cors");
const projectrouter=require("./routes/project")
const {Server}=require("socket.io")
const {checktoken}=require("./services/authentication")
const userrouter=require("./routes/user");
const cookieParser = require('cookie-parser');
const { authenticationforall } = require('./middelewares/authentication2');
const jwt = require('jsonwebtoken');
const projectmodel = require('./models/project');
const airouter=require("./routes/ai.routes");
const { getresult } = require('./services/ai.services');
const mssgrouter=require("./routes/message.route")
const app=express();

connectDB().then(()=>{
    console.log("mongo db connected");
}).catch((err)=>{
    console.log("error in connection--",err);
})

app.use(cors());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(authenticationforall)

app.use("/",userrouter);
app.use("/project",projectrouter);
app.use("/ai",airouter);
app.use("/message",mssgrouter);

//creating a http server using app 
const server=http.createServer(app);
const io=new Server(server,{
    cors: {
        origin: "*", // Replace with your frontend URL
        methods: ["GET", "POST"], 
        credentials: true 
      }
    }
);


//using the middleware to connect only authenticated users only
//using auth so that sending the request in auth form frontend
io.use(async (socket,next)=>{
    try {

        const token=socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ]
        if(!token) return next(new Error("authentication error"))
            
            const decoded=jwt.verify(token,process.env.SECRET);
            if(!decoded) return next(new Error("authentication error"));

            socket.user=decoded;
             
            next();

    } catch (error) {
        next(error)
    }

})
const users={};
io.on('connection',async (socket) =>{
    console.log("a user connected");
    if(users[socket.id]==undefined){
    users[socket.id]=socket.user._id;
    }
    io.emit("currentonline",users);

    const userid=socket.user._id;
    //joining the room for the all the project of the user
    const allprojects=await projectmodel.find({
        users : userid
    })
    allprojects.forEach((project)=>{
        const projectid=project._id.toString();
        socket.join(projectid);
    })

   
    socket.on("project-messg",async (data)=>{
        console.log(data);
        const roomid=data.projectid;
        //using socket.to so that the message goes from user to others excluding itsel
        socket.to(roomid).emit("project-messg",data);

        if(data.message.includes("@ai")){
            const result=await getresult(data.message);
            const newdata={
                message : result,
                sender : {
                    id : "AI",
                    email : "AI"
                }
            }
            io.to(roomid).emit("project-messg",newdata);
        }

    })

    socket.on('disconnect',()=>{
        console.log('a user disconnceted')
        delete users[socket.id];
        io.emit("currentonline",users);
    })
})




server.listen(port,()=>{
    console.log(`server has started at the port ${port}`)
})
