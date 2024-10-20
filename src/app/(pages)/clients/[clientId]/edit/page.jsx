'use client';
import { useState, useEffect } from 'react';
import Pagelayout from '../pagelayout';
import { Input, Spinner, Textarea, Button, useDisclosure } from '@nextui-org/react';
import { ClientDataId } from '@/backend/data/dataHooks';
import ConfirmModal from '@/components/ui/confirmModal';

export default function EditClient({ params }) {
	const clientId = params.clientId;
	const { client, project, loading, error, refetch } = ClientDataId({ clientId });
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const [formData, setFormData] = useState({
		clientId: clientId,
		clientPicture: '',
		clientAddress: '',
		clientDescription: '',
		clientEmail: '',
		clientNumber: '',
		clientFirstName: '',
		clientMiddleName: '',
		clientLastName: '',
		imageFile: null,
	});

	useEffect(() => {
		if (client) {
			console.log(client);
			setFormData({
				clientId: clientId,
				clientPicture: client.client_profilePicture,
				clientAddress: client.client_address,
				clientDescription: client.client_description,
				clientEmail: client.client_email,
				clientNumber: client.client_contactNo,
				clientFirstName: client.client_firstName,
				clientMiddleName: client.client_middleName,
				clientLastName: client.client_lastName,
				imageFile: null,
			});
		}
	}, [project, client, clientId]);

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
				// Skip if imageFile is null
				continue;
			}
			submitData.append(key, formData[key]);
		}

		try {
			const response = await axios.post('/api/update-project', submitData);
			router.push(`/projects/${clientId}`);
		} catch (error) {
			console.error('Failed to update project:', error);
		}
	};

	if (loading) {
		return (
			<Pagelayout>
				<div className='absolute top-1/2 left-1/2 text-center'>
					<Spinner />
					<p>Loading clients data...</p>
				</div>
			</Pagelayout>
		);
	}

	if (error) {
		return (
			<Pagelayout>
				<div className='absolute top-1/2 left-1/2 text-center'>
					<h2>Error loading client data</h2>
					<p>{error.message}</p>
				</div>
			</Pagelayout>
		);
	}
	return (
		<Pagelayout clientId={clientId}>
			<div className='h-fit'>
				<div className='bg-white rounded-lg'>
					<form onSubmit={handleSubmit}>
						<div className='grid grid-cols-1 gap-6 p-5 mt-0 font-semibold'>
							<span className='flex justify-between'>
								<h1 className='font-semibold'>Client details</h1>
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
									projectId={clientId}
								/>
							</span>
							<div className='flex flex-col-2'>
								<div className='w-1/4'>
									<p>Client name</p>
								</div>
								<div className='flex gap-5 w-1/2'>
									<Input
										name='clientFirstName'
										aria-label='clientFirstName'
										label='First name'
										variant='bordered'
										defaultValue={client[0].client_firstName}
										onChange={handleChange}
									/>
									<Input
										name='clientMiddleName'
										aria-label='clientMiddleName'
										label='Middle name'
										variant='bordered'
										defaultValue={client[0].client_middleName}
										onChange={handleChange}
									/>
									<Input
										name='clientLastName'
										aria-label='clientLastName'
										label='Last name'
										variant='bordered'
										defaultValue={client[0].client_lastName}
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
										src={client[0].client_profilePicture}
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
									<p>Contact</p>
								</div>
								<div className='flex gap-5 w-1/2'>
									<Input
										name='clientEmail'
										aria-label='clientEmail'
										label='Email'
										variant='bordered'
										defaultValue={client[0].client_email}
										onChange={handleChange}
									/>

									<Input
										name='clientNumber'
										aria-label='clientNumber'
										label='Contact no.'
										variant='bordered'
										defaultValue={client[0].client_contactNo}
										onChange={handleChange}
									/>
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
										defaultValue={client[0].client_description}
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
										defaultValue={client[0].client_address}
										variant='bordered'
										placeholder='Enter the address (Max rows 5)'
										onChange={handleChange}
									/>
								</div>
							</div>

							<div className='flex justify-end w-3/4'>
								<div className='flex gap-5'>
									<Button
										size='lg'
										radius='sm'
										className='bg-black text-white'
										type='submit'>
										Save changes
									</Button>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</Pagelayout>
	);
}
