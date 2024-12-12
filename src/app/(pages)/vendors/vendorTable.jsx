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
	Tooltip,
} from '@nextui-org/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { capitalizeOnlyFirstLetter, formatNumber, formatDate } from '@/utils/inputFormatter';
import { vendorColumns, services } from '@/backend/data/dataHooks';
import { Search } from '@/components/ui/search';

export default function VendorTable({
	vendor,
	filterValue,
	onSearchChange,
	onRowSelect,
	onRowDelete,
	onOpen,
}) {
	const [selectedKeys, setSelectedKeys] = useState(new Set([]));
	const [visibleColumns, setVisibleColumns] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [sortDescriptor, setSortDescriptor] = useState({
		column: 'age',
		direction: 'ascending',
	});
	const [page, setPage] = useState(1);

	const pages = Math.ceil(vendor.length / rowsPerPage);

	const hasSearchFilter = Boolean(filterValue);

	const headerColumns = useMemo(() => {
		if (visibleColumns === 'all') return vendorColumns;

		return vendorColumns.filter((column) => Array.from(visibleColumns).includes(column.uid));
	}, [visibleColumns]);

	const filteredItems = useMemo(() => {
		let filteredUsers = [...vendor];

		if (hasSearchFilter) {
			filteredUsers = filteredUsers.filter(
				(user) =>
					user.vendor_name.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.vendor_services?.toLowerCase().includes(filterValue.toLowerCase()),
			);
		}
		if (statusFilter !== 'all' && statusFilter.length !== services.length) {
			filteredUsers = filteredUsers.filter((user) =>
				statusFilter.includes(user.vendor_services),
			);
		}

		return filteredUsers;
	}, [vendor, filterValue, statusFilter, hasSearchFilter]);

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
				return (
					<User
						avatarProps={{
							showFallback: true,
							src:
								user.vendor_picture && user.vendor_picture !== 'null'
									? user.vendor_picture
									: '/default_picture.png',
							radius: 'lg',
						}}
						description={user.vendor_name}
						name={cellValue}
					/>
				);

			case 'vendor_contactNo':
				return (
					<div>
						{cellValue}
						<p className='text-blue-600'>{user.vendor_email}</p>
					</div>
				);

			case 'total_purchase_amount':
				return formatNumber(user.total_purchase_amount);

			case 'actions':
				return (
					<div className='relative flex items-center gap-2 justify-center'>
						<Button
							isIconOnly
							radius='sm'
							className='bg-black'
							variant='flat'
							onPress={() => handleRowEdit(user.id)}>
							<span className='material-symbols-outlined text-lg text-white cursor-pointer active:opacity-50'>
								edit
							</span>
						</Button>

						<Button
							isIconOnly
							radius='sm'
							className='bg-red-700'
							variant='flat'
							onPress={() => handleRowDelete(user.id)}>
							<span className='material-symbols-outlined text-lg text-white cursor-pointer active:opacity-50'>
								delete
							</span>
						</Button>
					</div>
				);
			default:
				return cellValue;
		}
	};

	const handleRowEdit = useCallback(
		(row) => {
			onRowSelect(row);
		},
		[onRowSelect],
	);

	const handleRowDelete = useCallback(
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
								{services.map((status) => (
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
								{vendorColumns.map((column) => (
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
								onPress={onOpen}
								radius='none'>
								+ Add vendors
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
		vendor.length,
		onOpen,
	]);

	const bottomContent = useMemo(() => {
		return (
			<div>
				<div className='flex justify-center items-center py-4 space-x-1 '>
					<Pagination
						isCompact
						showControls
						showShadow
						color='default'
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
			<div className='p-10 flex justify-between items-center'>
				<div className='flex space-x-4'>
					<span
						className='material-symbols-outlined'
						style={{ fontSize: '36px' }}>
						local_shipping
					</span>
					<h1 className='font-semibold tracking-wide text-3xl text-left'>Vendors</h1>
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
				<TableBody emptyContent={'No vendors found'}>
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
