import { useEffect, useState } from 'react';
import { getEmployees, checkIsEmployee } from '../../utils/apiAdmin';

const AdminEmployees = () => {
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		(async () => {
			try {
				const data = await getEmployees();
				setEmployees(data.employees || []);
			} catch (e) {
				setError('Failed to fetch employees');
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const verifyOnChain = async (address) => {
		try {
			const res = await checkIsEmployee(address);
			alert(`${address} is ${res.isEmployee ? '' : 'not '}an employee on-chain`);
		} catch {
			alert('Verification failed');
		}
	};

	if (loading) return <div className="card">Loading...</div>;
	if (error) return <div className="card text-red-500">{error}</div>;

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">Employees</h1>
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
						{employees.map((e, idx) => (
							<tr key={e.address} className="border-t border-[var(--border-color)]">
								<td className="py-2 pr-4">{idx + 1}</td>
								<td className="py-2 pr-4 font-mono text-sm">{e.address}</td>
								<td className="py-2 pr-4 font-mono text-sm">{e.contractAddress}</td>
								<td className="py-2 pr-4">
									<button className="btn btn-outline" onClick={() => verifyOnChain(e.address)}>Verify On-Chain</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AdminEmployees;


