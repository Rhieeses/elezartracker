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
	Chip,
	User,
	Pagination,
	Tab,
	Tabs,
} from '@nextui-org/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { capitalizeOnlyFirstLetter, formatNumberDecimal, formatDate } from '@/utils/inputFormatter';
import { columnsReceivables, statusOptions, statusColorMap } from '@/backend/data/dataHooks';
import { Search } from '@/components/ui/search';

export default function ReceivablesTable({
	receivable,
	filterValue,
	onSearchChange,
	onRowSelect,
	onOpen,
}) {
	const [selectedKeys, setSelectedKeys] = useState(new Set([]));
	const [visibleColumns, setVisibleColumns] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');
	const [rowsPerPage, setRowsPerPage] = useState(20);
	const [sortDescriptor, setSortDescriptor] = useState({
		column: 'age',
		direction: 'ascending',
	});
	const [page, setPage] = useState(1);

	const pages = Math.ceil(receivable.length / rowsPerPage);

	const hasSearchFilter = Boolean(filterValue);

	const headerColumns = useMemo(() => {
		if (visibleColumns === 'all') return columnsReceivables;

		return columnsReceivables.filter((column) => Array.from(visibleColumns).includes(column.uid));
	}, [visibleColumns]);

	const filteredItems = useMemo(() => {
		let filteredUsers = [...receivable];

		if (hasSearchFilter) {
			filteredUsers = filteredUsers.filter(
				(user) =>
					user.name.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.description.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.invoice_no.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.project_name.toLowerCase().includes(filterValue.toLowerCase()),
			);
		}
		if (statusFilter !== 'all' && statusFilter.length !== statusOptions.length) {
			filteredUsers = filteredUsers.filter((user) => statusFilter.includes(user.status));
		}

		return filteredUsers;
	}, [receivable, filterValue, statusFilter, hasSearchFilter]);

	const items = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;

		return filteredItems.slice(start, end);
	}, [page, filteredItems, rowsPerPage]);

	const { totalBalance, totalPaid } = useMemo(() => {
		if (!filteredItems || filteredItems.length === 0) {
			return { totalBalance: 0, totalPaid: 0 };
		}

		return filteredItems.reduce(
			(acc, item) => {
				if (item && typeof item === 'object') {
					acc.totalBalance += Number(item.balance) || 0;
					acc.totalPaid += Number(item.paid_amount) || 0;
				}
				return acc;
			},
			{ totalBalance: 0, totalPaid: 0 },
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
		if (!user) return null;

		const cellValue = user[columnKey];
		var rowNumber = (page - 1) * rowsPerPage + index + 1;

		switch (columnKey) {
			case 'no':
				return rowNumber;

			case 'name':
				return (
					<User
						avatarProps={{ radius: 'full', size: 'sm', src: user.client_profilePicture }}
						classNames={{
							description: 'text-default-500',
						}}
						description={user.project_name}
						name={<p className='font-semibold'>{cellValue}</p>}></User>
				);

			case 'invoice_no':
				return '#' + cellValue;
			case 'due_date':
				return <p className='text-default-500'>{formatDate(cellValue)}</p>;

			case 'description':
				return (
					<div className='flex items-center justify-start w-full gap-2'>
						<span
							className='material-symbols-sharp text-slate-700'
							style={{ fontSize: '35px' }}>
							receipt
						</span>
						<div className='w-8/12'>
							<p className='text-sm text-blue-500'>#{user.invoice_no}</p>
							<div className='flex flex-col gap-2 w-full justify-between'>
								<p className='font-semibold text-slate-900'>{cellValue}</p>
								<div>
									<strong className='font-semibold'>
										{formatNumberDecimal(user.billed_amount)}
									</strong>
									<p className='text-default-500 text-sm'>Amount</p>
								</div>
							</div>
						</div>
					</div>
				);

			case 'billed_amount':
			case 'paid_amount':
			case 'balance':
				return formatNumberDecimal(cellValue);

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
			case 'actions':
				return (
					<div className='relative flex items-center gap-2 justify-center'>
						<Button
							variant='bordered'
							className='font-bold hover:scale-105'
							onPress={() => handleRowChange(user.invoice_no)}>
							Payment
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
				<div className='flex justify-end gap-3 items-start'>
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
								{columnsReceivables.map((column) => (
									<DropdownItem
										key={column.uid}
										className='capitalize'>
										{capitalizeOnlyFirstLetter(column.name)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
						<div className='flex items-center justify-end gap-2'>
							<div className='lg:w-[25rem] w-1/2 lg:visible invisible'>
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
								+ Add additionals
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
		receivable.length,
		onOpen,
	]);

	const bottomContent = useMemo(() => {
		return (
			<div>
				<div className='flex justify-center items-center space-x-1'>
					<Pagination
						isCompact
						variant='solid'
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
	}, [page, pages]);

	return (
		<div className='grid grid-cols-1 lg:grid-cols-6 h-full'>
			<div className='col-span-1 lg:col-span-6 pb-5 pt-5 lg:p-10 flex justify-between items-center border-b-[1px]'>
				<div className='flex space-x-4'>
					<span
						className='material-symbols-outlined'
						style={{ fontSize: '36px' }}>
						approval_delegation
					</span>
					<h1 className='font-semibold tracking-wide text-3xl'>Receivables</h1>
				</div>
				{topContent}
			</div>
			<div className='border-r-[1px] hidden lg:block'>
				<Tabs
					aria-label='navbar'
					className='text-black flex justify-center'
					classNames={{ panel: 'pointer-events-none' }}
					selectedKeys={statusFilter}
					variant='solid'
					selectionMode='multiple'
					onSelectionChange={(selectedKeys) => setStatusFilter(selectedKeys)}>
					<Tab
						key='All'
						className='rounded w-full'
						title={<p>All</p>}>
						<div className='p-2'>
							<div className='p-2 flex flex-col gap-5'>
								<span className='p-5 border-1'>
									<span className='flex gap-2'>
										<span className='material-symbols-outlined'>tag</span>
										<p>Receivables</p>
									</span>
									<em className='text-right'>{filteredItems.length}</em>
								</span>
								<span className='p-5 border-1 w-full'>
									<span className='flex gap-2'>
										<span class='material-symbols-outlined'>payments</span>
										<p>Receivables</p>
									</span>
									<em className='text-right'>{formatNumberDecimal(totalBalance)}</em>
								</span>
							</div>
						</div>
					</Tab>
					<Tab
						key='FULLY PAID'
						className='hover:bg-gray-100 rounded w-full'
						title={<p>Paid</p>}>
						<div className='p-2'>
							<div className='p-2 flex flex-col gap-5'>
								<span className='p-5 border-1'>
									<span className='flex gap-2'>
										<span className='material-symbols-outlined'>tag</span>
										<p>
											Receivables - <strong>PAID</strong>
										</p>
									</span>
									<em className='text-right'>{filteredItems.length}</em>
								</span>
								<span className='p-5 border-1 w-full'>
									<span className='flex gap-2'>
										<span class='material-symbols-outlined'>payments</span>
										<p>
											Receivables - <strong>PAID</strong>
										</p>
									</span>
									<em className='text-right'>{formatNumberDecimal(totalPaid)}</em>
								</span>
							</div>
						</div>
					</Tab>
					<Tab
						key='PARTIALLY PAID'
						className='hover:bg-gray-100 rounded w-full'
						title={<p>Partially</p>}>
						<div className='p-2'>
							<div className='p-2 flex flex-col gap-5'>
								<span className='p-5 border-1'>
									<span className='flex gap-2'>
										<span className='material-symbols-outlined'>tag</span>
										<p>
											Receivables - <strong>PARTIALLY</strong>
										</p>
									</span>
									<em className='text-right'>{filteredItems.length}</em>
								</span>
								<span className='p-5 border-1 w-full'>
									<span className='flex gap-2'>
										<span class='material-symbols-outlined'>payments</span>
										<p>
											Receivables - <strong>PARTIALLY</strong>
										</p>
									</span>
									<em className='text-right'>{formatNumberDecimal(totalPaid)}</em>
								</span>
							</div>
						</div>
					</Tab>
					<Tab
						key='UNPAID'
						className='hover:bg-gray-100 rounded w-full'
						title={<p>Unpaid</p>}>
						<div className='p-2'>
							<div className='p-2 flex flex-col gap-5'>
								<span className='p-5 border-1'>
									<span className='flex gap-2'>
										<span className='material-symbols-outlined'>tag</span>
										<p>
											Receivables - <strong>UNPAID</strong>
										</p>
									</span>
									<em className='text-right'>{filteredItems.length}</em>
								</span>
								<span className='p-5 border-1 w-full'>
									<span className='flex gap-2'>
										<span class='material-symbols-outlined'>payments</span>
										<p>
											Receivables - <strong>UNPAID</strong>
										</p>
									</span>
									<em className='text-right'>{formatNumberDecimal(totalBalance)}</em>
								</span>
							</div>
						</div>
					</Tab>
				</Tabs>
			</div>
			<div className='col-span-1 lg:col-span-5 overflow-auto'>
				<Table
					aria-label='Receivable table'
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
					<TableBody emptyContent={'No receivable found'}>
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
			</div>
		</div>
	);
}
