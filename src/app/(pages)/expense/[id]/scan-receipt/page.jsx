'use client';
import Layout from '@/components/ui/layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import { allCapitalize } from '@/utils/inputFormatter';

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
	Modal,
	ModalContent,
	ModalBody,
	Select,
	SelectItem,
	useDisclosure,
} from '@nextui-org/react';
import Header from '@/components/ui/header';
//const fetcher = (url) => axios.get(url, { withCredentials: true }).then((res) => res.data);

export default function ScanReceipt({ params }) {
	const projectId = params.id;
	const router = useRouter();

	const [results, setResults] = useState([]);
	const [files, setFiles] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [scannedResults, setScannedResults] = useState([]);
	const [currentFileURL, setCurrentFileURL] = useState(null);
	const [fileNames, setFileNames] = useState([]);
	const [fileURLs, setFileURLs] = useState([]);
	const [loading, setLoading] = useState(false);

	const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

	const handleRemoveFile = (index) => {
		// Create new arrays excluding the file at the specified index
		const updatedFiles = files.filter((_, i) => i !== index);
		const updatedFileNames = fileNames.filter((_, i) => i !== index);
		const updatedFileURLs = fileURLs.filter((_, i) => i !== index);

		// Update state with the new arrays
		setFiles(updatedFiles);
		setFileNames(updatedFileNames);
		setFileURLs(updatedFileURLs);

		// Adjust the current index if necessary
		if (index <= currentIndex && currentIndex > 0) {
			setCurrentIndex((prevIndex) => prevIndex - 1);
		}

		// Update the currentFileURL if needed
		if (updatedFiles.length > 0) {
			setCurrentFileURL(updatedFileURLs[Math.min(currentIndex, updatedFileURLs.length - 1)]);
		} else {
			setCurrentFileURL(null); // No files left, so clear the preview
		}
	};

	const removeRow = (index) => {
		setResults((prevResults) => prevResults.filter((_, i) => i !== index));
	};

	const removeScanText = (index) => {
		setScannedResults((prevResults) => prevResults.filter((_, i) => i !== index));
	};

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

	let categoryOptions = [
		{ label: 'CASH', value: 'CASH' },
		{ label: 'BANK TRANSFER', value: 'BANK TRANSFER' },
		{ label: 'GCASH', value: 'GCASH' },
	];

	//extracting details functions
	const extractDetails = (text, file) => {
		const invoiceNumberRegex = /RECEIPT\s*#\s*([\w-]+)/i;
		const vendorNameRegex = /RECEIPT\s*EXAMPLE\s*([^0-9]+)/i;
		const descriptionRegex = /DESCRIPTION\s*([\s\S]*?)\s*UNIT\s*PRICE/i;
		const dateRegex = /RECEIPT DATE\s*(\d{2}\/\d{2}\/\d{4})/i;
		const paymentTypeRegex = /PAYMENT\s*TYPE\s*[:\s]*([\w\s]+)/i;
		const amountRegex = /TOTAL\s*\$([\d.,]+)/i;

		// Extract matches
		const invoiceNumberMatch = text.match(invoiceNumberRegex);
		const vendorNameMatch = text.match(vendorNameRegex);
		const descriptionMatch = text.match(descriptionRegex);
		const dateMatch = text.match(dateRegex);
		const paymentTypeMatch = text.match(paymentTypeRegex);
		const amountMatch = text.match(amountRegex);

		let formattedDate;
		if (!dateMatch || !dateMatch[1]) {
			formattedDate = new Date().toISOString().split('T')[0];
		} else {
			// Parse the matched date (MM/DD/YYYY)
			const [month, day, year] = dateMatch[1].split('/');
			formattedDate = `${year}-${month}-${day}`; // Format as yyyy-MM-dd
		}

		return {
			projectId: projectId,
			fileName: file.name,
			invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1] : 'Not found',
			vendorName: vendorNameMatch ? vendorNameMatch[1].trim() : 'Not found',
			description: descriptionMatch ? descriptionMatch[1].trim() : 'Not found',
			date: formattedDate,
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

	const handleInput = (e, index) => {
		const { name, value } = e.target;
		setResults((prevResults) =>
			prevResults.map((result, i) => (i === index ? { ...result, [name]: value } : result)),
		);
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
				console.log(details);

				const dbResponse = await axios.post('/api/scan-expense', details);

				if (dbResponse.status === 200) {
					handleRemoveFile(index);
					removeRow(index);
					removeScanText(index);
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
		<Header>
			<div className='p-10 border-b-[1px] flex justify-between items-center'>
				<div className='flex items-center space-x-4'>
					<span
						className='material-symbols-outlined cursor-pointer'
						onClick={() => {
							router.back();
						}}>
						arrow_back_ios_new
					</span>
					<img
						src='/ocr_icon.png'
						alt=''
						className='w-8 object-contain'
					/>

					<h1 className='font-bold tracking-wide text-3xl text-left'>Receipt Scanner</h1>
				</div>

				<Button
					className='bg-black text-white'
					auto
					size='md'
					radius='sm'
					onClick={processNextFile}
					disabled={loading || files.length - currentIndex === 0}
					icon={<span className='material-symbols-outlined'>document_scanner</span>}>
					{loading
						? `Processing ${currentIndex}...`
						: `Process Files ${files.length - currentIndex}`}
				</Button>
			</div>
			<div className='fixed top-[11.5rem] w-[15rem] h-full border-r-1 space-y-1 bg-white'>
				<p className='text-xl text-center p-2 rounded-b-[1rem] border-2 bg-black text-white'>
					Queue
				</p>
				<div className='p-2 space-y-1 overflow-y-auto h-[70%] '>
					{fileNames.length > 0 &&
						fileNames.map((fileName, index) => (
							<div
								className={`p-5 border-1 rounded-lg ${
									index === currentIndex ? 'bg-black text-white' : 'bg-default-200'
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

			<div className='w-full h-fit overflow-y-scroll bg-default-100'>
				<div className='grid grid-cols-2 gap-5 m-[16rem] mr-2 mt-0 mb-0'>
					<Table
						aria-label='table'
						removeWrapper
						isHeaderSticky
						classNames={{
							th: 'bg-black text-white',
							td: 'border-b-1',
							thead: 'z-10',
							tbody: 'z-0',
						}}
						className='w-full rounded-none col-span-2 h-[16rem] overflow-y-scroll'>
						<TableHeader>
							<TableColumn>NO.</TableColumn>
							<TableColumn>FILE</TableColumn>
							<TableColumn>INVOICE #</TableColumn>
							<TableColumn>VENDOR</TableColumn>
							<TableColumn>DESCRIPTION</TableColumn>
							<TableColumn>DATE</TableColumn>
							<TableColumn>PAYMENT TYPE</TableColumn>
							<TableColumn>AMOUNT</TableColumn>
							<TableColumn>ACTION</TableColumn>
						</TableHeader>
						<TableBody emptyContent={'No scanned text found'}>
							{(results || []).map((result, index) => (
								<TableRow
									key={index}
									className={index === currentIndex ? 'bg-default-300' : ''}>
									<TableCell>{index + 1}</TableCell>
									<TableCell>{result.fileName}</TableCell>

									<TableCell>
										<Input
											required
											type='text'
											name='invoiceNumber'
											variant='bordered'
											label='Invoice no.'
											value={allCapitalize(result.invoiceNumber)}
											labelPlacement='outside'
											isRequired
											onChange={(e) => handleInput(e, index)}
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
											onChange={(e) => handleInput(e, index)}
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
											onChange={(e) => handleInput(e, index)}
										/>
									</TableCell>

									<TableCell>
										<Input
											type='date'
											name='date'
											variant='bordered'
											label='Purchase date'
											value={result.date}
											labelPlacement='outside'
											isRequired
											required
											onChange={(e) => handleInput(e, index)}
										/>
									</TableCell>

									<TableCell>
										<Select
											label='Category'
											name='paymentType'
											labelPlacement='outside'
											variant='bordered'
											className='w-32'
											value={result.paymentType}
											onChange={(e) => handleInput(e, index)}
											isRequired>
											{categoryOptions.map((option) => (
												<SelectItem
													key={option.value}
													value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</Select>
									</TableCell>

									<TableCell>
										<Input
											type='text'
											name='amount'
											variant='bordered'
											label='Amount'
											value={result.amount}
											labelPlacement='outside'
											isRequired
											required
											onChange={(e) => handleInput(e, index)}
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

					{currentFileURL ? (
						<div className='group flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 rounded-lg bg-gray-50 '>
							<Image
								onClick={onOpen}
								src={currentFileURL}
								alt='Preview'
								width={438}
								height={438}
								className='object-fit rounded-lg'
							/>

							<Input
								id='dropzone-file'
								type='file'
								accept='image/*'
								multiple
								onChange={handleFileChange}
								className='group-hover:visible invisible'
							/>
						</div>
					) : (
						<label
							htmlFor='dropzone-file'
							className='flex flex-col group drop-shadow-lg rounded-lg items-center justify-center w-full h-64 cursor-pointer bg-white  hover:bg-black duration-200'>
							<div className='flex flex-col items-center justify-center pt-5 pb-6'>
								<span
									className='material-symbols-outlined group-hover:text-white'
									style={{ fontSize: '120px' }}>
									cloud_upload
								</span>
								<p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
									<span className='font-semibold'>Click to upload</span>
								</p>

								<p className='mt-2 text-md text-blue-500'>{currentFileURL}</p>
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
					<div className='bg-white drop-shadow-lg rounded-lg'>
						<Textarea
							readOnly
							label='Scanned text'
							variant='bordered'
							classNames={{
								label: 'text-md',
								input: 'text-lg',
								inputWrapper: 'border-0 ',
							}}
							maxRows={15}
							className='col-span-3 h-fit w-full p-2'
							//value={currentIndex + 1}
							value={results[currentIndex]?.scannedtext ?? scannedResults}
						/>
					</div>
				</div>
			</div>

			<Modal
				isOpen={isOpen}
				size='4xl'
				radius='sm'
				onOpenChange={onOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalBody>
								<Image
									src={currentFileURL}
									alt='Preview'
									width={'100%'}
									height={'100%'}
									className='object-cover rounded-lg'
								/>
							</ModalBody>
						</>
					)}
				</ModalContent>
			</Modal>
		</Header>
	);
}
