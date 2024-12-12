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
	Chip,
	Image,
} from '@nextui-org/react';
import axios from 'axios';

import Layout from '@/components/ui/layout';
import {
	formatDate,
	formatNumber,
	capitalizeOnlyFirstLetter,
	formatNumberDecimal,
	removeFormatting,
	allCapitalize,
} from '@/utils/inputFormatter';
import { IconTextBox } from '@/components/ui/uiComponent';
import ExpenseTable from '@/components/tables/expenseTable';
import {
	ExpenseData,
	ExpenseDataInvoice,
	ProjectData,
	statusColorMap,
} from '@/backend/data/dataHooks';
import ConfirmDelete from '@/components/ui/confirmDelete';

let categoryOptions = [
	{ label: 'CASH', value: 'CASH' },
	{ label: 'BANK TRANSFER', value: 'BANK TRANSFER' },
	{ label: 'GCASH', value: 'GCASH' },
];

export default function ExpenseContent() {
	const [viewIdExpense, setViewIdExpense] = useState(null);
	const { expense, refetch } = ExpenseData();
	const { invoiceExpense, loading } = ExpenseDataInvoice({ viewIdExpense });
	const { project } = ProjectData();
	const [searchTerm, setSearchTerm] = useState('');
	const [filterValue, setFilterValue] = useState('');
	const [expenseDelete, seteExpenseDelete] = useState(null);
	const [selected, setSelected] = useState('direct');
	const [isEditNo, setIsEdit] = useState(null);

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
	const { isOpen: isEdit, onOpen: openEdit, onOpenChange: changeEdit } = useDisclosure();

	const {
		isOpen: isOpenCreate,
		onOpen: onOpenCreate,
		onOpenChange: onOpenChangeCreate,
	} = useDisclosure();

	const { isOpen: isConfirm, onOpen: openConfirm, onOpenChange: closeConfirm } = useDisclosure();

	const {
		isOpen: isOpenPreview,
		onOpen: onOpenPreview,
		onOpenChange: onOpenChangePreview,
	} = useDisclosure();

	const onClose = () => {
		onOpenChange(false);
		setViewIdExpense(null);
	};

	const modalPayment = (id) => {
		setViewIdExpense(id);
		onOpen();
	};

	const modalEdit = (id) => {
		setViewIdExpense(id);
		setIsEdit(id);
		openEdit();
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
				const response = await axios.get('/api/vendor-select', {
					withCredentials: true,
				});
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
			//console.log(formData);
			await axios.post('/api/add-expenseindirect', cleanedData);
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
			onOpenChangeCreate();
			refetch();
			setLoadingSubmit(false);
		}
	};

	//edit

	const [editForm, setEditForm] = useState({
		vendor: '',
		amount: '',
		projectId: null,
		invoiceDate: '',
		description: '',
		invoiceNo: '',
		isDirect: false,
		vendorName: '',
		projectName: '',
	});

	const removeTimeFromDate = (date) => {
		if (!date) return null; // Handle null or undefined date
		const newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to zero
		return newDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
	};

	useEffect(() => {
		if (invoiceExpense && invoiceExpense.length > 0) {
			setEditForm({
				vendor: invoiceExpense[0].vendor_id,
				amount: invoiceExpense[0].purchase_amount,
				projectId: invoiceExpense[0].project_id,
				invoiceDate: removeTimeFromDate(invoiceExpense[0].purchase_date),
				description: invoiceExpense[0].expense_description,
				invoiceNo: invoiceExpense[0].invoiceNo,
				isDirect: invoiceExpense[0].direct_expense,
				vendorName: invoiceExpense[0].vendor_name,
				projectName: invoiceExpense[0].project_name,
			});
		}
	}, [invoiceExpense]);

	const handleInputEdit = (field) => (event) => {
		const { value } = event.target;

		setEditForm((prev) => ({
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

	const handleEdit = async (event) => {
		event.preventDefault();
		const cleanedData = {
			...editForm,
			amount: removeFormatting(editForm.amount),
			invoiceNo: removeFormatting(editForm.invoiceNo),
		};

		try {
			//console.log(cleanedData);
			await axios.put(`/api/edit-expense/${isEditNo}`, cleanedData);

			setFormData(initialFormData);
		} catch (error) {
			console.error('Error:', error);
		} finally {
			changeEdit();
			refetch();
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
					onRowEdit={modalEdit}
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
									<ModalHeader className='flex items-center gap-1'>
										<div className='flex gap-1 items-center'>
											<span className='material-symbols-outlined text-red-400'>
												Receipt
											</span>
											Expenses Invoice
										</div>
										<Chip
											color={statusColorMap[invoiceItem.status]}
											size='sm'
											variant='flat'>
											{invoiceItem.status}
										</Chip>

										<Chip
											color='primary'
											size='sm'
											variant='flat'>
											{invoiceItem.direct_expense ? 'DIRECT' : 'INDIRECT'}
										</Chip>
									</ModalHeader>
									<ModalBody>
										{loading ? (
											<Spinner />
										) : (
											<div className='grid grid-cols-2 gap-5 w-full'>
												{invoiceItem.ref_receipt ? (
													<div className='col-span-2'>
														<p className='text-default-500 text-sm'>Receipt ref. :</p>
														<p
															className='text-blue-500'
															onClick={onOpenPreview}>
															{invoiceItem.ref_receipt}
														</p>
													</div>
												) : null}

												<div className='flex border-[1px] col-span-3 p-5 rounded-md justify-between items-center'>
													<User
														name={invoiceItem.vendor_name}
														description='Client'
														isBordered
														className='font-bold'
														avatarProps={{
															showFallback: true,
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
														contentText={
															invoiceItem.payment_type
																? invoiceItem.payment_type
																: 'N/A'
														}
													/>

													<IconTextBox
														iconText='event'
														labelText='PURCHASE DATE'
														contentText={formatDate(invoiceItem.purchase_date)}
													/>

													<IconTextBox
														iconText='paid'
														labelText='PURCHASE AMOUNT'
														contentText={formatNumberDecimal(
															invoiceItem.purchase_amount,
														)}
													/>
													<IconTextBox
														iconText='balance'
														labelText='BALANCE'
														contentText={formatNumberDecimal(invoiceItem.balance)}
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

												<Modal
													isOpen={isOpenPreview}
													size='4xl'
													radius='sm'
													onOpenChange={onOpenChangePreview}>
													<ModalContent>
														<>
															<ModalBody>
																<Image
																	src={invoiceItem.ref_receipt}
																	alt='Preview'
																	width={'100%'}
																	height={'100%'}
																	className='object-cover rounded-lg'
																/>
															</ModalBody>
														</>
													</ModalContent>
												</Modal>
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
						<form
							onSubmit={handleSubmitForm}
							className='space-y-5'>
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
																		showFallback: true,
																		src:
																			projectItem.project_projectPicture &&
																			projectItem.project_projectPicture !==
																				'null'
																				? projectItem.project_projectPicture
																				: '/default_picture.png',
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
										type='submit'
										className='bg-black text-white'
										variant='bordered'
										size='lg'>
										Submit
									</Button>
								) : null}
							</ModalFooter>
						</form>
					)}
				</ModalContent>
			</Modal>

			<Modal
				isOpen={isEdit}
				size='lg'
				hideCloseButton
				aria-labelledby='sales details'
				aria-modal='true'
				role='dialog'
				onOpenChange={openEdit}>
				<form onSubmit={handleEdit}>
					{invoiceExpense && invoiceExpense.length > 0
						? invoiceExpense.map((invoiceItem) => (
								<ModalContent key={invoiceItem.id}>
									<>
										<ModalHeader className='flex justify-between gap-1 mb-5'>
											<div className='flex'>
												<span className='material-symbols-outlined'>receipt</span>
												<p>Edit expense - #{invoiceItem.invoiceNo} </p>
											</div>
											<Chip
												color={statusColorMap[invoiceItem.status]}
												size='sm'
												variant='flat'>
												{invoiceItem.status}
											</Chip>
										</ModalHeader>
										<ModalBody>
											{invoiceItem.status !== 'PAID' &&
											invoiceItem.status !== 'FULLY PAID' ? (
												<h1 className='text-default-500 text-lg'>
													This is an on going payable edit it in the payable section.
												</h1>
											) : (
												<div className='space-y-5'>
													<Button
														size='md'
														color='default'
														onPress={() =>
															setEditForm((prev) => ({
																...prev,
																isDirect: !prev.isDirect,
															}))
														}
														className={`col-span-2 ${
															editForm.isDirect ? 'bg-black text-white' : 'font-bold'
														}`}
														disableRipple
														disableAnimations
														variant='bordered'
														radius='sm'>
														{editForm.isDirect
															? 'Direct expense'
															: 'Indirect expense'}
													</Button>

													{editForm.isDirect && editForm.projectId && (
														<Select
															items={project}
															name='projectId'
															aria-label='projectSelect'
															description='Select a project for direct payables.'
															variant='bordered'
															labelPlacement='outside'
															placeholder={editForm.projectName}
															defaultValue={editForm.projectId}
															onChange={handleInputEdit('projectId')}
															className='w-full col-span-2'>
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
														value={editForm.vendor}
														defaultValue={editForm.vendor}
														placeholder={editForm.vendorName}
														onChange={handleInputEdit('vendor')}
														label='Select vendor'
														variant='bordered'
														labelPlacement='inside'
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
														value={editForm.vendorName}
														onChange={handleInputEdit('vendorName')}
													/>

													<Input
														type='text'
														label='Invoice No'
														labelPlacement='inside'
														variant='bordered'
														name='invoiceNo'
														className='col-span-2'
														value={editForm.invoiceNo}
														onChange={handleInputEdit('invoiceNo')}
													/>

													<Input
														type='text'
														label='Amount'
														labelPlacement='inside'
														variant='bordered'
														name='amount'
														className='col-span-2'
														isRequired
														value={editForm.amount}
														onChange={handleInputEdit('amount')}
													/>

													<Input
														type='date'
														label='Invoice Date'
														name='invoiceDate'
														variant='bordered'
														className='col-span-2'
														isRequired
														value={editForm.invoiceDate}
														onChange={handleInputEdit('invoiceDate')}
													/>

													<Textarea
														variant='bordered'
														name='description'
														label='Description'
														labelPlacement='outside'
														placeholder='Enter your description'
														className='col-span-4'
														value={editForm.description}
														onChange={handleInputEdit('description')}
													/>
												</div>
											)}
										</ModalBody>

										<ModalFooter>
											<Button
												color='none'
												variant='bordered'
												size='lg'
												onClick={changeEdit}>
												Cancel
											</Button>
											{invoiceItem.status !== 'PAID' ? null : (
												<Button
													className='bg-black text-white'
													radius='sm'
													size='lg'
													type='submit'
													loading={loading}
													disabled={loading}>
													Edit
												</Button>
											)}
										</ModalFooter>
									</>
								</ModalContent>
						  ))
						: null}
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
