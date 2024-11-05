'use client';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Accounts() {
	const [accounts, setAccounts] = useState(null);

	useEffect(() => {
		const fetchAccountsDetails = async () => {
			try {
				const response = await axios.get('/api/all-accounts', {
					withCredentials: true,
				});
				setAccounts(response.data);
			} catch (error) {
				console.error('Error fetching client details:', error);
			}
		};

		fetchAccountsDetails();
	}, []);

	return (
		<div className='h-fit'>
			<div className='p-10 mb-5 border-b-[1px] flex space-x-4 items-center'>
				<span
					className='material-symbols-outlined'
					style={{ fontSize: '36px' }}>
					account_balance_wallet
				</span>
				<h1 className='font-semibold tracking-wide text-3xl text-left'>Accounts</h1>
			</div>

			<div>
				<h1>User Accounts</h1>
				{accounts ? (
					<table className='min-w-full border-collapse border border-gray-300'>
						<thead>
							<tr>
								<th className='border border-gray-300 p-2'>Username</th>
								<th className='border border-gray-300 p-2'>Name</th>
								<th className='border border-gray-300 p-2'>Email</th>
								<th className='border border-gray-300 p-2'>Position</th>
								<th className='border border-gray-300 p-2'>Created At</th>
								<th className='border border-gray-300 p-2'>Password</th>
							</tr>
						</thead>
						<tbody>
							{accounts.map((account) => (
								<tr key={account.id}>
									<td className='border border-gray-300 p-2'>{account.username}</td>
									<td className='border border-gray-300 p-2'>{account.name}</td>
									<td className='border border-gray-300 p-2'>{account.email}</td>
									<td className='border border-gray-300 p-2'>{account.position}</td>
									<td className='border border-gray-300 p-2'>
										{new Date(account.created_at).toLocaleDateString()}
									</td>
									<td className='border border-gray-300 p-2'>{account.password}</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<p>Loading accounts...</p>
				)}
			</div>
		</div>
	);
}
