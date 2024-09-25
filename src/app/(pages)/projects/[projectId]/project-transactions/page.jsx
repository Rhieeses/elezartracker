'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Pagelayout from '@/app/(pages)/projects/[projectId]/pageLayout';
import {
	Spinner,
	useDisclosure,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	User,
	Button,
	Tabs,
	Tab,
	Chip,
	Input,
	Select,
	SelectItem,
} from '@nextui-org/react';
import { ProjectDataId } from '@/backend/data/dataHooks';
import TransactionTable from '@/components/tables/transactionTable';
import { ContentBoxProject, IconTextBox } from '@/components/ui/uiComponent';
import {
	formatNumber,
	formatDate,
	formatNumberDecimal,
	removeFormatting,
} from '@/utils/inputFormatter';
import ReceivablesTableProject from '@/components/tables/receivableTableProject';
import { ReceivableDataProject } from '@/backend/data/dataHooks';

const statusColorMap = {
	'FULLY PAID': 'success',
	UNPAID: 'danger',
	'PARTIALLY PAID': 'warning',
};

export default function ProjectTransactions({ params }) {
	const projectId = params.projectId;
	const { project, loading, error, refetch } = ProjectDataId({ projectId });
	const [projectName, setProjectName] = useState('Projects');
	const [transactions, setTransactions] = useState([]);
	const [accounts, setAccounts] = useState([]);

	useEffect(() => {
		if (project && project.projectDetails) {
			setTransactions(project.transactions);
			setProjectName(project.projectDetails.project_name);
			setAccounts(project.projectAccounts);
		}
	}, [project]);

	const { receivableProject, refetchReceivableProject } = ReceivableDataProject({ projectId });

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

	const [loadingSubmit, setLoading] = useState(false);

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
					console.log(viewIdSales);
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
			refetchReceivableProject();
			setPaymentData(initialPaymentData);
			setViewIdSales(null);
		}
	};

	return (
		<Pagelayout projectId={projectId}>
			{loading ? (
				<div className='flex justify-center items-center h-screen'>
					<Spinner size='lg' />
				</div>
			) : error ? (
				<div className='flex justify-center items-center h-full'>
					<p>Error: {error.message}</p>
				</div>
			) : project ? (
				<div className='h-fit'>
					<div className='bg-white rounded-lg'>
						<div className='flex flex-col p-5'>
							<div className='grid grid-cols-3 gap-10 p-5'>
								<ContentBoxProject
									iconText='balance'
									labelText='Balance'
									strongText={formatNumberDecimal(
										accounts.contract_price - accounts.total_paid,
									)}
									descriptionText={`${formatNumber(
										accounts.contract_price,
									)} contract price`}
								/>
								<ContentBoxProject
									iconText='payment'
									labelText='Payments'
									strongText={formatNumber(accounts.total_paid)}
									descriptionText='12 payments made out of 14'
								/>
								<ContentBoxProject
									iconText='shopping_cart'
									labelText='Expenses'
									strongText={formatNumber(accounts.total_expenses)}
									descriptionText='Total expenses'
								/>
							</div>
							<Tabs
								variant='underlined'
								aria-label='Transaction tabs'>
								<Tab
									key='transactions'
									title='Transactions'>
									<TransactionTable transactions={transactions} />
								</Tab>
								<Tab
									key='outstanding'
									title='Payments'>
									<ReceivablesTableProject
										filterValue={filterValue}
										onSearchChange={onSearchChange}
										onRowSelect={modalPayment}
										receivable={receivableProject}
										onOpen={openAdditionals}
									/>
								</Tab>
							</Tabs>
						</div>
					</div>
				</div>
			) : null}

			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				placement='top-center'
				isDismissable={false}
				onClose={onClose}
				size='xl'>
				<form onSubmit={handleSubmit}>
					{invoice && invoice.length > 0
						? invoice.map((invoiceItem) => (
								<ModalContent key={invoiceItem.id}>
									{(onClose) => (
										<>
											<ModalHeader className='flex gap-1 mb-5'>
												<span className='material-symbols-outlined'>receipt</span>
												<p>Bill Details</p>
											</ModalHeader>
											<ModalBody>
												<div>
													<div className='grid grid-cols-3 gap-5 w-full'>
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

														<div className='flex justify-end col-span-1 text-white w-full gap-2 p-2'>
															<Button
																variant='solid'
																size='md'
																isIconOnly
																color='success'
																className='text-white'
																startContent={
																	<span className='material-symbols-outlined'>
																		download
																	</span>
																}></Button>
															<Button
																variant='solid'
																fullWidth
																size='md'
																isIconOnly
																color='primary'
																startContent={
																	<span className='material-symbols-outlined'>
																		mail
																	</span>
																}></Button>
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

														<div className='grid grid-cols-3 gap-5 col-span-3 border-b-[1px] p-5'>
															<IconTextBox
																iconText='description'
																labelText='DESCRIPTION'
																contentText={invoiceItem.description}
															/>

															<IconTextBox
																iconText='event'
																labelText='DUE DATE'
																contentText={formatDate(invoiceItem.due_date)}
															/>

															<IconTextBox
																iconText='account_balance_wallet'
																labelText='BILLED AMOUNT'
																contentText={formatNumberDecimal(
																	invoiceItem.billed_amount,
																)}
															/>
														</div>

														<div className='grid grid-cols-3 gap-5 col-span-3 p-5'>
															<IconTextBox
																iconText='paid'
																labelText='PAID AMOUNT'
																contentText={formatNumberDecimal(
																	invoiceItem.paid_amount,
																)}
															/>

															<IconTextBox
																iconText='balance'
																labelText='BALANCE'
																contentText={formatNumberDecimal(
																	invoiceItem.balance,
																)}
															/>

															<IconTextBox
																iconText='hourglass_bottom'
																labelText='DUE BY'
																contentText={formatDate(invoiceItem.due_date)}
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
														color='danger'
														variant='light'
														size='md'
														onClick={onClose}
														className='bg-gray-200'>
														Cancel
													</Button>
												) : (
													<>
														<Button
															color='danger'
															variant='light'
															size='md'
															onClick={onClose}
															className='bg-gray-200'>
															Cancel
														</Button>
														<Button
															color='primary'
															size='md'
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
		</Pagelayout>
	);
}
