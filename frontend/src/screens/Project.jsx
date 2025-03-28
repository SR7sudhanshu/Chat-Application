import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initializesocket, sendmessage, recievemessage } from "../config/socket";
import Markdown from "markdown-to-jsx";
import axios from "../config/axios";

const Project = () => {
  const [sidepanel, setsidepanel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [allUsers, setallUsers] = useState([]);
  const location = useLocation();
  const [usersInProject, setusersInProject] = useState(location.state?.project?.users || []);
  const [curruser, setcurruser] = useState(null);
  const [message, setmessage] = useState("");
  const [messages, setMessages] = useState([]); // New state for messages
  const projectid = location.state.project._id || null;
  const [onlineusers, setonlineusers] = useState([]);
  const navigate = useNavigate();

  // Fetch the current user
  const getcurruser = async () => {
    try {
      const response = await axios.get("/curruser");
      const data = response.data?.user;
      if (!data) {
        navigate("/login"); // Redirect to login if no user is found
        return;
      }
      setcurruser(data);
    } catch (error) {
      console.error("Error fetching current user:", error);
      navigate("/login"); // Redirect to login in case of an error
    }
  };

  // Send a message
  const send = async () => {
    try {
      if (!message.trim()) return;
      const outgoingMessage = { message, sender: curruser, projectid: projectid };

      const messg = await axios.post("/message/sendmessage", outgoingMessage);
      console.log(messg.data);
      const messg_id = messg.data.newmessage._id;
      console.log("message saved to database");
      outgoingMessage.messageid = messg_id;
      console.log(outgoingMessage);
      sendmessage("project-messg", outgoingMessage);
      setMessages((prev) => [...prev, outgoingMessage]); // Append outgoing message to state
      setmessage("");
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch all users
  const getallusers = async () => {
    try {
      const response = await axios.get("/allusers");
      setallUsers(response.data.allusers || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch users in the project
  const getprojectuser = async () => {
    try {
      const response = await axios.get(`/project/users/${projectid}`);
      setusersInProject(response.data.users || []);
    } catch (err) {
      console.error("Error fetching project users:", err);
    }
  };

  // Toggle user selection for adding to the project
  const toggleUserSelection = (userId) => {
    const updatedSet = new Set(selectedUsers);
    if (updatedSet.has(userId)) {
      updatedSet.delete(userId);
    } else {
      updatedSet.add(userId);
    }
    setSelectedUsers(updatedSet);
  };

  // Add selected users to the project
  const addUsersToProject = async () => {
    try {
      const projectId = location.state.project._id;
      if (!projectId) {
        console.error("Project ID is missing");
        return;
      }
      const userId = Array.from(selectedUsers);
      await axios.put("/project/adduser", { projectId, userId });
      setShowModal(false);
      setSelectedUsers(new Set());
      getprojectuser();
    } catch (error) {
      console.error("Error adding users to the project:", error);
    }
  };

  // Fetch all messages for the project
  const fetchmessages = async () => {
    try {
      const response = await axios.get(`/message/allmessages/${projectid}`);
      console.log("messages fetched");
      console.log(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Initialize data and socket connections on component mount
  useEffect(() => {
    getcurruser();
    getallusers();
    getprojectuser();
    initializesocket();
    fetchmessages();
    recievemessage("project-messg", (data) => {
      setMessages((prev) => [...prev, data]); // Append incoming message to state
    });
  }, []);

  // Listen for online users
  useEffect(() => {
    recievemessage("currentonline", (data) => {
      setonlineusers(data);
      console.log(data);
    });
  },[]);

  return (
    <main className="w-screen h-screen flex bg-slate-600">
      <div className="left bg-gray-400 w-1/2 flex flex-col">
        <header className="w-full h-16 bg-gray-600 flex justify-between items-center shadow-lg">
          <button
            className="p-5 hover:bg-orange-600 transition-all duration-300 rounded-lg transform hover:scale-105"
            onClick={() => setsidepanel(true)}
          >
            <i className="ri-group-fill text-white text-2xl"></i>
          </button>
          <button
            className="adduser p-5 bg-gray-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
            onClick={() => setShowModal(true)}
          >
            Add User <i className="ri-user-add-fill"></i>
          </button>
        </header>

        <div
          className={`sidebar absolute ${
            sidepanel ? "translate-x-0 " : "-translate-x-full"
          } transition-transform duration-500 ease-in-out
          bg-slate-500 h-full w-1/3 flex z-10 flex-col gap-1 shadow-2xl`}
        >
          <button
            onClick={() => setsidepanel(false)}
            className="text-white ml-auto p-4 hover:bg-slate-600 rounded-full transition-all duration-300 transform hover:rotate-90"
          >
            <i className="ri-close-large-line text-2xl"></i>
          </button>

          {usersInProject.length > 0 ? (
            usersInProject.map((user) => {
              // Check if the user is online
              const isOnline = Object.values(onlineusers).includes(user._id);

              return (
                <div
                  className="overflow-hidden users w-full h-16 bg-slate-400 flex items-center text-3xl hover:bg-slate-600 transition-all duration-300 cursor-pointer transform hover:translate-x-2"
                  key={user._id}
                >
                  <i className="ri-account-circle-fill px-4"></i>
                  <small className="flex-1">{user.fullname}</small>
                  {/* Display online/offline status */}
                  <span
                    className={`ml-auto px-3 py-1 text-sm rounded-full ${
                      isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              );
            })
          ) : (
            <div>No users found</div>
          )}
        </div>

        <div className="messagearea flex flex-col flex-grow gap-1 p-1 overflow-y-auto">
          {messages.map((msg, index) => {
            const isCurrentUser = msg.sender.email === curruser.email;
            const isAI = msg.sender.email === "AI";

            return (
              <div
                key={msg._id}
                className={`${
                  isCurrentUser
                    ? "outgoing ml-auto bg-green-600 text-white w-fit max-w-56"
                    : isAI
                    ? "ai-message w-full bg-gray-800 text-white overflow-auto max-h-80"
                    : "incoming bg-blue-600 text-white w-fit max-w-56"
                }  flex flex-col p-2 rounded-lg shadow-md `}
              >
                <small className="text-base opacity-55">{msg.sender.email}</small>
                {isAI ? (
                  <Markdown>{msg.message}</Markdown>
                ) : (
                  <span>{msg.message}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="input w-full flex flex-row p-2 bg-white shadow-lg">
          <input
            value={message}
            onChange={(e) => setmessage(e.target.value)}
            className="p-3 h-10 flex-grow max-h-14 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
            placeholder="Enter the message"
            type="text"
            name="message"
          />
          <button
            onClick={send}
            className="px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-110"
          >
            <i className="p-1 ri-send-plane-2-fill text-3xl"></i>
          </button>
        </div>
      </div>

      <section className="right w-2/3 bg-white"></section>

      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-1/2 p-5 rounded-lg shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Users</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-red-500 text-2xl hover:text-red-600 transition-all duration-300 transform hover:rotate-90"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {allUsers.map((user) => (
                <div
                  key={user._id}
                  className={`cursor-pointer p-3 border rounded-md flex items-center justify-between ${
                    selectedUsers.has(user._id) ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                  } transition-all duration-300 transform hover:scale-105`}
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <span>{user.email}</span>
                  {selectedUsers.has(user._id) && <i className="ri-check-line text-xl animate-bounce"></i>}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={addUsersToProject}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
