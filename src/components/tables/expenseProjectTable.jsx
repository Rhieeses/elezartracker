'use client';

import axios from 'axios';
import React from 'react';
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Button,
	DropdownTrigger,
	Dropdown,
	DropdownMenu,
	DropdownItem,
	User,
	Pagination,
	Tooltip,
	Select,
	SelectItem,
	Input,
	Avatar,
	Textarea,
} from '@nextui-org/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
	capitalizeOnlyFirstLetter,
	formatNumber,
	formatDate,
	allCapitalize,
	removeFormatting,
	formatNumberDecimal,
} from '@/utils/inputFormatter';
import { columnProjectExpense, paymentOptions } from '@/backend/data/dataHooks';
import { Search } from '@/components/ui/search';
import { ExpenseProjectView } from '@/backend/data/dataHooks';
import { useRouter } from 'next/navigation';

export default function ExpenseProjectTable({
	filterValue,
	onSearchChange,
	onRowSelect,
	onRowDelete,
	projectId,
	openScanModal,
	projectName,
}) {
	const { expenseProject, refetchExpenseProject } = ExpenseProjectView({
		projectId,
	});

	const router = useRouter();

	function formatDescription(description) {
		if (description) {
			return description.split('\n').map((line, index) => (
				<React.Fragment key={index}>
					{line}
					<br />
				</React.Fragment>
			));
		}
	}

	const [selectedKeys, setSelectedKeys] = useState(new Set([]));
	const [visibleColumns, setVisibleColumns] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [sortDescriptor, setSortDescriptor] = useState({
		column: 'age',
		direction: 'ascending',
	});
	const [page, setPage] = useState(1);

	const pages = Math.ceil(expenseProject.length / rowsPerPage);

	const hasSearchFilter = Boolean(filterValue);

	const headerColumns = useMemo(() => {
		if (visibleColumns === 'all') return columnProjectExpense;

		return columnProjectExpense.filter((column) =>
			Array.from(visibleColumns).includes(column.uid),
		);
	}, [visibleColumns]);

	const filteredItems = useMemo(() => {
		let filteredUsers = [...expenseProject];

		if (hasSearchFilter) {
			filteredUsers = filteredUsers.filter(
				(user) =>
					user.vendor_name.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.expense_description.toLowerCase().includes(filterValue.toLowerCase()),
			);
		}
		if (statusFilter !== 'all' && statusFilter.length !== paymentOptions.length) {
			filteredUsers = filteredUsers.filter((user) => statusFilter.includes(user.payment_type));
		}

		return filteredUsers;
	}, [expenseProject, filterValue, statusFilter, hasSearchFilter]);

	const items = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;

		return filteredItems.slice(start, end);
	}, [page, filteredItems, rowsPerPage]);

	const { purchase_amount } = useMemo(() => {
		return filteredItems.reduce(
			(acc, item) => {
				acc.purchase_amount += Number(item.purchase_amount) || 0; // Convert to number
				return acc;
			},
			{ purchase_amount: 0 },
		);
	}, [filteredItems]);

	const sortedItems = useMemo(() => {
		return [...items].sort((a, b) => {
			const first = a[sortDescriptor.column];
			const second = b[sortDescriptor.column];
			const cmp = first < second ? -1 : first > second ? 1 : 0;

			return sortDescriptor.direction === 'descending' ? -cmp : cmp;
		});
	}, [sortDescriptor, items]);

	const renderCell = (user, columnKey, index) => {
		if (!user) return null; // Safety check in case `user` is null or undefined

		const cellValue = user[columnKey];
		var rowNumber = (page - 1) * rowsPerPage + index + 1;

		switch (columnKey) {
			case 'no':
				return rowNumber;
			case 'vendor_name':
				return cellValue ? (
					<User
						avatarProps={{
							radius: 'full',
							size: 'sm',

							showFallback: true,
							src: user.vendor_picture,
						}}
						classNames={{
							description: 'text-default-500',
						}}
						name={cellValue}></User>
				) : (
					<p className='text-sm text-default-500'>No applicable vendor</p>
				);

			case 'expense_description':
				let count = (cellValue.match(/\n/g) || []).length;

				return count <= 3 ? (
					<div className='flex gap-2'>
						<span className='material-symbols-outlined'>receipt_long</span>
						<p className='text-blue-500'>{formatDescription(cellValue)}</p>
					</div>
				) : (
					<details className='cursor-pointer'>
						<summary className='flex gap-2'>
							<span className='material-symbols-outlined'>receipt_long</span>
							<p className='text-default-400'>Show more...</p>
							<span className='material-symbols-outlined'>arrow_drop_down</span>
						</summary>
						<p className='ml-5 text-blue-500'>{formatDescription(cellValue)}</p>
					</details>
				);

			case 'payment_type':
				return cellValue ? (
					cellValue
				) : (
					<em className='text-default-500 text-sm'>[See payables section.]</em>
				);

			case 'invoiceNo':
				return '#' + cellValue;
			case 'purchase_date':
				return (
					<div className='flex items-center gap-2'>
						<span className='material-symbols-outlined text-slate-500'>calendar_today</span>
						{formatDate(cellValue)}
					</div>
				);

			case 'purchase_amount':
				return formatNumberDecimal(cellValue);

			case 'actions':
				return (
					<div className='relative flex items-center gap-2 justify-center'>
						<Button
							isIconOnly
							color='primary'
							variant='flat'
							onPress={() => handleRowChange(user.id)}>
							<span className='material-symbols-outlined text-lg cursor-pointer active:opacity-50'>
								visibility
							</span>
						</Button>

						<Button
							isIconOnly
							color='danger'
							variant='flat'
							onPress={() => handleRowChangeDelete(user.id)}>
							<span className='material-symbols-outlined text-lg cursor-pointer active:opacity-50'>
								delete
							</span>
						</Button>
					</div>
				);
			default:
				return cellValue;
		}
	};

	const handleRowChange = useCallback(
		(row) => {
			onRowSelect(row);
		},
		[onRowSelect],
	);

	const handleRowChangeDelete = useCallback(
		(row) => {
			onRowDelete(row);
		},
		[onRowDelete],
	);

	const onNextPage = useCallback(() => {
		if (page < pages) {
			setPage(page + 1);
		}
	}, [page, pages]);

	const onPreviousPage = useCallback(() => {
		if (page > 1) {
			setPage(page - 1);
		}
	}, [page]);

	const onRowsPerPageChange = useCallback((e) => {
		setRowsPerPage(Number(e.target.value));
		setPage(1);
	}, []);

	useEffect(() => {
		setPage(1);
	}, [filterValue]);

	const topContent = useMemo(() => {
		return (
			<div className='flex flex-col gap-4'>
				<div className='flex justify-end gap-3 items-end'>
					<div className='flex gap-3 items-center'>
						<Button
							size='md'
							variant='solid'
							radius='sm'
							className='bg-black text-white'
							onClick={() => router.push(`/expense/${projectId}/scan-receipt`)}>
							Scan receipt
						</Button>
						<Dropdown>
							<DropdownTrigger className='hidden sm:flex'>
								<Button
									endContent={
										<span className='material-symbols-outlined'>keyboard_arrow_down</span>
									}
									size='md'
									color='default'
									className='font-semibold'
									disableRipple
									disableAnimations
									variant='bordered'
									radius='sm'>
									Type
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								disallowEmptySelection
								aria-label='Table Columns'
								closeOnSelect={false}
								selectedKeys={statusFilter}
								selectionMode='multiple'
								onSelectionChange={(selectedKeys) =>
									setStatusFilter(Array.from(selectedKeys))
								}>
								{paymentOptions.map((status) => (
									<DropdownItem
										key={status.uid}
										className='capitalize'>
										{capitalizeOnlyFirstLetter(status.name)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
						<Dropdown>
							<DropdownTrigger className='hidden sm:flex'>
								<Button
									endContent={
										<span className='material-symbols-outlined'>keyboard_arrow_down</span>
									}
									size='md'
									color='default'
									className='font-semibold'
									disableRipple
									disableAnimations
									variant='bordered'
									radius='sm'>
									Filters
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								disallowEmptySelection
								aria-label='Table Columns'
								closeOnSelect={false}
								selectedKeys={visibleColumns}
								selectionMode='multiple'
								onSelectionChange={setVisibleColumns}>
								{columnProjectExpense.map((column) => (
									<DropdownItem
										key={column.uid}
										className='capitalize'>
										{capitalizeOnlyFirstLetter(column.name)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
						<div className='flex items-center justify-end gap-2'>
							<div className='lg:w-[25rem] w-1/2'>
								<Search
									filterValue={filterValue}
									onSearchChange={onSearchChange}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}, [
		filterValue,
		statusFilter,
		visibleColumns,
		onSearchChange,
		onRowsPerPageChange,
		expenseProject.length,
		openScanModal,
		projectName,
	]);

	const bottomContent = useMemo(() => {
		return (
			<div>
				<div className='flex justify-center items-center py-4 space-x-1 '>
					<Pagination
						isCompact
						showControls
						showShadow
						color='primary'
						page={page}
						total={pages}
						onChange={setPage}
					/>
				</div>
				<div className='flex justify-end items-center'>
					<label className='flex items-center text-default-400 text-small'>
						Rows per page:
						<select
							className='bg-transparent outline-none text-default-400 text-small'
							onChange={onRowsPerPageChange}>
							<option value='10'>10</option>
							<option value='15'>15</option>
							<option value='20'>20</option>
						</select>
					</label>
				</div>
			</div>
		);
	}, [page, pages]);

	//add expense

	const initialFormData = {
		invoiceNo: '',
		vendor: null,
		other: '',
		vendorName: '',
		purchaseDate: '',
		description: '',
		purchaseAmount: '',
		paymentType: '',
		projectId: projectId,
	};

	let categoryOptions = [
		{ label: 'CASH', value: 'CASH' },
		{ label: 'BANK TRANSFER', value: 'BANK TRANSFER' },
		{ label: 'GCASH', value: 'GCASH' },
	];
	const [formData, setFormData] = useState(initialFormData);
	const [vendor, setVendor] = useState([]);
	const [isOther, setIsOthers] = useState(false);
	const [message, setMessage] = useState(false);
	const [loading, setLoading] = useState(false);

	const vendorWithOthers = [...vendor, { id: 333333, vendor_name: 'Others' }];

	const handleInput = (field) => (event) => {
		const value = event.target.value;

		setFormData((prev) => {
			const newFieldValue =
				field === 'purchaseAmount'
					? formatNumber(value.replace(/[^0-9.]/g, ''))
					: field === 'invoiceNo'
					? allCapitalize(
							typeof value === 'string' && value.startsWith('#') ? value : '#' + value,
					  )
					: capitalizeOnlyFirstLetter(value);

			const newVendorName =
				field === 'vendor'
					? vendorWithOthers.find((v) => v.id === Number(value))?.vendor_name || ''
					: prev.vendorName;

			return {
				...prev,
				[field]: newFieldValue,
				vendorName: newVendorName,
			};
		});

		if (field === 'vendor') {
			setIsOthers(value === '333333');
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const cleanedData = {
			...formData,
			purchaseAmount: removeFormatting(formData.purchaseAmount),
			invoiceNo: removeFormatting(formData.invoiceNo),
			vendorName: formData.vendorName === 'Others' ? formData.other : formData.vendorName,
		};

		try {
			await axios.post('/api/add-expense', cleanedData);
			setMessage({
				success: 'Expense added successfully!',
				error: '',
			});
			setFormData(initialFormData);
			refetchExpenseProject();
		} catch (error) {
			setMessage({
				success: '',
				error: 'Failed to add expense. Please try again.',
			});
			console.error('Error:', error);
		} finally {
			setFormData(initialFormData);
			setLoading(false);
		}
	};

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

	return (
		<>
			<div className='p-10 border-b-[1px] flex justify-between items-center'>
				<div className='flex items-center space-x-4'>
					<span
						className='material-symbols-outlined cursor-pointer'
						onClick={() => {
							router.back();
						}}>
						arrow_back_ios_new
					</span>

					<p className='text-4xl font-bold text-blue-800'>{projectName || 'Loading...'}</p>
				</div>
				{topContent}
			</div>
			<Table
				aria-label='Expense'
				removeWrapper
				bottomContent={bottomContent}
				bottomContentPlacement='outside'
				selectedKeys={selectedKeys}
				sortDescriptor={sortDescriptor}
				topContentPlacement='outside'
				onSelectionChange={setSelectedKeys}
				onSortChange={setSortDescriptor}
				classNames={{ th: 'bg-black text-white', td: 'border-b-1' }}
				className='p-2 w-full rounded-none'>
				<TableHeader columns={headerColumns}>
					{(column) => (
						<TableColumn
							key={column.uid}
							align={column.uid === 'actions' ? 'center' : 'start'}
							allowsSorting={column.sortable}>
							{column.name}
						</TableColumn>
					)}
				</TableHeader>

				<TableBody
					emptyContent={'No expense for this project is found'}
					items={sortedItems}>
					<TableRow key='form-row'>
						<TableCell colSpan={headerColumns.length}>
							<form
								onSubmit={handleSubmit}
								className='grid grid-cols-7 gap-4 space-x-10'>
								<Input
									type='text'
									label='Invoice'
									name='invoiceNo'
									variant='underlined'
									value={formData.invoiceNo}
									onChange={handleInput('invoiceNo')}
									placeholder='Enter your invoice no'
									isRequired
								/>
								<div className='flex flex-col '>
									<Select
										items={vendorWithOthers}
										value={formData.vendor}
										onChange={handleInput('vendor')}
										label='Select vendor'
										variant='underlined'
										placeholder='Select a vendor'
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
														<span className='text-small'>{vendor.vendor_name}</span>
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
										labelPlacement='inside'
										placeholder='Enter vendor name'
										variant='underlined'
										name='other'
										className={`${isOther ? '' : 'hidden'}`}
										value={formData.other}
										onChange={handleInput('other')}
									/>
								</div>

								<Textarea
									type='text'
									label='Description'
									name='description'
									onChange={handleInput('description')}
									value={formData.description}
									variant='underlined'
									placeholder='Enter description'
									isRequired
									minRows={0}
								/>
								<Input
									type='date'
									label='Purchase date'
									name='purchaseDate'
									value={formData.purchaseDate}
									onChange={handleInput('purchaseDate')}
									variant='underlined'
									isRequired
								/>
								<Select
									label='Category'
									name='paymentType'
									variant='underlined'
									value={formData.paymentType}
									onChange={handleInput('paymentType')}
									isRequired>
									{categoryOptions.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</Select>
								<Input
									type='text'
									label='Total amount'
									name='purchaseAmount'
									onChange={handleInput('purchaseAmount')}
									value={formData.purchaseAmount}
									variant='underlined'
									placeholder='Enter amount'
									isRequired
								/>
								<div className='flex justify-center'>
									<Button
										className='text-white w-fit bg-black tracking-wider'
										variant='bordered'
										size='lg'
										startContent={<span className='material-symbols-outlined'>add</span>}
										type='submit'
										radius='md'>
										Add
									</Button>
								</div>
							</form>
						</TableCell>
						<TableCell className='hidden'></TableCell>
						<TableCell className='hidden'></TableCell>
						<TableCell className='hidden'></TableCell>
						<TableCell className='hidden'></TableCell>
						<TableCell className='hidden'></TableCell>
						<TableCell className='hidden'></TableCell>
						<TableCell className='hidden'></TableCell>
					</TableRow>
					{sortedItems && sortedItems.length > 0
						? sortedItems.map((item, index) =>
								item ? (
									<TableRow key={item.id}>
										{(columnKey) => (
											<TableCell>{renderCell(item, columnKey, index)}</TableCell>
										)}
									</TableRow>
								) : null,
						  )
						: null}
				</TableBody>
			</Table>
		</>
	);
}
