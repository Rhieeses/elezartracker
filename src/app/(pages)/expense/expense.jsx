'use client';
import React from 'react';
import { useState, useCallback } from 'react';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	User,
	Button,
	useDisclosure,
	Input,
	Textarea,
	Divider,
	Link,
	Spinner,
} from '@nextui-org/react';
import axios from 'axios';

import Layout from '@/components/ui/layout';
import { formatDate, formatNumber } from '@/utils/inputFormatter';
import { IconTextBox } from '@/components/ui/uiComponent';
import ExpenseTable from '@/components/tables/expenseTable';
import { ExpenseData, ExpenseDataInvoice, ProjectData } from '@/backend/data/dataHooks';
import ConfirmDelete from '@/components/ui/confirmDelete';

export default function ExpenseContent() {
	const [viewIdExpense, setViewIdExpense] = useState(null);
	const { expense, refetch } = ExpenseData();
	const { invoiceExpense, loading } = ExpenseDataInvoice({ viewIdExpense });
	const { project } = ProjectData();
	const [searchTerm, setSearchTerm] = useState('');
	const [filterValue, setFilterValue] = useState('');
	const [expenseDelete, seteExpenseDelete] = useState(null);

	const filteredProjects = project.filter(
		(projectItem) =>
			projectItem.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			projectItem.client_firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			projectItem.client_lastName.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const onSearchChange = useCallback((value) => {
		if (value) {
			setFilterValue(value);
		} else {
			setFilterValue('');
		}
	}, []);

	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const {
		isOpen: isOpenCreate,
		onOpen: onOpenCreate,
		onOpenChange: onOpenChangeCreate,
	} = useDisclosure();

	const { isOpen: isConfirm, onOpen: openConfirm, onOpenChange: closeConfirm } = useDisclosure();

	const onClose = () => {
		onOpenChange(false);
		setViewIdExpense(null);
	};

	const modalPayment = (id) => {
		setViewIdExpense(id);
		onOpen();
	};

	const handleDelete = (id) => {
		seteExpenseDelete(id);
		openConfirm(true);
	};

	const handleRowDelete = async () => {
		if (!expenseDelete) {
			console.error('No expense ID provided for deletion');
			return;
		}
		try {
			await axios.delete(`/api/expense-delete/${expenseDelete}`);
			refetch();
		} catch (error) {
			console.error('Error deleting vendor:', error);
		}
	};

	return (
		<Layout>
			<div className='grid grid-cols-1 h-fit'>
				<ExpenseTable
					filterValue={filterValue}
					onSearchChange={onSearchChange}
					onRowSelect={modalPayment}
					onRowDelete={handleDelete}
					expense={expense}
					onOpenCreate={onOpenCreate}
				/>
			</div>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				placement='top'
				isDismissable={false}
				onClose={onClose}
				size='lg'
				aria-modal='true'
				role='dialog'
				aria-labelledby='dialog-title'>
				{invoiceExpense && invoiceExpense.length > 0 ? (
					invoiceExpense.map((invoiceItem) => (
						<ModalContent key={invoiceItem.id}>
							{(onClose) => (
								<>
									<ModalHeader className='flex gap-1'>
										<span className='material-symbols-outlined text-red-400'>
											Receipt
										</span>
										Expenses Invoice
									</ModalHeader>
									<ModalBody>
										{loading ? (
											<Spinner />
										) : (
											<div className='grid grid-cols-2 gap-5 w-full'>
												<div className='flex border-[1px] col-span-3 p-5 rounded-md justify-between items-center'>
													<User
														name={invoiceItem.vendor_name}
														description='Client'
														isBordered
														className='font-bold'
														avatarProps={{
															src: invoiceItem.vendor_picture,
															style: {
																width: '70px',
																height: '70px',
															},
														}}
													/>

													<div>
														<p className='self-center font-semibold'>
															{invoiceItem.project_name}
														</p>
														<p className='text-xs text-gray-400'>Project name</p>
													</div>
												</div>

												<div className='grid grid-cols-2 gap-5 col-span-3 border-b-[1px] p-5'>
													<IconTextBox
														iconText='paid'
														labelText='PAYMENT TYPE'
														contentText={invoiceItem.payment_type}
													/>

													<IconTextBox
														iconText='event'
														labelText='PURCHASE DATE'
														contentText={formatDate(invoiceItem.purchase_date)}
													/>
												</div>

												<div className='grid col-span-2 p-5'>
													<Textarea
														label='DETAILS'
														color='primary'
														className=''
														variant='flat'
														value={invoiceItem.expense_description}
													/>
												</div>

												<div className='col-span-2 flex flex-col items-end'>
													<label className='block text-sm font-medium text-gray-700'>
														Total amount
													</label>
													<span className='mt-1 text-xl font-bold'>
														{formatNumber(invoiceItem.purchase_amount)}
													</span>
												</div>
											</div>
										)}
									</ModalBody>
									<ModalFooter>
										<Button
											color='none'
											variant='bordered'
											size='lg'
											onClick={onClose}>
											Cancel
										</Button>
									</ModalFooter>
								</>
							)}
						</ModalContent>
					))
				) : (
					<div className='flex w-full items-center'>
						<p>No details for this invoice :(.</p>
					</div>
				)}
			</Modal>

			<Modal
				backdrop='opaque'
				size='lg'
				placement='top'
				isOpen={isOpenCreate}
				onOpenChange={onOpenChangeCreate}
				onClose={onOpenChangeCreate}
				motionProps={{
					variants: {
						enter: {
							y: 0,
							opacity: 1,
							transition: {
								duration: 0.3,
								ease: 'easeOut',
							},
						},
						exit: {
							y: -20,
							opacity: 0,
							transition: {
								duration: 0.2,
								ease: 'easeIn',
							},
						},
					},
				}}>
				<ModalContent>
					{(onOpenChangeCreate) => (
						<>
							<ModalHeader className='flex flex-col gap-1 items-center'>
								<span
									className='material-symbols-outlined text-blue-400'
									style={{ fontSize: '64px' }}>
									Receipt
								</span>
								<p className='text-lg'>Create Expenses</p>
								<p className='text-slate-500 text-sm font-normal'>
									Add an expenses to your project
								</p>
							</ModalHeader>
							<ModalBody>
								<>
									<div className='flex flex-col items-start w-full'>
										<Input
											type='search'
											name='search'
											size='md'
											color='primary'
											variant='flat'
											placeholder='Search project...'
											className='font-bold w-full'
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											startContent={
												<span className='material-symbols-outlined'>search</span>
											}
										/>
										<div className='w-full max-h-[550px] overflow-y-auto  no-scrollbar'>
											{filteredProjects && filteredProjects.length > 0 ? (
												filteredProjects.map((projectItem) => (
													<Link
														key={projectItem.id}
														className='flex flex-col mt-5'
														href={`/expense/${projectItem.id}`}>
														<User
															name={projectItem.project_name}
															isFocusable={true}
															description={`${projectItem.client_firstName} ${projectItem.client_lastName}`}
															className='flex justify-start w-full pl-1 pb-3 pt-3 text-lg hover:bg-default-200 cursor-pointer rounded-none'
															avatarProps={{
																src: projectItem.project_projectPicture,
																size: 'lg',
															}}
														/>
														<Divider />
													</Link>
												))
											) : (
												<div className='flex justify-center text-slate-400 w-full'>
													<p>No result</p>
												</div>
											)}
										</div>
									</div>
								</>
							</ModalBody>
							<ModalFooter>
								<Button
									color='none'
									variant='bordered'
									size='lg'
									onPress={onOpenChangeCreate}>
									Cancel
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<ConfirmDelete
				isOpen={isConfirm}
				onOpenChange={closeConfirm}
				confirmCallback={handleRowDelete}
			/>
		</Layout>
	);
}
