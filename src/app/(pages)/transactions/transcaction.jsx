'use client';

import TransactionTable from '@/components/tables/transactionTable';
import { AllTransactions } from '@/backend/data/dataHooks';

import Layout from '@/components/ui/layout';
export default function TransactionsContent() {
	const { transactions, loading, refetch } = AllTransactions();

	return (
		<Layout>
			<TransactionTable transactions={transactions} />
		</Layout>
	);
}
