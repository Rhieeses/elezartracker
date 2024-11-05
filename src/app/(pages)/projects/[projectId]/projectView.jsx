'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import HeaderProject from './headerProject';
import ProjectTransactions from './project-transactions/projectTransaction';
import { ContentBox, IconTextBox } from '@/components/ui/uiComponent';
import {
	Spinner,
	Progress,
	Table,
	TableRow,
	TableBody,
	TableColumn,
	TableHeader,
	TableCell,
	User,
	Tabs,
	Tab,
	useDisclosure,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Chip,
	Input,
	Select,
	SelectItem,
	Button,
} from '@nextui-org/react';
import {
	formatNumberDecimal,
	calculateDateDifference,
	formatDate,
	formatNumber,
} from '@/utils/inputFormatter';
import { ProjectDataId, TopVendorData, ReceivableDataProject } from '@/backend/data/dataHooks';
import ReceivablesTableProject from '@/components/tables/receivableTableProject';
import EditProject from './edit-project/editProject';

const statusColorMap = {
	'FULLY PAID': 'success',
	UNPAID: 'danger',
	'PARTIALLY PAID': 'warning',
};

export default function ProjectView({ id }) {
	const projectId = id.projectId;

	const { project, loading, error } = ProjectDataId({ projectId });
	const { receivableProject, refetchReceivableProject } = ReceivableDataProject({ projectId });
	const { topVendor } = TopVendorData({ projectId });

	const [selected, setSelected] = useState('overview');
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
					const response = await axios.get(`/api/invoice-details/${viewIdSales}`, {
						withCredentials: true,
					});
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

	if (loading) {
		return (
			<HeaderProject>
				<div className='flex justify-center items-center h-[50rem]'>
					<Spinner />
					<p>Loading Project data...</p>
				</div>
			</HeaderProject>
		);
	}

	if (error) {
		return (
			<HeaderProject>
				<div className='flex justify-center items-center h-[50rem]'>
					<h2>Error loading Project data</h2>
					<p>{error.message}</p>
				</div>
			</HeaderProject>
		);
	}

	return (
		<HeaderProject projectName={project.projectDetails.project_name}>
			<div className='grid grid-cols-2 lg:grid-cols-4 h-fit'>
				<Tabs
					aria-label='Options'
					selectedKey={selected}
					variant='underlined'
					className='col-span-4 border-b-1 p-5 pb-0'
					onSelectionChange={setSelected}>
					<Tab
						key='overview'
						title='Overview'
						className='w-full col-span-4 '>
						<div className='grid grid-cols-2 lg:grid-cols-4 gap-10 h-fit p-10'>
							<div className='flex items-center space-x-4 col-span-2 lg:col-span-4 p-5 h-full'>
								<span
									className='material-symbols-outlined'
									style={{ fontSize: '36px' }}>
									equalizer
								</span>
								<h1 className='font-bold tracking-wide text-3xl text-center'>Overview</h1>
							</div>
							<ContentBox
								iconText='payments'
								labelText='Balance'
								strongText={formatNumberDecimal(
									project.projectDetails.project_contractPrice -
										project.projectAccounts.total_paid,
								)}
								descriptionText={
									<Progress
										size='md'
										radius='none'
										classNames={{
											base: 'max-w-md',
											track: 'drop-shadow-md border border-default',
											indicator: 'bg-gradient-to-r from-yellow-500 to-green-500',
											label: 'tracking-wider font-medium text-default-600',
											value: 'text-foreground/60 text-end',
										}}
										label={`${formatNumberDecimal(
											project.projectAccounts.total_paid,
										)} / ${formatNumberDecimal(project.projectAccounts.contract_price)}`}
										value={Math.round(
											project.projectAccounts.total_paid /
												project.projectAccounts.contract_price,
										)}
										showValueLabel={true}
									/>
								}
							/>

							<ContentBox
								iconText='savings'
								labelText='Budget'
								strongText={formatNumberDecimal(
									project.projectAccounts.total_paid -
										project.projectAccounts.total_expenses,
								)}
								descriptionText={
									<Progress
										size='md'
										radius='none'
										classNames={{
											base: 'max-w-md',
											track: 'drop-shadow-md border border-default',
											indicator: 'bg-gradient-to-r from-yellow-500 to-green-500',
											label: 'tracking-wider font-medium text-default-600',
											value: 'text-foreground/60 text-end',
										}}
										label={`${formatNumberDecimal(
											project.projectAccounts.total_paid -
												project.projectAccounts.total_expenses,
										)} / ${formatNumberDecimal(
											project.projectAccounts.contract_price * 0.7,
										)}`}
										value={Math.round(
											((project.projectAccounts.total_paid -
												project.projectAccounts.total_expenses) /
												(project.projectAccounts.contract_price * 0.3)) *
												100,
										)}
										showValueLabel={true}
									/>
								}
							/>

							<ContentBox
								iconText='payments'
								labelText='Payments'
								strongText={formatNumberDecimal(project.projectAccounts.total_paid)}
								descriptionText={
									<Progress
										size='md'
										radius='none'
										classNames={{
											base: 'max-w-md',
											track: 'drop-shadow-md border border-default',
											indicator: 'bg-gradient-to-r from-yellow-500 to-green-500',
											label: 'tracking-wider font-medium text-default-600',
											value: 'text-foreground/60 text-end',
										}}
										label={`${formatNumberDecimal(
											project.projectAccounts.contract_price -
												project.projectAccounts.total_paid,
										)} / ${formatNumberDecimal(project.projectAccounts.contract_price)}`}
										value={Math.round(
											project.projectAccounts.total_paid /
												project.projectAccounts.contract_price,
										)}
										showValueLabel={true}
									/>
								}
							/>

							<ContentBox
								iconText='payments'
								labelText='Expenses'
								strongText={formatNumberDecimal(project.projectAccounts.total_expenses)}
								descriptionText={
									<Progress
										size='md'
										radius='none'
										classNames={{
											base: 'max-w-md',
											track: 'drop-shadow-md border border-default',
											indicator: 'bg-gradient-to-r from-yellow-500 to-green-500',
											label: 'tracking-wider font-medium text-default-600',
											value: 'text-foreground/60 text-end',
										}}
										label={`${formatNumberDecimal(
											project.projectAccounts.total_expenses,
										)} / ${formatNumberDecimal(
											project.projectAccounts.contract_price * 0.7 -
												project.projectAccounts.total_expenses,
										)}`} //'$850,000.00 / $1,500,000.00 expended'
										value={Math.round(
											(project.projectAccounts.total_expenses /
												(project.projectAccounts.contract_price * 0.7)) *
												100,
										)}
										showValueLabel={true}
									/>
								}
							/>

							<div className='col-span-2 lg:col-span-2 grid grid-cols-2 p-2 border-1 rounded-2xl shadow-sm p-8'>
								<div className='space-x-5'>
									<span>
										<p className='font-bold text-xs'>CONTRACT PRICE</p>
										<h1>{formatNumberDecimal(project.projectAccounts.contract_price)}</h1>
									</span>
									<span>
										<p className='font-bold text-xs'>DOWNPAYMENT</p>
										<h1>{project.projectDetails.downpayment}%</h1>
									</span>
									<span>
										<p className='font-bold text-xs'>CLIENT</p>
										<h1 className='text-blue-500 cursor-pointer'>
											{project.projectDetails.client_firstName}{' '}
											{project.projectDetails.client_lastName}
										</h1>
									</span>
								</div>
								<div className='space-x-5'>
									<span>
										<p className='font-bold text-xs'>ADDRESS</p>
										<h1>{project.projectDetails.project_address}</h1>
									</span>
									<span>
										<p className='font-bold text-xs'>DURATION</p>
										<h1>
											{calculateDateDifference(
												project.projectDetails.project_startDate,
												project.projectDetails.project_endDate,
											)}
										</h1>
										<p>
											{formatDate(project.projectDetails.project_startDate)} -{' '}
											{formatDate(project.projectDetails.project_endDate)}
										</p>
									</span>
								</div>
								<div className='col-span-2 mt-5'>
									<span>
										<p className='font-bold text-xs'>DESCRIPTION</p>
										<p>{project.projectDetails.project_description}</p>
									</span>
								</div>
							</div>

							<div className='col-span-2 row-span-2'>
								<img
									src={project.projectDetails.project_projectPicture}
									alt=''
									className='w-full h-full object-cover object-center'
								/>
							</div>

							<div className='col-span-2'>
								<h1 className='p-5 pl-0'>Top vendors</h1>
								<Table
									removeWrapper
									aria-label='table'
									classNames={{ th: 'bg-black text-white', td: 'border-b-1' }}
									className='p-2 w-full rounded-none'>
									<TableHeader>
										<TableColumn>No</TableColumn>
										<TableColumn>Vendor</TableColumn>
										<TableColumn>Total order</TableColumn>
										<TableColumn>Total amount</TableColumn>
									</TableHeader>
									<TableBody emptyContent={'No vendor found'}>
										{topVendor.map((vendorItem, index) => (
											<TableRow key={index}>
												<TableCell>{index + 1}</TableCell>
												<TableCell>
													<User
														avatarProps={{
															radius: 'lg',
															src: vendorItem?.vendor_picture,
														}}
														name={vendorItem?.vendor_name}
														description={vendorItem?.vendor_services}
													/>
												</TableCell>
												<TableCell>{vendorItem?.total_expenses}</TableCell>
												<TableCell>
													{formatNumberDecimal(vendorItem?.total_purchase_amount)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</div>
					</Tab>

					<Tab
						key='transaction'
						title='Cash flow'
						className='w-full col-span-4'>
						<ProjectTransactions projectId={projectId} />
					</Tab>

					<Tab
						key='outstanding'
						title='Outstanding'
						className='w-full col-span-4'>
						<ReceivablesTableProject
							filterValue={filterValue}
							onSearchChange={onSearchChange}
							onRowSelect={modalPayment}
							receivable={receivableProject}
							onOpen={openAdditionals}
						/>
					</Tab>

					<Tab
						key='settings'
						title='Settings'
						className='w-full col-span-4'>
						<EditProject projectId={projectId} />
					</Tab>
				</Tabs>
			</div>

			<Modal
				isOpen={isOpen}
				radius='sm'
				onOpenChange={onOpenChange}
				placement='top'
				onClose={onClose}
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
																contentText={formatNumberDecimal(
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
																			{formatNumberDecimal(
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
									)}
								</ModalContent>
						  ))
						: null}
				</form>
			</Modal>
		</HeaderProject>
	);
}
