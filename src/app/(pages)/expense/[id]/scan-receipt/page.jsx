'use client';
import Layout from '@/components/ui/layout';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Tesseract from 'tesseract.js';

import axios from 'axios';

import {
	Button,
	Input,
	Textarea,
	Image,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
} from '@nextui-org/react';

import { allCapitalize, formatDate } from '@/utils/inputFormatter';

export default function ScanReceipt({ params }) {
	const projectId = params.id;
	const router = useRouter();
	const [results, setResults] = useState([]);
	const [files, setFiles] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [scannedResults, setScannedResults] = useState('');
	const [currentFileURL, setCurrentFileURL] = useState(null);
	const [fileNames, setFileNames] = useState([]);
	const [fileURLs, setFileURLs] = useState([]);

	const [loading, setLoading] = useState(false);

	const handleFileChange = (event) => {
		const fileInput = event.target.files;
		const filesArray = Array.from(fileInput); // Convert FileList to Array

		const fileNames = filesArray.map((file) => file.name);
		const fileURLs = filesArray.map((file) => URL.createObjectURL(file)); // Create URLs for each file

		setFileNames(fileNames); // Store file names to display in the UI
		setFileURLs(fileURLs); // Store the file URLs in state
		setFiles(filesArray); // Store the files in state
		setCurrentIndex(0); // Reset index to start with the first file
		//setScannedResults([]); // Reset any previous scanned results
		setResults([]);

		if (filesArray.length > 0) {
			// Generate URL for the first file and set it as the preview
			const firstFileURL = fileURLs[0]; // Get the URL of the first file
			setCurrentFileURL(firstFileURL);
		} else {
			// Reset if no files are selected
			setCurrentFileURL(null);
		}
	};

	useEffect(() => {
		// Update the preview URL when currentIndex changes
		if (fileURLs.length > 0 && currentIndex < fileURLs.length) {
			setCurrentFileURL(fileURLs[currentIndex]);
		}
	}, [currentIndex, fileURLs]);

	const processNextFile = async () => {
		setLoading(true); // Set loading to true before processing

		// Process files recursively
		const processFileAtIndex = async (index) => {
			if (index < files.length) {
				const file = files[index];
				const fileURL = URL.createObjectURL(file);
				setCurrentFileURL(fileURL);

				try {
					const {
						data: { text },
					} = await Tesseract.recognize(fileURL, 'eng');

					setScannedResults((prevResults) => [...prevResults, text]); // Store scanned text
					extractReceiptDetails(text, file); // Extract details from the scanned text
				} catch (error) {
					console.error('Error recognizing text:', error);
					setResults((prevResults) => [
						...prevResults,
						{
							projectId: projectId,
							invoiceNumber: '',
							vendorName: '',
							description: '',
							date: '',
							paymentType: '',
							amount: '',
							scannedtext: '',
						},
					]);
				} finally {
					URL.revokeObjectURL(fileURL); // Clean up the object URL
					setCurrentIndex((prevIndex) => prevIndex + 1); // Increment index
					processFileAtIndex(index + 1); // Process next file
				}
			} else {
				console.log('All files processed');
				setLoading(false); // Set loading to false after all files are processed
			}
		};

		// Start processing from the current index
		await processFileAtIndex(currentIndex);
	};

	//extracting details functions
	const extractDetails = (text, file) => {
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
			projectId: projectId,
			fileName: file.name,
			invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1] : 'Not found',
			vendorName: vendorNameMatch ? vendorNameMatch[1].trim() : 'Not found',
			description: descriptionMatch ? descriptionMatch[1].trim() : 'Not found',
			date: dateMatch ? dateMatch[1] : 'Not found',
			paymentType: paymentTypeMatch ? paymentTypeMatch[1].trim() : 'Not found',
			amount: amountMatch ? amountMatch[1] : 'Not found',
			scannedtext: text,
		};
	};

	const extractReceiptDetails = (string, file) => {
		const text = string;
		const details = extractDetails(text, file);
		setResults((prevResults) => [...prevResults, details]);
	};

	const handleInput = (e) => {
		const { name, value } = e.target;
		setResults((prevResults) => ({
			...prevResults,
			[name]: value,
		}));
	};

	const handleSubmit = async (e, result, index) => {
		e.preventDefault();

		const file = files[index]; // Use the row index to access the correct file

		// Create FormData to upload the file
		const formData = new FormData();
		formData.append('file', file); // Append the file to FormData

		try {
			// Upload the file using Axios
			const uploadResponse = await axios.post('/api/upload-receipt', formData, {
				headers: {
					'Content-Type': 'multipart/form-data', // Important for file uploads
				},
			});

			if (uploadResponse.status === 200) {
				console.log('File uploaded successfully:', uploadResponse.data);

				// Now add the scanned details to the database
				const details = {
					projectId: projectId,
					fileUrl: uploadResponse.data.filePath,
					invoiceNumber: result.invoiceNumber,
					vendorName: result.vendorName,
					description: result.description,
					date: result.date,
					paymentType: result.paymentType,
					amount: result.amount,
				};

				//const dbResponse = await axios.post('/api/scan-expense', details);

				if (dbResponse.status === 200) {
					console.log('Details added to database:', dbResponse.data);
				} else {
					console.error('Failed to add details to database:', dbResponse);
				}
			} else {
				console.error('File upload failed:', uploadResponse);
			}
		} catch (error) {
			console.error('Error uploading file or adding details:', error);
		}
	};

	return (
		<Layout>
			<div className='h-full'>
				<div className='flex items-center space-x-4 p-10 border-b-1'>
					<span
						className='material-symbols-outlined cursor-pointer'
						onClick={() => {
							router.back();
						}}>
						arrow_back_ios_new
					</span>

					<div className='flex gap-1 items-center  justify-between w-full '>
						<p className='text-4xl font-bold text-blue-800'>Scan receipt</p>

						<Button
							className='bg-black text-white'
							auto
							onClick={processNextFile}
							disabled={loading || files.length - currentIndex === 0}
							icon={<span className='material-symbols-outlined'>document_scanner</span>}>
							{loading
								? `Processing ${currentIndex}...`
								: `Process Files ${files.length - currentIndex}`}
						</Button>
					</div>
				</div>

				<div className='grid grid-cols-7 grid-rows-7 h-full w-full gap-4 pt-5'>
					<div className='row-span-5 overflow-y-auto max-h-1/2'>
						<div className=' border-t-0'>
							<div className='border-1 flex items-center p-5 '>
								<h1 className='font-semibold'>Queue</h1>
							</div>
							<div className='p-3 space-y-2'>
								{fileNames.length > 0 &&
									fileNames.map((fileName, index) => (
										<div
											className={`p-5 border-1 rounded-md ${
												index === currentIndex ? 'bg-black text-white' : ''
											}`} // Change background color if index matches currentIndex
											key={index}
											onClick={() => setCurrentIndex(index)} // Update currentIndex when clicked
										>
											<span className='flex gap-5'>
												<p>{index + 1}</p>
												<p className='font-semibold text-sm'>{fileName}</p>
											</span>
										</div>
									))}
							</div>
						</div>
					</div>
					<div className='col-span-6 row-span-5 '>
						<div className='grid grid-cols-6 gap-2'>
							<div className='col-span-3'>
								<div className=' h-fit w-full'>
									<div className='flex flex-col items-center justify-center w-full'>
										{currentFileURL ? (
											<div className='group flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 rounded-lg bg-gray-50'>
												<Image
													src={currentFileURL}
													alt='Preview'
													width={500}
													height={500}
													className='w-full h-full object-fit rounded-lg'
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
											<label
												htmlFor='dropzone-file'
												className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'>
												<div className='flex flex-col items-center justify-center pt-5 pb-6'>
													<span className='material-symbols-outlined'>
														cloud_upload
													</span>
													<p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
														<span className='font-semibold'>Click to upload</span>
													</p>

													<p className='mt-2 text-md text-blue-500'>
														{currentFileURL}
													</p>
												</div>
												<input
													id='dropzone-file'
													type='file'
													accept='image/*'
													multiple
													className='hidden'
													onChange={handleFileChange}
												/>
											</label>
										)}
									</div>
									<span className='flex justify-between'>
										<p className='font-semibold'>{fileNames[currentIndex]}</p>
									</span>
								</div>
							</div>
							<Textarea
								readOnly
								label='Scanned text'
								variant='bordered'
								classNames={{
									label: 'text-md',
									input: 'text-lg',
								}}
								maxRows={15}
								className='col-span-3 h-fit w-full'
								//value={currentIndex + 1}
								value={results[currentIndex]?.scannedtext ?? scannedResults}
							/>
						</div>
					</div>
					<div className='col-span-7 row-span-2 row-start-6 w-full'>
						<Table
							aria-label='table'
							classNames={{ th: 'bg-slate-900 text-white', td: 'border-b-1' }}
							className='p-2 w-full rounded-none'>
							<TableHeader>
								<TableColumn>NO.</TableColumn>
								<TableColumn>FILE</TableColumn>
								<TableColumn>PROJ ID</TableColumn>
								<TableColumn>INVOICE #</TableColumn>
								<TableColumn>VENDOR</TableColumn>
								<TableColumn>DESCRIPTION</TableColumn>
								<TableColumn>DATE</TableColumn>
								<TableColumn>PAYMENT TYPE</TableColumn>
								<TableColumn>AMOUNT</TableColumn>
								<TableColumn>ACTION</TableColumn>
							</TableHeader>
							<TableBody>
								{(results || []).map((result, index) => (
									<TableRow
										key={index}
										className={index === currentIndex ? 'bg-default-300' : ''}>
										<TableCell>{index + 1}</TableCell>
										<TableCell>{result.fileName}</TableCell>
										<TableCell>{result.projectId}</TableCell>

										<TableCell>
											<Input
												type='text'
												name='invoiceNumber'
												variant='bordered'
												label='Invoice no.'
												value={allCapitalize(result.invoiceNumber)}
												labelPlacement='outside'
												isRequired
												onChange={handleInput}
												className='w-fit'
											/>
										</TableCell>

										<TableCell>
											<Input
												type='text'
												name='vendorName'
												variant='bordered'
												label='Vendor'
												labelPlacement='outside'
												value={result.vendorName}
												isRequired
												required
												onChange={handleInput}
												className='w-fit'
											/>
										</TableCell>

										<TableCell>
											<Input
												type='text'
												name='description'
												variant='bordered'
												label='Description'
												value={result.description}
												labelPlacement='outside'
												isRequired
												required
												onChange={handleInput}
											/>
										</TableCell>

										<TableCell>
											<Input
												type='date'
												name='date'
												variant='bordered'
												label='Purchase date'
												value={formatDate(result.date)}
												labelPlacement='outside'
												isRequired
												required
												onChange={handleInput}
											/>
										</TableCell>

										<TableCell>
											<Input
												type='text'
												name='paymentType'
												variant='bordered'
												label='Category'
												value={result.paymentType}
												labelPlacement='outside'
												isRequired
												required
												onChange={handleInput}
											/>
										</TableCell>

										<TableCell>
											<Input
												type='text'
												name='amount'
												variant='bordered'
												label='Total amount'
												value={result.amount}
												labelPlacement='outside'
												isRequired
												required
												onChange={handleInput}
											/>
										</TableCell>

										<TableCell>
											<form onSubmit={(e) => handleSubmit(e, result, index)}>
												<Button
													className='bg-black text-white'
													type='submit'>
													+ Add
												</Button>
											</form>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>
		</Layout>
	);
}
