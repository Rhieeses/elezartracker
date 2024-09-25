import { useEffect, useState } from 'react';
import { Select, SelectItem, Button, Input, Avatar, Textarea } from '@nextui-org/react';
import {
	capitalizeOnlyFirstLetter,
	allCapitalize,
	formatNumber,
	removeFormatting,
} from '@/utils/inputFormatter';
import axios from 'axios';

export default function AddExpense({ projectId, refetchExpenseProject }) {
	const initialFormData = {
		invoiceNo: '',
		vendor: '',
		purchaseDate: '',
		description: '',
		purchaseAmount: '',
		paymentType: '',
		projectId: projectId,
	};

	let categoryOptions = [
		{ label: 'CASH', value: 'CASH' },
		{ label: 'BANK TRANSFER', value: 'BANK TRANSFER' },
		{ label: 'GCASH', value: 'GCASH' },
	];
	const [formData, setFormData] = useState(initialFormData);
	const [vendor, setVendor] = useState([]);
	const [message, setMessage] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleInput = (field) => (event) => {
		const { value } = event.target;

		setFormData((prev) => ({
			...prev,
			[field]:
				field === 'purchaseAmount'
					? formatNumber(value.replace(/[^0-9.]/g, ''))
					: field === 'invoiceNo'
					? allCapitalize(value.startsWith('#') ? value : '#' + value)
					: capitalizeOnlyFirstLetter(value),
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const cleanedData = {
			...formData,
			purchaseAmount: removeFormatting(formData.purchaseAmount),
			invoiceNo: removeFormatting(formData.invoiceNo),
		};

		try {
			await axios.post('/api/add-expense', cleanedData);
			setMessage({
				success: 'Expense added successfully!',
				error: '',
			});
			setFormData(initialFormData);
			refetchExpenseProject();
		} catch (error) {
			setMessage({
				success: '',
				error: 'Failed to add expense. Please try again.',
			});
			console.error('Error:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const fetchVendor = async () => {
			//setLoading(true);
			try {
				const response = await axios.get('/api/vendor-select');
				setVendor(response.data);
			} catch (error) {
				console.error('Error fetching vendor data:', error);
			} finally {
				//setLoading(false);
			}
		};

		fetchVendor();
	}, []);
	return (
		<form
			onSubmit={handleSubmit}
			className='flex gap-4'>
			<Input
				type='text'
				label='Invoice'
				name='invoiceNo'
				variant='bordered'
				value={formData.invoiceNo}
				onChange={handleInput('invoiceNo')}
				placeholder='Enter your invoice no'
				isRequired
			/>
			<Select
				items={vendor}
				value={formData.vendor}
				onChange={handleInput('vendor')}
				label='Select vendor'
				variant='bordered'
				labelPlacement='inside'
				isRequired
				className='w-full col-span-4'>
				{(vendor) => (
					<SelectItem
						key={vendor.id}
						value={vendor.id}
						textValue={vendor.vendor_name}>
						<div className='flex gap-2 items-center'>
							<Avatar
								alt={vendor.vendor_name}
								className='flex-shrink-0'
								size='sm'
								src={vendor.vendor_picture}
							/>
							<div className='flex flex-col'>
								<span className='text-small'>{vendor.vendor_name}</span>
								<span className='text-tiny text-default-400'>{vendor.vendor_services}</span>
							</div>
						</div>
					</SelectItem>
				)}
			</Select>
			<Textarea
				type='text'
				label='Description'
				name='description'
				onChange={handleInput('description')}
				value={formData.description}
				variant='bordered'
				placeholder='Enter description'
				isRequired
				rows={0}
			/>
			<Input
				type='date'
				label='Purchase date'
				name='purchaseDate'
				value={formData.purchaseDate}
				onChange={handleInput('purchaseDate')}
				variant='bordered'
				isRequired
			/>

			<Select
				label='Category'
				name='paymentType'
				variant='bordered'
				value={formData.paymentType}
				onChange={handleInput('paymentType')}
				isRequired>
				{categoryOptions.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</Select>

			<Input
				type='text'
				label='Total amount'
				name='purchaseAmount'
				onChange={handleInput('purchaseAmount')}
				value={formData.purchaseAmount}
				variant='bordered'
				placeholder='Enter amount'
				isRequired
			/>
			<Button
				color='success'
				className='text-white bg-black tracking-wider '
				size='lg'
				type='submit'
				radius='md'>
				Add
			</Button>
		</form>
	);
}
