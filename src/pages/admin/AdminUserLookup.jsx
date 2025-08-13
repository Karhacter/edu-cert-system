import { useState } from 'react';
import { getRegistration, checkIsEmployee, checkIsOrganization } from '../../utils/apiAdmin';

const AdminUserLookup = () => {
	const [address, setAddress] = useState('');
	const [dbResult, setDbResult] = useState(null);
	const [chainResult, setChainResult] = useState(null);
	const [error, setError] = useState('');

	const handleLookup = async (e) => {
		e.preventDefault();
		setError('');
		setDbResult(null);
		setChainResult(null);
		try {
			const [db, emp, org] = await Promise.all([
				getRegistration(address),
				checkIsEmployee(address),
				checkIsOrganization(address)
			]);
			setDbResult(db);
			setChainResult({ isEmployee: emp.isEmployee, isOrganization: org.isOrganizationEndorser });
		} catch (e2) {
			setError(e2?.response?.data?.message || 'Lookup failed');
		}
	};

	return (
		<div className="max-w-2xl mx-auto card space-y-4">
			<h1 className="text-2xl font-semibold">User Lookup</h1>
			<form onSubmit={handleLookup} className="flex gap-2">
				<input className="form-input flex-1" placeholder="0x..." value={address} onChange={(e) => setAddress(e.target.value)} />
				<button className="btn btn-primary" type="submit">Search</button>
			</form>
			{error && <p className="text-red-600">{error}</p>}
			{dbResult && (
				<div className="card">
					<h2 className="font-medium mb-2">Database Registration</h2>
					<pre className="text-sm whitespace-pre-wrap">{JSON.stringify(dbResult, null, 2)}</pre>
				</div>
			)}
			{chainResult && (
				<div className="card">
					<h2 className="font-medium mb-2">On-chain Status</h2>
					<p>Employee: {String(chainResult.isEmployee)}</p>
					<p>Organization: {String(chainResult.isOrganization)}</p>
				</div>
			)}
		</div>
	);
};

export default AdminUserLookup;


