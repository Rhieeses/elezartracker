'use client';
import Pagelayout from '../pagelayout';
import { Spinner } from '@nextui-org/react';
import { TransactionClientData } from '@/backend/data/dataHooks';
import TransactionClientTable from '@/components/tables/transacClientTable';

export default function ClientTransactions({ params }) {
	const clientId = params.clientId;
	const { clientTransaction, loading, error, refetch } = TransactionClientData({ clientId });

	if (loading) {
		return (
			<Pagelayout>
				<div className='absolute top-1/2 left-1/2 text-center'>
					<Spinner />
				</div>
			</Pagelayout>
		);
	}

	if (error) {
		return (
			<Pagelayout>
				<div className='absolute top-1/2 left-1/2 text-center'>
					<h2>Error loading dashboard data</h2>
					<p>{error.message}</p>
				</div>
			</Pagelayout>
		);
	}
	return (
		<Pagelayout clientId={clientId}>
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
		</Pagelayout>
	);
}
