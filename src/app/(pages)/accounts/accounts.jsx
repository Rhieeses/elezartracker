'use client';
import Layout from '@/components/ui/layout';
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Spinner,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Input,
	Select,
	SelectItem,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
} from '@nextui-org/react';
import axios from 'axios';
import { AccountsTransaction } from '@/backend/data/dataHooks';
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { AccountsData } from '@/backend/data/dataHooks';
import { formatNumber, removeFormatting, formatDateTime } from '@/utils/inputFormatter';

export default function AccountsContent() {
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
	];

	const { accTransaction, refetchTransaction } = AccountsTransaction();
	const { accounts, loading, refetch } = AccountsData();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [loadingSubmit, setLoadingSubmit] = useState();
	const [maxValue, setMaxValue] = useState(0);
	const [isMaxValue, setIsMaxValue] = useState(false);

	const initialData = {
		transferFrom: '',
		transferTo: '',
		transferAmount: '',
	};

	const [formData, setFormData] = useState(initialData);

	useEffect(() => {
		if (formData.transferFrom === 'CASH') {
			setMaxValue(accounts[0].total_balance);
		} else if (formData.transferFrom === 'BANK') {
			setMaxValue(accounts[1].total_balance);
		} else if (formData.transferFrom === 'GCASH') {
			setMaxValue(accounts[2].total_balance);
		}
	}, [formData.transferFrom, accounts]);

	const onClose = () => {
		onOpenChange(false);
		setFormData(initialData);
		setIsMaxValue(false);
		setMaxValue(0);
	};

	const handleInput = (field) => (event) => {
		let value = event.target.value || '';

		// Special handling for transferAmount
		if (field === 'transferAmount') {
			// Allow only digits and a single decimal point
			const rawValue = value.replace(/[^0-9.]/g, '');

			// Ensure only one decimal point exists
			const parts = rawValue.split('.');
			if (parts.length > 2) {
				return; // Ignore the input if there are more than one decimal point
			}

			// Format the integer part of the number
			let formattedValue = rawValue;
			if (parts[1] === undefined || parts[1] !== '') {
				const numericValue = parseFloat(parts[0]); // Parse the integer part
				if (!isNaN(numericValue)) {
					// Format only the integer part
					formattedValue =
						formatNumber(numericValue) + (parts[1] !== undefined ? '.' + parts[1] : '');
				}
			}

			const numericValue = parseFloat(rawValue);
			if (!isNaN(numericValue) && numericValue > maxValue) {
				setIsMaxValue(true);
			} else {
				setIsMaxValue(false);
			}

			value = formattedValue;
		}

		// Update form data for all fields
		setFormData((prevData) => ({
			...prevData,
			[field]: value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const formDataToSubmit = new FormData();
		const cleanedData = {
			...formData,
			transferAmount: removeFormatting(formData.transferAmount),
		};

		setLoadingSubmit(true);

		try {
			await axios.post('/api/transfer-account', cleanedData);
			setFormData(initialData);
			onClose();
			refetch();
			refetchTransaction();
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setLoadingSubmit(false);
		}
	};

	const renderCell = useCallback((accTransaction, columnKey) => {
		const cellValue = accTransaction[columnKey];

		switch (columnKey) {
			case 'date':
				return formatDateTime(cellValue);
			case 'amount':
				return formatNumber(cellValue);

			default:
				return cellValue;
		}
	}, []);

	return (
		<Layout>
			{!loading && accounts && accounts.length > 0 ? (
				<div className='h-fit'>
					<div className='p-10 mb-5 border-b-[1px] flex space-x-4 items-center'>
						<span
							className='material-symbols-outlined'
							style={{ fontSize: '36px' }}>
							account_balance_wallet
						</span>
						<h1 className='font-semibold tracking-wide text-3xl text-left'>Accounts</h1>
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
						<div className='flex items-center justify-between'>
							<h1>Transactions</h1>
							<Button
								color='secondary'
								startContent={<span className='material-symbols-outlined'>move_up</span>}
								onPress={onOpen}>
								Transfer fund
							</Button>
						</div>

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
				</div>
			) : (
				<div className='flex justify-center items-center w-full h-screen'>
					<Spinner />
				</div>
			)}

			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}>
				<form onSubmit={handleSubmit}>
					<ModalContent>
						<>
							<ModalHeader className='flex gap-2'>
								<span className='material-symbols-outlined'>move_up</span>
								Transfer fund
							</ModalHeader>
							<ModalBody>
								<div className='grid grid-cols-2 gap-5'>
									<Select
										items={accounts}
										label='Transfer from'
										variant='bordered'
										placeholder='Select an account'
										name='transferFrom'
										value={formData.transferFrom}
										onChange={handleInput('transferFrom')}
										className='max-w-xs'>
										{(accounts) => (
											<SelectItem
												key={accounts.account_name}
												value={accounts.account_name}>
												{accounts.account_name}
											</SelectItem>
										)}
									</Select>
									<Select
										items={accounts}
										label='Transfer to'
										variant='bordered'
										placeholder='Select an account'
										name='transferTo'
										value={formData.transferTo}
										onChange={handleInput('transferTo')}
										className='max-w-xs'>
										{(accounts) => (
											<SelectItem
												key={accounts.account_name}
												value={accounts.account_name}>
												{accounts.account_name}
											</SelectItem>
										)}
									</Select>
									<Input
										type='text'
										label='Transfer amount'
										name='transferAmount'
										value={formData.transferAmount}
										onChange={handleInput('transferAmount')}
										isInvalid={isMaxValue}
										errorMessage='Funds is max'
										variant='bordered'
										labelPlacement='inside'
										className='col-span-2'
										required
									/>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button
									color='danger'
									variant='light'
									onPress={onClose}>
									Cancel
								</Button>
								<Button
									type='submit'
									color='primary'>
									Transfer
								</Button>
							</ModalFooter>
						</>
					</ModalContent>
				</form>
			</Modal>
		</Layout>
	);
}
