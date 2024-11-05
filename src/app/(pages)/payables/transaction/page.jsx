'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
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
} from '@nextui-org/react';

import Layout from '@/components/ui/layout';
import { formatDate, formatNumber } from '@/utils/inputFormatter';
import { IconTextBox } from '@/components/ui/uiComponent';
import PayableTableTransaction from '@/components/tables/payTransactionTb';
import { PaymentData, PayablesTransaction } from '@/backend/data/dataHooks';
import ConfirmDelete from '@/components/ui/confirmDelete';

export default function PayTransaction() {
	const { payableTransaction, loading, refetch } = PayablesTransaction();
	const [filterValue, setFilterValue] = useState('');
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const { isOpen: isConfirm, onOpen: openConfirm, onOpenChange: closeConfirm } = useDisclosure();

	const [invoice, setInvoice] = useState([]);
	const [viewId, setViewId] = useState(null);
	const [salesDelete, setSalesDelete] = useState(null);

	const [receiptData, setReceiptData] = useState({
		clientName: '',
		paymentDate: '',
		projectName: '',
		paymentAmount: '',
	});

	useEffect(() => {
		if (viewId) {
			if (invoice && invoice.length > 0) {
				setReceiptData({
					clientName: invoice[0].vendor_name,
					paymentDate: invoice[0].invoice_date,
					projectName: invoice[0].project_id,
					paymentAmount: invoice[0].amount,
				});
			}
		}
	}, [viewId, invoice]);

	const handleNavigate = () => {
		const { clientName, paymentDate, projectName, paymentAmount } = receiptData;
		console.log(receiptData);

		// Create a single params string
		const name = encodeURIComponent(clientName);
		const date = encodeURIComponent(paymentDate);
		const project = encodeURIComponent(projectName);
		const amount = encodeURIComponent(paymentAmount);

		// Open the URL in a new tab
		window.open(`/sales/${name}/${date}/${project}/${amount}`, '_blank');
	};

	const onSearchChange = useCallback((value) => {
		if (value) {
			setFilterValue(value);
		} else {
			setFilterValue('');
		}
	}, []);

	const modalPayment = (id) => {
		setViewId(id);
		onOpen();
	};

	const onClose = () => {
		onOpen(false);
		setViewId(null);
	};
	const handleDelete = (id) => {
		setSalesDelete(id);
		openConfirm(true);
	};

	const handleArchive = async (id) => {
		if (!id) {
			console.error('No expense ID provided for deletion');
			return;
		}
		try {
			await axios.patch(`/api/payablesTransaction-archive/${id}`);
			refetch();
		} catch (error) {
			console.error('Error deleting vendor:', error);
		}
	};

	const handleRowDelete = async () => {
		if (!salesDelete) {
			console.error('No expense ID provided for deletion');
			return;
		}
		try {
			await axios.delete(`/api/payableTransaction-delete/${salesDelete}`);
			refetch();
		} catch (error) {
			console.error('Error deleting vendor:', error);
		}
	};

	useEffect(() => {
		const fetchInvoiceData = async () => {
			if (viewId) {
				try {
					const response = await axios.get(`/api/payabletransaction-details/${viewId}`, {
						withCredentials: true,
					});
					setInvoice(response.data);
				} catch (error) {
					console.error('API Error:', error.response ? error.response.data : error.message);
				}
			}
		};

		fetchInvoiceData();
	}, [viewId]);

	return (
		<Layout>
			<div className='grid grid-cols-1 h-fit'>
				<PayableTableTransaction
					filterValue={filterValue}
					onSearchChange={onSearchChange}
					onRowSelect={modalPayment}
					onRowDelete={handleDelete}
					onRowArchive={handleArchive}
					payment={payableTransaction}
				/>
			</div>
			<Modal
				isOpen={isOpen}
				size='lg'
				hideCloseButton
				placement='top'
				aria-labelledby='sales details'
				aria-modal='true'
				role='dialog'
				onOpenChange={onOpenChange}>
				{invoice && invoice.length > 0
					? invoice.map((invoiceItem) => (
							<ModalContent key={invoiceItem.id}>
								{(onClose) => (
									<>
										<ModalHeader className='flex gap-1 mb-5'>
											<span className='material-symbols-outlined'>receipt</span>
											<p>Sales Details - #{invoiceItem.invoice_id}</p>
										</ModalHeader>
										<ModalBody>
											<div>
												<div className='grid grid-cols-3 gap-5 w-full'>
													<div className='flex border-[1px] col-span-3 p-5 rounded-md justify-between items-center'>
														<User
															name={invoiceItem.name}
															description={invoiceItem.vendor_services}
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
															<label className='block text-sm font-medium text-gray-700'>
																Payment Amount
															</label>
															<h1 className='font-bold text-2xl'>
																{formatNumber(invoiceItem.payment_amount)}
															</h1>
														</div>
													</div>

													<div className='grid grid-cols-2 gap-5 col-span-3 border-b-[1px] pb-5'>
														<IconTextBox
															iconText='event'
															labelText='PAYMENT DATE'
															contentText={formatDate(invoiceItem.payment_date)}
														/>

														<IconTextBox
															iconText='hourglass_bottom'
															labelText='PAYMENT TYPE'
															contentText={invoiceItem.payment_type}
														/>
														<div className='col-span-2'>
															<IconTextBox
																iconText='description'
																labelText='DESCRIPTION'
																contentText={invoiceItem.payment_description}
															/>
														</div>
													</div>
												</div>
											</div>
										</ModalBody>
										<ModalFooter className='flex justify-end'>
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
					: null}
			</Modal>

			<ConfirmDelete
				isOpen={isConfirm}
				onOpenChange={closeConfirm}
				confirmCallback={handleRowDelete}
			/>
		</Layout>
	);
}
