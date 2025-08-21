import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrganizationDetails, updateOrganizationProfile, endorseCertificate } from '../../utils/api';

const OrganizationProfile = () => {
  const { address } = useParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: ''
  });
  const [endorseData, setEndorseData] = useState({
    certificateId: '',
    endorsementDetails: ''
  });

  useEffect(() => {
    fetchOrganizationDetails();
  }, [address]);

  const fetchOrganizationDetails = async () => {
    try {
      const response = await getOrganizationDetails(address);
      setOrganization(response);
      setFormData({
        name: response.name || '',
        location: response.location || '',
        description: response.description || ''
      });
    } catch (error) {
      setError('Failed to fetch organization details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateOrganizationProfile(address, formData);
      setOrganization({ ...organization, ...formData });
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleEndorse = async (e) => {
    e.preventDefault();
    try {
      await endorseCertificate(address, endorseData);
      alert('Certificate endorsed successfully!');
      setEndorseData({ certificateId: '', endorsementDetails: '' });
    } catch (error) {
      alert('Failed to endorse certificate');
    }
  };

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organization Profile</h1>
      
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
            <p><strong>Address:</strong> <span className="font-mono">{organization.ethAddress}</span></p>
            <p><strong>Name:</strong> {organization.name}</p>
            <p><strong>Location:</strong> {organization.location}</p>
            <p><strong>Description:</strong> {organization.description}</p>
            <p><strong>Status:</strong> <span className={organization.isActive ? 'text-green-600' : 'text-red-600'}>
              {organization.isActive ? 'Active' : 'Inactive'}
            </span></p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Certificates</h2>
        <OrganizationCertificates organizationAddress={address} />
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Endorse Certificate</h2>
        <form onSubmit={handleEndorse} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Certificate ID</label>
            <input
              type="text"
              value={endorseData.certificateId}
              onChange={(e) => setEndorseData({...endorseData, certificateId: e.target.value})}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Endorsement Details</label>
            <textarea
              value={endorseData.endorsementDetails}
              onChange={(e) => setEndorseData({...endorseData, endorsementDetails: e.target.value})}
              className="input"
              rows={3}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Endorse Certificate</button>
        </form>
      </div>
    </div>
  );
};

const OrganizationCertificates = ({ organizationAddress }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, [organizationAddress]);

  const fetchCertificates = async () => {
    try {
      const response = await fetch(`/api/organizations/${organizationAddress}/certificates`);
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

export default OrganizationProfile;
