import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX, FiCheck, FiFileText } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-[var(--card-bg)] shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary-color)] text-white">
                <FiCheck className="w-5 h-5" />
              </div>
              <div className="ml-2 flex items-center">
                <span className="text-2xl font-bold text-[var(--primary-color)]">Block</span>
                <span className="text-2xl font-bold">Chain</span>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-6">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Home
              </NavLink>
              
              <NavLink 
                to="/issue" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Issue Certificate
              </NavLink>
              
              <NavLink 
                to="/verify" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Verify Certificate
              </NavLink>
              
              <NavLink 
                to="/certificates" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                View Certificates
              </NavLink>
              
              <NavLink 
                to="/admin" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Admin
              </NavLink>
              
        
            </div>
            
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button 
              onClick={toggleMenu}
              className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] focus:outline-none"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border-color)]">
            <div className="flex flex-col space-y-4">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => setIsOpen(false)}
              >
                Home
              </NavLink>
              
              <NavLink 
                to="/issue" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => setIsOpen(false)}
              >
                Issue Certificate
              </NavLink>
              
              <NavLink 
                to="/verify" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => setIsOpen(false)}
              >
                Verify Certificate
              </NavLink>
              
              <NavLink 
                to="/certificates" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => setIsOpen(false)}
              >
                View Certificates
              </NavLink>
              
              <NavLink 
                to="/admin" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => setIsOpen(false)}
              >
                Admin
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 