import {
	User,
	Button,
	Divider,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	DropdownSection,
	useDisclosure,
} from '@nextui-org/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Notification } from '@/backend/data/dataHooks';
import { formatDateTime } from '@/utils/inputFormatter';
import ConfirmModal from '@/components/ui/confirmModal';

import axios from 'axios';

export default function Layout({ children, projectId }) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	let pathname = usePathname();
	const router = useRouter();

	pathname = pathname.replace(/^\/projects\/\d+/, '');
	const isActive = (href) => pathname === href;

	let headerPathname;

	if (pathname === '/project-transactions') {
		headerPathname = 'Transactions';
	} else if (pathname === '/edit-project') {
		headerPathname = 'Edit Details';
	} else {
		//headerPathname = projectName || 'Projects';
	}
	const lgWidthClass = 'lg:w-[15rem]';
	const hideTextClass = 'hidden lg:inline';
	const liWidthClass = 'w-[3rem] lg:w-[14rem]';

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

				<div className='sticky flex items-center justify-between top-0 z-10 bg-white no-scrollbar w-full overflow-x-scroll lg:overflow-x-hidden border-b-[1px]'>
					<ul className='flex list-none ml-5 space-x-3'>
						<li className='p-2'>
							<Button
								size='md'
								className='p-0 pt  flex items-center justify-center bg-opacity-0 '
								fullWidth
								isIconOnly
								disableRipple
								onClick={() => router.push('/projects')}>
								<p className='material-symbols-outlined '>arrow_back_ios_new</p>
							</Button>
						</li>
						<Link
							href={`/projects/${projectId}`}
							prefetch={true}
							className={`flex items-center p-1 text-gray-700 ${
								isActive('') ? 'pointer-events-none border-b-2 border-black' : ''
							}`}>
							<li className='flex space-x-2 hover:bg-gray-200 p-2 rounded-lg'>
								<span className='material-symbols-outlined'>dashboard</span>
								<p className='md:inline'>Overview</p>
							</li>
						</Link>

						<Link
							href={`/projects/${projectId}/project-transactions`}
							prefetch={true}
							className={`flex items-center p-1 text-gray-700 ${
								isActive('/project-transactions')
									? 'pointer-events-none border-b-2 border-black'
									: ''
							}`}>
							<li className='flex space-x-2 hover:bg-gray-200 p-2 rounded-lg'>
								<span className='material-symbols-outlined'>receipt</span>
								<p className='md:inline'>Transactions</p>
							</li>
						</Link>

						<Link
							href={`/projects/${projectId}/edit-project`}
							prefetch={true}
							className={`flex items-center p-1 text-gray-700 ${
								isActive('/edit-project')
									? 'pointer-events-none border-b-2 border-black'
									: ''
							}`}>
							<li className='flex space-x-2 hover:bg-gray-200 p-2 rounded-lg'>
								<span className='material-symbols-outlined'>edit</span>
								<p className='md:inline'>Edit</p>
							</li>
						</Link>
					</ul>
					<ul className='flex list-none mr-5 space-x-3 '>
						<li
							className='flex space-x-2 bg-red-500 text-white hover:bg-red-700 p-2 rounded-lg cursor-pointer'
							onClick={onOpen}>
							<span className='material-symbols-outlined'>delete</span>
							<p className={`hidden md:${hideTextClass}`}>Delete</p>
						</li>

						<ConfirmModal
							isOpen={isOpen}
							onOpen={onOpen}
							onOpenChange={onOpenChange}
							projectId={projectId}
						/>
					</ul>
				</div>

				<div className='flex w-screen lg:w-full'>
					<main className='p-10 z-0 pt-0 w-full bg-[#fafafa]'>{children}</main>
				</div>
			</header>
		</div>
	);
}

/**
 * 
					
	
					
<Tabs
						aria-label='navbar'
						className='text-black'
						variant='underlined'
						selectedKey={basePath}
						color='primary'
						onSelectionChange={(value) => {
							if (value !== basePath) {
								console.log('Navigating to', value);
								router.push(value);
							}
						}}>
						<Tab
							key='/dashboard'
							prefetch={true}
							className='hover:bg-gray-100 rounded w-full p-6'
							title={
								<div className='flex items-center space-x-2 '>
									<span className='material-symbols-outlined'>dashboard</span>
									<span>Dashboard</span>
								</div>
							}
						/>
						<Tab
							key='/projects'
							prefetch={true}
							className='hover:bg-gray-100 rounded w-full p-6'
							title={
								<div className='flex items-center space-x-2 '>
									<span className='material-symbols-outlined'>tactic</span>
									<span>Projects</span>
								</div>
							}
						/>
						<Tab
							key='/clients'
							prefetch={true}
							className='hover:bg-gray-100 rounded w-full p-6'
							title={
								<div className='flex items-center space-x-2 '>
									<span className='material-symbols-outlined'>face</span>
									<span>Clients</span>
								</div>
							}
						/>
						<Tab
							key='/vendors'
							prefetch={true}
							className='hover:bg-gray-100 rounded w-full p-6'
							title={
								<div className='flex items-center space-x-2 '>
									<span className='material-symbols-outlined'>shop</span>
									<span>Vendor</span>
								</div>
							}
						/>

						<Tab
							key='/accounts'
							prefetch={true}
							className='hover:bg-gray-100 rounded w-full p-6'
							title={
								<div className='flex items-center space-x-2 '>
									<span className='material-symbols-outlined'>account_balance_wallet</span>
									<span>Accounts</span>
								</div>
							}
						/>

						<Tab
							key='/receivables'
							prefetch={true}
							className='hover:bg-gray-100 rounded w-full p-6'
							title={
								<div className='flex items-center space-x-2 '>
									<span className='material-symbols-outlined'>equalizer</span>
									<span>Receivables</span>
								</div>
							}
						/>
						<Tab
							key='/sales'
							prefetch={true}
							className='hover:bg-gray-100 rounded w-full p-6'
							title={
								<div className='flex items-center space-x-2 '>
									<span className='material-symbols-outlined'>payments</span>
									<span>Sales</span>
								</div>
							}
						/>
						<Tab
							key='/expense'
							prefetch={true}
							className='hover:bg-gray-100 rounded w-full p-6'
							title={
								<div className='flex items-center space-x-2 '>
									<span className='material-symbols-outlined'>credit_card</span>
									<span>Expenses</span>
								</div>
							}
						/>
						<Tab
							key='/transactions'
							prefetch={true}
							className='hover:bg-gray-100 rounded w-full p-6'
							title={
								<div className='flex items-center space-x-2 '>
									<span className='material-symbols-outlined'>receipt</span>
									<span>Transactions</span>
								</div>
							}
						/>
						<Tab
							key='/reports'
							prefetch={true}
							className='hover:bg-gray-100 rounded w-full p-6'
							title={
								<div className='flex items-center space-x-2'>
									<span className='material-symbols-outlined'>pie_chart</span>
									<span>Reports</span>
								</div>
							}
						/>
					</Tabs>

 */
