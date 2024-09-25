'use client';
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Spinner,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Button,
	useDisclosure,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
} from '@nextui-org/react';
import axios from 'axios';
import { AccountsTransaction, AccountsTransactionId } from '@/backend/data/dataHooks';
import React from 'react';
import { useState, useCallback } from 'react';
import { AccountsData } from '@/backend/data/dataHooks';
import { formatNumber, removeFormatting, formatDateTime } from '@/utils/inputFormatter';

export default function Transferfund() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [viewId, setStatusId] = useState(null);

	const columns = [
		{
			key: 'account_name',
			label: 'ACCOUNT NAME',
		},
		{
			key: 'description',
			label: 'DESCRIPTION',
		},
		{
			key: 'date',
			label: 'DATE',
		},
		{
			key: 'amount',
			label: 'AMOUNT',
		},
		{
			key: 'status',
			label: 'STATUS',
		},
		{
			key: 'action',
			label: 'ACTION',
		},
	];

	const { accTransaction, refetchTransaction } = AccountsTransaction();
	const { accountsTransactionId, loadingTransact, refetchTransact } = AccountsTransactionId({
		viewId,
	});
	const { accounts, loading, error, refetch } = AccountsData();

	const renderCell = useCallback((accTransaction, columnKey) => {
		const cellValue = accTransaction[columnKey];

		switch (columnKey) {
			case 'date':
				return formatDateTime(cellValue);
			case 'amount':
				return formatNumber(cellValue);
			case 'action':
				return (
					<div className='flex items-start gap-2 justify-start'>
						<Button
							isIconOnly
							color='primary'
							variant='flat'
							onPress={() => handleRowChange(accTransaction.id)}>
							<span className='material-symbols-outlined text-lg cursor-pointer active:opacity-50'>
								visibility
							</span>
						</Button>
					</div>
				);

			default:
				return cellValue;
		}
	}, []);

	const handleRowChange = useCallback(
		(row) => {
			setStatusId(row);
			onOpen();
		},
		[setStatusId],
	);
	const onClose = () => {
		onOpenChange(false);
		setStatusId(null);
	};

	const Approve = async (id) => {
		if (id) {
			try {
				const response = await axios.post(`/api/approve-transfer/${id}`);
				console.log('Notification marked as seen:', response.data);
				refetchTransaction();
				onClose();
			} catch (error) {
				console.error('Error marking notification as seen:', error);
				onClose();
			}
		}
	};

	if (loading) {
		return (
			<div className='absolute top-1/2 left-1/2 text-center'>
				<Spinner />
				<p>Loading dashboard data...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='absolute top-1/2 left-1/2 text-center'>
				<h2>Error loading dashboard data</h2>
				<p>{error.message}</p>
			</div>
		);
	}

	return (
		<div className='h-fit'>
			<div className='p-10 mb-5 border-b-[1px] flex space-x-4 items-center'>
				<span
					className='material-symbols-outlined'
					style={{ fontSize: '36px' }}>
					account_balance_wallet
				</span>
				<h1 className='font-semibold tracking-wide text-3xl text-left'>Transfer fund</h1>
			</div>
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-5 col-span-1 p-3'>
				<Card className='bg-gradient-to-l from-purple-600 to-purple-800 p-2'>
					<CardHeader className='flex items-start justify-between'>
						<span
							className='material-symbols-outlined text-white col-span-2'
							style={{ fontSize: '36px' }}>
							contactless
						</span>
						<em className='text-right text-white font-bold tracking-wide'>VISA</em>
					</CardHeader>
					<CardBody>
						<p className='text-white font-bold tracking-wide text-2xl'>REVENUE</p>
						<p className='text-white tracking-wide'>5363 4700 0123 457</p>
					</CardBody>
					<CardFooter className='flex items-end justify-between'>
						<p className='text-white tracking-wide col-span-2 text-2xl mt-6'>
							{formatNumber(accounts[0].total_balance_sum)}
						</p>
						<div className='bank-card-div-2 text-white mt-4'>
							<p className='text-xs text-right'>Expiry date</p>
							<p className='text-sm text-center'>2/24</p>
						</div>
					</CardFooter>
				</Card>
				{accounts.map((accountsItem) => (
					<Card
						key={accountsItem.id}
						className='bg-gradient-to-l from-gray-600 to-gray-800 p-2'>
						<CardHeader className='flex items-start justify-between'>
							<span
								className='material-symbols-outlined text-white col-span-2'
								style={{ fontSize: '36px' }}>
								contactless
							</span>
							<em className='text-right text-white font-bold tracking-wide'>VISA</em>
						</CardHeader>
						<CardBody>
							<p className='text-white font-bold tracking-wide text-2xl'>
								{accountsItem.account_name}
							</p>
							<p className='text-white tracking-wide'>5363 4700 0123 457</p>
						</CardBody>
						<CardFooter className='flex items-end justify-between'>
							<p className='text-white tracking-wide col-span-2 text-2xl mt-6'>
								{formatNumber(accountsItem.total_balance)}
							</p>
							<div className='bank-card-div-2 text-white mt-4'>
								<p className='text-xs text-right'>Expiry date</p>
								<p className='text-sm text-center'>2/24</p>
							</div>
						</CardFooter>
					</Card>
				))}
			</div>

			<div className='mt-10 p-3'>
				<Table
					aria-label='Transaction table'
					className='p-2'
					removeWrapper>
					<TableHeader columns={columns}>
						{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
					</TableHeader>
					<TableBody
						items={accTransaction}
						emptyContent={<p>No transaction</p>}>
						{(item) => (
							<TableRow key={item.key}>
								{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<Modal
				isOpen={isOpen}
				size='lg'
				placement='top'
				onClose={onClose}
				aria-labelledby='sales details'
				aria-modal='true'
				role='dialog'>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className='flex gap-1 mb-5'>
								<span className='material-symbols-outlined'>account_balance_wallet</span>
								<p>Transfer Details</p>
							</ModalHeader>

							{loadingTransact ? (
								<p>Loading...</p> // You can show a spinner or a loading text
							) : accountsTransactionId ? (
								<ModalBody key={accountsTransactionId[0].id}>
									<div className='grid grid-cols-2 gap-5 w-full'>
										<div className='flex border-[1px] col-span-3 p-5 rounded-md justify-between items-center'>
											<div>
												<p className='self-center font-semibold'>
													{accountsTransactionId[0].account_name}
												</p>
												<p className='text-xs text-gray-400'>Account Name</p>
											</div>
											<div>
												<p className='self-center font-semibold'>
													{accountsTransactionId[0].transferto}
												</p>
												<p className='text-xs text-gray-400'>Transfer To</p>
											</div>
											<div>
												<p className='self-center font-semibold'>
													{accountsTransactionId[0].status}
												</p>
												<p className='text-xs text-gray-400'>Status</p>
											</div>
										</div>
										<div className='flex col-span-3 p-5 rounded-md justify-between items-center'>
											<div>
												<p className='self-center font-semibold'>
													{formatDateTime(accountsTransactionId[0].date)}
												</p>
												<p className='text-xs text-gray-400'>Transfer date</p>
											</div>
											<div>
												<p className='self-center font-semibold'>
													{formatNumber(accountsTransactionId[0].amount)}
												</p>
												<p className='text-xs text-gray-400'>Amount</p>
											</div>
										</div>
									</div>
									{accountsTransactionId[0].status === 'PENDING' ? (
										<Button
											endContent={
												<span className='material-symbols-outlined'>done_outline</span>
											}
											color='success'
											variant='solid'
											size='lg'
											onClick={() => Approve(accountsTransactionId[0].id)}
											type='submit'
											className='text-white'>
											Approve
										</Button>
									) : (
										<Button
											color='danger'
											variant='solid'
											size='lg'
											onClick={onClose}
											className='text-white'>
											Close
										</Button>
									)}
								</ModalBody>
							) : (
								<p>No transaction details available</p>
							)}
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}

/**
 * 
 * 		<Modal
				isOpen={isOpen}
				size='lg'
				hideCloseButton
				onClose={onClose}
				aria-labelledby='sales details'
				aria-modal='true'
				role='dialog'
				onOpenChange={onOpenChange}>
				{accountsTransactionId && accountsTransactionId.length > 0 ? (
					accountsTransactionId.map((accountsItem) => (
						<ModalContent key={accountsItem.id}>
							{(onClose) => (
								<>
									<ModalHeader className='flex gap-1 mb-5'>
										<span className='material-symbols-outlined'>
											account_balance_wallet
										</span>
										<p>Transfer Details</p>
									</ModalHeader>
									<ModalBody>
								
									</ModalBody>
									<ModalFooter className='flex justify-between'>
										<Button
											color='danger'
											variant='light'
											size='md'
											onClick={onClose}
											className='bg-gray-200'>
											Close
										</Button>
									</ModalFooter>
								</>
							)}
						</ModalContent>
					))
				) : (
					<div className='flex w-full items-center'>
						<p>No details for this Transaction.</p>
					</div>
				)}
			</Modal>
 */
