import Layout from '@/components/ui/layout';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@nextui-org/button';

export default function PageLayout({ children, clientId, clientheader }) {
	let pathname = usePathname();
	const router = useRouter();

	pathname = pathname.replace(/[\/0-9]/g, '');
	pathname = pathname.charAt(0).toUpperCase() + pathname.slice(1);

	const isActive = (href) => pathname === href;

	return (
		<Layout>
			<div className='grid grid-cols-7 h-fit w-fit lg:w-full'>
				<div className='col-span-7 border-b-1'>{clientheader}</div>
				<div className='side col-span-1 border-r-1'>
					<ul>
						<Link
							href={`/clients/${clientId}`}
							prefetch={true}
							className={`flex items-center hover:bg-default-300 text-gray-700 ${
								isActive('Clients') ? 'pointer-events-none text-white bg-black' : ''
							}`}>
							<li className='flex space-x-2 items-center p-3 cursor-pointer'>
								<span className='material-symbols-sharp'>dashboard</span>
								<p className='font-semibold hidden lg:inline'>Overview</p>
							</li>
						</Link>
						<Link
							href={`/clients/${clientId}/transactions`}
							prefetch={true}
							className={`flex items-center hover:bg-default-300 text-gray-700 ${
								isActive('Clientstransactions')
									? 'pointer-events-none text-white bg-black'
									: ''
							}`}>
							<li className='flex space-x-2 items-center p-3 cursor-pointer'>
								<span className='material-symbols-sharp'>point_of_sale</span>
								<p className='font-semibold hidden lg:inline'>Transactions</p>
							</li>
						</Link>

						<Link
							href={`/clients/${clientId}/edit`}
							prefetch={true}
							className={`flex items-center hover:bg-default-300 text-gray-700 ${
								isActive('Clientsedit') ? 'pointer-events-none text-white bg-black' : ''
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
