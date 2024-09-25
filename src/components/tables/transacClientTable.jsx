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
import { transactionClientColumns, paymentType } from '@/backend/data/dataHooks';

export default function TransactionClientTable({
	clientTransaction,
	filterValue,
	onSearchChange,
	onRowSelect,
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

	const pages = Math.ceil(clientTransaction.length / rowsPerPage);

	const headerColumns = useMemo(() => {
		if (visibleColumns === 'all') return transactionClientColumns;

		return transactionClientColumns.filter((column) =>
			Array.from(visibleColumns).includes(column.uid),
		);
	}, [visibleColumns]);

	const filteredItems = useMemo(() => {
		let filteredUsers = [...clientTransaction];

		if (statusFilter !== 'all' && statusFilter.length !== paymentType.length) {
			filteredUsers = filteredUsers.filter((user) => statusFilter.includes(user.payment_type));
		}

		return filteredUsers;
	}, [clientTransaction, statusFilter]);

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

	const renderCell = useCallback((user, columnKey) => {
		const cellValue = user[columnKey];

		switch (columnKey) {
			case 'vendor_name':
				return (
					<User
						avatarProps={{ radius: 'full', size: 'sm', src: user.project_projectPicture }}
						classNames={{
							description: 'text-default-500',
						}}
						name={cellValue}></User>
				);

			case 'recipient_id':
				return <p className='text-default-500'>(You)</p>;

			case 'invoice_id':
				return '#' + cellValue;
			case 'payment_date':
				return formatDate(cellValue);

			case 'payment_amount':
				return formatNumber(cellValue);

			default:
				return cellValue;
		}
	}, []);

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
									startContent={
										<span className='material-symbols-outlined'>filter_list</span>
									}
									size='md'
									className='bg-black text-white'
									variant='flat'>
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
									startContent={
										<span className='material-symbols-outlined'>filter_list</span>
									}
									size='md'
									className='bg-black text-white'
									variant='flat'>
									Columns
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								disallowEmptySelection
								aria-label='Table Columns'
								closeOnSelect={false}
								selectedKeys={visibleColumns}
								selectionMode='multiple'
								onSelectionChange={setVisibleColumns}>
								{transactionClientColumns.map((column) => (
									<DropdownItem
										key={column.uid}
										className='capitalize'>
										{capitalizeOnlyFirstLetter(column.name)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
					</div>
				</div>
				<div className='flex justify-between items-center'>
					<p className='text-md'>Total {clientTransaction.length} transactions </p>
					<label className='flex items-center text-default-400 text-small'>
						Rows per page:
						<select
							className='bg-transparent outline-none text-default-400 text-small'
							onChange={onRowsPerPageChange}>
							<option value='20'>20</option>
							<option value='30'>30</option>
							<option value='50'>50</option>
						</select>
					</label>
				</div>
			</div>
		);
	}, [statusFilter, visibleColumns, onRowsPerPageChange, clientTransaction.length]);

	const bottomContent = useMemo(() => {
		return (
			<div className='flex justify-center items-center py-5 space-x-1 '>
				<Button
					isDisabled={pages === 1}
					size='md'
					variant='flat'
					className='bg-black text-white'
					onPress={onPreviousPage}>
					Previous
				</Button>
				<Pagination
					isCompact
					showControls
					showShadow
					color='primary'
					page={page}
					total={pages}
					onChange={setPage}
				/>

				<Button
					isDisabled={pages === 1}
					size='md'
					variant='flat'
					className='bg-black text-white'
					onPress={onNextPage}>
					Next
				</Button>
			</div>
		);
	}, [page, pages, onPreviousPage, onNextPage]);

	const handleRowChange = (row) => {
		onRowSelect(row);
	};

	return (
		<Table
			aria-label='Example table with custom cells, pagination and sorting'
			isHeaderSticky
			removeWrapper
			bottomContent={bottomContent}
			bottomContentPlacement='outside'
			selectedKeys={selectedKeys}
			sortDescriptor={sortDescriptor}
			topContent={topContent}
			topContentPlacement='outside'
			onSelectionChange={setSelectedKeys}
			onSortChange={setSortDescriptor}>
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
				{(item) => (
					<TableRow key={item.id}>
						{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
