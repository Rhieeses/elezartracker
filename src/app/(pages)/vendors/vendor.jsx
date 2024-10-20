'use client';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/ui/layout';
import ConfirmDelete from '@/components/ui/confirmDelete';
import { Search } from '@/components/ui/search';
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

	console.log(vendor);

	const [formData, setFormData] = useState(initialFormData);
	const [file, setFile] = useState(null);
	const [loadingForm, setLoadingForm] = useState(false); //use later for success alert
	const [successMessage, setSuccessMessage] = useState(''); //use later for success alert
	const [errorMessage, setErrorMessage] = useState(''); //use later for success alert
	const [errorTable, setErrorTable] = useState('');
	const [loadingTable, setLoadingTable] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const filteredVendor = vendor.filter((vendorItem) =>
		vendorItem.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

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
			const response = await axios.post(`/api/edit-vendor/${editVendorId}`, submitData);
			console.log(response.data.message);
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

	const columns = [
		{ key: 'name', label: 'NAME' },
		{ key: 'contact', label: 'CONTACT' },
		{ key: 'address', label: 'ADDRESS' },
		{ key: 'services', label: 'SERVICES' },
		{ key: 'actions', label: 'ACTIONS' },
	];

	const getRows = () => {
		if (loadingTable) return [];
		if (errorTable) return [];

		// If vendor data is available
		return filteredVendor.length > 0
			? filteredVendor.map((vendorItem) => ({
					key: vendorItem.id,
					name: vendorItem.vendor_name,
					picture: vendorItem.vendor_picture,
					contact: vendorItem.vendor_contactNo,
					email: vendorItem.vendor_email,
					address: vendorItem.vendor_address,
					services: vendorItem.vendor_services,
			  }))
			: [];
	};

	const vendors = getRows();

	const renderCell = (vendor, columnKey) => {
		const cellValue = vendor[columnKey];

		switch (columnKey) {
			case 'name':
				return (
					<User
						avatarProps={{ radius: 'lg', src: vendor.picture }}
						description={vendor.vendor_name}
						name={cellValue}></User>
				);

			case 'contact':
				return (
					<div>
						{cellValue}
						<p className='text-blue-600'>{vendor.email}</p>
					</div>
				);
			case 'actions':
				return (
					<div className='relative flex items-center gap-2 justify-center'>
						<Tooltip
							content='Edit user'
							color='primary'>
							<Button
								isIconOnly
								color='primary'
								variant='flat'
								onPress={() => handleRowEdit(vendor.key)}>
								<span className='material-symbols-outlined text-lg text-blue-400 cursor-pointer active:opacity-50'>
									edit
								</span>
							</Button>
						</Tooltip>
						<Tooltip
							color='danger'
							content='Delete user'>
							<Button
								isIconOnly
								color='danger'
								variant='flat'
								onPress={() => handleRowDelete(vendor.key)}>
								<span className='material-symbols-outlined text-lg cursor-pointer active:opacity-50'>
									delete
								</span>
							</Button>
						</Tooltip>
					</div>
				);

			default:
				return cellValue;
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
														src: vendorItem.vendor_picture,
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
											onClick={onCloseEdit}
											className='bg-gray-300'>
											Close
										</Button>
										<Button
											color='primary'
											size='lg'
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
/**
 * <div className='p-10 flex justify-between items-center'>
					<div className='flex space-x-4'>
						<span
							className='material-symbols-outlined'
							style={{ fontSize: '36px' }}>
							local_shipping
						</span>
						<h1 className='font-semibold tracking-wide text-3xl text-left'>Vendors</h1>
					</div>
					<div className='flex items-center justify-end gap-2'>
						<div className='lg:w-[25rem] w-1/2 hidden lg:inline'>
							<Input
								isClearable
								type='text'
								color='default'
								variant='bordered'
								radius='sm'
								size='lg'
								placeholder='Type to search...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								startContent={<span className='material-symbols-outlined'>search</span>}
							/>
						</div>
						<Button
							color='secondary'
							className='text-white bg-black rounded-md p-3 tracking-wider '
							size='lg'
							onPress={onOpen}
							radius='none'>
							+ Add Vendor
						</Button>
					</div>
				</div>
 * 	<Table
						classNames={{ th: 'bg-slate-900 text-white', td: 'border-b-1' }}
						className='p-2 w-full rounded-none overflow-x-scroll lg:overflow-x-hidden'
						removeWrapper
						aria-label='vendors-list'>
						<TableHeader columns={columns}>
							{(column) => (
								<TableColumn
									key={column.uid}
									align={column.key === 'actions' ? 'center' : 'start'}>
									{column.label}
								</TableColumn>
							)}
						</TableHeader>
						<TableBody
							items={vendors}
							emptyContent={'No rows to display.'}>
							{(item) => (
								<TableRow key={item.id}>
									{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
								</TableRow>
							)}
						</TableBody>
					</Table>
 */
