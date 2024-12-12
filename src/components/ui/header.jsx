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
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Notification } from '@/backend/data/dataHooks';
import { formatDateTime } from '@/utils/inputFormatter';
import axios from 'axios';
import jwtDecode from 'jwt-decode'; // Ensure jwt-decode is installed
import { useState, useEffect } from 'react';

export default function Header({ children }) {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await axios.get('/api/getUser', { withCredentials: true });
				setUser(response.data);
			} catch (err) {
				setError(err.response ? err.response.data : 'Error fetching user');
			}
		};

		fetchUser();
	}, []);

	let pathname = usePathname();
	const router = useRouter();

	let pathArray = pathname.split('/');

	pathname = pathArray[1];

	pathname = pathname.charAt(0).toUpperCase() + pathname.slice(1);

	const isActive = (href) => pathname === href;

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
				//localStorage.removeItem('token');
				router.push('/login');
			}
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	return (
		<div className='flex flex-col h-screen text-black'>
			<header className='flex flex-col w-full bg-white pt-2 h-fit'>
				<div className='flex items-center justify-between pr-2 border-b-1'>
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

					<div className='flex items-center space-x-5 pr-3'>
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
									className='text-sm p-2'
									avatarProps={{
										showFallback: true,
										src: user?.profilepicture || 'default_picture.png',
									}}
									name={user?.name}
									description={user?.position}
								/>
							</DropdownTrigger>
							<DropdownMenu aria-label='Action event example'>
								<DropdownItem
									key='accountSettings'
									href='/account-settings'
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

				<div className='flex w-full h-full 	lg:w-full'>
					<main className='w-full h-full lg:w-full'>{children}</main>
				</div>
			</header>
		</div>
	);
}
