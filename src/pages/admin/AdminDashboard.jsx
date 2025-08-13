import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../utils/apiAdmin';

const StatCard = ({ title, value }) => (
	<div className="card">
		<div className="text-sm text-[var(--text-secondary)]">{title}</div>
		<div className="text-2xl font-semibold mt-1">{value}</div>
	</div>
);

const AdminDashboard = () => {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		(async () => {
			try {
				const data = await getDashboardStats();
				setStats(data);
			} catch (e) {
				setError('Failed to load stats');
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (loading) return <div className="card">Loading...</div>;
	if (error) return <div className="card text-red-500">{error}</div>;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Admin Dashboard</h1>
			{stats && (
				<>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<StatCard title="Employees" value={stats.statistics.totalEmployees} />
						<StatCard title="Organizations" value={stats.statistics.totalOrganizations} />
						<StatCard title="Certificates" value={stats.statistics.totalCertificates} />
					</div>
					<div className="card">
						<h2 className="text-lg font-medium mb-3">Quick Links</h2>
						<div className="flex gap-3 flex-wrap">
							<Link to="/admin/register" className="btn btn-primary">Register User</Link>
							<Link to="/admin/employees" className="btn btn-outline">Employees</Link>
							<Link to="/admin/organizations" className="btn btn-outline">Organizations</Link>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default AdminDashboard;


