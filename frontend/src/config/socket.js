import socket from "socket.io-client";

let socketinstance=null;

export const initializesocket =()=>{
    socketinstance=socket(import.meta.env.vite_api_url,{
        auth : {
            token : localStorage.getItem('token'),
        }
    })

    return socketinstance;
}