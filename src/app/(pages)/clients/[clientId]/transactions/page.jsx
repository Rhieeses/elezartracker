'use client';
import { useState, useEffect } from 'react';
import Pagelayout from '../pagelayout';
import { Spinner } from '@nextui-org/react';

import { TransactionClientData } from '@/backend/data/dataHooks';
import TransactionClientTable from '@/components/tables/transacClientTable';
export default function ClientTransactions({ params }) {
	const clientId = params.clientId;
	const { clientTransaction, loading, error, refetch } = TransactionClientData({ clientId });

	return (
		<Pagelayout clientId={clientId}>
			{loading ? (
				<div className='flex justify-center items-center h-screen'>
					<Spinner size='lg' />
				</div>
			) : error ? (
				<div className='flex justify-center items-center h-full'>
					<p>Error: {error.message}</p>
				</div>
			) : clientTransaction ? (
				<div className='h-fit'>
					<div className='bg-white rounded-lg'>
						<div className='flex flex-col p-5'>
							<div className='mt-4'>
								<h1 className='font-bold'>Transactions</h1>
								<TransactionClientTable clientTransaction={clientTransaction} />
							</div>
						</div>
					</div>
				</div>
			) : null}
		</Pagelayout>
	);
}
