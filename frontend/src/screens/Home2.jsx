import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import { initializesocket, recievemessage } from "../config/socket";
import Nav from "../components/Nav";
import { UserContext } from "../context/Context";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cursorRef = useRef(null);
  const navigate = useNavigate();

  // Particle background effect
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = window.innerWidth < 768 ? 30 : 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        color: `rgba(${Math.floor(Math.random() * 100 + 155)}, 
                ${Math.floor(Math.random() * 100 + 155)}, 
                ${Math.floor(Math.random() * 100 + 155)}, 
                ${Math.random() * 0.5 + 0.1})`
      });
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(200, 200, 200, ${1 - distance / 150})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animateParticles);
    };
    
    animateParticles();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.removeChild(canvas);
    };
  }, []);

  // Custom cursor effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over interactive elements
      const interactiveElements = document.querySelectorAll('button, a, [onClick], .project-card');
      let hovering = false;
      
      interactiveElements.forEach(el => {
        if (el.contains(e.target)) {
          hovering = true;
        }
      });
      
      setIsHovering(hovering);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await axios.get("/project");
      setProjects(response.data.projects);
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
      setModalOpen(false);
      setProjectName("");
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Please login to continue");
    }
  };

  // Unread messages counter
  useEffect(() => {
    const unreadmessages = () => {
      const uniqueMessages = Array.from(new Set(messages.map(msg => JSON.stringify(msg)))).map(msg => JSON.parse(msg));
      const unreadCount = uniqueMessages.reduce((acc, msg) => {
        acc[msg.projectid] = (acc[msg.projectid] || 0) + 1;
        return acc;
      }, {});
      setUnread(unreadCount);
    };
  
    unreadmessages();
  }, [messages]);

  // Initial data fetch
  useEffect(() => {
    fetchProjects();
    initializesocket();
    recievemessage("project-messg", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        ref={cursorRef}
        className="fixed w-8 h-8 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: cursorPos.x - 16,
          y: cursorPos.y - 16,
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.5)"
        }}
        transition={{ type: "spring", mass: 0.1 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white"
          animate={{
            scale: isHovering ? 0.8 : 1.2,
            opacity: isHovering ? 0 : 0.5
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut" 
          }}
        />
      </motion.div>

      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gray-900 text-white">
        {/* Notification icon */}
        <Nav message={messages} />
        
        {/* Gradient Animated Text */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% 200%'
            }}
          >
            Welcome
          </motion.h1>
          
          <motion.p 
            className="mt-4 text-gray-400 text-lg max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Bring your ideas to life with our project creation tool.
          </motion.p>
        </motion.div>

        {/* Button to Open Modal */}
        <motion.button
          className="mt-8 px-8 py-4 text-lg font-medium rounded-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 shadow-lg relative overflow-hidden group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setModalOpen(true)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="relative z-10">Create New Project</span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
        </motion.button>

        {/* Project List */}
        <motion.div 
          className="mt-16 w-full max-w-6xl px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-3xl font-semibold text-center mb-12"
            variants={itemVariants}
          >
            Your Projects
          </motion.h2>
          
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <motion.div
                  key={project._id}
                  className={`project-card p-6 rounded-xl shadow-2xl relative overflow-hidden cursor-pointer ${
                    unread && unread[project._id] 
                      ? "border-2 border-green-500" 
                      : "bg-gray-800 bg-opacity-50 backdrop-blur-sm"
                  }`}
                  onClick={() => navigate(`/project`, { state: { project } })}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <h3 className="text-xl font-bold text-indigo-400 relative z-10">
                    {project.name}
                  </h3>
                  <p className="mt-2 text-gray-300 relative z-10">
                    Members: {project.users.length}
                  </p>
                  <p className="mt-2 text-gray-400 text-sm relative z-10">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  
                  {unread && unread[project._id] && (
                    <motion.span 
                      className="absolute top-4 right-4 px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {unread[project._id]} New
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.p 
              className="text-center text-gray-500"
              variants={itemVariants}
            >
              No projects created yet.
            </motion.p>
          )}
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl relative border border-gray-700"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
              >
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Create a New Project
                </h2>
                
                <form onSubmit={handleCreateProject}>
                  <motion.input
                    type="text"
                    placeholder="Enter project name"
                    className="w-full px-4 py-3 mb-6 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    whileFocus={{ 
                      boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)"
                    }}
                  />
                  
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      type="button"
                      className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      onClick={() => setModalOpen(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 shadow-md transition-all"
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 5px 15px rgba(99, 102, 241, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Home;