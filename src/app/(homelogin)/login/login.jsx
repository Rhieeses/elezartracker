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

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			onClose();
			router.push('/dashboard');
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
				const { token } = res.data;
				localStorage.setItem('token', token);
				router.push('/dashboard');
			}
		} catch (error) {
			setErrorMessage('Login failed. Wrong username or password.');
			console.error('Login error:', error);
			onClose();
			setLoading(false);
		}
	};

	useEffect(() => {
		router.prefetch('/dashboard');
	}, [router]);

	//
	return (
		<div className='flex flex-col min-h-screen'>
			<header className='bg-white p-2 border-b border-gray-300'>
				<div className='flex items-center p-1 rounded-lg ml-2 lg:ml-[3rem]'>
					<div className='flex items-center p-1 h-fit'>
						<img
							src='logo.jpg'
							alt='Logo'
							className='w-[50px] h-[50px] object-cover rounded-full'
						/>
						<div className='flex flex-col'>
							<p className='ml-2 font-bold'>ELEZAR CONSTRUCTION</p>
						</div>
					</div>
				</div>
			</header>

			<main className='flex flex-1 justify-center items-top mt-20'>
				<Card
					shadow='none'
					className='py-4 w-full lg:w-1/4'>
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
								startContent={<span className='material-symbols-outlined'>person</span>}
								autoComplete='username'
							/>

							<Input
								type='password'
								label='Password'
								size='lg'
								variant='bordered'
								placeholder='Enter your password'
								labelPlacement='outside'
								className='font-bold'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								startContent={<span className='material-symbols-outlined'>lock</span>}
								autoComplete='current-password'
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
									<p className='text-red-500 text-center mt-4'>{errorMessage}</p>
								)}
								<p className='text-slate w-full text-center mt-5'>
									Don't have an account? Contact admin
								</p>
							</div>
						</form>
					</CardBody>
				</Card>
				<Modal
					isOpen={isOpen}
					onOpenChange={onOpenChange}
					onClose={onClose}
					radius='sm'
					isDismissable={false}
					isKeyboardDismissDisabled={true}>
					<ModalContent>
						{(onClose) => (
							<>
								<ModalBody className='text-center'>
									<span
										className='material-symbols-outlined text-center'
										style={{ fontSize: '64px' }}>
										warning
									</span>
									<p>You are logging in. Please wait</p>
									{errorMessage}
									<Spinner />
								</ModalBody>
							</>
						)}
					</ModalContent>
				</Modal>
			</main>
			<div className='flex justify-end items-end m-4'>
				<span
					className='material-symbols-outlined bg-black rounded-md p-4 text-white'
					style={{ fontSize: '28px' }}>
					chat
				</span>
			</div>
		</div>
	);
}
