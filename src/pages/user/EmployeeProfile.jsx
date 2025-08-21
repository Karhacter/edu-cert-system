import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEmployeeDetails, updateEmployeeProfile } from '../../utils/apiAdmin';

const EmployeeProfile = () => {
  const { address } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchEmployeeDetails();
  }, [address]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await getEmployeeDetails(address);
      setEmployee(response);
      setFormData({
        name: response.name || '',
        location: response.location || '',
        description: response.description || ''
      });
    } catch (error) {
      setError('Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateEmployeeProfile(address, formData);
      setEmployee({ ...employee, ...formData });
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Employee Profile</h1>
      
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <button 
            onClick={() => setEditMode(!editMode)}
            className="btn btn-primary"
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input"
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        ) : (
          <div className="space-y-2">
            <p><strong>Address:</strong> <span className="font-mono">{employee.ethAddress}</span></p>
            <p><strong>Name:</strong> {employee.name}</p>
            <p><strong>Location:</strong> {employee.location}</p>
            <p><strong>Description:</strong> {employee.description}</p>
            <p><strong>Status:</strong> <span className={employee.isActive ? 'text-green-600' : 'text-red-600'}>
              {employee.isActive ? 'Active' : 'Inactive'}
            </span></p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Certificates</h2>
        <EmployeeCertificates employeeAddress={address} />
      </div>
    </div>
  );
};

const EmployeeCertificates = ({ employeeAddress }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, [employeeAddress]);

  const fetchCertificates = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeAddress}/certificates`);
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading certificates...</div>;

  return (
    <div className="space-y-3">
      {certificates.length === 0 ? (
        <p className="text-gray-500">No certificates found</p>
      ) : (
        certificates.map((cert, index) => (
          <div key={index} className="border rounded p-3">
            <h3 className="font-semibold">{cert.title}</h3>
            <p className="text-sm text-gray-600">{cert.description}</p>
            <p className="text-xs text-gray-500">Issued: {new Date(cert.issuedDate).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default EmployeeProfile;
