'use client';

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
	Chip,
} from '@nextui-org/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { capitalizeOnlyFirstLetter, formatNumber, formatDate } from '@/utils/inputFormatter';
import { columnExpense, paymentOptions, statusColorMap } from '@/backend/data/dataHooks';
import { Search } from '@/components/ui/search';

export default function ExpenseTable({
	expense,
	filterValue,
	onSearchChange,
	onRowSelect,
	onRowArchive,
	onRowDelete,
	onRowEdit,
	onOpenCreate,
}) {
	function formatDescription(description) {
		return description.split('\n').map((line, index) => (
			<React.Fragment key={index}>
				{line}
				<br />
			</React.Fragment>
		));
	}
	const [selectedKeys, setSelectedKeys] = useState(new Set([]));
	const [visibleColumns, setVisibleColumns] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');
	const [isArchived, setIsArchived] = useState(false);

	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [sortDescriptor, setSortDescriptor] = useState({
		column: 'age',
		direction: 'ascending',
	});
	const [page, setPage] = useState(1);

	const pages = Math.ceil(expense.length / rowsPerPage);

	const hasSearchFilter = Boolean(filterValue);

	const headerColumns = useMemo(() => {
		if (visibleColumns === 'all') return columnExpense;

		return columnExpense.filter((column) => Array.from(visibleColumns).includes(column.uid));
	}, [visibleColumns]);

	const filteredItems = useMemo(() => {
		let filteredUsers = [...expense];

		filteredUsers = filteredUsers.filter((user) => user && user.is_archived === isArchived);

		if (hasSearchFilter) {
			filteredUsers = filteredUsers.filter(
				(user) =>
					user.vendor_name.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.project_name.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.expense_description.toLowerCase().includes(filterValue.toLowerCase()),
			);
		}
		if (statusFilter !== 'all' && statusFilter.length !== paymentOptions.length) {
			filteredUsers = filteredUsers.filter((user) => statusFilter.includes(user.payment_type));
		}

		return filteredUsers;
	}, [expense, filterValue, statusFilter, hasSearchFilter, isArchived]);

	const items = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;

		return filteredItems.slice(start, end);
	}, [page, filteredItems, rowsPerPage]);

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
						description='Vendor'
						name={cellValue}></User>
				) : (
					<em className='text-default-500 text-sm'>[Not applicable]</em>
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

			case 'project_name':
				return cellValue ? cellValue : <em className='text-default-500 text-sm'>N/A</em>;

			case 'invoiceNo':
				return '#' + cellValue;
			case 'purchase_date':
				return (
					<div className='flex items-center gap-1'>
						<span className='material-symbols-outlined text-slate-500'>calendar_today</span>
						{formatDate(cellValue)}
					</div>
				);

			case 'balance':
			case 'purchase_amount':
				return formatNumber(cellValue);

			case 'status':
				return (
					<Chip
						className='capitalize border-none gap-1'
						color={statusColorMap[user.status]}
						size='sm'
						variant='flat'>
						{cellValue}
					</Chip>
				);

			case 'direct_expense':
				return cellValue ? 'YES' : 'NO';

			case 'actions':
				return isArchived ? (
					<div className='relative flex justify-center items-center gap-2'>
						<Dropdown>
							<DropdownTrigger>
								<Button
									isIconOnly
									size='sm'
									variant='light'>
									<span className='material-symbols-outlined text-lg cursor-pointer active:opacity-50'>
										more_vert
									</span>
								</Button>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem onPress={() => handleRowArchive(user.id)}>
									Unarchive
								</DropdownItem>
								<DropdownItem onPress={() => handleRowDelete(user.id)}>Delete</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				) : (
					<div className='relative flex justify-center items-center'>
						<Button
							onPress={() => handleRowChange(user.id)}
							radius='sm'
							size='md'
							variant='solid'
							className='bg-black border-r-2 border-white text-white rounded-r-none'>
							View
						</Button>

						<Dropdown>
							<DropdownTrigger>
								<Button
									startContent={
										<span className='material-symbols-outlined text-white'>
											arrow_drop_down
										</span>
									}
									isIconOnly
									radius='sm'
									size='md'
									variant='solid'
									className='bg-black border-r-2 border-white text-white rounded-l-none'
								/>
							</DropdownTrigger>
							<DropdownMenu aria-label='Static Actions'>
								<DropdownItem onPress={() => handleRowEdit(user.id)}>Edit</DropdownItem>
								<DropdownItem onPress={() => handleRowArchive(user.id)}>
									Archive
								</DropdownItem>
								<DropdownItem onPress={() => handleRowDelete(user.id)}>Delete</DropdownItem>
							</DropdownMenu>
						</Dropdown>
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

	const handleRowArchive = (row) => {
		onRowArchive(row);
	};

	const handleRowDelete = useCallback(
		(row) => {
			onRowDelete(row);
		},
		[onRowDelete],
	);

	const handleRowEdit = (row) => {
		onRowEdit(row);
	};

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
						<Dropdown>
							<Button
								size='md'
								color='default'
								onPress={() => setIsArchived((prev) => !prev)}
								className={`${isArchived ? 'bg-black text-white' : 'font-bold'}`}
								disableRipple
								disableAnimations
								variant='bordered'
								radius='sm'>
								{isArchived ? 'Hide Archived' : 'Archived'}{' '}
							</Button>
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
								{columnExpense.map((column) => (
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
							<Button
								color='secondary'
								className='text-white bg-black rounded-md p-3 tracking-wider '
								size='lg'
								onPress={onOpenCreate}
								radius='none'>
								+ Add expenses
							</Button>
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
		expense.length,
		onOpenCreate,
		isArchived,
	]);

	const bottomContent = useMemo(() => {
		return (
			<div>
				<div className='flex justify-center items-center py-4 space-x-1 '>
					<Pagination
						isCompact
						showControls
						showShadow
						classNames={{ cursor: 'bg-slate-900 text-white' }}
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
	}, [page, pages, onNextPage, onPreviousPage]);

	return (
		<>
			<div className='p-10 border-b-[1px] flex justify-between items-center'>
				<div className='flex space-x-4'>
					<span
						className='material-symbols-outlined'
						style={{ fontSize: '36px' }}>
						shopping_cart_checkout
					</span>
					<h1 className='font-semibold tracking-wide text-3xl text-left'>
						{isArchived ? 'Archived' : 'Expenses'}
					</h1>
				</div>
				{topContent}
			</div>
			<Table
				aria-label='Example table with custom cells, pagination and sorting'
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
				<TableBody emptyContent={'No expenses found'}>
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
