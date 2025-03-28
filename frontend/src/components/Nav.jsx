import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import { Navigate,useNavigate } from "react-router-dom";
import { initializesocket } from "../config/socket";


const Nav = (props) => {
    const [noti,setnoti]=useState(0);
  return (
    <>
    <div className='notificationbutton' style={{position: 'absolute', cursor: 'pointer',top: '10px',right: '10px',height:'32px',width:'32px',borderRadius:'50%',backgroundColor:'transparent',display:'flex',justifyContent:'center',alignItems:'center'}}> 
        <i className="ri-notification-4-fill"></i>
        <sup className=' ${ {noti}>1 ? text-red-600 : text-white  }'>{noti}</sup>
    </div>
    </> 
  )
}

export default Nav
