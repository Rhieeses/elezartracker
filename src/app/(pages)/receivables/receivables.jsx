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
	Select,
	SelectItem,
	Input,
	Chip,
	Textarea,
	Avatar,
	useDisclosure,
} from '@nextui-org/react';

import Layout from '@/components/ui/layout';
import {
	formatDate,
	formatNumber,
	formatNumberDecimal,
	capitalizeOnlyFirstLetter,
} from '@/utils/inputFormatter';
import { IconTextBox } from '@/components/ui/uiComponent';
import ReceivablesTable from '@/components/tables/receivableTable';
import { ReceivableData, ProjectData } from '@/backend/data/dataHooks';

const statusColorMap = {
	'FULLY PAID': 'success',
	UNPAID: 'danger',
	'PARTIALLY PAID': 'warning',
};

export default function ReceivablesContent() {
	const { receivable, refetch } = ReceivableData();
	const { project } = ProjectData();

	const [filterValue, setFilterValue] = useState('');

	const onSearchChange = useCallback((value) => {
		if (value) {
			setFilterValue(value);
		} else {
			setFilterValue('');
		}
	}, []);
	const initialPaymentData = {
		paymentAmount: '',
		paymentDate: '',
		paymentType: '',
	};

	let categoryOptions = [
		{ label: 'BANK', value: 'BANK' },
		{ label: 'CASH', value: 'CASH' },
	];

	const [loading, setLoading] = useState(false);

	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const {
		isOpen: isAddtionalsOpen,
		onOpen: openAdditionals,
		onOpenChange: changeAdditionals,
	} = useDisclosure();

	const [invoice, setInvoice] = useState([]);
	const [viewIdSales, setViewIdSales] = useState(null);
	const [paymentData, setPaymentData] = useState(initialPaymentData);
	const [rawPaymentAmount, setRawPaymentAmount] = useState('');
	const [remainingAmount, setRemainingAmount] = useState(0);
	const [maxValue, setMaxValue] = useState(0);

	const modalPayment = (id) => {
		setViewIdSales(id);
		onOpen();
	};

	const onClose = () => {
		onOpen(false);
		setPaymentData(initialPaymentData);
		setViewIdSales(null);
	};

	useEffect(() => {
		const fetchInvoiceData = async () => {
			if (viewIdSales) {
				try {
					const response = await axios.get(`/api/invoice-details/${viewIdSales}`);
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
	}, [viewIdSales, paymentData.paymentAmount]);

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
				setPaymentData((prev) => ({
					...prev,
					[field]: formatNumber(numericValue),
				}));
			} else {
				setPaymentData((prev) => ({
					...prev,
					[field]: formatNumber(maxValue),
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
			invoiceId: invoice[0].id,
			projectId: invoice[0].project_id,
			invoiceNo: invoice[0].invoice_no,
			clientId: invoice[0].client_id,
			description: invoice[0].description,
			paymentAmount: parseFloat(rawPaymentAmount),
			paymentDate: paymentData.paymentDate,
			paymentType: paymentData.paymentType,
		};

		try {
			await axios.post('/api/sales-payment', payload);
			setLoading(true);
		} catch (error) {
			console.error('Payment failed:', error.message);
			console.error(
				'Error details:',
				error.response ? error.response.data : 'No response from server',
			);
			setLoading(false);
		} finally {
			setLoading(false);
			refetch();
			setPaymentData(initialPaymentData);
			setViewIdSales(null);
		}
	};

	const initialFormData = {
		projectId: '',
		dueDate: '',
		description: '',
		amount: '',
	};

	const [formData, setFormData] = useState(initialFormData);

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
	};

	const handleSubmitForm = async (event) => {
		event.preventDefault();

		const cleanedData = {
			...formData,
			amount: removeFormatting(formData.amount),
		};

		try {
			await axios.post('/api/add-sales', cleanedData);
			setMessage({
				success: 'Expense added successfully!',
				error: '',
			});
			setFormData(initialFormData);
		} catch (error) {
			setMessage({
				success: '',
				error: 'Failed to add expense. Please try again.',
			});
			console.error('Error:', error);
		} finally {
			refetch();
			setLoading(false);
		}
	};
	return (
		<Layout>
			<div className='grid grid-cols-1 h-fit'>
				<ReceivablesTable
					filterValue={filterValue}
					onSearchChange={onSearchChange}
					onRowSelect={modalPayment}
					receivable={receivable}
					onOpen={openAdditionals}
				/>
			</div>
			<div className='flex justify-end items-stretch'>
				<Modal
					isOpen={isOpen}
					onOpenChange={onOpenChange}
					radius='sm'
					placement='right'
					isDismissable={false}
					size='xl'>
					<form onSubmit={handleSubmit}>
						{invoice && invoice.length > 0
							? invoice.map((invoiceItem) => (
									<ModalContent key={invoiceItem.id}>
										{(onClose) => (
											<>
												<ModalHeader className='flex flex-col gap-1 mb-5'>
													<div className='flex'>
														<span className='material-symbols-outlined'>receipt</span>
														<p>Bill Details - #{invoiceItem.invoice_no}</p>
													</div>

													<h1 className='text-center'>{invoiceItem.description}</h1>
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
																	name={`${invoiceItem.client_firstName} ${invoiceItem.client_lastName}`}
																	description='Client'
																	isBordered
																	className='font-bold'
																	avatarProps={{
																		src: invoiceItem.client_profilePicture,
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
																	<p className='text-xs text-gray-400'>
																		Project name
																	</p>
																</div>
															</div>

															<div className='grid grid-cols-2 gap-5 col-span-3 p-5'>
																<IconTextBox
																	iconText='paid'
																	labelText='PAID AMOUNT'
																	contentText={formatNumber(
																		invoiceItem.paid_amount,
																	)}
																/>
																<IconTextBox
																	iconText='account_balance_wallet'
																	labelText='BILLED AMOUNT'
																	contentText={formatNumberDecimal(
																		invoiceItem.billed_amount,
																	)}
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
													{invoiceItem.status === 'FULLY PAID' ? (
														<Button
															color='none'
															variant='bordered'
															size='lg'
															onClick={onClose}>
															Cancel
														</Button>
													) : (
														<>
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
										)}
									</ModalContent>
							  ))
							: null}
					</form>
				</Modal>
			</div>

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
								<ModalHeader className='flex gap-1 mb-5'>
									<span className='material-symbols-outlined'>tactic</span>
									<p>Create additionals</p>
								</ModalHeader>
								<ModalBody>
									<div className='grid grid-cols-4 gap-5'>
										<Select
											items={project}
											name='projectId'
											label='Select project'
											variant='bordered'
											placeholder='Select a project'
											labelPlacement='outside'
											isRequired
											className='w-full col-span-4'
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

										<Input
											type='text'
											label='Amount'
											variant='bordered'
											name='amount'
											className='col-span-2'
											isRequired
											value={formData.amount}
											onChange={handleInputForm('amount')}
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
		</Layout>
	);
}
