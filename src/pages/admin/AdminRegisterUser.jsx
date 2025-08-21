import { useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { registerEmployeeOnChain, checkIsEmployee } from '../../utils/contractAdmin';
import { Html5Qrcode } from 'html5-qrcode';

const AdminRegisterUser = () => {
	const [form, setForm] = useState({
		ethAddress: '',
		name: '',
		location: '',
		description: '',
		role: '1'
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [showQr, setShowQr] = useState(false);
	const [scanning, setScanning] = useState(false);
	const scannerRef = useRef(null);
	const scannerIdRef = useRef(`qr-reader-${Math.random().toString(36).slice(2)}`);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	useEffect(() => {
		setIsMetaMaskInstalled(typeof window !== 'undefined' && !!window.ethereum);
	}, []);

	const handleConnectMetaMask = async () => {
		try {
			setIsConnecting(true);
			if (!window.ethereum) {
				setError('MetaMask is not installed. Please install it first.');
				return;
			}
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			if (accounts && accounts.length > 0) {
				setForm((f) => ({ ...f, ethAddress: accounts[0] }));
				setMessage('Connected to MetaMask');
			}
		} catch (e) {
			setError(e?.message || 'Failed to connect MetaMask');
		} finally {
			setIsConnecting(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');
		setError('');
		
		try {
			// Validate form
			if (!form.ethAddress || !form.name || !form.location || !form.description) {
				throw new Error('All fields are required');
			}
			
			// Check if already registered
			const isAlreadyEmployee = await checkIsEmployee(form.ethAddress);
			if (isAlreadyEmployee) {
				throw new Error('This address is already registered as an employee');
			}
			
			// Convert registration fee to wei
			const feeInWei = ethers.parseEther(registrationFee);
			
			// Register user on blockchain
			const result = await registerEmployeeOnChain({
				ethAddress: form.ethAddress,
				name: form.name,
				location: form.location,
				description: form.description,
				role: Number(form.role),
				value: feeInWei
			});
			
			setMessage(`Transaction submitted! Hash: ${result.txHash}`);
			setTxHash(result.txHash);
			
			// Wait for transaction confirmation
			const receipt = await result.transaction.wait();
			if (receipt.status === 1) {
				setMessage(`Successfully registered ${form.role === '1' ? 'Employee' : 'Organization'} on blockchain!`);
				setForm({ ethAddress: '', name: '', location: '', description: '', role: '1' });
			} else {
				throw new Error('Transaction failed');
			}
			
		} catch (e) {
			console.error('Registration error:', e);
			setError(e?.message || 'Registration failed. Please check your MetaMask connection and try again.');
		} finally {
			setLoading(false);
		}
	};

	const startScan = async () => {
		try {
			if (scanning) return;
			setError('');
			setScanning(true);
			if (!scannerRef.current) {
				scannerRef.current = new Html5Qrcode(scannerIdRef.current);
			}
			await scannerRef.current.start(
				{ facingMode: 'environment' },
				{ fps: 10, qrbox: 250 },
				(decodedText) => {
					const text = decodedText.trim();
					// Accept raw address or EIP-681 (ethereum:) URI
					let address = text;
					const match = text.match(/^ethereum:([^?]+)/i);
					if (match && match[1]) address = match[1];
					if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
						setForm((f) => ({ ...f, ethAddress: address }));
						stopScan();
						setMessage('QR scanned successfully');
					} else {
						setError('QR did not contain a valid Ethereum address');
					}
				}
			);
		} catch (e) {
			setError(e?.message || 'Unable to start camera for QR scan');
			setScanning(false);
		}
	};

	const stopScan = async () => {
		try {
			if (scannerRef.current && scanning) {
				await scannerRef.current.stop();
			}
		} catch {}
		setScanning(false);
	};

	useEffect(() => {
		return () => {
			if (scannerRef.current) {
				try { scannerRef.current.stop(); } catch {}
				try { scannerRef.current.clear(); } catch {}
			}
		};
	}, []);

	return (
		<div className="max-w-2xl mx-auto card">
			<h1 className="text-2xl font-semibold mb-4">Register User</h1>
			<div className="mb-4 p-3 rounded border bg-yellow-50 text-yellow-800">
				{isMetaMaskInstalled ? (
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<p className="text-sm">For convenience, connect MetaMask to auto-fill the Ethereum address.</p>
						<button type="button" onClick={handleConnectMetaMask} disabled={isConnecting} className="btn btn-secondary">
							{isConnecting ? 'Connecting...' : 'Connect MetaMask'}
						</button>
					</div>
				) : (
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<p className="text-sm">MetaMask is required to interact with Ethereum. Please install it before entering your address.</p>
						<a className="btn btn-secondary" href="https://metamask.io/download/" target="_blank" rel="noreferrer">Install MetaMask</a>
					</div>
				)}
			</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="form-label">Ethereum Address</label>
					<div className="flex gap-2">
						<input name="ethAddress" value={form.ethAddress} onChange={handleChange} className="form-input flex-1" placeholder="0x..." />
					<button type="button" onClick={scanning ? stopScan : startScan} className="btn btn-outline">
						{scanning ? 'Stop Scan' : 'Scan QR'}
					</button>
					</div>
					{scanning && (
						<div className="mt-2">
							<div id={scannerIdRef.current} className="w-full max-w-xs aspect-square border rounded overflow-hidden"></div>
							<p className="text-xs text-gray-500 mt-1">Point the camera at a QR code that contains an Ethereum address or ethereum:address URI.</p>
						</div>
					)}
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="form-label">Name</label>
						<input name="name" value={form.name} onChange={handleChange} className="form-input" />
					</div>
					<div>
						<label className="form-label">Location</label>
						<input name="location" value={form.location} onChange={handleChange} className="form-input" />
					</div>
				</div>
				<div>
					<label className="form-label">Description</label>
					<textarea name="description" value={form.description} onChange={handleChange} className="form-input" rows="3" />
				</div>
				<div>
					<label className="form-label">Role</label>
					<select name="role" value={form.role} onChange={handleChange} className="form-input">
						<option value="1">Employee</option>
						<option value="2">Organization</option>
					</select>
				</div>
				<div className="flex gap-3">
					<button disabled={loading} className="btn btn-primary" type="submit">{loading ? 'Registering...' : 'Register'}</button>
				</div>
				{message && <p className="text-green-600">{message}</p>}
				{error && <p className="text-red-600">{error}</p>}
			</form>
		</div>
	);
};

export default AdminRegisterUser;


