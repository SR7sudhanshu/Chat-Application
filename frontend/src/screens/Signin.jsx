import React, { useState } from "react";
import axios from "../config/axios";
import { Link,useNavigate } from "react-router-dom";
function Signin() {
    const navigate=useNavigate();
    const [fullname,setfullname]=useState("");
    const [password,setpassword]=useState("");
    const [email,setemail]=useState("");

    function submithandler(e){
        e.preventDefault();

        axios.post("/signup",{
            fullname,email,password
        }).then((res)=>{
            console.log("user successfully created")
            console.log(res);
            navigate("/login");
        }).catch((err)=>{
            console.log(err);
        })
    }
    

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl shadow-xl border border-gray-600">
        <h1 className="text-4xl font-extrabold text-white text-center mb-8">Create Account</h1>
        <form
        onSubmit={submithandler}
        >
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-gray-300 text-sm font-semibold mb-2"
            >
              Username
            </label>
            <input
              onChange={(e)=> setfullname(e.target.value)}
              type="text"
              id="username"
              className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-500"
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-gray-300 text-sm font-semibold mb-2"
            >
              Email
            </label>
            <input
              onChange={(e)=> setemail(e.target.value)}
              type="email"
              id="email"
              className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-gray-300 text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
                onChange={(e)=> setpassword(e.target.value)}
              type="password"
              id="password"
              className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500"
          >
            Sign Up
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signin;
