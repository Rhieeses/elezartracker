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
	CardHeader,
	CardFooter,
	useDisclosure,
	Textarea,
	Button,
	Input,
	Link,
	Spinner,
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
				<div className='p-10 border-b-[1px] flex justify-between items-center'>
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
							<Search />
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
					<div className='p-3 h-fit'>
						<div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-5'>
							<div className='flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-3 p-3'>
								<div className='flex justify-center items-start gap-2 hidden lg:flex'>
									<p className='text-lg font-semibold'>All clients</p>
									<p className='text-slate text-xl'>{x}</p>
								</div>
							</div>

							{client && client.length > 0 ? (
								client.map((clientItem) => (
									<Link
										key={clientItem.id}
										href={`/clients/${clientItem.id}`}>
										<Card
											className='group bg-white p-1 relative overflow-hidden w-full h-full'
											shadow='none'>
											<CardHeader className='relative p-0'>
												<img
													alt='Card background'
													className='object-cover rounded-xl w-full h-[20rem]'
													src={clientItem.client_profilePicture || '/house.jpg'}
												/>
												<div className='absolute rounded-xl inset-x-0 bottom-[-1px] h-1/3 bg-gradient-to-b from-transparent via-black to-gray-900 opacity-50 pointer-events-none'></div>
												<h4 className='font-bold text-2xl absolute inset-0 flex items-end m-5 justify-start text-white opacity-100 transition-opacity duration-300'>
													{`${clientItem.client_firstName} ${clientItem.client_lastName}`}
												</h4>
											</CardHeader>
											<CardFooter className='text-small justify-between'>
												<p>{clientItem.client_email}</p>
												<p>{formatDate(clientItem.client_dateJoined)}</p>
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
									color='danger'
									variant='light'
									size='lg'
									onClick={onCloseModal}
									className='bg-gray-200'>
									Close
								</Button>
								<Button
									color='primary'
									size='lg'
									type='submit'
									loading={loadingSubmit}
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
