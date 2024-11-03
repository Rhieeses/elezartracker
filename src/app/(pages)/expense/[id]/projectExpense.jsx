'use client';
import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	User,
	Button,
	useDisclosure,
	Textarea,
	Spinner,
} from '@nextui-org/react';

import Layout from '@/components/ui/layout';
import { formatDate, formatNumber } from '@/utils/inputFormatter';
import { IconTextBox } from '@/components/ui/uiComponent';
import ExpenseProjectTable from '@/components/tables/expenseProjectTable';
import { ExpenseDataInvoice, ExpenseProjectView } from '@/backend/data/dataHooks';
import ConfirmDelete from '@/components/ui/confirmDelete';
import ScanModal from '@/components/ui/scanModal';
import { ProjectName } from '@/backend/data/dataHooks';

export default function ExpenseProject({ id }) {
	const projectId = id.id;

	const [viewIdExpense, setViewIdExpense] = useState(null);
	const [deletExpenseId, setDeleteExpense] = useState(null);
	const { invoiceExpense, loading } = ExpenseDataInvoice({ viewIdExpense });
	const { loadingExpense, error, refetchExpenseProject } = ExpenseProjectView({
		projectId,
	});
	const { projectName } = ProjectName({ projectId });

	const [filterValue, setFilterValue] = useState('');
	const onSearchChange = useCallback((value) => {
		if (value) {
			setFilterValue(value);
		} else {
			setFilterValue('');
		}
	}, []);

	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
	const { isOpen: isConfirm, onOpen: openConfirm, onOpenChange: closeConfirm } = useDisclosure();
	const {
		isOpen: isScanModal,
		onOpen: openScanModal,
		onOpenChange: closeScanModal,
	} = useDisclosure();

	const modalPayment = (id) => {
		setViewIdExpense(id);
		onOpen();
	};

	const handleRowDelete = (id) => {
		setDeleteExpense(id);
		openConfirm(true);
	};

	const handleDelete = async () => {
		if (!deletExpenseId) {
			console.error('No expense ID provided for deletion');
			return;
		}
		try {
			await axios.delete(`/api/expense-delete/${deletExpenseId}`);
			refetchExpenseProject();
		} catch (error) {
			console.error('Error deleting expense:', error);
		}
	};

	if (loadingExpense) {
		return (
			<Layout>
				<div className='flex justify-center items-center h-[50rem]'>
					<Spinner />
					<p>Loading Expense data...</p>
				</div>
			</Layout>
		);
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
			<div className='grid grid-cols-1 p-5 h-fit'>
				<ExpenseProjectTable
					filterValue={filterValue}
					onSearchChange={onSearchChange}
					onRowSelect={modalPayment}
					projectId={projectId}
					onRowDelete={handleRowDelete}
					openScanModal={openScanModal}
					projectName={projectName}
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
												<div className='col-span-2'>
													<p className='text-default-500 text-sm'>Receipt ref. :</p>
													<p className='text-blue-500'>receipt.jpg</p>
												</div>
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
														label={
															<div className='flex gap-2'>
																<span className='material-symbols-outlined'>
																	receipt_long
																</span>
																<p>Details</p>
															</div>
														}
														classNames={{ label: 'font-bold' }}
														labelPlacement='outside'
														className=''
														readOnly
														variant='bordered'
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
											onPress={onClose}>
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

			<ConfirmDelete
				isOpen={isConfirm}
				onOpenChange={closeConfirm}
				confirmCallback={handleDelete}
			/>

			<ScanModal
				projectId={projectId}
				isOpen={isScanModal}
				onOpenChange={closeScanModal}
				refetchExpenseProject={refetchExpenseProject}
			/>
		</Layout>
	);
}

{
}
