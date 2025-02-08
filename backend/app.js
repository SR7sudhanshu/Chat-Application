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
        const projectid=socket.handshake.query.projectid;
        const project= await projectmodel.findById(projectid);
        console.log("the projcet at the socket middlewareis-",project);
        if(!project) return next(new Error("project id is not valid"));

        const token=socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ]
        if(!token) return next(new Error("authentication error"))
            
            const decoded=jwt.verify(token,process.env.SECRET);
            if(!decoded) return next(new Error("authentication error"));

            socket.user=decoded;
            socket.project=project;
           
            next();

    } catch (error) {
        next(error)
    }

})

io.on('connection', (socket) =>{
    console.log("a user connected")
    const roomid=socket.project._id.toString();
    socket.join(roomid)
    socket.on("project-messg",async (data)=>{
        console.log(data);
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
    })
})


server.listen(port,()=>{
    console.log(`server has started at the port ${port}`)
})
