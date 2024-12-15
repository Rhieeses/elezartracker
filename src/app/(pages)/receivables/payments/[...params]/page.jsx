'use client';
import { formatDate, formatNumberDecimal } from '@/utils/inputFormatter';
import { useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Receipt({ params }) {
	const name = decodeURIComponent(params.params[0]);
	const date = decodeURIComponent(params.params[1]);
	const project = decodeURIComponent(params.params[2]);
	const amount = decodeURIComponent(params.params[3]);

	useEffect(() => {
		// Trigger print dialog when the component mounts
		window.print();
	}, []);

	const downloadReceipt = () => {
		const input = document.getElementById('receipt');
		setTimeout(() => {
			html2canvas(input).then((canvas) => {
				const imgData = canvas.toDataURL('image/png');
				const pdf = new jsPDF();
				const imgWidth = 190;
				const pageHeight = pdf.internal.pageSize.height;
				const imgHeight = (canvas.height * imgWidth) / canvas.width;
				let heightLeft = imgHeight;

				let position = 0;

				while (heightLeft > 0) {
					pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
					heightLeft -= pageHeight;
					position -= pageHeight;
					if (heightLeft > 0) {
						pdf.addPage();
					}
				}
				pdf.save(`acknowledgment-receipt-${name}_${formatDate(date)}.pdf`);
			});
		}, 1000);
	};

	return (
		<div className='flex items-start justify-center w-screen h-screen bg-default-900'>
			<div
				className='printable-area flex flex-col items-center bg-white w-2/5 h-full p-12'
				id='receipt'>
				<div className='company-name flex items-center gap-3'>
					<img
						src='/logo.jpg'
						alt='logo'
						width={60}
					/>
					<div>
						<h1 className='font-bold text-3xl'>Elezar Construction and Design</h1>
						<p className='text-slate text-center'>Marikina City, Metro Manila</p>
					</div>
				</div>
				<div className='receipt-title mt-[10rem]'>
					<em className='font-bold text-2xl'>ACKNOWLEDGEMENT RECEIPT</em>
				</div>

				<div className='date w-full mt-10 mb-10 p-7'>
					<p className='text-right font-semibold'>{formatDate(date)}</p>
				</div>

				<div className='body'>
					<p className='font-semibold'>
						This receipt acknowledges the down payment received from{' '}
						<strong>{name}</strong> for the construction of a residential house
						<strong> {project}</strong>.The payment total amounting of
						<strong> {formatNumberDecimal(amount)} </strong> represents part of the
						total project cost, and further payments will be due as outlined in the
						contract agreement. This receipt serves as proof of payment and is not an
						invoice.
					</p>
				</div>

				<div className='receipt-footer w-full mt-[15rem] flex flex-col items-start'>
					<div>
						<p className='font-bold'>Mary Cris R. Retuerma</p>
						<p className='text-slate text-center'>Book keeper</p>
					</div>
				</div>
			</div>

			<div className='absolute right-5'>
				<button
					onClick={downloadReceipt}
					className='mt-4 bg-blue-500 text-white p-2 rounded'>
					Download Receipt
				</button>
			</div>
		</div>
	);
}
