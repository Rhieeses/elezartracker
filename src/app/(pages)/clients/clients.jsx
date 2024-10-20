'use client';
import Layout from '@/components/ui/layout';
import { Search } from '@/components/ui/search';
import { formatDate, capitalizeFirstLetter } from '@/utils/inputFormatter';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	useDisclosure,
	Textarea,
	Button,
	Input,
	Link,
	Spinner,
	Image,
} from '@nextui-org/react';
import { useState } from 'react';
import { ClientData } from '@/backend/data/dataHooks';
import axios from 'axios';

export default function ClientsContent() {
	const { client, loading, error, refetch } = ClientData();
	const initialFormData = {
		lastName: '',
		firstName: '',
		middleName: '',
		clientAddress: '',
		clientEmail: '',
		contactNo: '',
		description: '',
	};

	const [formData, setFormData] = useState(initialFormData);
	const { isOpen, onOpen, onOpenChange } = useDisclosure(false);
	const [file, setFile] = useState(null);
	const [loadingSubmit, setLoadingSubmit] = useState(false);
	const [successMessage, setSuccessMessage] = useState(''); //use later for alert success
	const [errorMessage, setErrorMessage] = useState(''); //use later for alert success

	const [searchTerm, setSearchTerm] = useState('');

	const filteredClients = client.filter(
		(clientItem) =>
			clientItem.client_firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			clientItem.client_lastName.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	let x = 0;

	if (client && client.length > 0) {
		x = client.length;
	}

	const onCloseModal = () => {
		onOpenChange();
		setFormData(initialFormData);
		setFile(null);
	};

	const handleInput = (field) => (event) => {
		const value = event.target.value;
		setFormData((prevData) => ({
			...prevData,
			[field]: capitalizeFirstLetter(value),
		}));
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setFile(file);

			return () => URL.revokeObjectURL(objectUrl);
		} else {
			setFile(null);
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const formDataToSubmit = new FormData();
		for (const key in formData) {
			formDataToSubmit.append(key, formData[key]);
		}
		if (file) {
			formDataToSubmit.append('profilePicture', file);
		}
		setLoadingSubmit(true);
		setSuccessMessage('');
		setErrorMessage('');

		try {
			await axios.post('/api/add-client', formDataToSubmit);
			setSuccessMessage('Client added successfully!');
			setFormData(initialFormData);
			onCloseModal();
			setFile(null);
			refetch();
		} catch (error) {
			setErrorMessage('Failed to add client. Please try again.');
			console.error('Error:', error);
		} finally {
			setLoadingSubmit(false);
		}
	};

	return (
		<Layout>
			<>
				<div className='p-10 flex justify-between items-center'>
					<div className='flex space-x-4'>
						<span
							className='material-symbols-outlined'
							style={{ fontSize: '36px' }}>
							face
						</span>
						<h1 className='font-semibold tracking-wide text-3xl text-left'>Clients</h1>
					</div>
					<div className='flex items-center justify-end gap-2'>
						<div className='lg:w-[25rem] w-1/2'>
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

						<Button
							color='secondary'
							className='text-white bg-black rounded-md p-3 tracking-wider '
							size='lg'
							onPress={onOpen}
							radius='none'>
							+ Add client
						</Button>
					</div>
				</div>
				{!loading ? (
					<div className='p-10 h-full bg-white overflow-y-scroll no-scrollbar'>
						<div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-5'>
							<div className='flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-4 p-3'>
								<div className='flex justify-center items-start gap-2 hidden lg:flex'>
									<p className='text-lg font-semibold'>All clients</p>
									<p className='text-slate text-xl'>{x}</p>
								</div>
							</div>

							{filteredClients && filteredClients.length > 0 ? (
								filteredClients.map((clientItem) => (
									<Link
										key={clientItem.id}
										href={`/clients/${clientItem.id}`}>
										<Card
											className='w-full h-full'
											shadow='none'>
											<CardBody className='overflow-visible p-0'>
												<Image
													radius='sm'
													width='100%'
													className='w-full object-cover h-[15rem]'
													src={clientItem.client_profilePicture || '/house.jpg'}
												/>
											</CardBody>
											<CardFooter className='flex flex-col items-start'>
												<p className='text-md font-semibold'>
													{`${clientItem.client_firstName} ${clientItem.client_lastName}`}
												</p>
												<p className='text-default-500 text-sm'>
													{clientItem.client_email}
												</p>
											</CardFooter>
										</Card>
									</Link>
								))
							) : (
								<div className='absolute top-1/2 left-1/2'>
									<p className='text-default-500 text-2xl'>No Clients</p>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className='absolute top-1/2 left-1/2'>
						<Spinner />
					</div>
				)}
			</>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				placement='top-center'
				size='2xl'>
				<form onSubmit={handleSubmit}>
					<ModalContent>
						<>
							<ModalHeader className='flex gap-1 mb-5'>
								<span className='material-symbols-outlined'>face</span>
								<p>Create new client</p>
							</ModalHeader>
							<ModalBody>
								<div className='grid grid-cols-4 gap-5'>
									<Input
										type='text'
										label='First name'
										variant='bordered'
										name='firstName'
										value={formData.firstName}
										onChange={handleInput('firstName')}
										className='col-span-2'
										required
										isRequired
									/>
									<Input
										type='text'
										label='Middle name'
										variant='bordered'
										name='middleName'
										value={formData.middleName}
										onChange={handleInput('middleName')}
										className='col-span-1'
									/>
									<Input
										type='text'
										label='Last name'
										variant='bordered'
										name='lastName'
										value={formData.lastName}
										onChange={handleInput('lastName')}
										required
										isRequired
									/>
									<Input
										type='email'
										label='Email'
										variant='bordered'
										name='clientEmail'
										value={formData.clientEmail}
										onChange={handleInput('clientEmail')}
										className='col-span-2'
										required
										isRequired
									/>
									<Input
										type='number'
										label='Contact no.'
										variant='bordered'
										name='contactNo'
										value={formData.contactNo}
										onChange={handleInput('contactNo')}
										className='col-span-2'
										required
										isRequired
									/>

									<Input
										type='text'
										label='Address'
										variant='bordered'
										name='clientAddress'
										value={formData.clientAddress}
										onChange={handleInput('clientAddress')}
										className='col-span-4'
										required
										isRequired
									/>

									<Textarea
										variant='bordered'
										name='description'
										label='Description'
										labelPlacement='outside'
										placeholder='Enter your description'
										value={formData.description}
										onChange={handleInput('description')}
										className='col-span-4'
									/>
									<Input
										type='file'
										variant='bordered'
										label='Upload photo'
										name='profilePicture'
										accept='image/*'
										onChange={handleFileChange}
										className='col-span-2 w-fit'
									/>
								</div>
							</ModalBody>
							<ModalFooter>
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
									isLoading={loadingSubmit}
									disabled={loadingSubmit}>
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
