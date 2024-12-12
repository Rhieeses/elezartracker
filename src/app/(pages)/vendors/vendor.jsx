'use client';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/ui/layout';
import ConfirmDelete from '@/components/ui/confirmDelete';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	User,
	useDisclosure,
	Button,
	Select,
	SelectItem,
	Input,
	Table,
	TableBody,
	TableRow,
	TableColumn,
	TableHeader,
	TableCell,
	Tooltip,
} from '@nextui-org/react';
import { VendorData, VendorDataID } from '@/backend/data/dataHooks';
import { capitalizeFirstLetter, formatDate } from '@/utils/inputFormatter';
import { IconTextBox } from '@/components/ui/uiComponent';
import VendorTable from './vendorTable';

export default function VendorsContent() {
	const [deleteVendor, setDeleteVendor] = useState(null);
	const [editVendorId, setEditVendor] = useState(null);
	const onCloseEdit = () => {
		closeEdit();
		setEditVendor(null);
		setEditForm({
			vendorPicture: '',
			vendorName: '',
			vendorContact: '',
			vendorEmail: '',
			vendorServices: '',
			vendorAddress: '',
			imageFile: null,
		});
	};

	const { isOpen: isConfirm, onOpen: openConfirm, onOpenChange: closeConfirm } = useDisclosure();
	const { isOpen: isEdit, onOpen: openEdit, onOpenChange: closeEdit } = useDisclosure();

	const { vendor, loadingVendor, errorVendor, refetch } = VendorData();
	const { vendorDataId, loadingVendorId } = VendorDataID({ editVendorId });

	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const initialFormData = {
		vendorName: '',
		vendorService: '',
		vendorEmail: '',
		vendorContactNo: '',
		vendorAddress: '',
		vendorPicture: '',
	};

	const [formData, setFormData] = useState(initialFormData);
	const [file, setFile] = useState(null);
	const [loadingForm, setLoadingForm] = useState(false); //use later for success alert
	const [successMessage, setSuccessMessage] = useState(''); //use later for success alert
	const [errorMessage, setErrorMessage] = useState(''); //use later for success alert

	const [searchTerm, setSearchTerm] = useState('');
	const [filterValue, setFilterValue] = useState('');

	const filteredVendor = vendor.filter((vendorItem) =>
		vendorItem.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const onSearchChange = useCallback((value) => {
		if (value) {
			setFilterValue(value);
		} else {
			setFilterValue('');
		}
	}, []);

	const [editForm, setEditForm] = useState({
		vendorPicture: '',
		vendorName: '',
		vendorContact: '',
		vendorEmail: '',
		vendorServices: '',
		vendorAddress: '',
		imageFile: null,
	});

	useEffect(() => {
		if (vendorDataId && vendorDataId.length > 0) {
			setEditForm({
				vendorPicture: vendorDataId[0].vendor_picture,
				vendorName: vendorDataId[0].vendor_name,
				vendorContact: vendorDataId[0].vendor_contactNo,
				vendorEmail: vendorDataId[0].vendor_email,
				vendorServices: vendorDataId[0].vendor_services,
				vendorAddress: vendorDataId[0].vendor_address,
				imageFile: null,
			});
		}
	}, [vendorDataId]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setEditForm((prevData) => ({ ...prevData, [name]: value }));
	};

	const handleFileEdit = (e) => {
		const file = e.target.files[0];
		setEditForm((prev) => ({
			...prev,
			imageFile: file,
		}));
	};

	const handleEdit = async (e) => {
		e.preventDefault();

		const submitData = new FormData();
		for (const key in editForm) {
			if (key === 'imageFile' && !editForm[key]) {
				continue;
			}
			submitData.append(key, editForm[key]);
		}

		try {
			//console.log(editForm);
			await axios.put(`/api/edit-vendor/${editVendorId}`, submitData);
			closeEdit();
			refetch();
		} catch (error) {
			console.error('Failed to edit vendor:', error);
		}
	};

	//category for select form
	let categoryOptions = [
		{ label: 'Electrical Supplies', value: 'Electrical Supplies' },
		{ label: 'HVAC Supplies', value: 'HVAC Supplies' },
		{ label: 'Tools and Equipment', value: 'Tools and Equipment' },
		{ label: 'Landscaping Materials', value: 'Landscaping Materials' },
		{ label: 'Safety Gear', value: 'Safety Gear' },
		{ label: 'Others', value: 'Others' },
	];

	let x = 0;

	if (filteredVendor && filteredVendor.length > 0) {
		x = filteredVendor.length;
	}

	const handleInput = (field) => (event) => {
		const value = event.target.value;
		setFormData((prevData) => ({
			...prevData,
			[field]: capitalizeFirstLetter(value),
		}));
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setFile(file);
			return () => URL.revokeObjectURL(objectUrl);
		} else {
			setFile(null);
		}
	};

	const onCloseModal = () => {
		onOpenChange();
		setFormData(initialFormData);
		setFile(null);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const formDataToSubmit = new FormData();
		for (const key in formData) {
			formDataToSubmit.append(key, formData[key]);
		}
		if (file) {
			formDataToSubmit.append('vendorPicture', file);
		}

		setLoadingForm(true);
		setSuccessMessage('');
		setErrorMessage('');

		try {
			await axios.post('/api/add-vendor', formDataToSubmit);

			setSuccessMessage('Vendor added successfully!');
			setFormData(initialFormData);
			setFile(null);
			onCloseModal(); // Close modal after successful submission
			refetch();
		} catch (error) {
			setErrorMessage('Failed to add vendor. Please try again.');
			console.error('Error:', error);
		} finally {
			setLoadingForm(false);
		}
	};

	const handleRowEdit = (id) => {
		setEditVendor(id);
		openEdit(true);
	};

	const handleRowDelete = (row) => {
		setDeleteVendor(row);
		openConfirm(true);
	};

	const handleDelete = async () => {
		if (!deleteVendor) {
			console.error('No vendor ID provided for deletion');
			return;
		}
		try {
			await axios.delete(`/api/vendor-delete/${deleteVendor}`);
			refetch();
		} catch (error) {
			console.error('Error deleting vendor:', error);
		}
	};

	return (
		<Layout>
			<>
				<div className='grid grid-cols-1 gap-5 p-3 h-fit'>
					<VendorTable
						vendor={vendor}
						filterValue={filterValue}
						onSearchChange={onSearchChange}
						onRowSelect={handleRowEdit}
						onRowDelete={handleRowDelete}
						onOpen={onOpen}
					/>
				</div>
			</>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				placement='top-center'
				radius='sm'
				size='2xl'>
				<form onSubmit={handleSubmit}>
					<ModalContent>
						<>
							<ModalHeader className='flex gap-1 mb-5'>
								<span className='material-symbols-outlined'>storefront</span>
								<p>Create new vendor</p>
							</ModalHeader>
							<ModalBody>
								<div className='grid grid-cols-4 gap-5'>
									<Input
										type='text'
										label='Vendor name'
										variant='bordered'
										name='vendorName'
										value={formData.vendorName}
										onChange={handleInput('vendorName')}
										className='col-span-2'
										required
										isRequired
									/>

									<Select
										variant='bordered'
										label='Category'
										name='vendorService'
										value={formData.vendorService}
										onChange={handleInput('vendorService')}
										required
										isRequired
										className='col-span-2'>
										{categoryOptions.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</Select>

									<Input
										type='email'
										label='Email'
										variant='bordered'
										name='vendorEmail'
										value={formData.vendorEmail}
										onChange={handleInput('vendorEmail')}
										className='col-span-2'
									/>
									<Input
										type='number'
										label='Contact no.'
										variant='bordered'
										name='vendorContactNo'
										value={formData.vendorContactNo}
										onChange={handleInput('vendorContactNo')}
										className='col-span-2'
										required
										isRequired
									/>

									<Input
										type='text'
										label='Address'
										variant='bordered'
										name='vendorAddress'
										value={formData.vendorAddress}
										onChange={handleInput('vendorAddress')}
										className='col-span-4'
										required
										isRequired
									/>

									<Input
										type='file'
										variant='bordered'
										label='Upload photo'
										name='vendorPicture'
										accept='image/*'
										onChange={handleFileChange}
										className='col-span-2 w-fit'
									/>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button
									variant='bordered'
									size='lg'
									onClick={onCloseModal}
									radius='sm'
									className='bg-gray-300'>
									Close
								</Button>

								<Button
									size='lg'
									type='submit'
									loading={loadingForm}
									disabled={loadingForm}
									radius='sm'
									className='bg-black text-white'>
									Create
								</Button>
							</ModalFooter>
						</>
					</ModalContent>
				</form>
			</Modal>

			<Modal
				isOpen={isEdit}
				onOpenChange={closeEdit}
				placement='top'
				aria-labelledby='edit-vendor-title'
				aria-modal='true'
				radius='sm'
				role='dialog'
				size='2xl'>
				<form onSubmit={handleEdit}>
					{vendorDataId && vendorDataId.length > 0
						? vendorDataId.map((vendorItem) => (
								<ModalContent key={vendorItem.id}>
									<ModalHeader className='flex gap-1 mb-5'>
										<span className='material-symbols-outlined'>storefront</span>
										<p>Edit Vendor</p>
									</ModalHeader>
									<ModalBody>
										<div className='flex flex-col gap-5 w-full'>
											<div className='flex border-[1px] col-span-3 p-5 rounded-md justify-between items-center'>
												<User
													name={
														<Input
															name='vendorName'
															aria-label='vendorName'
															type='text'
															variant='none'
															onChange={handleChange}
															defaultValue={vendorItem.vendor_name}
														/>
													}
													description='Vendor'
													isBordered
													className='font-bold'
													avatarProps={{
														src:
															vendorItem.vendor_picture &&
															vendorItem.vendor_picture !== 'null'
																? vendorItem.vendor_picture
																: '/house1.jpg',

														style: {
															width: '70px',
															height: '70px',
														},
													}}
												/>
												<div className='flex flex-col items-center'>
													<Input
														type='file'
														color='primary'
														aria-label='image'
														className='w-fit w-[7rem]'
														style={{ backgroundColor: '#0000FF' }}
														variant='flat'
														onChange={handleFileEdit}
													/>
												</div>
											</div>

											<div className='flex w-full border-b-[1px]'>
												<IconTextBox
													iconText='phone'
													labelText='CONTACT NO.'
													inputDiv={
														<Input
															name='vendorContact'
															aria-label='vendorContact'
															type='number'
															variant='none'
															defaultValue={vendorItem.vendor_contactNo}
															onChange={handleChange}
														/>
													}
												/>

												<IconTextBox
													iconText='email'
													labelText='EMAIL'
													inputDiv={
														<Input
															name='vendorEmail'
															aria-label='vendorEmail'
															type='email'
															variant='none'
															defaultValue={vendorItem.vendor_email}
															onChange={handleChange}
														/>
													}
												/>

												<IconTextBox
													iconText='conveyor_belt'
													labelText='SERVICES'
													inputDiv={
														<Input
															name='vendorServices'
															aria-label='vendorServices'
															type='text'
															variant='none'
															defaultValue={vendorItem.vendor_services}
															onChange={handleChange}
														/>
													}
												/>
											</div>

											<div className='flex w-full justify-between'>
												<IconTextBox
													iconText='home'
													labelText='ADDRESS'
													inputDiv={
														<Input
															name='vendorAddress'
															aria-label='vendorAddress'
															type='text'
															variant='none'
															defaultValue={vendorItem.vendor_address}
															onChange={handleChange}
														/>
													}
												/>
												<IconTextBox
													iconText='schedule'
													labelText='JOINED'
													contentText={formatDate(vendorItem.vendor_dateJoined)}
												/>
											</div>
										</div>
									</ModalBody>
									<ModalFooter>
										<Button
											variant='bordered'
											size='lg'
											radius='sm'
											onClick={onCloseEdit}>
											Close
										</Button>
										<Button
											radius='sm'
											size='lg'
											className='bg-black text-white'
											startContent={
												<span className='material-symbols-outlined'>edit</span>
											}
											type='submit'>
											Edit
										</Button>
									</ModalFooter>
								</ModalContent>
						  ))
						: null}
				</form>
			</Modal>

			<ConfirmDelete
				isOpen={isConfirm}
				onOpenChange={closeConfirm}
				confirmCallback={handleDelete}
			/>
		</Layout>
	);
}
