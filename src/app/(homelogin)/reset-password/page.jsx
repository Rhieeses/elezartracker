'use client';

import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from '@nextui-org/react';
import Link from 'next/link';

export default function ChangePassword() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	return (
		<div className='flex flex-col min-h-screen bg-white'>
			<header className='bg-white p-2 border-b border-gray-300'>
				<div className='flex items-center p-1 rounded-lg pointer-events-none ml-2 lg:ml-[3rem]'>
					<div className='flex items-center border-r-1 border-black p-1 pr-5 h-fit'>
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
			<div className='flex justify-start items-end m-4'>
				<span
					className='material-symbols-outlined'
					style={{ fontSize: '24px' }}>
					chevron_left
				</span>
				{'Back to login'}
			</div>

			<main className='flex flex-1 justify-center items-top mt-20 '>
				<Card
					shadow='none'
					className='py-4 w-1/4'>
					<CardHeader className='pb-0 pt-2 px-4 py-4  flex-col items-center'>
						<h1 className='font-bold text-4xl mb-7'>Password Reset</h1>
					</CardHeader>
					<CardBody className='space-y-[3rem] overflow-visible py-3'>
						<Input
							type='password'
							label='Enter new password'
							size='lg'
							variant='bordered'
							placeholder='Enter your email'
							labelPlacement='outside'
							className='font-bold'
							startContent={<span className='material-symbols-outlined'>lock</span>}
						/>
						<Input
							type='password'
							label='Re-enter new password'
							size='lg'
							variant='bordered'
							placeholder='Enter your email'
							labelPlacement='outside'
							className='font-bold'
							startContent={<span className='material-symbols-outlined'>lock</span>}
						/>

						<div className='w-full'>
							<Button
								color='success'
								onPress={onOpen}
								radius='sm'
								className='font-bold bg-black text-white w-full'>
								Reset Password
							</Button>
							<p className='text-slate w-full text-center mt-5'>Reset your password.</p>
						</div>
					</CardBody>
				</Card>
			</main>
			<div className='flex justify-end items-end m-4'>
				<span
					className='material-symbols-outlined bg-black rounded-md p-4 text-white'
					style={{ fontSize: '28px' }}>
					chat
				</span>
			</div>

			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}>
				<ModalContent>
					<>
						<ModalHeader className='flex flex-col gap-1 text-green-500'></ModalHeader>
						<ModalBody className='flex justify-center items-center'>
							<span
								className='material-symbols-outlined text-green-500'
								style={{ fontSize: '64px' }}>
								check
							</span>
							<h1>Password Changed!</h1>
							<p>Your password has been changed successfully</p>
						</ModalBody>
						<ModalFooter className='flex justify-center items-center'>
							<Button
								variant='solid'
								radius='sm'
								className='bg-black text-white'>
								Back to login
							</Button>
						</ModalFooter>
					</>
				</ModalContent>
			</Modal>
		</div>
	);
}
