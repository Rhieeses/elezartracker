'use client';
import { Button } from '@nextui-org/button';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className='flex items-center justify-center w-full lg:h-full h-[200%]'>
			<div className='flex flex-col space-y-20 text-center'>
				<h1 className='text-[200px] font-bold'>404</h1>
				<p>We can't seem to find the page you are looking for.</p>
				<Link href='/dashboard'>
					<Button
						size='lg'
						radius='none'
						fullWidth
						className='bg-black text-white'>
						Go back
					</Button>
				</Link>
			</div>
			<img
				src='/sad.svg'
				alt=''
				className='hidden lg:inline'
			/>
		</div>
	);
}
