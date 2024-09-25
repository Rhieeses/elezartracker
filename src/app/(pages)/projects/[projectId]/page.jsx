'use client';
import { useState, useEffect } from 'react';
import Pagelayout from '@/app/(pages)/projects/[projectId]/pageLayout';
import { IconText, ContentBoxProject } from '@/components/ui/uiComponent';
import { Spinner, Card, CardBody, Image } from '@nextui-org/react';
import {
	formatNumber,
	formatDate,
	calculateDateDifference,
	formatNumberDecimal,
} from '@/utils/inputFormatter';
import { ProjectDataId } from '@/backend/data/dataHooks';
import { projectHealthPercentage, projectHealthStatus } from '@/backend/data/notification';

export default function ProjectView({ params }) {
	const projectId = params.projectId;
	const { project, loading, error, refetch } = ProjectDataId({ projectId });
	const [projectName, setProjectName] = useState('');
	const [accounts, setAccounts] = useState([]);
	const [warningValue, setWarningValue] = useState(0);

	useEffect(() => {
		if (project && project.projectDetails) {
			setAccounts(project.projectAccounts);
			setProjectName(project.projectDetails.project_name);
			setWarningValue(project.projectDetails.warningvalue);
		}
	}, [project]);

	if (loading) {
		return (
			<Pagelayout>
				<div className='absolute top-1/2 left-1/2 text-center'>
					<Spinner />
					<p>Loading Project data...</p>
				</div>
			</Pagelayout>
		);
	}

	if (error) {
		return (
			<Pagelayout>
				<div className='absolute top-1/2 left-1/2 text-center'>
					<h2>Error loading Project data</h2>
					<p>{error.message}</p>
				</div>
			</Pagelayout>
		);
	}

	const calculatePercentage = (budget, contractPrice) => {
		if (contractPrice === 0) {
			throw new Error('Contract Price cannot be zero');
		}
		return ((budget / contractPrice) * 100).toFixed(2) + '%';
	};

	return (
		<Pagelayout projectId={projectId}>
			<div className='h-full'>
				<div className='flex flex-col'>
					{projectHealthStatus(
						projectHealthPercentage(
							accounts.total_paid - accounts.total_expenses,
							accounts.contract_price,
						),
						projectName,
						projectId,
						warningValue,
					)}

					<div>
						<Card
							radius='none'
							className='w-full shadow-none'
							shadow='sm'>
							<CardBody>
								<div className=''>
									<div className='relative'>
										<Image
											alt='Project picture'
											className='object-cover z-10'
											height={350}
											radius='sm'
											src={project.projectDetails.project_projectPicture}
											width='100%'
										/>
										<div className='absolute rounded-xl inset-x-0 bottom-0 h-36 z-20  bg-gradient-to-b from-transparent via-black to-gray-900 opacity-50 pointer-events-none'></div>

										<div className='absolute bottom-5 left-5 z-20 text-white w-fit'>
											<h1 className=' text-3xl font-bold '>
												{project.projectDetails.project_name}
											</h1>
											<p>{project.projectDetails.project_description}</p>
										</div>
									</div>
								</div>
								<div className='flex flex-col mt-10'>
									<div className='flex justify-between items-start'>
										<div className='flex-1 space-y-5'>
											<IconText
												iconText='savings'
												labelText='Contract price'
												contentText={formatNumber(
													project.projectDetails.project_contractPrice,
												)}
											/>
											<IconText
												iconText='attach_money'
												labelText='Downpayment'
												contentText={`${project.projectDetails.downpayment}%`}
											/>
											<IconText
												iconText='calendar_today'
												labelText='Start date'
												contentText={formatDate(
													project.projectDetails.project_startDate,
												)}
											/>
											<IconText
												iconText='calendar_today'
												labelText='End date'
												contentText={formatDate(project.projectDetails.project_endDate)}
											/>

											<IconText
												iconText='location_on'
												labelText='Address'
												contentText={project.projectDetails.project_address}
											/>
										</div>
										<div className='flex-1 space-y-5'>
											<IconText
												iconText='person'
												labelText='Client'
												contentText={`${project.projectDetails.client_firstName} ${project.projectDetails.client_lastName}`}
											/>
											<IconText
												iconText='call'
												labelText='Contact'
												contentText={project.projectDetails.client_contactNo}
											/>
											<IconText
												iconText='mail'
												labelText='Email'
												contentText={project.projectDetails.client_email}
											/>

											<IconText
												iconText='schedule'
												labelText='Duration'
												contentText={calculateDateDifference(
													project.projectDetails.project_startDate,
													project.projectDetails.project_endDate,
												)}
											/>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>

					<div className='grid grid-cols-4 gap-10 p-5'>
						<ContentBoxProject
							iconText='balance'
							labelText='Balance'
							strongText={formatNumberDecimal(
								project.projectDetails.project_contractPrice - accounts.total_paid,
							)}
							descriptionText={`${calculatePercentage(
								accounts.contract_price - accounts.total_paid,
								accounts.contract_price,
							)} of the contract price is unpaid`}
						/>
						<ContentBoxProject
							iconText='money_bag'
							labelText='Budget'
							strongText={formatNumberDecimal(accounts.total_paid - accounts.total_expenses)}
							descriptionText={`${calculatePercentage(
								accounts.total_paid - accounts.total_expenses,
								accounts.total_paid,
							)} of the payments remaining`}
						/>
						<ContentBoxProject
							iconText='credit_card'
							labelText='Payments'
							strongText={formatNumberDecimal(accounts.total_paid)}
							descriptionText={`${calculatePercentage(
								accounts.total_paid,
								accounts.contract_price,
							)} paid`}
						/>
						<ContentBoxProject
							iconText='shopping_cart'
							labelText='Expenses'
							strongText={formatNumberDecimal(accounts.total_expenses)}
							descriptionText={`${calculatePercentage(
								accounts.total_expenses,
								accounts.contract_price,
							)} spent`}
						/>
						<ContentBoxProject
							iconText='balance'
							labelText='Balance'
							strongText={formatNumberDecimal(
								project.projectDetails.project_contractPrice - accounts.total_paid,
							)}
							descriptionText={`${calculatePercentage(
								accounts.contract_price - accounts.total_paid,
								accounts.contract_price,
							)} of the contract price is unpaid`}
						/>
						<ContentBoxProject
							iconText='money_bag'
							labelText='Budget'
							strongText={formatNumberDecimal(accounts.total_paid - accounts.total_expenses)}
							descriptionText={`${calculatePercentage(
								accounts.total_paid - accounts.total_expenses,
								accounts.total_paid,
							)} of the payments remaining`}
						/>
						<ContentBoxProject
							iconText='credit_card'
							labelText='Payments'
							strongText={formatNumberDecimal(accounts.total_paid)}
							descriptionText={`${calculatePercentage(
								accounts.total_paid,
								accounts.contract_price,
							)} paid`}
						/>
						<ContentBoxProject
							iconText='shopping_cart'
							labelText='Expenses'
							strongText={formatNumberDecimal(accounts.total_expenses)}
							descriptionText={`${calculatePercentage(
								accounts.total_expenses,
								accounts.contract_price,
							)} spent`}
						/>
					</div>
				</div>
			</div>
		</Pagelayout>
	);
}
