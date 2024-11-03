import { checkEnvironment } from '@/components/checker/checkEnv';
import ProjectView from './projectView';

export async function generateMetadata({ params }) {
	//console.log(params);
	const id = params.projectId;

	const projectName = await fetchProjectNameById(id);

	return {
		title: `${projectName} `,
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

export default function ProjectPage({ params }) {
	//console.log(params);
	return <ProjectView id={params} />;
}
