'use client';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	Textarea,
	Image,
	Spinner,
} from '@nextui-org/react';
import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { allCapitalize } from '@/utils/inputFormatter';
import axios from 'axios';

export default function ScanModal({ isOpen, onOpenChange, projectId, refetchExpenseProject }) {
	const handleClose = () => {
		setFileURL(null);
		setFileName(null);
		onOpenChange();
		setExtractedText(null);
	};
	const [results, setResults] = useState({
		projectId: projectId,
		invoiceNumber: '',
		vendorName: '',
		description: '',
		date: '',
		paymentType: '',
		amount: '',
	});
	const [fileName, setFileName] = useState('No file selected');
	const [fileURL, setFileURL] = useState(null);
	const [extractedText, setExtractedText] = useState('');
	const [loading, setLoading] = useState(false);

	//extracting details functions
	const extractDetails = (text) => {
		const invoiceNumberRegex = /RECEIPT\s*#\s*([\w-]+)/i;
		const vendorNameRegex = /RECEIPT\s*EXAMPLE\s*([^0-9]+)/i;
		const descriptionRegex = /DESCRIPTION\s*([\s\S]*?)\s*UNIT\s*PRICE/i;
		const dateRegex = /RECEIPTDATE\s*(\d{2}\/\d{2}\/\d{4})/i;
		const paymentTypeRegex = /PAYMENT\s*TYPE\s*[:\s]*([\w\s]+)/i;
		const amountRegex = /TOTAL\s*\$([\d.,]+)/i;

		// Extract matches
		const invoiceNumberMatch = text.match(invoiceNumberRegex);
		const vendorNameMatch = text.match(vendorNameRegex);
		const descriptionMatch = text.match(descriptionRegex);
		const dateMatch = text.match(dateRegex);
		const paymentTypeMatch = text.match(paymentTypeRegex);
		const amountMatch = text.match(amountRegex);

		return {
			projectId: projectId[0],
			invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1] : 'Not found',
			vendorName: vendorNameMatch ? vendorNameMatch[1].trim() : 'Not found',
			description: descriptionMatch ? descriptionMatch[1].trim() : 'Not found',
			date: dateMatch ? dateMatch[1] : 'Not found',
			paymentType: paymentTypeMatch ? paymentTypeMatch[1].trim() : 'Not found',
			amount: amountMatch ? amountMatch[1] : 'Not found',
		};
	};

	const extractReceiptDetails = (string) => {
		const text = string;
		const details = extractDetails(text);
		setResults(details);
	};

	const handleFileChange = async (event) => {
		const fileInput = event.target;
		if (fileInput.files.length > 0) {
			const file = fileInput.files[0];
			setFileName(file.name);

			const fileURL = URL.createObjectURL(file);
			setFileURL(fileURL);

			setLoading(true);
			try {
				const {
					data: { text },
				} = await Tesseract.recognize(fileURL, 'eng', {
					logger: (m) => m,
				});
				setExtractedText(text);
				extractReceiptDetails(text);
			} catch (error) {
				console.error('Error recognizing text:', error);
				setExtractedText('Error extracting text.');
			} finally {
				setLoading(false);
				URL.revokeObjectURL(fileURL);
			}
		} else {
			setFileName('No file selected');
			setFileURL(null);
			setExtractedText('');
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return ''; // Return an empty string if the date is invalid
		}
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const handleInput = (e) => {
		const { name, value } = e.target;
		setResults((prevResults) => ({
			...prevResults,
			[name]: value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			await axios.post('/api/scan-expense', results);
			refetchExpenseProject();
			onOpenChange();
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				radius='sm'
				className='max-w-screen-lg'
				placement='top'
				size='5xl'
				hideCloseButton
				onOpenChange={onOpenChange}>
				<ModalContent>
					<>
						<form onSubmit={handleSubmit}>
							<ModalHeader>
								<div className='flex flex-col w-full justify-center items-center'>
									<span
										className='material-symbols-outlined text-blue-500'
										style={{ fontSize: '64px' }}>
										document_scanner
									</span>
									<div className='text-center'>
										<h1 className='font-bold'>Scan your receipts here</h1>
										<p>Upload and submit your receipts to scan</p>
									</div>
								</div>
							</ModalHeader>
							<ModalBody>
								<div className='flex flex-col justify-center items-center gap-5'>
									<div className='flex flex-col items-center justify-center w-full'>
										{fileURL ? (
											// Display the image preview
											<div className='group flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 rounded-lg bg-gray-50'>
												<Image
													src={fileURL}
													alt='Preview'
													className='w-full h-full object-cover rounded-lg'
												/>
												<Input
													id='dropzone-file'
													type='file'
													accept='image/*'
													onChange={handleFileChange}
													className='group-hover:visible invisible'
												/>
											</div>
										) : (
											// Display the dropbox
											<label
												htmlFor='dropzone-file'
												className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'>
												<div className='flex flex-col items-center justify-center pt-5 pb-6'>
													<span className='material-symbols-outlined'>
														cloud_upload
													</span>
													<p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
														<span className='font-semibold'>Click to upload</span> or
														drag and drop
													</p>
													<p className='text-xs text-gray-500 dark:text-gray-400'>
														SVG, PNG, JPG or GIF (MAX. 800x400px)
													</p>
													<p className='mt-2 text-md text-blue-500'>{fileName}</p>
												</div>
												<input
													id='dropzone-file'
													type='file'
													accept='image/*'
													className='hidden'
													onChange={handleFileChange}
												/>
											</label>
										)}
									</div>

									{fileURL ? (
										<div className='w-full h-full'>
											{loading ? (
												<div className='w-full h-full flex items-center justify-center'>
													<Spinner
														color='primary'
														className='z-20 absolute'
													/>
												</div>
											) : (
												<Textarea
													isReadOnly
													maxRows={15}
													value={extractedText}
												/>
											)}
										</div>
									) : null}

									{fileURL
										? !loading && (
												<div className='flex gap-5'>
													<Input
														type='text'
														name='invoiceNumber'
														variant='bordered'
														label='Invoice no.'
														value={allCapitalize(results.invoiceNumber)}
														labelPlacement='outside'
														isRequired
														onChange={handleInput}
													/>
													<Input
														type='text'
														name='vendorName'
														variant='bordered'
														label='Vendor'
														labelPlacement='outside'
														value={results.vendorName}
														isRequired
														required
														onChange={handleInput}
													/>
													<Input
														type='text'
														name='description'
														variant='bordered'
														label='Description'
														value={results.description}
														labelPlacement='outside'
														isRequired
														required
														onChange={handleInput}
													/>
													<Input
														type='date'
														name='date'
														variant='bordered'
														label='Purchase date'
														value={formatDate(results.date)}
														labelPlacement='outside'
														isRequired
														required
														onChange={handleInput}
													/>
													<Input
														type='text'
														name='paymentType'
														variant='bordered'
														label='Category'
														value={results.paymentType}
														labelPlacement='outside'
														isRequired
														required
														onChange={handleInput}
													/>
													<Input
														type='text'
														name='amount'
														variant='bordered'
														label='Total amount'
														value={results.amount}
														labelPlacement='outside'
														isRequired
														required
														onChange={handleInput}
													/>
												</div>
										  )
										: null}
								</div>
							</ModalBody>
							<ModalFooter>
								{fileURL ? (
									<>
										<Button
											color='danger'
											variant='light'
											onPress={handleClose}>
											Close
										</Button>
										<Button
											type='submit'
											color='primary'>
											Insert
										</Button>
									</>
								) : null}
							</ModalFooter>
						</form>
					</>
				</ModalContent>
			</Modal>
		</>
	);
}
