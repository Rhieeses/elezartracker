import ExpenseProject from './projectExpense';
import { checkEnvironment } from '@/components/checker/checkEnv';

export const metadata = {
	title: 'Expenses',
	description: 'Capstone',
};

export default function ExpensePage({ params }) {
	return <ExpenseProject id={params} />;
}
