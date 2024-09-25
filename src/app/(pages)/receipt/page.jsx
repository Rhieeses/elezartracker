const ReceiptTest = ({ data }) => {
	const clientName = 'Kier abenojar';
	const totalAmount = '₱750,000.00';
	const projectLocation = 'Nasugbo, Tagaytay city';
	const date = 'November 19, 2024';

	return (
		<div className='flex items-start justify-center bg-black w-screen h-screen'>
			<div className='flex flex-col items-center bg-white w-2/5 h-full p-12'>
				<div className='company-name flex items-center gap-3'>
					<img
						src='/logo.jpg'
						alt='logo'
						width={60}
					/>
					<div>
						<h1 className='font-bold text-2xl'>Elezar Construction and Design</h1>
						<p className='text-slate text-center'>Marikina City, Metro Manila</p>
					</div>
				</div>
				<div className='receipt-title mt-16'>
					<em className='font-bold text-3xl'>ACKNOWLEDGEMENT RECEIPT</em>
				</div>

				<div className='date w-full mt-10 mb-10 p-7'>
					<p className='text-right font-semibold'>{date}</p>
				</div>

				<div className='body'>
					<p className='font-semibold'>
						This receipt acknowledges the down payment received from{' '}
						<strong>{clientName}</strong> for the construction of a residential house at
						<strong> {projectLocation}</strong>.The payment total amounting of{'     '}
						<strong>{totalAmount}</strong> represents part of the total project cost, and
						further payments will be due as outlined in the contract agreement. This receipt
						serves as proof of payment and is not an invoice.
					</p>
				</div>

				<div className='receipt-footer w-full mt-[15rem] flex flex-col items-start'>
					<div>
						<p className='font-bold'>Juan dela cruz</p>
						<p className='text-slate text-center'>Secretary</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ReceiptTest;
