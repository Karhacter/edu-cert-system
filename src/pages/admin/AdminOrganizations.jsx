import { useEffect, useState } from 'react';
import { getOrganizations, checkIsOrganization } from '../../utils/apiAdmin';

const AdminOrganizations = () => {
	const [orgs, setOrgs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		(async () => {
			try {
				const data = await getOrganizations();
				setOrgs(data.organizations || []);
			} catch (e) {
				setError('Failed to fetch organizations');
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const verifyOnChain = async (address) => {
		try {
			const res = await checkIsOrganization(address);
			alert(`${address} is ${res.isOrganizationEndorser ? '' : 'not '}an organization on-chain`);
		} catch {
			alert('Verification failed');
		}
	};

	if (loading) return <div className="card">Loading...</div>;
	if (error) return <div className="card text-red-500">{error}</div>;

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">Organizations</h1>
			<div className="card overflow-x-auto">
				<table className="min-w-full">
					<thead>
						<tr className="text-left">
							<th className="py-2 pr-4">#</th>
							<th className="py-2 pr-4">Address</th>
							<th className="py-2 pr-4">Contract</th>
							<th className="py-2 pr-4">Actions</th>
						</tr>
					</thead>
					<tbody>
						{orgs.map((o, idx) => (
							<tr key={o.address} className="border-t border-[var(--border-color)]">
								<td className="py-2 pr-4">{idx + 1}</td>
								<td className="py-2 pr-4 font-mono text-sm">{o.address}</td>
								<td className="py-2 pr-4 font-mono text-sm">{o.contractAddress}</td>
								<td className="py-2 pr-4">
									<button className="btn btn-outline" onClick={() => verifyOnChain(o.address)}>Verify On-Chain</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AdminOrganizations;


