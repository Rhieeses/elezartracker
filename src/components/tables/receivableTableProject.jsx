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
	Tooltip,
	Card,
	CardHeader,
	CardBody,
} from '@nextui-org/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { capitalizeOnlyFirstLetter, formatNumberDecimal, formatDate } from '@/utils/inputFormatter';
import { columns, statusOptions, statusColorMap } from '@/backend/data/dataHooks';
import { Search } from '@/components/ui/search';

export default function ReceivablesTableProject({
	receivable,
	filterValue,
	onSearchChange,
	onRowSelect,
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

	const pages = Math.ceil(receivable.length / rowsPerPage);

	const hasSearchFilter = Boolean(filterValue);

	const headerColumns = useMemo(() => {
		if (visibleColumns === 'all') return columns;

		return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
	}, [visibleColumns]);

	const filteredItems = useMemo(() => {
		let filteredUsers = [...receivable];

		if (hasSearchFilter) {
			filteredUsers = filteredUsers.filter(
				(user) =>
					user.invoice_no.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.due_date.toLowerCase().includes(filterValue.toLowerCase()) ||
					user.description.toLowerCase().includes(filterValue.toLowerCase()),
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

	const sortedItems = useMemo(() => {
		return [...items].sort((a, b) => {
			const first = a[sortDescriptor.column];
			const second = b[sortDescriptor.column];
			const cmp = first < second ? -1 : first > second ? 1 : 0;

			return sortDescriptor.direction === 'descending' ? -cmp : cmp;
		});
	}, [sortDescriptor, items]);

	const renderCell = (user, columnKey) => {
		const cellValue = user[columnKey];

		switch (columnKey) {
			case 'name':
				return (
					<User
						avatarProps={{ radius: 'full', size: 'sm', src: user.client_profilePicture }}
						classNames={{
							description: 'text-default-500',
						}}
						description='5/12 payments paid'
						name={cellValue}></User>
				);

			case 'invoice_no':
				return '#' + cellValue;
			case 'due_date':
				return formatDate(cellValue);

			case 'billed_amount':
			case 'paid_amount':
			case 'balance':
				return formatNumberDecimal(cellValue);

			case 'status':
				return (
					<Chip
						className='capitalize border-none gap-1 text-default-600'
						color={statusColorMap[user.status]}
						size='sm'
						variant='dot'>
						{cellValue}
					</Chip>
				);
			case 'actions':
				return (
					<div className='relative flex items-center gap-2 justify-center'>
						<Tooltip content='Details'>
							<Button
								isIconOnly
								color='primary'
								variant='flat'
								onPress={() => handleRowChange(user.invoice_no)}>
								<span className='material-symbols-outlined text-lg cursor-pointer active:opacity-50'>
									visibility
								</span>
							</Button>
						</Tooltip>
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
									Status
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
								{statusOptions.map((status) => (
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
								{columns.map((column) => (
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
				<div className='flex justify-between items-center'>
					<p className='text-md'>Total {receivable.length} receivable</p>
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
	}, [
		filterValue,
		statusFilter,
		visibleColumns,
		onSearchChange,
		onRowsPerPageChange,
		receivable.length,
	]);

	const bottomContent = useMemo(() => {
		return (
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
		);
	}, [page, pages]);

	return (
		<Table
			aria-label='Example table with custom cells, pagination and sorting'
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
				emptyContent={'No receivable found'}
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
