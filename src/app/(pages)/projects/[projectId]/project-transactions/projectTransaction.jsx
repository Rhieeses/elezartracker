'use client';

import { Spinner } from '@nextui-org/react';
import { ProjectDataId } from '@/backend/data/dataHooks';
import TransactionTable from '@/components/tables/transactionTable';

export default function ProjectTransactions({ projectId }) {
	const { project, loading, error, refetch } = ProjectDataId({ projectId });

	if (loading) {
		return (
			<div className='absolute top-1/2 left-1/2 text-center'>
				<Spinner />
				<p>Loading Project data...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='absolute top-1/2 left-1/2 text-center'>
				<h2>Error loading Project data</h2>
				<p>{error.message}</p>
			</div>
		);
	}

	return (
		<>
			<div className='h-fit'>
				<div className='bg-white rounded-lg'>
					<div className='flex flex-col p-5'>
						<TransactionTable transactions={project?.transactions} />
					</div>
				</div>
			</div>
		</>
	);
}
