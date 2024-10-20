'use client';
import { Button } from '@nextui-org/button';
import Link from 'next/link';

export default function Unauthorized() {
	return (
		<div className='flex items-center justify-center w-full lg:h-screen'>
			<div className='flex flex-col space-y-20 text-center z-10'>
				<h1 className='text-[200px] font-bold'>403</h1>
				<p>You are Unauthorized for this page!.</p>
				<Link href='/login'>
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
				src='/noEntry.svg'
				alt=''
				width='40%'
				className='hidden lg:inline absolute opacity-20 z-0'
			/>
		</div>
	);
}
