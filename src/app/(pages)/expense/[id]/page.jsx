import ExpenseProject from './projectExpense';
import { checkEnvironment } from '@/components/checker/checkEnv';

export async function generateMetadata({ params }) {
	const { id } = params;
	const projectName = await fetchProjectNameById(id);

	return {
		title: `${projectName} | Expense `,
		description: 'Capstone',
	};
}

async function fetchProjectNameById(id) {
	//const response = await fetch(`http://localhost:3000/api/project-name/${id}`);

	const response = await fetch(checkEnvironment().concat(`/api/project-name/${id}`));

	const data = await response.json();
	//console.log(data[0].project_name);
	return data[0].project_name;
}

export default function ExpensePage({ params }) {
	return <ExpenseProject id={params} />;
}
