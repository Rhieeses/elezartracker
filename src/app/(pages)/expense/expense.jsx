'use client';
import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	User,
	Button,
	useDisclosure,
	Input,
	Textarea,
	Divider,
	Link,
	Spinner,
	Tabs,
	Tab,
	Select,
	SelectItem,
	Avatar,
} from '@nextui-org/react';
import axios from 'axios';

import Layout from '@/components/ui/layout';
import { formatDate, formatNumber, capitalizeOnlyFirstLetter } from '@/utils/inputFormatter';
import { IconTextBox } from '@/components/ui/uiComponent';
import ExpenseTable from '@/components/tables/expenseTable';
import { ExpenseData, ExpenseDataInvoice, ProjectData } from '@/backend/data/dataHooks';
import ConfirmDelete from '@/components/ui/confirmDelete';

export default function ExpenseContent() {
	const [viewIdExpense, setViewIdExpense] = useState(null);
	const { expense, refetch } = ExpenseData();
	const { invoiceExpense, loading } = ExpenseDataInvoice({ viewIdExpense });
	const { project } = ProjectData();
	const [searchTerm, setSearchTerm] = useState('');
	const [filterValue, setFilterValue] = useState('');
	const [expenseDelete, seteExpenseDelete] = useState(null);
	const [selected, setSelected] = useState('direct');

	const filteredProjects = project.filter(
		(projectItem) =>
			projectItem.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			projectItem.client_firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			projectItem.client_lastName.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const onSearchChange = useCallback((value) => {
		if (value) {
			setFilterValue(value);
		} else {
			setFilterValue('');
		}
	}, []);

	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const {
		isOpen: isOpenCreate,
		onOpen: onOpenCreate,
		onOpenChange: onOpenChangeCreate,
	} = useDisclosure();

	const { isOpen: isConfirm, onOpen: openConfirm, onOpenChange: closeConfirm } = useDisclosure();

	const onClose = () => {
		onOpenChange(false);
		setViewIdExpense(null);
	};

	const modalPayment = (id) => {
		setViewIdExpense(id);
		onOpen();
	};

	const handleArchive = async (id) => {
		if (!id) {
			console.error('No expense ID provided for deletion');
			return;
		}
		try {
			await axios.patch(`/api/expense-archive/${id}`);
			refetch();
		} catch (error) {
			console.error('Error deleting vendor:', error);
		}
	};

	const handleDelete = (id) => {
		seteExpenseDelete(id);
		openConfirm(true);
	};

	const handleRowDelete = async () => {
		if (!expenseDelete) {
			console.error('No expense ID provided for deletion');
			return;
		}
		try {
			await axios.delete(`/api/expense-delete/${expenseDelete}`);
			refetch();
		} catch (error) {
			console.error('Error deleting vendor:', error);
		}
	};

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

	const initialFormData = {
		vendor: '',
		amount: '',
		projectId: null,
		invoiceDate: '',
		description: '',
		invoiceNo: '',
		isDirect: false,
		vendorName: '',
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

	return (
		<Layout>
			<div className='grid grid-cols-1 h-fit'>
				<ExpenseTable
					filterValue={filterValue}
					onSearchChange={onSearchChange}
					onRowSelect={modalPayment}
					onRowDelete={handleDelete}
					expense={expense}
					onOpenCreate={onOpenCreate}
					onRowArchive={handleArchive}
				/>
			</div>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				placement='top'
				isDismissable={false}
				onClose={onClose}
				radius='sm'
				size='lg'
				aria-modal='true'
				role='dialog'
				aria-labelledby='dialog-title'>
				{invoiceExpense && invoiceExpense.length > 0 ? (
					invoiceExpense.map((invoiceItem) => (
						<ModalContent key={invoiceItem.id}>
							{(onClose) => (
								<>
									<ModalHeader className='flex gap-1'>
										<span className='material-symbols-outlined text-red-400'>
											Receipt
										</span>
										Expenses Invoice
									</ModalHeader>
									<ModalBody>
										{loading ? (
											<Spinner />
										) : (
											<div className='grid grid-cols-2 gap-5 w-full'>
												<div className='flex border-[1px] col-span-3 p-5 rounded-md justify-between items-center'>
													<User
														name={invoiceItem.vendor_name}
														description='Client'
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

													<div>
														<p className='self-center font-semibold'>
															{invoiceItem.project_name}
														</p>
														<p className='text-xs text-gray-400'>Project name</p>
													</div>
												</div>

												<div className='grid grid-cols-2 gap-5 col-span-3 border-b-[1px] p-5'>
													<IconTextBox
														iconText='paid'
														labelText='PAYMENT TYPE'
														contentText={invoiceItem.payment_type}
													/>

													<IconTextBox
														iconText='event'
														labelText='PURCHASE DATE'
														contentText={formatDate(invoiceItem.purchase_date)}
													/>
												</div>

												<div className='grid col-span-2 p-5'>
													<Textarea
														label={
															<div className='flex gap-1'>
																<span className='material-symbols-outlined'>
																	receipt_long
																</span>
																Details
															</div>
														}
														color='default'
														labelPlacement='outside'
														readOnly
														variant='bordered'
														value={invoiceItem.expense_description}
													/>
												</div>

												<div className='col-span-2 flex flex-col items-end'>
													<label className='block text-sm font-medium text-gray-700'>
														Total amount
													</label>
													<span className='mt-1 text-xl font-bold'>
														{formatNumber(invoiceItem.purchase_amount)}
													</span>
												</div>
											</div>
										)}
									</ModalBody>
									<ModalFooter>
										<Button
											color='none'
											variant='bordered'
											size='lg'
											onClick={onClose}>
											Cancel
										</Button>
									</ModalFooter>
								</>
							)}
						</ModalContent>
					))
				) : (
					<div className='flex w-full items-center'>
						<p>No details for this invoice :(.</p>
					</div>
				)}
			</Modal>

			<Modal
				backdrop='opaque'
				size='lg'
				placement='top'
				isOpen={isOpenCreate}
				onOpenChange={onOpenChangeCreate}
				onClose={onOpenChangeCreate}
				motionProps={{
					variants: {
						enter: {
							y: 0,
							opacity: 1,
							transition: {
								duration: 0.3,
								ease: 'easeOut',
							},
						},
						exit: {
							y: -20,
							opacity: 0,
							transition: {
								duration: 0.2,
								ease: 'easeIn',
							},
						},
					},
				}}>
				<ModalContent>
					{(onOpenChangeCreate) => (
						<>
							<ModalHeader className='flex flex-col gap-1 items-center'>
								<span
									className='material-symbols-outlined text-blue-400'
									style={{ fontSize: '64px' }}>
									Receipt
								</span>
								<p className='text-lg'>Add Expenses</p>
								<p className='text-slate-500 text-sm font-normal'>
									Add an expenses to your project
								</p>
							</ModalHeader>
							<ModalBody>
								<Tabs
									fullWidth
									size='md'
									aria-label='Tabs form'
									selectedKey={selected}
									onSelectionChange={setSelected}
									color='primary'
									classNames={{
										tabList: 'bg-default-100',
										cursor: 'bg-slate-900 ',
									}}>
									<Tab
										key='direct'
										title='Direct'>
										<>
											<div className='flex flex-col items-start w-full'>
												<Input
													type='search'
													name='search'
													size='md'
													variant='bordered'
													placeholder='Search project...'
													className='font-bold w-full'
													value={searchTerm}
													onChange={(e) => setSearchTerm(e.target.value)}
													startContent={
														<span className='material-symbols-outlined'>search</span>
													}
												/>
												<div className='w-full max-h-[550px] overflow-y-auto  no-scrollbar'>
													{filteredProjects && filteredProjects.length > 0 ? (
														filteredProjects.map((projectItem) => (
															<Link
																key={projectItem.id}
																className='flex flex-col mt-5'
																href={`/expense/${projectItem.id}`}>
																<User
																	name={projectItem.project_name}
																	isFocusable={true}
																	description={`${projectItem.client_firstName} ${projectItem.client_lastName}`}
																	className='flex justify-start w-full pl-1 pb-3 pt-3 text-lg hover:bg-default-200 cursor-pointer rounded-none'
																	avatarProps={{
																		src: projectItem.project_projectPicture,
																		size: 'lg',
																	}}
																/>
																<Divider />
															</Link>
														))
													) : (
														<div className='flex justify-center text-slate-400 w-full'>
															<p>No result</p>
														</div>
													)}
												</div>
											</div>
										</>
									</Tab>
									<Tab
										key='indirect'
										title='Indirect'>
										<div className='space-y-5'>
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
									</Tab>
								</Tabs>
							</ModalBody>
							<ModalFooter>
								<Button
									color='none'
									variant='bordered'
									size='lg'
									onPress={onOpenChangeCreate}>
									Cancel
								</Button>
								{selected === 'indirect' ? (
									<Button
										className='bg-black text-white'
										variant='bordered'
										size='lg'>
										Submit
									</Button>
								) : null}
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<ConfirmDelete
				isOpen={isConfirm}
				onOpenChange={closeConfirm}
				confirmCallback={handleRowDelete}
			/>
		</Layout>
	);
}
