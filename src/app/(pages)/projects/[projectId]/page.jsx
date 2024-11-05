import { checkEnvironment } from '@/components/checker/checkEnv';
import ProjectView from './projectView';

export const metadata = {
	title: 'Projects',
	description: 'Capstone',
};

export default function ProjectPage({ params }) {
	//console.log(params);
	return <ProjectView id={params} />;
}
