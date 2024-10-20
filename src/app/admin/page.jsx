'use client';
import {
	User,
	Button,
	Divider,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	DropdownSection,
} from '@nextui-org/react';
import AdminDashboard from './dashboard';
import TransferFund from './transferFund';
import Accounts from './accounts';

import { Notification } from '@/backend/data/dataHooks';
import { formatDateTime } from '@/utils/inputFormatter';
import axios from 'axios';
import { Tabs, Tab } from '@nextui-org/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Admin() {
	const router = useRouter;
	const [selected, setSelected] = useState('photos');

	const { notifications } = Notification();

	const NotificationSeen = async (id, isseen) => {
		if (isseen === false) {
			try {
				const response = await axios.post('/api/notification-seen', { id });
				console.log('Notification marked as seen:', response.data);
			} catch (error) {
				console.error('Error marking notification as seen:', error);
			}
		}
	};

	const handleLogout = async () => {
		try {
			const response = await axios.post('/api/logout');

			if (response.status === 200) {
				localStorage.removeItem('token');
				window.location.href = '/login';
			}
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	return (
		<div className='flex flex-col h-screen text-black'>
			<header className='flex flex-col w-full bg-white pt-2 h-fit opacity-90'>
				<div className='flex items-center justify-between pr-2'>
					<div className='ml-[2rem]'>
						<div className='flex items-center  rounded-lg pointer-events-none'>
							<img
								src='/logo.jpg'
								alt='Logo'
								className='sticky top-0 z-10 w-[25px] h-[30px] sm:w-[10px] sm:h-[10px] md:w-[40px] md-[40px] lg:w-[35px] lg:h-[35px] object-cover rounded-full'
							/>
							<div className='flex flex-col'>
								<h1 className='ml-2 font-bold text-[20px] tracking-tightest  md:inline'>
									Elezar
								</h1>
							</div>
						</div>
					</div>

					<div className='flex items-center space-x-5'>
						<div className='flex space-x-2'>
							<Dropdown
								radius='sm'
								placement='bottom-end'>
								<DropdownTrigger>
									<Button
										color='default'
										className='bg-transparent p-0 min-w-0 min-h-0 hover:text-blue-400'
										startContent={
											<span
												className='material-symbols-outlined text-lg'
												style={{ fontSize: '24px' }}>
												notifications
											</span>
										}
									/>
								</DropdownTrigger>
								<DropdownMenu
									aria-label='notification'
									showDivider
									className='p-0'>
									<DropdownSection className='p-0'>
										<DropdownItem
											className='pointer-events-none'
											textValue='Notifications'>
											<h1 className='text-xl font-bold'>Notifications</h1>
										</DropdownItem>
										{notifications.length > 0 ? (
											notifications.map((notif, index) => {
												let color =
													notif.isseen === false ? 'bg-red-100 font-bold' : 'bg-white';

												return (
													<DropdownItem
														key={index}
														textValue={notif.title}
														href={`/projects/${notif.project_id}`}
														onPress={() => NotificationSeen(notif.id, notif.isseen)}
														className='p-0 flex gap-5'>
														<div className={`text-sm flex flex-col ${color} p-2 `}>
															<div className='text-red-400'>{notif.title}</div>
															<div className='text-default-500 text-sm font-semibold'>
																{notif.description}
															</div>
															<div className='text-xs text-default-500'>
																{formatDateTime(notif.date)}
															</div>
														</div>
														<Divider className='bg-white' />
													</DropdownItem>
												);
											})
										) : (
											<DropdownItem textValue='No notifications available'>
												No notifications available.
											</DropdownItem>
										)}
									</DropdownSection>
								</DropdownMenu>
							</Dropdown>
						</div>

						<Dropdown radius='md'>
							<DropdownTrigger>
								<User
									as='button'
									className='my-2'
									avatarProps={{
										src: '/bookkeeper.jpg',
									}}
								/>
							</DropdownTrigger>
							<DropdownMenu aria-label='Action event example'>
								<DropdownItem
									key='accountSettings'
									startContent={
										<span className='material-symbols-outlined'>account_circle</span>
									}>
									Account Settings
								</DropdownItem>

								<DropdownItem
									key='help'
									startContent={<span className='material-symbols-outlined'>help</span>}>
									Help
								</DropdownItem>
								<DropdownItem
									color='danger'
									key='logout'
									onClick={handleLogout}
									startContent={<span className='material-symbols-outlined'>logout</span>}>
									Log out
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</div>
			</header>
			<div className='w-full h-full'>
				<Tabs
					aria-label='Options'
					selectedKey={selected}
					variant='underlined'
					className='border-b-[1px] w-full'
					onSelectionChange={setSelected}>
					<Tab
						key='dashboard'
						title='Dashboard'>
						<AdminDashboard />
					</Tab>
					<Tab
						key='fund'
						title='Transfer Fund'>
						<TransferFund />
					</Tab>

					<Tab
						key='account'
						title='Accounts'>
						<Accounts />
					</Tab>
				</Tabs>
			</div>
		</div>
	);
}
