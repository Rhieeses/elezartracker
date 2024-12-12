'use client';
import { useState, useEffect } from 'react';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Checkbox,
	Modal,
	ModalBody,
	ModalContent,
	useDisclosure,
	Spinner,
	Image,
} from '@nextui-org/react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginComponent() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
	const [loading, setLoading] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const toggleVisibility = () => setIsVisible(!isVisible);

	useEffect(() => {
		router.prefetch('/dashboard');
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('token');
			if (token) {
				onClose();
				router.push('/dashboard');
				router.refresh();
			}
		}
	}, [router, onClose]);

	const handleLogin = async (event) => {
		event.preventDefault();
		onOpen();
		setErrorMessage('');
		setLoading(true);

		try {
			const res = await axios.post('/api/login', { username, password });

			if (res.status === 200) {
				const { token, user } = res.data; // Destructure token and user data
				if (typeof window !== 'undefined') {
					localStorage.setItem('token', token);
					sessionStorage.setItem('user', JSON.stringify(user));
					sessionStorage.setItem('token', token);
				}

				router.push('/dashboard');
			}
		} catch (error) {
			setErrorMessage('Login failed. Wrong username or password.');
			console.error('Login error:', error);
			onClose();
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col min-h-screen h-screen '>
			<header className='bg-white p-2 border-b border-gray-300'>
				<div className='flex items-center p-1 rounded-lg ml-2 lg:ml-[3rem]'>
					<div className='flex items-center p-1 h-fit'>
						<Image
							src='/favicon.png'
							alt='Logo'
							width={50}
							height={50}
						/>
						<div className='flex flex-col'>
							<p className='ml-2 font-bold'>ELEZAR CONSTRUCTION</p>
						</div>
					</div>
				</div>
			</header>

			<main className='grid grid-cols-1 lg:grid-cols-2 h-full'>
				<div className='flex items-center justify-center hidden lg:flex '>
					<div className='w-1/2 space-y-5'>
						<h1 className='text-3xl w-3/4'>
							Optimize Your Sales and Expense Management for Elezar Construction
						</h1>
						<p>
							Designed specifically for Elezar Construction, our customized tracking
							tool empowers your team to monitor sales, control expenses, and drive
							profitability with precision—all within one seamless platform
						</p>
					</div>
				</div>
				<div className='flex items-center justify-start'>
					<Card
						shadow='none'
						className='py-4 w-full lg:w-4/6'>
						<CardHeader className='pb-0 pt-2 px-4 py-4 flex-col items-center'>
							<h1 className='font-bold text-4xl mb-7'>Sign in</h1>
							<p className='text-slate'>Log into your bookkeeper account</p>
						</CardHeader>
						<CardBody className='space-y-[3rem] overflow-visible py-5'>
							<form
								onSubmit={handleLogin}
								className='space-y-[3rem]'>
								<Input
									type='text'
									label='Username'
									size='lg'
									variant='bordered'
									placeholder='Enter your username'
									labelPlacement='outside'
									className='font-bold'
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									startContent={
										<span className='material-symbols-outlined'>person</span>
									}
									autoComplete='username'
								/>

								<Input
									label='Password'
									variant='bordered'
									placeholder='Enter your password'
									size='lg'
									labelPlacement='outside'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									startContent={
										<span className='material-symbols-outlined'>lock</span>
									}
									autoComplete='current-password'
									endContent={
										<button
											className='focus:outline-none'
											type='button'
											onClick={toggleVisibility}
											aria-label='toggle password visibility'>
											{isVisible ? (
												<span className='material-symbols-outlined'>
													visibility
												</span>
											) : (
												<span className='material-symbols-outlined'>
													visibility_off
												</span>
											)}
										</button>
									}
									type={isVisible ? 'text' : 'password'}
									className='font-bold'
								/>

								<div className='w-full'>
									<div className='flex justify-between mb-5'>
										<Checkbox
											size='md'
											color='primary'>
											Remember me
										</Checkbox>
										<Link
											href='/password-reset'
											className='text-blue-600 font-bold'>
											Forgot password?
										</Link>
									</div>

									<Button
										type='submit'
										color='success'
										radius='sm'
										className='font-bold bg-black text-white w-full'
										onClick={handleLogin}>
										Login
									</Button>

									{errorMessage && (
										<p className='text-red-500 text-center mt-4'>
											{errorMessage}
										</p>
									)}
									<p className='text-slate w-full text-center mt-5'>
										Don't have an account? Contact admin
									</p>
								</div>
							</form>
						</CardBody>
					</Card>
				</div>
			</main>
			<Modal
				isOpen={isOpen && loading}
				onOpenChange={onOpenChange}
				onClose={onClose}
				radius='sm'
				isDismissable={false}
				isKeyboardDismissDisabled={true}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalBody className='text-center'>
								<p>You are logging in. Please wait</p>
								{errorMessage}
								<Spinner />
							</ModalBody>
						</>
					)}
				</ModalContent>
			</Modal>
			<footer className='flex items-center justify-between pt-7 pb-7 p-5 border-t-1 border-default-300 bg-white z-50'>
				<div className='flex gap-5'>
					<p className='text-xs text-right text-default-500'>
						Copyright © 2024 Elezar Construction
					</p>
					<p className='text-xs text-right text-default-500'>All rights reserved</p>
				</div>
				<div className='flex gap-2'>
					<Image
						src='/instagram-icon.png'
						alt=''
						width={30}
						height={30}
					/>
					<Image
						src='/fb-icon.png'
						alt=''
						width={30}
						height={30}
					/>
				</div>
			</footer>
		</div>
	);
}
