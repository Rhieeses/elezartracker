'use client';
import { useState, useEffect } from 'react';
import Pagelayout from '@/app/(pages)/projects/[projectId]/pageLayout';
import { Input, Spinner, Textarea, Select, SelectItem, Avatar, Button } from '@nextui-org/react';
import { ProjectDataId } from '@/backend/data/dataHooks';
import { ProjectData } from '@/backend/data/dataHooks';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function EditProject({ params }) {
	const projectId = params.projectId;
	const router = useRouter();
	const { project, loading, error, refetch } = ProjectDataId({ projectId });
	const { clients } = ProjectData();

	function formatDate(dateString) {
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
			const response = await axios.post(`/api/update-project/${projectId}`, submitData);
			console.log(response.data.message);
			router.push(`/projects/${projectId}`);
		} catch (error) {
			console.error('Failed to update project:', error);
		}
	};

	return (
		<Pagelayout projectId={projectId}>
			{loading ? (
				<div className='flex justify-center items-center h-screen'>
					<Spinner size='lg' />
				</div>
			) : error ? (
				<div className='flex justify-center items-center h-full'>
					<p>Error: {error.message}</p>
				</div>
			) : project ? (
				<div className='h-fit'>
					<div className='bg-white rounded-lg'>
						<form onSubmit={handleSubmit}>
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
											defaultValue={formatDate(project.projectDetails.project_startDate)}
											name='projectStartDate'
											onChange={handleChange}
										/>
										<Input
											aria-label='end'
											type='date'
											label='End Date'
											variant='bordered'
											defaultValue={formatDate(project.projectDetails.project_endDate)}
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
					</div>
				</div>
			) : null}
		</Pagelayout>
	);
}
