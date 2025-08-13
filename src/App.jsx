import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './utils/ThemeContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/user/Home';
import IssueCertificate from './pages/user/IssueCertificate';
import VerifyCertificate from './pages/user/VerifyCertificate';
import ViewCertificates from './pages/user/ViewCertificates';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRegisterUser from './pages/admin/AdminRegisterUser';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminOrganizations from './pages/admin/AdminOrganizations';
import AdminUserLookup from './pages/admin/AdminUserLookup';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ToastContainer 
          position="top-right" 
          autoClose={5000}
          theme="colored"
          toastClassName="bg-[var(--card-bg)] text-[var(--text-primary)] shadow-md"
        />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/issue" element={<IssueCertificate />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/certificates" element={<ViewCertificates />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/register" element={<AdminRegisterUser />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />
            <Route path="/admin/organizations" element={<AdminOrganizations />} />
            <Route path="/admin/lookup" element={<AdminUserLookup />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;