export default function Loading() {
	return (
		<div className='absolute top-[30%] w-full'>
			<div className='flex flex-col justify-center items-center space-y-5 animate-pulse'>
				<img
					src='/logo.jpg'
					alt=''
					width='10%'
					height='10%'
				/>
				<h1 className='text-2xl font-semibold'>Elezar Construction</h1>
			</div>
		</div>
	);
}
