'use client';
import Pagelayout from './pagelayout';
import { formatDate } from '@/utils/inputFormatter';
import { Card, CardHeader, CardFooter, CardBody, Divider } from '@nextui-org/react';
import { IconText } from '@/components/ui/uiComponent';
import { ClientDataId } from '@/backend/data/dataHooks';
import { formatStatus } from '@/components/ui/uiComponent';
import { checkStatus } from '@/utils/inputFormatter';
import Link from 'next/link';

export default function ClientViewPage({ params }) {
	const clientId = params.clientId;
	const { client, project, loading, refetch } = ClientDataId({ clientId });

	const clientheader = () => {
		return client && client.length > 0 ? (
			client.map((clientItem) => (
				<div
					key={clientItem.id}
					className='grid mb-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5'>
					<div className='col-span-5 bg-gray-200 h-[10rem] w-full relative'></div>
					<div className='col-span-2 flex items-center relative -mt-[5rem] ml-10'>
						<img
							src={clientItem.client_profilePicture}
							alt=''
							className='rounded-full object-cover w-[250px] h-[250px] border-[1px] p-1'
						/>
						<div className='mt-7 ml-5'>
							<h1 className='font-bold mt-2'>{`${clientItem.client_firstName} ${clientItem.client_middleName} ${clientItem.client_lastName}`}</h1>
							<p className='mt-1 text-slate-400'>{clientItem.client_email}</p>
						</div>
					</div>

					<div className='flex items-center justify-start gap-3 col-span-3 ml-10 mr-10'>
						<Card
							className='border-none w-full shadow-none'
							shadow='sm'>
							<CardBody>
								<div className='flex items-center justify-center'>
									<div className='flex flex-col space-y-5'>
										<IconText
											iconText='email'
											labelText='Email'
											contentText={clientItem.client_email}
										/>
										<IconText
											iconText='calendar_today'
											labelText='Date joined'
											contentText={formatDate(clientItem.client_dateJoined)}
										/>
										<IconText
											iconText='call'
											labelText='Contact no'
											contentText={clientItem.client_contactNo}
										/>
										<IconText
											iconText='home_pin'
											labelText='Address'
											contentText={clientItem.client_address}
										/>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>
			))
		) : (
			<div className='col-span-5'>
				<p className='text-default-500'>No projects found</p>
			</div>
		);
	};

	return (
		<Pagelayout
			clientId={clientId}
			clientheader={clientheader()}>
			<div className='h-fit w-full'>
				<div className='m-10'>
					<div className='space-y-2 mb-5 border-b-[1px] border-slate-400 pb-5'>
						<p className='font-bold text-xl'>Projects</p>
						<p>This is all the projects that the client have</p>
					</div>
					<div className='grid grid-cols-3'>
						{project && project.length > 0 ? (
							project.map((projectItem) => (
								<Link
									key={projectItem.id}
									href={`/projects/${projectItem.id}`}>
									<Card className='bg-white p-1 relative overflow-hidden w-full h-full'>
										<CardHeader className='relative p-0'>
											<img
												alt='Card background'
												className='object-cover rounded-xl w-full h-[20rem]'
												src={projectItem.project_projectPicture}
											/>
											<div className='absolute rounded-xl inset-x-0 bottom-[-1px] h-1/3 bg-gradient-to-b from-transparent via-black to-gray-900 opacity-50 pointer-events-none'></div>
											<h4 className='font-bold text-2xl absolute inset-0 flex items-end m-5 justify-start text-white opacity-100 transition-opacity duration-300'>
												{projectItem.project_name}
											</h4>
										</CardHeader>
										<CardBody className='pb-0 pt-2 px-4 flex items-start z-10'>
											<p>{projectItem.project_description}</p>
										</CardBody>
										<CardFooter className='text-small justify-between'>
											<p className='text-default-500'>
												{formatStatus(
													`${checkStatus(
														projectItem.project_startDate,
														projectItem.project_endDate,
													)}`,
												)}
											</p>
										</CardFooter>
									</Card>
								</Link>
							))
						) : (
							<div className='absolute top-3/4 left-1/2'>
								<p className='text-default-500 text-2xl'>No projects</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</Pagelayout>
	);
}
