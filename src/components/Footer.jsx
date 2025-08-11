import { FiGithub, FiLinkedin, FiTwitter, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-secondary)] text-[var(--text-primary)] py-10 border-t border-[var(--border-color)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary-color)] text-white">
                <FiCheck className="w-4 h-4" />
              </div>
              <div className="ml-2 flex items-center">
                <span className="text-xl font-bold text-[var(--primary-color)]">Cert</span>
                <span className="text-xl font-bold">Chain</span>
              </div>
            </div>
            <p className="text-[var(--text-secondary)]">
              A blockchain-based certificate validation system that ensures authenticity 
              and immutability of educational and professional certificates.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/issue" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                  Issue Certificate
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link to="/certificates" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                  View Certificates
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Connect */}
          <div>
            <h3 className="text-lg font-bold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/Karhacter/edu-cert-system" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                <FiGithub size={24} />
              </a>
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                <FiLinkedin size={24} />
              </a>
              <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                <FiTwitter size={24} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[var(--border-color)] mt-8 pt-6 text-center text-[var(--text-secondary)]">
          <p>&copy; {currentYear} BlockChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 