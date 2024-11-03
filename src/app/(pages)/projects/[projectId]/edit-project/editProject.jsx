'use client';
import { useState, useEffect } from 'react';
import {
	Input,
	Spinner,
	Textarea,
	Select,
	SelectItem,
	Avatar,
	Accordion,
	AccordionItem,
	Button,
	useDisclosure,
} from '@nextui-org/react';

import { ProjectDataId } from '@/backend/data/dataHooks';
import { formatDate } from '@/utils/inputFormatter';
import { ProjectData } from '@/backend/data/dataHooks';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/confirmModal';

import axios from 'axios';

export default function EditProject({ projectId }) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const router = useRouter();
	const { project, loading, error, refetch } = ProjectDataId({ projectId });
	const { clients } = ProjectData();

	function formatDateToNumbers(dateString) {
		const datePart = dateString.split('T')[0];
		return datePart;
	}

	const [formData, setFormData] = useState({
		warningvalue: '',
		clientId: '',
		projectName: '',
		projectDescription: '',
		projectAddress: '',
		projectStartDate: '',
		projectEndDate: '',
		imageFile: null,
	});

	useEffect(() => {
		if (project.projectDetails) {
			setFormData({
				warningvalue: project.projectDetails.warningvalue,
				clientId: project.projectDetails.client_id,
				projectName: project.projectDetails.project_name,
				projectPicture: project.projectDetails.project_projectPicture,
				projectDescription: project.projectDetails.project_description,
				projectAddress: project.projectDetails.project_address,
				projectStartDate: project.projectDetails.project_startDate,
				projectEndDate: project.projectDetails.project_endDate,
				imageFile: null,
			});
		}
	}, [project]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prevData) => ({ ...prevData, [name]: value }));
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setFormData((prev) => ({
			...prev,
			imageFile: file,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const submitData = new FormData();
		for (const key in formData) {
			if (key === 'imageFile' && !formData[key]) {
				continue;
			}
			submitData.append(key, formData[key]);
		}

		console.log(submitData);
		try {
			const response = await axios.put(`/api/update-project/${projectId}`, submitData);
			console.log(response.data.message);
			router.push(`/projects/${projectId}`);
		} catch (error) {
			console.error('Failed to update project:', error);
		}
	};

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
			<div className='p-10 space-y-5'>
				<span className='flex justify-between'>
					<div className='flex items-center space-x-4 col-span-2 lg:col-span-4 p-5 pb-5 h-full'>
						<span
							className='material-symbols-outlined'
							style={{ fontSize: '36px' }}>
							settings
						</span>
						<h1 className='font-bold tracking-wide text-3xl text-center'>Settings</h1>
					</div>
					<Button
						radius='sm'
						size='lg'
						className='bg-rose-600 text-white'
						onClick={onOpen}>
						Delete
					</Button>
					<ConfirmModal
						isOpen={isOpen}
						onOpen={onOpen}
						onOpenChange={onOpenChange}
						projectId={projectId}
					/>
				</span>
				<div className='w-full'>
					<form
						onSubmit={handleSubmit}
						className='p-5'>
						<Accordion
							variant='bordered'
							className=''
							itemClasses={{
								base: 'py-0 w-full',
								title: 'font-normal text-lg',
								trigger:
									'px-2 py-0 data-[hover=true]:bg-default-100 rounded-lg h-[6rem] flex items-center',
								indicator: 'text-lg text-black',
								content: 'text-lg px-2 ',
								subtitle: 'text-md',
							}}>
							<AccordionItem
								key='1'
								aria-label='budgetLimit'
								subtitle='kier.kieree@gmail.com'
								title='Budget limit'>
								<Input
									name='warningvalue'
									aria-label='warningvalue'
									variant='bordered'
									defaultValue={project.projectDetails.warningvalue}
									onChange={handleChange}
								/>
							</AccordionItem>
							<AccordionItem
								key='2'
								aria-label='Client name'
								subtitle={`${project.projectDetails.client_firstName} ${project.projectDetails.client_lastName}`}
								title='Client name'>
								<Select
									name='clientId'
									aria-label='clientId'
									items={clients}
									variant='bordered'
									placeholder={`${project.projectDetails.client_firstName} ${project.projectDetails.client_lastName}`}
									defaultValue={project.projectDetails.client_id}
									onChange={handleChange}
									className='w-full col-span-4'>
									{clients.map((client) => (
										<SelectItem
											key={client.id}
											value={client.id}
											textValue={`${client.client_firstName} ${client.client_lastName}`}>
											<div className='flex gap-2 items-center'>
												<Avatar
													alt={client.client_firstName}
													className='flex-shrink-0'
													size='sm'
													src={client.client_profilePicture}
												/>
												<div className='flex flex-col'>
													<span className='text-small'>{`${client.client_firstName} ${client.client_lastName}`}</span>
													<span className='text-tiny text-default-400'>
														{client.client_email}
													</span>
												</div>
											</div>
										</SelectItem>
									))}
								</Select>
							</AccordionItem>
							<AccordionItem
								key='3'
								aria-label='Project name'
								subtitle={project.projectDetails.project_name}
								title='Project name'>
								<Input
									name='projectName'
									aria-label='projectName'
									variant='bordered'
									defaultValue={project.projectDetails.project_name}
									onChange={handleChange}
								/>
							</AccordionItem>
							<AccordionItem
								key='4'
								aria-label='Image'
								subtitle={project.projectDetails.project_projectPicture}
								title='Project image'>
								<div className='w-full border-[3px] flex flex-col-2 items-center p-3 rounded-lg gap-5'>
									<img
										src={project.projectDetails.project_projectPicture}
										alt='Project'
										className='h-[15rem] w-[25rem]  object-cover rounded-lg'
									/>
									<div className='flex flex-col items-center justify-center w-full h-full gap-10'>
										<p className='text-center'>Upload an image for the project</p>
										<Input
											type='file'
											color='primary'
											aria-label='image'
											className='w-fit'
											style={{ backgroundColor: '#0000FF' }}
											variant='flat'
											onChange={handleFileChange}
										/>
									</div>
								</div>
							</AccordionItem>
							<AccordionItem
								key='5'
								aria-label='description'
								subtitle={project.projectDetails.project_description}
								title='Description'>
								<Textarea
									name='projectDescription'
									aria-label='projectDescription'
									minRows={5}
									maxRows={5}
									defaultValue={project.projectDetails.project_description}
									variant='bordered'
									placeholder='Enter your description (Max rows 5)'
									onChange={handleChange}
								/>
							</AccordionItem>
							<AccordionItem
								key='6'
								aria-label='address'
								subtitle={project.projectDetails.project_description}
								title='Address'>
								<Textarea
									aria-label='address'
									name='projectAddress'
									minRows={2}
									maxRows={5}
									defaultValue={project.projectDetails.project_address}
									variant='bordered'
									placeholder='Enter the address (Max rows 5)'
									onChange={handleChange}
								/>
							</AccordionItem>
							<AccordionItem
								key='7'
								aria-label='Project Date'
								subtitle={`${formatDate(
									project.projectDetails.project_startDate,
								)} - ${formatDate(project.projectDetails.project_endDate)}`}
								title='Project Date'>
								<div className='flex gap-5'>
									<Input
										aria-label='start'
										type='date'
										label='Start Date'
										variant='bordered'
										defaultValue={formatDateToNumbers(
											project.projectDetails.project_startDate,
										)}
										name='projectStartDate'
										onChange={handleChange}
									/>

									<Input
										aria-label='end'
										type='date'
										label='End Date'
										variant='bordered'
										defaultValue={formatDateToNumbers(
											project.projectDetails.project_endDate,
										)}
										name='projectEndDate'
										onChange={handleChange}
									/>
								</div>
							</AccordionItem>
						</Accordion>
						<div className='flex justify-end pt-5 w-full'>
							<Button
								size='lg'
								radius='sm'
								className='bg-black text-white'
								type='submit'>
								Save changes
							</Button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}

/**
 * 
 * 	<div className='bg-slate-500 rounded-md p-2'>
								<p className='font-medium'>Contact info</p>
								<p>kier.kieree@gmail.com</p>
							</div>
 * 	<form
				onSubmit={handleSubmit}
				className='p-5'>
				<div className='grid grid-cols-1 gap-6 p-5 mt-4 font-semibold'>
					<div className='flex flex-col-2'>
						<div className='w-1/4'>
							<p>Budget limit</p>
						</div>
						<div className='w-1/2'>
							<Input
								name='warningvalue'
								aria-label='warningvalue'
								variant='bordered'
								defaultValue={project.projectDetails.warningvalue}
								onChange={handleChange}
							/>
						</div>
					</div>
					<div className='flex flex-col-2'>
						<div className='w-1/4'>
							<p>Client name</p>
						</div>
						<div className='w-1/2'>
							<Select
								name='clientId'
								aria-label='clientId'
								items={clients}
								variant='bordered'
								placeholder={`${project.projectDetails.client_firstName} ${project.projectDetails.client_lastName}`}
								defaultValue={project.projectDetails.client_id}
								onChange={handleChange}
								className='w-full col-span-4'>
								{clients.map((client) => (
									<SelectItem
										key={client.id}
										value={client.id}
										textValue={`${client.client_firstName} ${client.client_lastName}`}>
										<div className='flex gap-2 items-center'>
											<Avatar
												alt={client.client_firstName}
												className='flex-shrink-0'
												size='sm'
												src={client.client_profilePicture}
											/>
											<div className='flex flex-col'>
												<span className='text-small'>{`${client.client_firstName} ${client.client_lastName}`}</span>
												<span className='text-tiny text-default-400'>
													{client.client_email}
												</span>
											</div>
										</div>
									</SelectItem>
								))}
							</Select>
						</div>
					</div>

					<div className='flex flex-col-2'>
						<div className='w-1/4'>
							<p>Project name</p>
						</div>
						<div className='w-1/2'>
							<Input
								name='projectName'
								aria-label='projectName'
								variant='bordered'
								defaultValue={project.projectDetails.project_name}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className='flex flex-col-2'>
						<div className='w-1/4'>
							<p>Image</p>
						</div>
						<div className='w-1/2 border-[3px] flex flex-col-2 items-center p-3 rounded-lg gap-5'>
							<img
								src={project.projectDetails.project_projectPicture}
								alt='Project'
								className='h-[15rem] w-[25rem]  object-cover rounded-lg'
							/>
							<div className='flex flex-col items-center justify-center w-full h-full gap-10'>
								<p className='text-center'>Upload an image for the project</p>
								<Input
									type='file'
									color='primary'
									aria-label='image'
									className='w-fit'
									style={{ backgroundColor: '#0000FF' }}
									variant='flat'
									onChange={handleFileChange}
								/>
							</div>
						</div>
					</div>

					<div className='flex flex-col-2'>
						<div className='w-1/4'>
							<p>Description</p>
						</div>
						<div className='w-1/2'>
							<Textarea
								name='projectDescription'
								aria-label='projectDescription'
								minRows={5}
								maxRows={5}
								defaultValue={project.projectDetails.project_description}
								variant='bordered'
								placeholder='Enter your description (Max rows 5)'
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className='flex flex-col-2'>
						<div className='w-1/4'>
							<p>Address</p>
						</div>
						<div className='w-1/2'>
							<Textarea
								aria-label='address'
								name='projectAddress'
								minRows={2}
								maxRows={5}
								defaultValue={project.projectDetails.project_address}
								variant='bordered'
								placeholder='Enter the address (Max rows 5)'
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className='flex flex-col-2'>
						<div className='w-1/4'>
							<p>Project Date</p>
						</div>
						<div className='flex gap-5 w-1/2'>
							<Input
								aria-label='start'
								type='date'
								label='Start Date'
								variant='bordered'
								defaultValue={formatDateToNumbers(project.projectDetails.project_startDate)}
								name='projectStartDate'
								onChange={handleChange}
							/>
							<Input
								aria-label='end'
								type='date'
								label='End Date'
								variant='bordered'
								defaultValue={formatDateToNumbers(project.projectDetails.project_endDate)}
								name='projectEndDate'
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className='flex justify-end w-3/4'>
						<div className='flex gap-5'>
							<Button
								color='primary'
								size='lg'
								type='submit'>
								Save changes
							</Button>
						</div>
					</div>
				</div>
			</form>
 */
