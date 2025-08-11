import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './utils/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import IssueCertificate from './pages/IssueCertificate';
import VerifyCertificate from './pages/VerifyCertificate';
import ViewCertificates from './pages/ViewCertificates';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <ToastContainer 
              position="top-right" 
              autoClose={5000}
              theme="colored"
              toastClassName="bg-[var(--card-bg)] text-[var(--text-primary)] shadow-md"
            />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/issue" element={<IssueCertificate />} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/certificates" element={<ViewCertificates />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;