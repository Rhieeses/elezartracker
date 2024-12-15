'use client';
import Layout from '@/components/ui/layout';
import {
	Input,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	useDisclosure,
	Button,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Select,
	SelectItem,
} from '@nextui-org/react';
import React from 'react';
import { AccountsData, AccountsTransaction } from '@/backend/data/dataHooks';
import {
	formatNumber,
	removeFormatting,
	formatNumberDecimal,
	formatDateTime,
} from '@/utils/inputFormatter';
import Loading from '@/app/loading';
import { PieChartAccounts } from '@/components/ui/chart';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';

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

export default function AccountsContent() {
	//transfer accounts
	const { accounts, loading, error } = AccountsData();
	const { accTransaction, refetchTransaction } = AccountsTransaction();
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

		if (field === 'transferAmount') {
			const rawValue = value.replace(/[^0-9.]/g, '');

			const parts = rawValue.split('.');
			if (parts.length > 2) {
				return;
			}

			let formattedValue = rawValue;
			if (parts[1] === undefined || parts[1] !== '') {
				const numericValue = parseFloat(parts[0]);
				if (!isNaN(numericValue)) {
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
			case 'status':
				return cellValue === 'SUCCESSFUL' ? (
					<p className='text-green-700'>{cellValue}</p>
				) : (
					<p className='text-red-500'>{cellValue}</p>
				);

			default:
				return cellValue;
		}
	}, []);

	//

	if (loading) {
		return <Loading />;
	}

	if (error) {
		return (
			<Layout>
				<div className='flex justify-center items-center h-[50rem]'>
					<h2>Error loading dashboard data</h2>
					<p>{error.message}</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className='grid grid-cols-2 gap-10 '>
				<div className='col-span-2 p-10 mb-5 border-b-[1px] flex space-x-4 items-center'>
					<span
						className='material-symbols-outlined'
						style={{ fontSize: '36px' }}>
						account_balance_wallet
					</span>
					<h1 className='font-semibold tracking-wide text-3xl text-left'>Accounts</h1>
				</div>
				<div className='flex items-center justify-center w-full'>
					<div className='w-[70%]'>
						<PieChartAccounts
							cash={accounts?.total_payment_cash}
							bank={accounts?.total_payment_bank}
							gcash={accounts?.total_payment_gcash}
						/>
					</div>
				</div>

				<div className='h-fit'>
					<h1 className='text-center font-semibold text-3xl'>Assets</h1>
					<div className='grid grid-cols-2 lg:grid-cols-2 gap-5 col-span-1 p-10'>
						<Card className='border-1 border-black p-2'>
							<CardHeader className='flex items-start justify-between'>
								<span
									className='material-symbols-outlined  col-span-2'
									style={{ fontSize: '36px' }}>
									contactless
								</span>
								<em className='text-right  font-bold tracking-wide'>VISA</em>
							</CardHeader>
							<CardBody>
								<p className=' font-bold tracking-wide text-2xl'>CASH</p>
							</CardBody>
							<CardFooter className='flex items-end justify-between'>
								<strong className=' tracking-wide col-span-2 text-2xl mt-6'>
									{formatNumberDecimal(
										Number(accounts?.total_payment_cash || 0) -
											Number(accounts?.total_expense_cash || 0),
									)}
								</strong>
								<div className='bank-card-div-2  mt-4'>
									<p className='text-xs text-right'>Expiry date</p>
									<p className='text-sm text-center'>2/24</p>
								</div>
							</CardFooter>
						</Card>

						<Card className='border-1 border-black p-2'>
							<CardHeader className='flex items-start justify-between'>
								<span
									className='material-symbols-outlined  col-span-2'
									style={{ fontSize: '36px' }}>
									contactless
								</span>
								<em className='text-right  font-bold tracking-wide'>VISA</em>
							</CardHeader>
							<CardBody>
								<p className=' font-bold tracking-wide text-2xl'>BANK</p>
							</CardBody>
							<CardFooter className='flex items-end justify-between'>
								<strong className=' tracking-wide col-span-2 text-2xl mt-6'>
									{formatNumber(
										Number(accounts?.total_payment_bank || 0) -
											Number(accounts?.total_expense_bank || 0),
									)}
								</strong>
								<div className='bank-card-div-2  mt-4'>
									<p className='text-xs text-right'>Expiry date</p>
									<p className='text-sm text-center'>2/24</p>
								</div>
							</CardFooter>
						</Card>

						<Card className='border-1 border-black p-2'>
							<CardHeader className='flex items-start justify-between'>
								<span
									className='material-symbols-outlined  col-span-2'
									style={{ fontSize: '36px' }}>
									contactless
								</span>
								<em className='text-right  font-bold tracking-wide'>VISA</em>
							</CardHeader>
							<CardBody>
								<p className=' font-bold tracking-wide text-2xl'>GCASH</p>
							</CardBody>
							<CardFooter className='flex items-end justify-between'>
								<strong className=' tracking-wide col-span-2 text-2xl mt-6'>
									{formatNumber(
										Number(accounts?.total_payment_gcash || 0) -
											Number(accounts?.total_expense_gcash || 0),
									)}
								</strong>
								<div className='bank-card-div-2  mt-4'>
									<p className='text-xs text-right'>Expiry date</p>
									<p className='text-sm text-center'>2/24</p>
								</div>
							</CardFooter>
						</Card>
					</div>
				</div>

				<div className='col-span-2 mt-10 p-10 pt-0'>
					<div className='flex items-center justify-between'>
						<h1>Transactions</h1>
						<Button
							className='bg-black text-white p-3'
							startContent={
								<span className='material-symbols-outlined'>move_up</span>
							}
							onPress={onOpen}>
							Transfer fund
						</Button>
					</div>

					<Table
						aria-label='Transaction table'
						classNames={{ th: 'bg-black text-white ', td: 'border-b-1' }}
						className='p-2 w-full rounded-none'
						removeWrapper>
						<TableHeader columns={columns}>
							{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
						</TableHeader>
						<TableBody
							items={accTransaction}
							emptyContent={<p>No transaction</p>}>
							{(item) => (
								<TableRow key={item.key}>
									{(columnKey) => (
										<TableCell>{renderCell(item, columnKey)}</TableCell>
									)}
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

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

/**
 * 
 * 	<div className='h-fit'>
				<div className='p-10 mb-5 border-b-[1px] flex space-x-4 items-center'>
					<span
						className='material-symbols-outlined'
						style={{ fontSize: '36px' }}>
						account_balance_wallet
					</span>
					<h1 className='font-semibold tracking-wide text-3xl text-left'>Accounts</h1>
				</div>
				<div className='grid grid-cols-2 lg:grid-cols-4 gap-5 col-span-1 p-10'>
					<Card className='border-1 border-black p-2 shadow-none'>
						<CardHeader className='flex items-start justify-between'>
							<span
								className='material-symbols-outlined col-span-2'
								style={{ fontSize: '36px' }}>
								contactless
							</span>
							<em className='text-right font-bold tracking-wide'>VISA</em>
						</CardHeader>
						<CardBody>
							<p className='font-bold tracking-wide text-2xl'>
								CASH AND CASH EQUIVALENTS
							</p>
						</CardBody>
						<CardFooter className='flex items-end justify-between'>
							<strong className='tracking-wide col-span-2 text-2xl mt-6'>
								{formatNumberDecimal(
									(Number(accounts?.total_payment_cash) || 0) +
										(Number(accounts?.total_payment_bank) || 0) +
										(Number(accounts?.total_payment_gcash) || 0),
								)}
							</strong>
							<div className='bank-card-div-2  mt-4'>
								<p className='text-xs text-right'>Expiry date</p>
								<p className='text-sm text-center'>2/24</p>
							</div>
						</CardFooter>
					</Card>
					<Card className='border-1 border-black p-2'>
						<CardHeader className='flex items-start justify-between'>
							<span
								className='material-symbols-outlined  col-span-2'
								style={{ fontSize: '36px' }}>
								contactless
							</span>
							<em className='text-right  font-bold tracking-wide'>VISA</em>
						</CardHeader>
						<CardBody>
							<p className=' font-bold tracking-wide text-2xl'>CASH</p>
						</CardBody>
						<CardFooter className='flex items-end justify-between'>
							<strong className=' tracking-wide col-span-2 text-2xl mt-6'>
								{formatNumber(
									Number(accounts?.total_payment_cash || 0) -
										Number(accounts?.total_expense_cash || 0),
								)}
							</strong>
							<div className='bank-card-div-2  mt-4'>
								<p className='text-xs text-right'>Expiry date</p>
								<p className='text-sm text-center'>2/24</p>
							</div>
						</CardFooter>
					</Card>

					<Card className='border-1 border-black p-2'>
						<CardHeader className='flex items-start justify-between'>
							<span
								className='material-symbols-outlined  col-span-2'
								style={{ fontSize: '36px' }}>
								contactless
							</span>
							<em className='text-right  font-bold tracking-wide'>VISA</em>
						</CardHeader>
						<CardBody>
							<p className=' font-bold tracking-wide text-2xl'>BANK</p>
						</CardBody>
						<CardFooter className='flex items-end justify-between'>
							<strong className=' tracking-wide col-span-2 text-2xl mt-6'>
								{formatNumber(
									Number(accounts?.total_payment_bank || 0) -
										Number(accounts?.total_expense_bank || 0),
								)}
							</strong>
							<div className='bank-card-div-2  mt-4'>
								<p className='text-xs text-right'>Expiry date</p>
								<p className='text-sm text-center'>2/24</p>
							</div>
						</CardFooter>
					</Card>

					<Card className='border-1 border-black p-2'>
						<CardHeader className='flex items-start justify-between'>
							<span
								className='material-symbols-outlined  col-span-2'
								style={{ fontSize: '36px' }}>
								contactless
							</span>
							<em className='text-right  font-bold tracking-wide'>VISA</em>
						</CardHeader>
						<CardBody>
							<p className=' font-bold tracking-wide text-2xl'>GCASH</p>
						</CardBody>
						<CardFooter className='flex items-end justify-between'>
							<strong className=' tracking-wide col-span-2 text-2xl mt-6'>
								{formatNumber(
									Number(accounts?.total_payment_gcash || 0) -
										Number(accounts?.total_expense_gcash || 0),
								)}
							</strong>
							<div className='bank-card-div-2  mt-4'>
								<p className='text-xs text-right'>Expiry date</p>
								<p className='text-sm text-center'>2/24</p>
							</div>
						</CardFooter>
					</Card>
				</div>
			</div>
 */
