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
} from '@nextui-org/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
	capitalizeOnlyFirstLetter,
	formatNumber,
	formatDateTime,
	formatNumberDecimal,
} from '@/utils/inputFormatter';
import { payablestransactionColumns } from '@/backend/data/dataHooks';
import { Search } from '@/components/ui/search';

export default function PayableTableTransaction({
	payment,
	filterValue,
	onSearchChange,
	onRowSelect,
	onRowDelete,
	onRowArchive,
}) {
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
	const [isArchived, setIsArchived] = useState(false);
	const [rowsPerPage, setRowsPerPage] = useState(20);
	const [sortDescriptor, setSortDescriptor] = useState({
		column: 'payment_date',
		direction: 'descending',
	});
	const [page, setPage] = useState(1);

	const pages = Math.ceil(payment.length / rowsPerPage);

	const hasSearchFilter = Boolean(filterValue);

	const paymentType = [
		{ name: 'CASH', uid: 'CASH' },
		{ name: 'BANK', uid: 'BANK' },
	];

	const headerColumns = useMemo(() => {
		if (visibleColumns === 'all') return payablestransactionColumns;

		return payablestransactionColumns.filter((column) =>
			Array.from(visibleColumns).includes(column.uid),
		);
	}, [visibleColumns]);

	const filteredItems = useMemo(() => {
		let filteredUsers = [...payment];

		filteredUsers = filteredUsers.filter((user) => user && user.is_archived === isArchived);

		if (hasSearchFilter) {
			filteredUsers = filteredUsers.filter(
				(user) =>
					user.payment_description?.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.invoice_id?.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.name?.toLowerCase().includes(filterValue.toLowerCase()),
			);
		}
		if (statusFilter !== 'all' && statusFilter.length !== paymentType.length) {
			filteredUsers = filteredUsers.filter((user) => statusFilter.includes(user.payment_type));
		}

		return filteredUsers;
	}, [payment, filterValue, statusFilter, hasSearchFilter, paymentType.length, isArchived]);

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
		if (!user) return null;

		const cellValue = user[columnKey];
		var rowNumber = (page - 1) * rowsPerPage + index + 1;

		switch (columnKey) {
			case 'no':
				return rowNumber;

			case 'name':
				return cellValue ? (
					<User
						avatarProps={{ radius: 'full', size: 'sm', src: user.vendor_picture }}
						classNames={{
							description: 'text-default-500',
						}}
						description={user.vendor_services}
						name={user.name}></User>
				) : (
					<em className='text-default-500 text-sm'>[client not found]</em>
				);

			case 'invoice_id':
				return '#' + cellValue;
			case 'payment_date':
				return (
					<div className='flex items-center gap-1'>
						<span className='material-symbols-outlined text-slate-500'>calendar_today</span>
						{formatDateTime(cellValue)}
					</div>
				);

			case 'payment_description':
				return (
					<div className='flex gap-2'>
						<span className='material-symbols-outlined'>receipt_long</span>
						{formatDescription(cellValue)}
					</div>
				);

			case 'payment_amount':
				return formatNumber(cellValue);

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
								<DropdownItem onPress={() => handleRowChange(user.id)}>View</DropdownItem>
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
	const handleRowDelete = (row) => {
		onRowDelete(row);
	};

	const handleRowArchive = (row) => {
		onRowArchive(row);
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
			<div className='flex flex-col gap-2'>
				<div className='flex justify-end gap-3 items-end'>
					<div className='flex gap-3 items-center'>
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
								{paymentType.map((status) => (
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
								{payablestransactionColumns.map((column) => (
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
		payment.length,
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
						payments
					</span>

					<h1 className='font-semibold tracking-wide text-3xl text-left'>
						{isArchived ? 'Archived' : 'Transactions'}
					</h1>
				</div>
				{topContent}
			</div>

			<Table
				aria-label='Tablesales'
				removeWrapper
				bottomContent={bottomContent}
				bottomContentPlacement='outside'
				selectedKeys={selectedKeys}
				sortDescriptor={sortDescriptor}
				topContentPlacement='outside'
				onSelectionChange={setSelectedKeys}
				onSortChange={setSortDescriptor}
				classNames={{ th: 'bg-slate-900 text-white', td: 'border-b-1' }}
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
				<TableBody emptyContent={'No transactions found'}>
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
