import axios from "../config/axios";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { initializesocket } from "../config/socket";


const Project = () => {
  const [sidepanel, setsidepanel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [allUsers, setallUsers] = useState([]);
  const location = useLocation();
  const [usersInProject, setusersInProject] = useState(location.state?.project?.users || []);
  console.log(location.state);
  const projectid = location.state.project._id || null;

  
  const getallusers = async (params) => {
    console.log("entered the get all users function");
    try {
      const response = await axios.get("/allusers");
      const allusers = response.data.allusers;
      console.log("alluser variable is ", allusers);
      setallUsers(allusers);
    } catch (err) {
      console.log(err);
    }
  };

  const getprojectuser = async () => {
    const response = await axios.get(`/project/users/${projectid}`);
    console.log("get the project user function response", response.data.users);
    setusersInProject(response.data.users);
  };

  useEffect(() => {
    initializesocket();
    getallusers();
    getprojectuser();
  }, []);

  // Handle user selection
  const toggleUserSelection = (userId) => {
    const updatedSet = new Set(selectedUsers);
    if (updatedSet.has(userId)) {
      updatedSet.delete(userId);
    } else {
      updatedSet.add(userId);
    }
    setSelectedUsers(updatedSet);
  };

  // Add users to the project
  async function addUsersToProject() {
    try {
      const projectId = location.state.project._id;
      if (!projectId) {
        console.error("Project ID is missing");
        return;
      }

      const userId = Array.from(selectedUsers); // Convert set to array
      console.log("the request in the format is", {
        projectId,
        userId,
      });
      const response = await axios.put("/project/adduser", {
        projectId,
        userId,
      });
      console.log(response);
      // Close the modal after successful addition
      setShowModal(false);
      setSelectedUsers(new Set());
      getprojectuser();
    } catch (error) {
      console.error("Error adding users to the project:", error);
    }
  }

  return (
    <main className="w-screen h-screen flex bg-slate-600">
      <div className="left bg-red-400 w-1/3 flex flex-col">
        <header className="w-full h-16 bg-orange-700 flex justify-between items-center shadow-lg">
          <button
            className="p-5 hover:bg-orange-600 transition-all duration-300 rounded-lg transform hover:scale-105"
            onClick={() => {
              setsidepanel(true);
            }}
          >
            <i className="ri-group-fill text-white text-2xl"></i>
          </button>
          <button
            className="adduser p-5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
            onClick={() => setShowModal(true)}
          >
            Add User <i className="ri-user-add-fill"></i>
          </button>
        </header>

        <div className="messagearea flex flex-col flex-grow gap-1 p-1 overflow-y-auto">
          <div className="incoming w-fit bg-white max-w-48 flex flex-col p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <small className="text-base opacity-55">user@ggmail.com</small>
            message by the user
          </div>
          <div className="outgoing ml-auto w-fit bg-white max-w-48 flex flex-col p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <small className="text-base opacity-55">user@ggmail.com</small>
            message by the user
          </div>
        </div>

        <div
          className={`sidebar absolute ${
            sidepanel ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-500 ease-in-out
          bg-slate-500 h-full w-1/3 flex flex-col gap-1 shadow-2xl`}
        >
          <button
            onClick={() => setsidepanel(false)}
            className="text-white ml-auto p-4 hover:bg-slate-600 rounded-full transition-all duration-300 transform hover:rotate-90"
          >
            <i className="ri-close-large-line text-2xl"></i>
          </button>

          {usersInProject.length > 0 ? (
            usersInProject.map((user) => (
              <div
                className="overflow-hidden users w-full h-16 bg-slate-400 flex items-center text-3xl hover:bg-slate-600 transition-all duration-300 cursor-pointer transform hover:translate-x-2"
                key={user._id}
              >
                <i className="ri-account-circle-fill px-4"></i>
                <small>{user.fullname}</small>
              </div>
            ))
          ) : (
            <div>No users found</div>
          )}
        </div>

        <div className="input w-full flex flex-row p-2 bg-white shadow-lg">
          <input
            className="p-3 h-10 flex-grow max-h-14 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
            placeholder="enter the message"
            type="text"
            name="message"
          />
          <button className="px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-110">
            <i className="p-1 ri-send-plane-2-fill text-3xl"></i>
          </button>
        </div>
      </div>

      <section className="right w-2/3 bg-white"></section>

      {/* Modal for adding users */}
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
                    selectedUsers.has(user._id)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  } transition-all duration-300 transform hover:scale-105`}
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <span>{user.email}</span>
                  {selectedUsers.has(user._id) && (
                    <i className="ri-check-line text-xl animate-bounce"></i>
                  )}
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