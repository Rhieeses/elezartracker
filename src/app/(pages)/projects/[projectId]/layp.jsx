import Link from 'next/link';
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
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/confirmModal';

export default function Pagelayout({ children, projectId }) {
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

	return (
		<div className='flex h-screen text-black'>
			<aside
				className={`bg-gray-100 m-1 fixed top-0 left-0 h-full w-[45px] sm:w-[3rem] md:w-[12rem] z-40  ${lgWidthClass}`}>
				<div className='sidebar'>
					<ul>
						<Link href='/dashboard'>
							<li
								className={`flex items-center p-2 mb-5 rounded-lg pointer-events-none ${liWidthClass}`}>
								<img
									src='/logo.jpg'
									alt='Logo'
									className='w-[25px] h-[30px] sm:w-[10px] sm:h-[10px] md:w-[40px] md-[40px] lg:w-[50px] lg:h-[50px] object-cover rounded-full'
								/>
								<div className='flex flex-col'>
									<h1
										className={`ml-2 font-bold text-[20px] tracking-tightest hidden md:${hideTextClass}`}>
										Elezar
									</h1>
								</div>
							</li>
						</Link>
						<Button
							size='md'
							className='p-0 pt-2  mb-5 flex items-start justify-start bg-opacity-0 '
							fullWidth
							disableRipple
							onClick={() => router.push('/projects')}
							startContent={<p className='material-symbols-outlined '>arrow_back_ios_new</p>}
							endContent={
								<p className='hidden lg:inline font-base'>Back to projects</p>
							}></Button>

						<Link href={`/projects/${projectId}`}>
							<li
								className={`flex items-center p-2 rounded-lg  ${liWidthClass} ${
									isActive('') ? 'pointer-events-none bg-black text-white' : ''
								}`}>
								<span className='material-symbols-outlined'>dashboard</span>
								<p className={`ml-2 hidden md:${hideTextClass}`}>Overview</p>
							</li>
						</Link>

						<Link href={`/projects/${projectId}/project-transactions`}>
							<li
								className={`flex items-center p-2 rounded-lg  ${liWidthClass} ${
									isActive('/project-transactions')
										? 'pointer-events-none bg-black text-white'
										: ''
								}`}>
								<span className='material-symbols-outlined'>receipt</span>
								<p className={`ml-2 hidden md:${hideTextClass}`}>Transactions</p>
							</li>
						</Link>

						<Link href={`/projects/${projectId}/edit-project`}>
							<li
								className={`flex items-center p-2 rounded-lg  ${liWidthClass} ${
									isActive('/edit-project')
										? 'pointer-events-none bg-black text-white'
										: ''
								}`}>
								<span className='material-symbols-outlined'>edit</span>
								<p className={`ml-2 hidden md:${hideTextClass}`}>Edit</p>
							</li>
						</Link>
					</ul>
				</div>

				<div className='sidebar'>
					<ul>
						<li
							className='flex items-center p-2 rounded-lg text-red-500 cursor-pointer'
							onClick={onOpen}>
							<span className='material-symbols-outlined'>delete</span>
							<p className={`ml-2 hidden md:${hideTextClass}`}>Delete</p>
						</li>

						<ConfirmModal
							isOpen={isOpen}
							onOpen={onOpen}
							onOpenChange={onOpenChange}
							projectId={projectId}
						/>
					</ul>
				</div>
			</aside>

			<div className='flex-1 ml-[2rem] md:ml-[11rem] lg:ml-[14rem] w-screen lg:w-full overflow-x-hidden'>
				<main className=' pl-6 h-fit w-full'>{children}</main>
			</div>
		</div>
	);
}
