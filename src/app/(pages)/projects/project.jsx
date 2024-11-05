'use client';
import { useState } from 'react';
import axios from 'axios';
import Layout from '@/components/ui/layout';
import { formatStatus } from '@/components/ui/uiComponent';
import {
	formatNumber,
	removeFormatting,
	capitalizeFirstLetter,
	checkStatus,
	capitalizeOnlyFirstLetter,
} from '@/utils/inputFormatter';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	User,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	useDisclosure,
	Button,
	Select,
	SelectItem,
	Avatar,
	Input,
	DatePicker,
	Textarea,
	Slider,
	Link,
	Image,
	Spinner,
} from '@nextui-org/react';
import { ProjectData } from '@/backend/data/dataHooks';

export default function ProjectsContent() {
	const { project, clients, loading, error } = ProjectData();

	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const initialFormData = {
		selectClient: '',
		projectName: ' ',
		projectCategory: '',
		projectAddress: '',
		contractPrice: '',
		paymentTerms: '',
		downpayment: 15,
		startDate: null,
		endDate: null,
		projectDescription: '',
		projectPicture: '',
	};

	let x = 0;

	if (project && project.length > 0) {
		x = project.length;
	}

	const [formData, setFormData] = useState(initialFormData);
	const [file, setFile] = useState(null);
	const [submitLoading, setsubmitLoading] = useState();
	const [message, setMessage] = useState({ success: '', error: '' });

	const [searchTerm, setSearchTerm] = useState('');

	const filteredProjects = project?.filter((projectItem) =>
		projectItem.project_name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	//category options
	let paymentOption = [
		{ label: 'Monthly payment', value: 'Monthly payment' },
		{ label: 'Full payment', value: 'Full payment' },
	];

	let categoryOptions = [
		{ label: 'Residential', value: 'Residential' },
		{ label: 'Commercial', value: 'Commercial' },
		{ label: 'Industrial', value: 'Industrial' },
	];

	const handleFileChange = (event) => {
		const selectedFile = event.target.files[0];
		setFile(selectedFile || null);
		if (selectedFile) {
			const objectUrl = URL.createObjectURL(selectedFile);
			return () => URL.revokeObjectURL(objectUrl);
		}
	};

	const onCloseModal = () => {
		onOpenChange();
		setFormData(initialFormData);
		setFile(null);
	};

	const handleInputChange = (field) => (event) => {
		const value = event?.target?.value || event;

		setFormData((prev) => ({
			...prev,
			[field]:
				field === 'contractPrice'
					? formatNumber(value.replace(/[^0-9.]/g, ''))
					: ['startDate', 'endDate', 'downpayment', 'paymentTerms'].includes(field)
					? value
					: field === 'projectDescription'
					? capitalizeOnlyFirstLetter(value)
					: capitalizeFirstLetter(value),
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const formDataToSubmit = new FormData();
		const cleanedData = {
			...formData,
			contractPrice: removeFormatting(formData.contractPrice),
		};

		Object.keys(cleanedData).forEach((key) => {
			formDataToSubmit.append(key, cleanedData[key]);
		});

		if (file) formDataToSubmit.append('projectPicture', file);

		setsubmitLoading(true);
		setMessage({ success: '', error: '' });

		try {
			await axios.post('/api/create-project', formDataToSubmit);
			setMessage({ success: 'project added successfully!', error: '' });
			onCloseModal();
			setFormData(initialFormData);
			//refetch();
		} catch (error) {
			setMessage({ success: '', error: 'Failed to add project. Please try again.' });
			console.error('Error:', error);
		} finally {
			setsubmitLoading(false);
		}
	};

	if (loading) {
		return (
			<Layout>
				<div className='flex justify-center items-center h-[50rem]'>
					<Spinner />
					<p>Loading projects...</p>
				</div>
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout>
				<div className='flex justify-center items-center h-[50rem]'>
					<h2>Error loading projects</h2>
					<p>{error.message}</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<>
				<div className=' p-10 flex justify-between items-center'>
					<div className='flex space-x-4'>
						<span
							className='material-symbols-outlined'
							style={{ fontSize: '36px' }}>
							foundation
						</span>
						<h1 className='font-bold tracking-wide text-3xl text-left'>Projects</h1>
					</div>
					<div className='flex items-center justify-end gap-2'>
						<div className='lg:w-[25rem] w-1/2 lg:visible invisible'>
							<div className='relative flex items-center justify-center w-full '>
								<Input
									isClearable
									type='text'
									color='default'
									variant='bordered'
									radius='sm'
									size='lg'
									placeholder='Type to search...'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									startContent={<span className='material-symbols-outlined'>search</span>}
								/>
							</div>
						</div>

						<Button
							color='secondary'
							className='text-white bg-black rounded-md p-3 tracking-wider '
							size='lg'
							onPress={onOpen}
							radius='none'>
							+ Add project
						</Button>
					</div>
				</div>

				<div className='p-10 h-full bg-white overflow-y-scroll no-scrollbar'>
					<div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-5'>
						<div className='flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-3 p-3'>
							<div className='flex justify-center items-start gap-2'>
								<h1 className='text-xl font-semibold'>All projects</h1>
								<p className='text-slate text-2xl'>{x}</p>
							</div>
						</div>
						{filteredProjects && filteredProjects.length > 0 ? (
							filteredProjects.map((projectItem) => (
								<Link
									key={projectItem.id}
									href={`/projects/${projectItem.id}`}>
									<Card
										className='bg-white p-1 overflow-hidden w-full'
										shadow='none'
										size='sm'>
										<CardHeader className='relative p-0 w-full'>
											<Image
												isZoomed
												alt='Card background'
												className='object-cover h-[20rem] w-[100rem] z-0'
												src={projectItem.project_projectPicture}
											/>
											<div className='absolute z-10 rounded-xl inset-x-0 bottom-[-1px] h-1/3 bg-gradient-to-b from-transparent via-black to-slate-900 opacity-50'></div>
											<h4 className='font-bold text-2xl absolute z-10 inset-0 flex items-end m-5 justify-start text-white opacity-100'>
												{projectItem.project_name}
											</h4>
										</CardHeader>
										<CardBody className='pb-0 pt-2 px-4 flex items-start z-10'>
											<p>{projectItem.project_description}</p>
										</CardBody>
										<CardFooter className='text-small justify-between'>
											<User
												name={`${projectItem.client_firstName} ${projectItem.client_lastName}`}
												description={
													<span className='text-xs'>{projectItem.client_email}</span>
												}
												avatarProps={{
													src: `${projectItem.client_profilePicture}`,
												}}
											/>
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
							<div className='absolute top-1/2 left-1/2'>
								<p className='text-default-500 text-2xl'>No projects</p>
							</div>
						)}
					</div>
				</div>
			</>
			<Modal
				isOpen={isOpen}
				variant='bordered'
				onOpenChange={onOpenChange}
				placement='top-center'
				radius='sm'
				size='2xl'>
				<form onSubmit={handleSubmit}>
					<ModalContent>
						<>
							<ModalHeader className='flex gap-1 mb-5'>
								<span className='material-symbols-outlined'>tactic</span>
								<p>Create new project</p>
							</ModalHeader>
							<ModalBody>
								<div className='grid grid-cols-4 gap-5'>
									<Select
										aria-label='select-user'
										items={clients}
										value={formData.selectClient}
										onChange={handleInputChange('selectClient')}
										variant='bordered'
										placeholder='Select a user'
										labelPlacement='outside'
										isRequired
										className='w-full col-span-4'>
										{(clients) => (
											<SelectItem
												key={clients.id}
												value={clients.id}
												textValue={`${clients.client_firstName} ${clients.client_lastName}`}>
												<div className='flex gap-2 items-center'>
													<Avatar
														alt={clients.client_firstName}
														className='flex-shrink-0'
														size='sm'
														src={clients.client_profilePicture}
													/>
													<div className='flex flex-col'>
														<span className='text-small'>{`${clients.client_firstName} ${clients.client_lastName}`}</span>
														<span className='text-tiny text-default-400'>
															{clients.client_email}
														</span>
													</div>
												</div>
											</SelectItem>
										)}
									</Select>
									<Input
										type='text'
										label='Project name'
										variant='bordered'
										name='projectName'
										value={formData.projectName}
										onChange={handleInputChange('projectName')}
										className='col-span-3'
										isRequired
									/>
									<Select
										variant='bordered'
										label='Category'
										name='projectCategory'
										value={formData.projectCategory}
										onChange={handleInputChange('projectCategory')}
										isRequired
										className='col-span-1'>
										{categoryOptions.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</Select>
									<Input
										type='text'
										label='Contract Price'
										variant='bordered'
										name='contractPrice'
										value={formData.contractPrice}
										onChange={handleInputChange('contractPrice')}
										className='col-span-2'
										isRequired
									/>

									<Select
										variant='bordered'
										label='Payment terms'
										name='paymentTerms'
										className='col-span-2'
										isRequired
										value={formData.paymentTerms}
										onChange={handleInputChange('paymentTerms')}>
										{paymentOption.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</Select>

									<Slider
										isDisabled={formData.paymentTerms !== 'Monthly payment'}
										label='DP %'
										name='downpayment'
										value={formData.downpayment}
										onChange={handleInputChange('downpayment')}
										step={5}
										maxValue={100}
										minValue={15}
										defaultValue={15}
										variant='bordered'
										className='col-span-4'
										isRequired
									/>
									<Input
										type='text'
										label='Address'
										variant='bordered'
										name='projectAddress'
										value={formData.projectAddress}
										onChange={handleInputChange('projectAddress')}
										className='col-span-4'
										isRequired
									/>
									<DatePicker
										label='Start date'
										variant='bordered'
										name='startDate'
										value={formData.startDate}
										onChange={handleInputChange('startDate')}
										className='col-span-2'
										isRequired
									/>

									<DatePicker
										label='End date'
										name='endDate'
										value={formData.endDate}
										onChange={handleInputChange('endDate')}
										variant='bordered'
										className='col-span-2'
										isRequired
									/>

									<Textarea
										variant='bordered'
										name='projectDescription'
										label='Description'
										labelPlacement='outside'
										placeholder='Enter your description'
										value={formData.projectDescription}
										onChange={handleInputChange('projectDescription')}
										className='col-span-4'
									/>
									<Input
										type='file'
										variant='bordered'
										label='Upload photo'
										name='projectPicture'
										accept='image/*'
										onChange={handleFileChange}
										className='col-span-2 w-fit'
									/>
								</div>
							</ModalBody>
							<ModalFooter className='border-t-1'>
								<Button
									color='none'
									variant='bordered'
									size='lg'
									onClick={onCloseModal}>
									Cancel
								</Button>
								<Button
									className='bg-black text-white'
									size='lg'
									radius='sm'
									type='submit'
									isLoading={submitLoading}
									disabled={submitLoading}>
									Create
								</Button>
							</ModalFooter>
						</>
					</ModalContent>
				</form>
			</Modal>
		</Layout>
	);
}
