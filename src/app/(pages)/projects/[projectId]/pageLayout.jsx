import Layout from '@/components/ui/layout';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@nextui-org/button';

export default function ProjectLayout({
	children,
	projectId,
	projectName,
	projectPicture,
	desciption,
}) {
	let pathname = usePathname();
	const router = useRouter();

	pathname = pathname.replace(/[\/0-9]/g, '');
	pathname = pathname.charAt(0).toUpperCase() + pathname.slice(1);

	const isActive = (href) => pathname === href;

	return (
		<Layout>
			<div className='border-b-[1px] flex justify-between items-center'>
				<div className='relative flex w-full h-[25rem]'>
					<img
						src={projectPicture}
						alt=''
						className='w-full h-full object-cover object-center'
					/>
					<div className='absolute inset-0 h-[7rem] bg-gradient-to-t from-transparent via-black to-gray-900 opacity-50'></div>

					<div className='absolute flex p-5'>
						<Button
							isIconOnly
							className='bg-transparent'
							onClick={() => {
								router.push('/projects');
							}}
							startContent={
								<span className='material-symbols-sharp text-white'>arrow_back_ios</span>
							}></Button>

						<span>
							<h1 className='text-white font-bold tracking-wide text-3xl text-left'>
								{projectName}
							</h1>
							<p className='text-white'>{desciption}</p>
						</span>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-7 h-fit w-fit lg:w-full'>
				<div className='side col-span-1'>
					<ul>
						<Link
							href={`/projects/${projectId}`}
							prefetch={true}
							className={`flex items-center hover:bg-default-300 text-gray-700 ${
								isActive('Projects') ? 'pointer-events-none text-white bg-black' : ''
							}`}>
							<li className='flex space-x-2 items-center p-3 cursor-pointer'>
								<span className='material-symbols-sharp'>dashboard</span>
								<p className='font-semibold hidden lg:inline'>Overview</p>
							</li>
						</Link>
						<Link
							href={`/projects/${projectId}/project-transactions`}
							prefetch={true}
							className={`flex items-center hover:bg-default-300 text-gray-700 ${
								isActive('Projectsproject-transactions')
									? 'pointer-events-none text-white bg-black'
									: ''
							}`}>
							<li className='flex space-x-2 items-center p-3 cursor-pointer'>
								<span className='material-symbols-sharp'>point_of_sale</span>
								<p className='font-semibold hidden lg:inline'>Transactions</p>
							</li>
						</Link>

						<Link
							href={`/projects/${projectId}/edit-project`}
							prefetch={true}
							className={`flex items-center hover:bg-default-300 text-gray-700 ${
								isActive('Projectsedit-project')
									? 'pointer-events-none text-white bg-black'
									: ''
							}`}>
							<li className='flex space-x-2 items-center p-3 cursor-pointer'>
								<span className='material-symbols-sharp'>settings</span>
								<p className='font-semibold hidden lg:inline'>Settings</p>
							</li>
						</Link>
					</ul>
				</div>
				<div className='col-span-6'>{children}</div>
			</div>
		</Layout>
	);
}
/**
 * <div className='fixed w-1/6  border-r-1 h-full bg-white'>
					<ul className='pl-2 pt-2 w-[90%]'>
						<Link
							href={`/dashboard`}
							prefetch={true}
							className={`flex items-center text-gray-700 ${
								isActive('/edit-project')
									? 'pointer-events-none border-b-2 border-black'
									: ''
							}`}>
							<li className='flex items-center rounded-lg mb-5 p-3 cursor-pointer'>
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
							</li>
						</Link>
						<Link
							href={`/projects/${projectId}`}
							prefetch={true}
							className={`flex items-center hover:bg-default-300 text-gray-700 ${
								isActive('') ? 'pointer-events-none border-b-1 border-black' : ''
							}`}>
							<li className='flex space-x-2 items-center p-3 cursor-pointer'>
								<span className='material-symbols-sharp'>dashboard</span>
								<p className='font-semibold'>Overview</p>
							</li>
						</Link>
						<Link
							href={`/projects/${projectId}/project-transactions`}
							prefetch={true}
							className={`flex items-center hover:bg-default-300 text-gray-700 ${
								isActive('/project-transactions')
									? 'pointer-events-none border-b-2 border-black'
									: ''
							}`}>
							<li className='flex space-x-2 items-center p-3 cursor-pointer'>
								<span className='material-symbols-sharp'>point_of_sale</span>
								<p className='font-semibold'>Transactions</p>
							</li>
						</Link>

						<Link
							href={`/projects/${projectId}/edit-project`}
							prefetch={true}
							className={`flex items-center hover:bg-default-300 text-gray-700 ${
								isActive('/edit-project')
									? 'pointer-events-none border-b-2 border-black'
									: ''
							}`}>
							<li className='flex space-x-2 items-center p-3 cursor-pointer'>
								<span className='material-symbols-sharp'>settings</span>
								<p className='font-semibold'>Settings</p>
							</li>
						</Link>
					</ul>
				</div>
 */
