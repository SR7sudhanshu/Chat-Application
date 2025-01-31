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


//creating a http server using app 
const server=http.createServer(app);
const io=new Server(server);


//using the middleware to connect only authenticated users only
//using auth so that sending the request in auth form frontend
io.use((socket,next)=>{
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

io.on('connection', (socket) =>{
    console.log("a user connected")
    socket.on('disconnect',()=>{
        console.log('a user disconnceted')
    })
})


server.listen(port,()=>{
    console.log(`server has started at the port ${port}`)
})
