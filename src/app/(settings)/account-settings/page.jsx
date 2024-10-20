'use client';

import Header from '@/components/ui/header';
import { Button, Tab, Tabs, AccordionItem, Accordion, Spinner, Input } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/inputFormatter';
import axios from 'axios';

export default function AccountSettings() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await axios.get('/api/getUser', { withCredentials: true });
				setUser(response.data);
			} catch (err) {
				setError(err.response ? err.response.data : 'Error fetching user');
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, []);

	const [formData, setFormData] = useState({
		username: '',
		name: '',
		email: '',
		imageFile: null,
	});

	useEffect(() => {
		if (user) {
			setFormData({
				username: user.username,
				name: user.name,
				email: user.email,
				profilepicture: user.profilepicture,
				imageFile: null,
			});
		}
	}, [user]);

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

		try {
			const userId = Number(user.id);
			const response = await axios.put(`/api/update-account/${userId}`, submitData);
			console.log(response.data.message);
			router.refresh();
		} catch (error) {
			console.error('Failed to update project:', error);
		}
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			setErrorMessage('Passwords do not match!');

			return;
		}

		try {
			const userId = Number(user.id);

			const response = await axios.post(`/api/change-password/${userId}`, {
				oldPassword,
				newPassword,
			});
			alert(response.data.message);
		} catch (error) {
			console.error(error);
			alert('Error changing password.');
		}
	};

	if (loading) {
		return (
			<Header>
				<div className='flex justify-center items-center h-[50rem]'>
					<Spinner />
					<p>Loading dashboard data...</p>
				</div>
			</Header>
		);
	}

	if (error) {
		return (
			<Header>
				<div className='flex justify-center items-center h-[50rem]'>
					<h2>Error loading dashboard data</h2>
					<p>{error.message}</p>
				</div>
			</Header>
		);
	}

	return (
		<Header>
			<div className='flex items-center justify-center w-full'>
				<div className='main-body p-5 w-4/5'>
					<div className='flex justify-start items-center mb-5'>
						<Button
							isIconOnly
							className='bg-transparent'
							onClick={() => {
								router.back();
							}}
							startContent={
								<span className='material-symbols-sharp'>arrow_back_ios</span>
							}></Button>
						<h1>Account settings</h1>
					</div>

					<div className='m-10 '>
						<p className='font-semibold'>Personal</p>
						<Tabs
							aria-label='Options'
							classNames={{
								panel: 'ml-10 w-full',
								tabList: 'bg-white w-full',
								tab: 'flex justify-start',
								tabContent: 'group-data-[selected=true]:font-bold',
							}}
							variant='flat'
							isVertical>
							<Tab
								key='profile'
								title={
									<div className='flex gap-2'>
										<span className='material-symbols-sharp'>person</span>
										<p>Profile</p>
									</div>
								}>
								<div className='w-full'>
									<h1 className='font-semibold'>Profile details</h1>
									<form
										onSubmit={handleSubmit}
										className='pt-5 w-full'>
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
												aria-label='Username'
												subtitle={user.username}
												title='Username'>
												<Input
													name='username'
													aria-label='userName'
													variant='bordered'
													defaultValue={user.username}
													onChange={handleChange}
												/>
											</AccordionItem>
											<AccordionItem
												key='2'
												aria-label='name'
												subtitle={user.name}
												title='name'>
												<Input
													name='name'
													aria-label='name'
													variant='bordered'
													defaultValue={user.name}
													onChange={handleChange}
												/>
											</AccordionItem>
											<AccordionItem
												key='3'
												aria-label='Image'
												title='Profile picture'>
												<div className='w-full border-[3px] flex flex-col-2 items-center p-3 rounded-lg gap-5'>
													<img
														src={user.profilepicture}
														alt='Project'
														className='h-[15rem] w-[25rem]  object-cover rounded-lg'
													/>
													<div className='flex flex-col items-center justify-center w-full h-full gap-10'>
														<p className='text-center'>
															Upload an image for the project
														</p>
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
												key='4'
												aria-label='email'
												title='Email'
												subtitle={user.email}>
												<Input
													aria-label='email'
													type='email'
													label='email'
													variant='bordered'
													defaultValue={user.email}
													onChange={handleChange}
												/>
											</AccordionItem>
											<AccordionItem
												key='5'
												aria-label='position'
												title='Position'
												subtitle={user.position}>
												<p>Bookkeeper</p>
											</AccordionItem>
											<AccordionItem
												key='6'
												aria-label='dateJoined'
												title='Date Joined'
												subtitle={formatDate(user.created_at)}>
												<p>December 12, 2024</p>
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
							</Tab>
							<Tab
								key='password'
								title={
									<div className='flex gap-2'>
										<span className='material-symbols-sharp'>lock</span>
										<p>Password</p>
									</div>
								}>
								<div className='w-full'>
									<h1 className='font-semibold'>Profile details</h1>
									<form onSubmit={handleChangePassword}>
										<div className='flex flex-col gap-10 w-full p-5'>
											{/* Input fields here, binding state to values */}
											<Input
												label='Old password'
												variant='bordered'
												labelPlacement='outside'
												placeholder='Enter your old password'
												size='lg'
												type={isVisible ? 'text' : 'password'}
												value={oldPassword}
												onChange={(e) => setOldPassword(e.target.value)}
												className='font-bold w-1/2'
											/>
											<Input
												label='New password'
												variant='bordered'
												labelPlacement='outside'
												placeholder='Enter your new password'
												size='lg'
												type={isVisible ? 'text' : 'password'}
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												className='font-bold w-1/2'
											/>
											<Input
												label='Confirm New password'
												variant='bordered'
												labelPlacement='outside'
												placeholder='Enter your confirm new password'
												size='lg'
												type={isVisible ? 'text' : 'password'}
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												className='font-bold w-1/2'
											/>
											<p className='text-red-500'>{errorMessage}</p>
											<div className='flex justify-end pt-5 w-1/2'>
												<Button
													size='lg'
													radius='sm'
													className='bg-black text-white'
													type='submit'>
													Change password
												</Button>
											</div>
										</div>
									</form>
								</div>
							</Tab>
						</Tabs>
					</div>
				</div>
			</div>
		</Header>
	);
}
