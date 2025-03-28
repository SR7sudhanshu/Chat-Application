import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import { Navigate,useNavigate } from "react-router-dom";
import { initializesocket,recievemessage } from "../config/socket";
import Nav from "../components/Nav";


const Home = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unread,setunread]=useState(null);


  const navigate=useNavigate();

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await axios.get("/project"); // API endpoint to fetch projects
      console.log("the project data is - ",response.data);
      setProjects(response.data.projects); // Assuming the response structure
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Handle project creation
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/project", {
        name: projectName,
      });
      console.log(response.data);
      setModalOpen(false);
      setProjectName("");
      fetchProjects(); // Refresh project list after creation
    } catch (error) {
      console.error("Error creating project:", error);
      alert("please login to continue");
    }
  };

  // function to set the number of messages recieved from the groups
  const unreadmessages=()=>{
    const uniqueMessages = Array.from(new Set(messages.map(msg => JSON.stringify(msg)))).map(msg => JSON.parse(msg));
    const unreadCount = uniqueMessages.reduce((acc, msg) => {
      acc[msg.projectid] = (acc[msg.projectid] || 0) + 1;
      return acc;
    }, {});
    setunread(unreadCount);
    console.log(unread);
  }


  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
    initializesocket();
    recievemessage("project-messg", (data) => {
          setMessages((prev) => [...prev, data]); // Append incoming message to state
        });
    unreadmessages();
  }, []);

  return (
    <>
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-r from-gray-900 via-black to-gray-800 text-white ">
      {/*notification icon*/}
      <Nav message={messages}/>

      {/* Rotating 3D Box Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <div className="animate-spin-slow rounded-lg border-[15px] border-t-gray-700 border-r-gray-600 border-b-gray-500 border-l-gray-400 w-64 h-64 transform rotate-45 blur-md"></div>
        </div>
      </div>

      {/* Gradient Animated Text */}
      <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 animate-text-shadow">
        Welcome
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-gray-400 text-lg text-center">
        Bring your ideas to life with our project creation tool.
      </p>

      {/* Button to Open Modal */}
      <button
        className="mt-8 px-6 py-3 text-lg font-medium rounded-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-110 shadow-lg shadow-green-500/50"
        onClick={() => setModalOpen(true)}
      >
        Create New Project
      </button>



      {/* Project List */}
      <div className="mt-16 w-full max-w-5xl">
        <h2 className="text-3xl font-semibold text-center mb-8">Your Projects</h2>
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
              onClick={()=>{
                navigate(`/project`,{
                  state : {project}
                })
              }}
                key={project._id}
                className="p-6 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                <h3 className="text-xl font-bold text-indigo-400">{project.name}</h3>
                <p>{project.users.length}</p>
                <p className="mt-2 text-gray-400">
                  Created on: {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No projects created yet.</p>
        )}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 right-10 animate-float">
        <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-yellow-500 rounded-full shadow-lg shadow-pink-500/30 blur-sm"></div>
      </div>
      <div className="absolute bottom-16 left-20 animate-float-slower">
        <div className="w-20 h-20 bg-gradient-to-tl from-blue-500 to-indigo-500 rounded-full shadow-lg shadow-blue-500/30 blur-sm"></div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-96 shadow-xl shadow-indigo-500/50">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Create a New Project
            </h2>
            <input
              type="text"
              placeholder="Enter project name"
              className="w-full px-4 py-2 mb-6 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-md shadow-indigo-500/50"
                onClick={handleCreateProject}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Home;
