import socket from "socket.io-client";

let socketinstance=null;

export const initializesocket =(projectid)=>{
    socketinstance=socket("http://localhost:5005",{
        auth : {
            token : localStorage.getItem('token'),
        },
        query :{
            projectid
        }
    })

    return socketinstance;
}

export const sendmessage=(eventname,cb)=>{
    socketinstance.emit(eventname,cb);
}
export const recievemessage=(eventname,cb)=>{
    socketinstance.on(eventname,cb);
}