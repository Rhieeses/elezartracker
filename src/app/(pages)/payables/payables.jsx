'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	User,
	Button,
	useDisclosure,
	Select,
	SelectItem,
	Input,
	Textarea,
	Avatar,
	Chip,
} from '@nextui-org/react';

import Layout from '@/components/ui/layout';
import { IconTextBox } from '@/components/ui/uiComponent';
import PayablesTable from './payablesTable';
import { PayablesData, ProjectData, statusColorMap } from '@/backend/data/dataHooks';
import ConfirmDelete from '@/components/ui/confirmDelete';
import {
	removeFormatting,
	allCapitalize,
	capitalizeOnlyFirstLetter,
	formatNumberDecimal,
	formatDate,
	formatNumber,
} from '@/utils/inputFormatter';

export default function PayablesContent() {
	const { payables, loading, refetch } = PayablesData();
	const { project } = ProjectData();
	const [vendor, setVendor] = useState([]);

	useEffect(() => {
		const fetchVendor = async () => {
			//setLoading(true);
			try {
				const response = await axios.get('/api/vendor-select');
				setVendor(response.data);
			} catch (error) {
				console.error('Error fetching vendor data:', error);
			} finally {
				//setLoading(false);
			}
		};

		fetchVendor();
	}, []);

	const vendorWithOthers = [...vendor, { id: 'others', vendor_name: 'Others' }];

	const [filterValue, setFilterValue] = useState('');
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const { isOpen: isConfirm, onOpen: openConfirm, onOpenChange: closeConfirm } = useDisclosure();
	const {
		isOpen: isAddtionalsOpen,
		onOpen: openAdditionals,
		onOpenChange: changeAdditionals,
	} = useDisclosure();

	const [invoice, setInvoice] = useState([]);
	const [viewId, setViewId] = useState(null);
	const [salesDelete, setSalesDelete] = useState(null);
	const [isDirect, setIsDirect] = useState(false);

	const initialFormData = {
		vendor: '',
		amount: '',
		projectId: null,
		invoiceDate: '',
		dueDate: '',
		description: '',
		invoiceNo: '',
		isDirect: false,
		vendorName: '',
	};

	const handleToggle = () => {
		setIsDirect((prev) => !prev); // Toggle isDirect in local state
		setFormData((prevFormData) => ({
			...prevFormData,
			isDirect: !isDirect, // Update isDirect in formData to keep them in sync
		}));
	};

	const [formData, setFormData] = useState(initialFormData);
	const [isOther, setIsOthers] = useState(false);
	const [loadingSubmit, setLoadingSubmit] = useState(false);

	const handleInputForm = (field) => (event) => {
		const { value } = event.target;

		setFormData((prev) => ({
			...prev,
			[field]:
				field === 'amount'
					? formatNumber(value.replace(/[^0-9.]/g, ''))
					: field === 'invoiceNo'
					? allCapitalize(value.startsWith('#') ? value : '#' + value)
					: capitalizeOnlyFirstLetter(value),
		}));

		if (field === 'vendor') {
			setIsOthers(value === 'others');
		}
	};

	const handleSubmitForm = async (event) => {
		event.preventDefault();

		setLoadingSubmit(true);
		const cleanedData = {
			...formData,
			amount: removeFormatting(formData.amount),
			invoiceNo: removeFormatting(formData.invoiceNo),
		};

		try {
			console.log(formData);
			//await axios.post('/api/add-payables', cleanedData);
			/**setMessage({
				success: 'Expense added successfully!',
				error: '',
			});*/
			setFormData(initialFormData);
		} catch (error) {
			/**setMessage({
				success: '',
				error: 'Failed to add expense. Please try again.',
			});*/
			console.error('Error:', error);
		} finally {
			changeAdditionals();
			refetch();
			setLoadingSubmit(false);
		}
	};

	const onSearchChange = useCallback((value) => {
		if (value) {
			setFilterValue(value);
		} else {
			setFilterValue('');
		}
	}, []);

	const modalPayment = (id) => {
		setViewId(id);
		onOpen();
	};

	const onClose = () => {
		onOpen(false);
		setViewId(null);
	};
	const handleDelete = (id) => {
		setSalesDelete(id);
		openConfirm(true);
	};

	const handleArchive = async (id) => {
		if (!id) {
			console.error('No payable ID provided for archiving');
			return;
		}
		try {
			await axios.patch(`/api/payable-archive/${id}`);
			refetch();
		} catch (error) {
			console.error('Error archiving payable:', error);
		}
	};

	const handleRowDelete = async () => {
		if (!salesDelete) {
			console.error('No payable ID provided for deletion');
			return;
		}
		try {
			await axios.delete(`/api/payable-delete/${salesDelete}`);
			refetch();
		} catch (error) {
			console.error('Error payable vendor:', error);
		}
	};

	//payments

	const initialPaymentData = {
		paymentAmount: '',
		paymentDate: '',
		paymentType: '',
		invoiceNo: '',
	};
	const [paymentData, setPaymentData] = useState(initialPaymentData);
	const [rawPaymentAmount, setRawPaymentAmount] = useState('');
	const [remainingAmount, setRemainingAmount] = useState(0);
	const [maxValue, setMaxValue] = useState(0);

	const onClosess = () => {
		onOpen(false);
		setPaymentData(initialPaymentData);
		setViewIdSales(null);
	};

	let categoryOptions = [
		{ label: 'BANK', value: 'BANK' },
		{ label: 'CASH', value: 'CASH' },
	];
	useEffect(() => {
		const fetchInvoiceData = async () => {
			if (viewId) {
				try {
					const response = await axios.get(`/api/payables-details/${viewId}`);
					setInvoice(response.data);
					if (response.data.length > 0) {
						const billedAmount = response.data[0].billed_amount;
						const initialRemainingAmount =
							billedAmount - parseFloat(paymentData.paymentAmount || 0);
						setRemainingAmount(initialRemainingAmount);
					}
				} catch (error) {
					console.error('API Error:', error.response ? error.response.data : error.message);
				}
			} else {
				setInvoice([]);
				setRawPaymentAmount(0);
			}
		};

		fetchInvoiceData();
	}, [viewId, paymentData.paymentAmount]);

	useEffect(() => {
		const balance = invoice.length > 0 ? invoice[0].balance : 0;
		const newRemainingAmount = balance - parseFloat(rawPaymentAmount || 0);
		setRemainingAmount(newRemainingAmount);
		setMaxValue(balance);
	}, [rawPaymentAmount, invoice]);

	const handleInputChange = (field) => (event) => {
		const { value } = event.target;

		if (field === 'paymentAmount') {
			const updatedRawPaymentAmount = value.replace(/[^0-9.]/g, '');
			setRawPaymentAmount(updatedRawPaymentAmount);
			const numericValue = parseFloat(updatedRawPaymentAmount);

			if (isNaN(numericValue) || numericValue <= maxValue) {
				console.log('balance: ', maxValue, numericValue);
				setPaymentData((prev) => ({
					...prev,
					[field]: formatNumber(numericValue),
				}));
			} else {
				setPaymentData((prev) => ({
					...prev,
					[field]: maxValue,
				}));
			}
		} else {
			setPaymentData((prev) => ({
				...prev,
				[field]: value,
			}));
		}
	};
	const handleSubmit = async (event) => {
		event.preventDefault();

		const payload = {
			projectId: invoice[0].project_id,
			invoiceId: invoice[0].id,
			vendor: invoice[0].vendor_id,
			vendorName: invoice[0].vendor_name,
			purchaseDate: paymentData.paymentDate,
			description: invoice[0].description,
			purchaseAmount: parseFloat(rawPaymentAmount),
			paymentType: paymentData.paymentType,
			invoiceNo: invoice[0].invoice_no,
		};

		try {
			console.log(payload);
			await axios.post('/api/payable-payment', payload);
			//setLoading(true);
		} catch (error) {
			console.error('Payment failed:', error.message);
			console.error(
				'Error details:',
				error.response ? error.response.data : 'No response from server',
			);
			//setLoading(false);
		} finally {
			//setLoading(false);
			refetch();
			setPaymentData(initialPaymentData);
			setViewId(null);
		}
	};

	return (
		<Layout>
			<div className='grid grid-cols-1 h-fit'>
				<PayablesTable
					filterValue={filterValue}
					onSearchChange={onSearchChange}
					onRowSelect={modalPayment}
					onRowDelete={handleDelete}
					onRowArchive={handleArchive}
					payables={payables}
					onOpen={openAdditionals}
				/>
			</div>
			<Modal
				isOpen={isOpen}
				size='lg'
				hideCloseButton
				aria-labelledby='sales details'
				aria-modal='true'
				role='dialog'
				onOpenChange={onOpenChange}>
				<form onSubmit={handleSubmit}>
					{invoice && invoice.length > 0
						? invoice.map((invoiceItem) => (
								<ModalContent key={invoiceItem.id}>
									<>
										<ModalHeader className='flex flex-col gap-1 mb-5'>
											<div className='flex'>
												<span className='material-symbols-outlined'>receipt</span>
												<p>Payable Details - #{invoiceItem.invoice_no}</p>
											</div>
										</ModalHeader>
										<ModalBody>
											<div>
												<div className='grid grid-cols-3 gap-5'>
													<div className='col-span-2'>
														<label className='block text-sm font-medium text-gray-700'>
															Balance
														</label>
														<span className='mt-1 text-xl font-bold'>
															{formatNumberDecimal(remainingAmount)}
														</span>
														<Chip
															color={statusColorMap[invoiceItem.status]}
															size='sm'
															variant='flat'>
															{invoiceItem.status}
														</Chip>
													</div>
													<div className='col-span-1'>
														<label className='block text-sm font-medium text-gray-700'>
															Due Date
														</label>
														<span className='mt-1 text-md font-bold'>
															{formatDate(invoiceItem.due_date)}
														</span>
													</div>

													<div className='flex border-[1px] col-span-3 p-5 rounded-md justify-between items-center'>
														<User
															name={invoiceItem.vendor_name}
															description={invoiceItem.vendor_services}
															isBordered
															className='font-bold'
															avatarProps={{
																src: invoiceItem.vendor_picture,
																style: {
																	width: '70px',
																	height: '70px',
																},
															}}
														/>

														<div className=''>
															<p className='self-center font-semibold'>
																{invoiceItem.project_name}
															</p>
															<p className='text-xs text-gray-400'>Project name</p>
														</div>
													</div>

													<div className='grid grid-cols-2 gap-5 col-span-3 p-5'>
														<div className='col-span-2'>
															<IconTextBox
																iconText='calendar_today'
																labelText='INVOICE DATE'
																contentText={formatDate(invoiceItem.invoice_date)}
															/>
														</div>

														<IconTextBox
															iconText='paid'
															labelText='PAID AMOUNT'
															contentText={formatNumber(invoiceItem.amount_paid)}
														/>
														<IconTextBox
															iconText='account_balance_wallet'
															labelText='BILLED AMOUNT'
															contentText={formatNumberDecimal(invoiceItem.amount)}
														/>
													</div>
												</div>

												{invoiceItem.status === 'FULLY PAID' ? (
													<>
														<div className='flex col-span-3 ml-5'>
															<div className='bg-slate-200 p-1 rounded-md h-[36px]'>
																<span className='material-symbols-outlined ml-1 text-slate-500'>
																	payment
																</span>
															</div>
															<div className='ml-3'>
																<p className='flex text-xs text-slate-500 items-start'>
																	EXCESS PAYMENT
																</p>
																<div className='flex'>
																	<p className='flex items-end'>
																		{formatNumber(
																			invoiceItem.paid_amount -
																				invoiceItem.billed_amount,
																		)}
																	</p>
																	<p className='ml-2 text-slate-500'>
																		FORWARDED TO THE NEXT BILLING
																	</p>
																</div>
															</div>
														</div>
													</>
												) : (
													<div className='grid grid-cols-2 gap-5 col-span-3 p-5'>
														<Input
															type='text'
															label='Payment amount'
															name='paymentAmount'
															value={paymentData.paymentAmount}
															onChange={handleInputChange('paymentAmount')}
															required
															isRequired
															size='sm'
															variant='bordered'
															placeholder='Enter Payment Amount'
															labelPlacement='outside'
															className='font-bold'
															startContent={
																<span className='material-symbols-outlined'>
																	payment
																</span>
															}
														/>

														<Input
															type='datetime-local'
															label='Payment date'
															name='paymentDate'
															value={paymentData.paymentDate}
															onChange={handleInputChange('paymentDate')}
															required
															isRequired
															size='sm'
															variant='bordered'
															placeholder='Enter Payment Amount'
															labelPlacement='outside'
															className='font-bold'
															startContent={
																<span className='material-symbols-outlined'>
																	event
																</span>
															}
														/>

														<div className='p-5'>
															<label className='block text-sm font-medium text-gray-700'>
																Remaining Balance
															</label>
															<p className='mt-1 text-xl font-bold text-red-600'>
																{formatNumberDecimal(invoiceItem.balance)}
															</p>
														</div>

														<div>
															<Select
																variant='bordered'
																label='Category'
																name='paymentType'
																required
																size='sm'
																value={paymentData.paymentType}
																onChange={handleInputChange('paymentType')}
																isRequired
																className='col-span-1'>
																{categoryOptions.map((option) => (
																	<SelectItem
																		key={option.value}
																		value={option.value}>
																		{option.label}
																	</SelectItem>
																))}
															</Select>
														</div>
													</div>
												)}
											</div>
										</ModalBody>

										<ModalFooter>
											{invoiceItem.status === 'PAID' ? (
												<Button
													color='none'
													variant='bordered'
													size='lg'
													onClick={onOpenChange}>
													Cancel
												</Button>
											) : (
												<>
													<Button
														color='none'
														variant='bordered'
														size='lg'
														onClick={onOpenChange}>
														Cancel
													</Button>
													<Button
														className='bg-black text-white'
														radius='sm'
														size='lg'
														type='submit'
														loading={loading}
														disabled={loading}>
														Confirm
													</Button>
												</>
											)}
										</ModalFooter>
									</>
								</ModalContent>
						  ))
						: null}
				</form>
			</Modal>

			<Modal
				isOpen={isAddtionalsOpen}
				isDismissable={false}
				onOpenChange={changeAdditionals}
				radius='sm'
				placement='top-center'
				size='2xl'>
				<form onSubmit={handleSubmitForm}>
					<ModalContent>
						{(onClose) => (
							<>
								<ModalHeader className='flex gap-1'>
									<span className='material-symbols-outlined'>tactic</span>
									<p>Create payable</p>
								</ModalHeader>
								<ModalBody>
									<div className='grid grid-cols-4 gap-5'>
										<Button
											size='md'
											color='default'
											onPress={handleToggle}
											className={`col-span-2 ${
												isDirect ? 'bg-black text-white' : 'font-bold'
											}`}
											disableRipple
											disableAnimations
											variant='bordered'
											radius='sm'>
											{isDirect ? 'Direct payable' : 'Indirect payable'}
										</Button>

										{isDirect && (
											<Select
												items={project}
												name='projectId'
												aria-label='projectSelect'
												description='Select a project for direct payables.'
												variant='bordered'
												placeholder='Select a project'
												labelPlacement='outside'
												className='w-full col-span-2'
												onChange={handleInputForm('projectId')}>
												{(project) => (
													<SelectItem
														key={project.id}
														value={project.id}
														textValue={project.project_name}>
														<div className='flex gap-2 items-center'>
															<Avatar
																alt={project.project_name}
																className='flex-shrink-0'
																size='sm'
																src={project.project_projectPicture}
															/>
															<div className='flex flex-col'>
																<span className='text-small'>
																	{project.project_name}
																</span>
																<span className='text-tiny text-default-400'>
																	{project.contract_price}
																</span>
															</div>
														</div>
													</SelectItem>
												)}
											</Select>
										)}
										<Select
											items={vendorWithOthers}
											value={formData.vendor}
											onChange={handleInputForm('vendor')}
											label='Select vendor'
											variant='bordered'
											labelPlacement='outside'
											className='col-start-1 col-end-3'
											renderValue={(items) => {
												return items.map((item) => (
													<div
														key={item.key}
														className='flex gap-2 items-center'>
														<Avatar
															alt={item.data.vendor_name}
															className='flex-shrink-0'
															size='sm'
															src={item.data.vendor_picture}
														/>
														<div className='flex flex-col'>
															<span>{item.data.vendor_name}</span>
															<span className='text-default-500 text-tiny'>
																{item.data.vendor_services}
															</span>
														</div>
													</div>
												));
											}}>
											{(vendor) => (
												<SelectItem
													key={vendor.id}
													value={vendor.id}
													textValue={vendor.vendor_name}>
													<div className='flex gap-2 items-center'>
														<Avatar
															alt={vendor.vendor_name}
															className='flex-shrink-0'
															size='sm'
															src={vendor.vendor_picture}
														/>
														<div className='flex flex-col'>
															<span className='text-small'>
																{vendor.vendor_name}
															</span>
															<span className='text-tiny text-default-400'>
																{vendor.vendor_services}
															</span>
														</div>
													</div>
												</SelectItem>
											)}
										</Select>

										<Input
											type='text'
											label='Vendor Name'
											labelPlacement='outside'
											variant='bordered'
											name='vendorName'
											className={`${isOther ? 'col-span-2' : 'hidden'}`}
											value={formData.vendorName}
											onChange={handleInputForm('vendorName')}
										/>

										<Input
											type='text'
											label='Invoice No'
											labelPlacement='outside'
											variant='bordered'
											name='invoiceNo'
											className='col-span-2'
											value={formData.invoiceNo}
											onChange={handleInputForm('invoiceNo')}
										/>

										<Input
											type='text'
											label='Amount'
											labelPlacement='inside'
											variant='bordered'
											name='amount'
											className='col-span-2'
											isRequired
											value={formData.amount}
											onChange={handleInputForm('amount')}
										/>

										<Input
											type='date'
											label='Invoice Date'
											name='invoiceDate'
											variant='bordered'
											className='col-span-2'
											isRequired
											value={formData.invoiceDate}
											onChange={handleInputForm('invoiceDate')}
										/>

										<Input
											type='date'
											label='Due Date'
											name='dueDate'
											variant='bordered'
											className='col-span-2'
											isRequired
											value={formData.dueDate}
											onChange={handleInputForm('dueDate')}
										/>

										<Textarea
											variant='bordered'
											name='description'
											label='Description'
											labelPlacement='outside'
											placeholder='Enter your description'
											className='col-span-4'
											value={formData.description}
											onChange={handleInputForm('description')}
										/>
									</div>
								</ModalBody>
								<ModalFooter>
									<Button
										color='none'
										variant='bordered'
										size='lg'
										onClick={onClose}>
										Cancel
									</Button>

									<Button
										className='bg-black text-white'
										radius='sm'
										isLoading={loadingSubmit}
										size='lg'
										type='submit'>
										Create
									</Button>
								</ModalFooter>
							</>
						)}
					</ModalContent>
				</form>
			</Modal>

			<ConfirmDelete
				isOpen={isConfirm}
				onOpenChange={closeConfirm}
				confirmCallback={handleRowDelete}
			/>
		</Layout>
	);
}
