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
	Avatar,
} from '@nextui-org/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Notification } from '@/backend/data/dataHooks';
import { formatDateTime } from '@/utils/inputFormatter';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
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
				localStorage.removeItem('token');
				router.push('/login');
			}
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	return (
		<div className='flex flex-col h-screen text-black'>
			<header className='flex flex-col w-full bg-white pt-2 h-fit'>
				<div className='flex items-center justify-between pr-2 z-20'>
					<div className='ml-[2rem]'>
						<div className='flex items-center  rounded-lg pointer-events-none'>
							<img
								src='/logo.jpg'
								alt='Logo'
								className='sticky top-0  w-[25px] h-[30px] sm:w-[10px] sm:h-[10px] md:w-[40px] md-[40px] lg:w-[35px] lg:h-[35px] object-cover rounded-full'
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
										src: user?.profilepicture,
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

				<div className='sticky top-0 z-10 h-full bg-white no-scrollbar w-full overflow-x-scroll lg:overflow-x-hidden border-b-[1px]'>
					<ul className='flex list-none ml-5 space-x-3'>
						<Link
							href='/dashboard'
							prefetch={true}
							className={`flex items-center p-1  ${
								isActive('Dashboard')
									? 'pointer-events-none border-b-2 border-black font-semibold'
									: ''
							}`}>
							<li className='hover:bg-gray-200 p-2 rounded-lg'>
								<p className=' md:inline'>Dashboard</p>
							</li>
						</Link>
						<Link
							href='/projects'
							prefetch={true}
							className={`flex items-center p-1  ${
								isActive('Projects')
									? 'pointer-events-none border-b-2 border-black font-semibold'
									: ''
							}`}>
							<li className='hover:bg-gray-200 p-2 rounded-lg'>
								<p className=' md:inline'>Projects</p>
							</li>
						</Link>
						<Link
							href='/clients'
							prefetch={true}
							className={`flex items-center p-1  ${
								isActive('Clients')
									? 'pointer-events-none border-b-2 border-black font-semibold'
									: ''
							}`}>
							<li className='hover:bg-gray-200 p-2 rounded-lg'>
								<p className=' md:inline'>Clients</p>
							</li>
						</Link>
						<Link
							href='/vendors'
							prefetch={true}
							className={`flex items-center p-1  ${
								isActive('Vendors')
									? 'pointer-events-none border-b-2 border-black font-semibold'
									: ''
							}`}>
							<li className='hover:bg-gray-200 p-2 rounded-lg'>
								<p className=' md:inline'>Vendors</p>
							</li>
						</Link>
						<Link
							href='/accounts'
							prefetch={true}
							className={`flex items-center p-1  ${
								isActive('Accounts')
									? 'pointer-events-none border-b-2 border-black font-semibold'
									: ''
							}`}>
							<li className='hover:bg-gray-200 p-2 rounded-lg'>
								<p className=' md:inline'>Accounts</p>
							</li>
						</Link>

						<Link
							href='/receivables'
							prefetch={true}
							className={`flex items-center p-1  ${
								isActive('Receivables')
									? 'pointer-events-none border-b-2 border-black font-semibold'
									: ''
							}`}>
							<li className='hover:bg-gray-200 p-2 rounded-lg'>
								<p className=' md:inline'>Receivables</p>
							</li>
						</Link>

						<Link
							href='/sales'
							prefetch={true}
							className={`flex items-center p-1  ${
								isActive('Sales')
									? 'pointer-events-none border-b-2 border-black font-semibold'
									: ''
							}`}>
							<li className='hover:bg-gray-200 p-2 rounded-lg'>
								<p className=' md:inline'>Sales</p>
							</li>
						</Link>

						<Link
							href='/expense'
							prefetch={true}
							className={`flex items-center p-1  ${
								isActive('Expense')
									? 'pointer-events-none border-b-2 border-black font-semibold'
									: ''
							}`}>
							<li className='hover:bg-gray-200 p-2 rounded-lg'>
								<p className=' md:inline'>Expenses</p>
							</li>
						</Link>

						<Link
							href='/transactions'
							prefetch={true}
							className={`flex items-center p-1  ${
								isActive('Transactions')
									? 'pointer-events-none border-b-2 border-black font-semibold'
									: ''
							}`}>
							<li className='hover:bg-gray-200 p-2 rounded-lg'>
								<p className=' md:inline'>Transactions</p>
							</li>
						</Link>

						<Link
							href='/reports'
							prefetch={true}
							className={`flex items-center p-1  ${
								isActive('Reports')
									? 'pointer-events-none border-b-2 border-black font-semibold'
									: ''
							}`}>
							<li className='hover:bg-gray-200 p-2 rounded-lg'>
								<p className=' md:inline'>Reports</p>
							</li>
						</Link>
					</ul>
				</div>
				<div className='flex w-full h-full 	lg:w-full'>
					<main className='w-full h-full lg:w-full'>{children}</main>
				</div>
			</header>
		</div>
	);
}
