'use client';
import Layout from '@/components/ui/layout';
import { useState, useEffect } from 'react';
import { Select, SelectItem, Button } from '@nextui-org/react';
import { formatNumberDecimal, formatDate, formatDateTime } from '@/utils/inputFormatter';
import axios from 'axios';

const months = [
	{ key: 1, label: 'January' },
	{ key: 2, label: 'February' },
	{ key: 3, label: 'March' },
	{ key: 4, label: 'April' },
	{ key: 5, label: 'May' },
	{ key: 6, label: 'June' },
	{ key: 7, label: 'July' },
	{ key: 8, label: 'August' },
	{ key: 9, label: 'September' },
	{ key: 10, label: 'October' },
	{ key: 11, label: 'November' },
	{ key: 12, label: 'December' },
];

const quarter = [
	{ key: 'Q1', label: 'Quarter 1' },
	{ key: 'Q2', label: 'Quarter 2' },
	{ key: 'Q3', label: 'Quarter 3' },
	{ key: 'Q4', label: 'Quarter 4' },
];

export default function ReportsContent() {
	const [timeFrame, setTimeframe] = useState('');
	const [month, setMonths] = useState('');
	const [year, setYear] = useState('');
	const [quarters, setQuarter] = useState('');
	const [reports, setReport] = useState(null);

	useEffect(() => {
		if (reports) {
			console.log(reports); // Log reports when it changes
			console.log(reports.customerAccounts);
		}
	}, [reports]);

	const currentYear = new Date().getFullYear();
	const yearRange = [];

	for (let year = currentYear - 3; year <= currentYear; year++) {
		yearRange.push({ key: year, label: year.toString() });
	}

	yearRange.sort((a, b) => b.key - a.key);

	const handleSelectionChange = (e) => {
		setTimeframe(e.target.value);
	};

	const handleMonthChange = (e) => {
		setMonths(e.target.value);
	};

	const handleMonthYear = (e) => {
		setYear(e.target.value);
	};

	const handleQuarterChange = (e) => {
		setQuarter(e.target.value);
	};

	//submit for monthly
	const handleSubmit = async (event) => {
		event.preventDefault();

		let formattedMonth = month;
		let selectedYear = year;
		try {
			const results = await axios.get('/api/generate-report', {
				params: {
					quarters,
					timeFrame,
					formattedMonth,
					selectedYear,
				},
			});
			setReport(results.data);
		} catch (error) {
			console.error('Error:', error);
		}
	};

	let reportTitle;

	if (reports) {
		switch (timeFrame) {
			case 'monthly':
				reportTitle = `${months[month - 1].label} ${year} reports`;
				break;

			case 'quarterly':
				switch (quarters) {
					case 'Q1':
						reportTitle = `Quarter 1 ${year} reports`;
						break;
					case 'Q2':
						reportTitle = `Quarter 2 ${year} reports`;
						break;
					case 'Q3':
						reportTitle = `Quarter 3 ${year} reports`;
						break;
					case 'Q4':
						reportTitle = `Quarter 4 ${year} reports`;
						break;
					default:
						reportTitle = `Not available`;
				}
				break;
			case 'annually':
				reportTitle = `${year} Annual reports`;
				break;
			default:
		}
	}

	return (
		<Layout>
			<div className='p-10 border-b-[1px] flex justify-between items-center'>
				<div className='flex space-x-4'>
					<img
						src='/report.png'
						alt=''
						className='w-8 object-contain'
					/>

					<h1 className='font-bold tracking-wide text-3xl text-left'>Reports</h1>
				</div>
			</div>
			{!reports ? (
				<div className='flex gap-5 flex-col items-center justify-center w-full h-full'>
					<h1>Choose a timeframe.</h1>
					<div className='flex items-start gap-5 '>
						<Select
							variant='bordered'
							size='lg'
							label='Select timeframe'
							labelPlacement='outside'
							selectedKeys={[timeFrame]}
							onChange={handleSelectionChange}
							className='max-w-md w-[20rem]'>
							<SelectItem key='monthly'>Monthly</SelectItem>
							<SelectItem key='quarterly'>Quarterly</SelectItem>
							<SelectItem key='annually'>Annually</SelectItem>
						</Select>

						{timeFrame === 'monthly' ? (
							<form
								onSubmit={handleSubmit}
								className='flex items-center justify-center'>
								<div className='space-y-10'>
									<Select
										variant='bordered'
										size='lg'
										label='Select Month'
										selectedKeys={[month]}
										onChange={handleMonthChange}
										labelPlacement='outside'
										className='max-w-md w-[20rem]'>
										{months.map((months) => (
											<SelectItem key={months.key}>{months.label}</SelectItem>
										))}
									</Select>

									<Select
										variant='bordered'
										size='lg'
										label='Select year'
										selectedKeys={[year]}
										onChange={handleMonthYear}
										labelPlacement='outside'
										className='max-w-md w-[20rem]'>
										{yearRange.map((year) => (
											<SelectItem key={year.key}>{year.label}</SelectItem>
										))}
									</Select>

									<Button
										type='submit'
										variant='bordered'
										className='bg-black text-white w-full'>
										Generate report
									</Button>
								</div>
							</form>
						) : null}

						{timeFrame === 'quarterly' ? (
							<form
								onSubmit={handleSubmit}
								className='flex items-center justify-center'>
								<div className='space-y-10'>
									<Select
										variant='bordered'
										size='lg'
										label='Select Quarter'
										selectedKeys={[quarters]}
										onChange={handleQuarterChange}
										labelPlacement='outside'
										className='max-w-md w-[20rem]'>
										{quarter.map((quarter) => (
											<SelectItem key={quarter.key}>{quarter.label}</SelectItem>
										))}
									</Select>

									<Select
										variant='bordered'
										size='lg'
										label='Select year'
										selectedKeys={[year]}
										onChange={handleMonthYear}
										labelPlacement='outside'
										className='max-w-md w-[20rem]'>
										{yearRange.map((year) => (
											<SelectItem key={year.key}>{year.label}</SelectItem>
										))}
									</Select>

									<Button
										type='submit'
										variant='bordered'
										className='bg-black text-white w-full'>
										Generate report
									</Button>
								</div>
							</form>
						) : null}

						{timeFrame === 'annually' ? (
							<form
								onSubmit={handleSubmit}
								className='space-y-5'>
								<Select
									variant='bordered'
									size='lg'
									label='Select year'
									selectedKeys={[year]}
									onChange={handleMonthYear}
									labelPlacement='outside'
									className='max-w-md w-[20rem]'>
									{yearRange.map((year) => (
										<SelectItem key={year.key}>{year.label}</SelectItem>
									))}
								</Select>

								<Button
									type='submit'
									variant='bordered'
									className='bg-black text-white w-full'>
									Generate report
								</Button>
							</form>
						) : null}
					</div>
				</div>
			) : (
				<>
					<div className='flex justify-start items-end m-4'>
						<span
							className='flex items-center cursor-pointer'
							onClick={() => setReport(null)}>
							<span
								className='material-symbols-outlined'
								style={{ fontSize: '24px' }}>
								chevron_left
							</span>
							{'Back'}
						</span>
					</div>
					<div className='flex items-center justify-center w-full p-10'>
						<div className='w-4/6'>
							<h1 className='font-bold text-slate-900 text-4xl p-10 pl-0'>{reportTitle}</h1>

							<div className='mb-[10rem]'>
								<span className='flex items-center gap-2 p-2'>
									<span
										className='material-symbols-outlined text-slate-800'
										style={{ fontSize: '36px' }}>
										incomplete_circle
									</span>

									<h1 className='font-bold'>Total Generated Value</h1>
								</span>

								<div className='grid grid-cols-2 gap-10 border-t-2 border-slate-800 p-5'>
									<div className='flex justify-between items-end border-1 border-default-600 p-5 rounded-xl'>
										<div className='space-y-2'>
											<span className='flex items-center gap-2'>
												<span
													className='material-symbols-outlined text-blue-500'
													style={{ fontSize: '42px' }}>
													work
												</span>
												<p className='text-xl text-default-600'>Projects Acquired</p>
											</span>

											<h1>{reports.generatedValue[0].project_acquired}</h1>
										</div>
									</div>

									<div className='flex justify-between items-end border-1 border-default-600 p-5 rounded-xl'>
										<div className='space-y-2'>
											<span className='flex items-center gap-2'>
												<span
													className='material-symbols-outlined text-blue-500'
													style={{ fontSize: '42px' }}>
													work
												</span>
												<p className='text-xl text-default-600'>Revenue</p>
											</span>

											<h1>{formatNumberDecimal(reports.generatedValue[0].revenue)}</h1>
										</div>
									</div>

									<div className='flex justify-between items-end border-1 border-default-600 p-5 rounded-xl'>
										<div className='space-y-2'>
											<span className='flex items-center gap-2'>
												<span
													className='material-symbols-outlined text-blue-500'
													style={{ fontSize: '42px' }}>
													attach_money
												</span>
												<p className='text-xl text-default-600'>Net Income</p>
											</span>
											<h1>
												{formatNumberDecimal(reports.generatedValue[0].net_income)}
											</h1>
										</div>
									</div>

									<div className='flex justify-between items-end border-1 border-default-600 p-5 rounded-xl'>
										<div className='space-y-2'>
											<span className='flex items-center gap-2'>
												<span
													className='material-symbols-outlined text-blue-500'
													style={{ fontSize: '42px' }}>
													attach_money
												</span>
												<p className='text-xl text-default-600'>Expenses</p>
											</span>
											<h1>{formatNumberDecimal(reports.generatedValue[0].expenses)}</h1>
										</div>
									</div>
								</div>
							</div>
							<div>
								<div className='border-b-2 border-slate-800 mb-5'>
									<div className='p-2 text-white rounded-t-xl bg-slate-800 w-fit '>
										<p className='text-xl'>Reports</p>
									</div>
								</div>

								<p className='font-bold text-md'>1. Customer Accounts Report</p>

								<div className='w-full flex items-center justify-center mt-5 mb-10'>
									<div className='w-5/6 space-y-10'>
										<table
											className='w-full border-b-1 border-slate-300'
											border='1'
											cellPadding='10'
											cellSpacing='0'>
											<thead className='border-b-2  border-slate-800'>
												<tr className='border-b-2 border-slate-800'>
													<td colSpan='2'>
														<h1>Customer Accounts Report</h1>
													</td>
												</tr>
												<tr>
													<td>No</td>
													<td>Client</td>
													<td>Contact</td>
													<td>Address</td>
													<td>Amount</td>
												</tr>
											</thead>
											<tbody>
												{reports.customerAccounts.map((customerAccounts, index) => (
													<tr key={index}>
														<td>{index + 1}</td>
														<td>{customerAccounts.client_name}</td>
														<td>{customerAccounts.client_email}</td>
														<td>{customerAccounts.client_address}</td>
														<td>
															{formatNumberDecimal(
																customerAccounts.total_paid_amount,
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>

								<p className='font-bold text-md'>2. Vendor Accounts Report</p>

								<div className='w-full flex items-center justify-center mt-5 mb-10'>
									<div className='w-5/6 space-y-10'>
										<table
											className='w-full border-b-1 border-slate-300'
											border='1'
											cellPadding='10'
											cellSpacing='0'>
											<thead className='border-b-2  border-slate-800'>
												<tr className='border-b-2 border-slate-800'>
													<td colSpan='2'>
														<h1>Vendor Accounts Report</h1>
													</td>
												</tr>
												<tr>
													<td>No</td>
													<td>Vendor name</td>
													<td>Contact</td>
													<td>Address</td>
													<td>Total orders</td>
													<td>Amount</td>
												</tr>
											</thead>

											<tbody>
												{reports.vendorAccounts.map((vendorAccounts, index) => (
													<tr key={index}>
														<td>{index + 1}</td>
														<td>{vendorAccounts.vendor_name}</td>
														<td>
															{vendorAccounts.vendor_email
																? vendorAccounts.vendor_email
																: vendorAccounts.vendor_contactNo}
														</td>
														<td>{vendorAccounts.vendor_address}</td>
														<td>{vendorAccounts.total_order}</td>
														<td>
															{formatNumberDecimal(
																vendorAccounts.total_expense_amount,
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>

								<p className='font-bold text-md'>3. Sales Report</p>

								<div className='w-full flex items-center justify-center mt-5 mb-10'>
									<div className='w-5/6 space-y-10'>
										<table
											className='w-full border-b-1 border-slate-300'
											border='1'
											cellPadding='10'
											cellSpacing='0'>
											<thead className='border-b-2  border-slate-800'>
												<tr className='border-b-2 border-slate-800'>
													<td colSpan='2'>
														<h1>Sales Report</h1>
													</td>
												</tr>
												<tr>
													<td>No</td>
													<td>Date</td>
													<td>Client</td>
													<td>Payment type</td>
													<td>Amount</td>
												</tr>
											</thead>
											<tbody>
												{reports.salesAccounts.map((salesAccounts, index) => (
													<tr key={index}>
														<td>{index + 1}</td>
														<td>{formatDate(salesAccounts.date)}</td>
														<td>{salesAccounts.client_name}</td>
														<td>{salesAccounts.payment_terms}</td>
														<td>{formatNumberDecimal(salesAccounts.amount)}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
								<p className='font-bold text-md'>4. Expense Report</p>

								<div className='w-full flex items-center justify-center mt-5 mb-10'>
									<div className='w-5/6 space-y-10'>
										<table
											className='w-full border-b-1 border-slate-300'
											border='1'
											cellPadding='10'
											cellSpacing='0'>
											<thead className='border-b-2  border-slate-800'>
												<tr className='border-b-2 border-slate-800'>
													<td colSpan='2'>
														<h1>Expense Report</h1>
													</td>
												</tr>
												<tr>
													<td>No</td>
													<td>Date</td>
													<td>Vendor</td>
													<td>Payment type</td>
													<td>Amount</td>
												</tr>
											</thead>
											<tbody>
												{reports.expenseAccounts.map((expenseAccounts, index) => (
													<tr key={index}>
														<td>{index + 1}</td>

														<td>{formatDate(expenseAccounts.purchase_date)}</td>
														<td>{expenseAccounts.vendor_name}</td>
														<td>{expenseAccounts.payment_type}</td>
														<td>
															{formatNumberDecimal(expenseAccounts.purchase_amount)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>

								<p className='font-bold text-md w-full'>5. Cash Flow Report</p>

								<div className='w-full flex items-center justify-center mt-5 mb-10'>
									<div className='w-1/8 space-y-10'>
										<table
											className='w-full border-b-1 border-slate-300'
											border='1'
											cellPadding='10'
											cellSpacing='0'>
											<thead className='border-b-2  border-slate-800'>
												<tr className='border-b-2 border-slate-800'>
													<td colSpan='2'>
														<h1>Cash Flow Report</h1>
													</td>
												</tr>
												<tr>
													<td>No</td>
													<td>Date</td>
													<td>Client/Vendor</td>
													<td>Description</td>
													<td>Credit</td>
													<td>Debit</td>
													<td>Balance</td>
												</tr>
											</thead>
											<tbody>
												{(() => {
													let currentBalance = 0; // Initialize the balance

													return reports.cashFlow.map((cashFlowAccounts, index) => {
														currentBalance += cashFlowAccounts.credit; // Add credit to balance
														currentBalance -= cashFlowAccounts.debit; // Subtract debit from balance

														return (
															<tr key={index}>
																<td>{index + 1}</td>
																<td>
																	{formatDate(cashFlowAccounts.transaction_date)}
																</td>
																<td>{cashFlowAccounts.name}</td>
																<td className='max-w-xs'>
																	{cashFlowAccounts.description}
																</td>
																<td>
																	{cashFlowAccounts.credit ? (
																		<p className='text-green-600'>
																			+
																			{formatNumberDecimal(
																				cashFlowAccounts.credit,
																			)}
																		</p>
																	) : null}
																</td>
																<td>
																	{cashFlowAccounts.debit ? (
																		<p className='text-red-600'>
																			-
																			{formatNumberDecimal(
																				cashFlowAccounts.debit,
																			)}
																		</p>
																	) : null}
																</td>
																<td>
																	<p className='text-blue-500'>
																		{formatNumberDecimal(currentBalance)}
																	</p>
																</td>
															</tr>
														);
													});
												})()}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</Layout>
	);
}

/**
 * 	<div>
								<div className='border-b-2 border-slate-800 mb-5'>
									<div className='p-2 text-white rounded-t-xl bg-slate-800 w-fit '>
										<p className='text-xl'>Income Statement</p>
									</div>
								</div>

								<p className='font-bold text-md'>
									For Year Ended September 28, 2019 (In thousands)
								</p>

								<div className='w-full flex items-center justify-center mt-5 mb-10'>
									<div className='w-5/6 space-y-10 border-1 border-default-700 h-[50rem] p-5'>
										<div className='flex justify-between '>
											<span className='space-y-3'>
												<p>NET SALES</p>
												<p>COST OF SALES</p>
												<p className='font-semibold p-3'>GROSS PROFIT</p>
											</span>
											<span className='text-end space-y-3 w-[8rem]'>
												<p>
													<strong className='mr-8'>₱</strong> 4,358,100
												</p>
												<p className='border-b-1 border-default-700'>2,738,714</p>
												<p className='font-semibold p-3 pr-0 border-b-2 border-default-700'>
													1,619,386
												</p>
											</span>
										</div>

										<div className='flex justify-between '>
											<span className='space-y-3'>
												<p>SELLING AND OPERATING EXPENSES</p>
												<p>GENERAL AND ADMINISTRATIVE EXPENSES</p>
												<p className='font-semibold p-3'>TOTAL OPERATING EXPENSES</p>
												<p className='font-semibold p-3 pt-0'>OPERATING INCOME</p>
											</span>
											<span className='text-end space-y-3 w-[8rem]'>
												<p>560,430</p>
												<p className='border-b-1 border-default-700'>293,729</p>
												<p className='font-semibold p-3 pr-0 border-b-2 border-default-700'>
													854,159
												</p>
												<p className='font-semibold'>765,227</p>
											</span>
										</div>

										<div className='flex justify-between '>
											<span className='space-y-3'>
												<p>OTHER INCOME</p>
												<p>GAIN (LOSS) ON FINANCIAL INSTRUMENTS</p>
												<p>(LOSS) GAIN ON FINANCIAL INSTRUMENTS</p>
												<p>INTEREST EXPENSE</p>
												<p className='font-semibold p-3'>GROSS PROFIT</p>
											</span>
											<span className='text-end space-y-3 w-[8rem]'>
												<p>960</p>
												<p>5,513</p>
												<p>(12,649)</p>
												<p className='border-b-2 border-default-700'>(18,177)</p>

												<p className='font-semibold p-3 pr-0'>1,619,386</p>
											</span>
										</div>

										<div className='flex justify-between '>
											<span className='space-y-3'>
												<p>INCOME TAX EXPENSE</p>
												<p className='font-semibold p-3'>NET INCOME</p>
											</span>
											<span className='text-end space-y-3 w-[8rem]'>
												<p className='border-b-1 border-default-700'>2,738,714</p>
												<p className='border-b-4 border-default-700 border-double'>
													<strong className='mr-8'>₱</strong> 4,358,100
												</p>
											</span>
										</div>
									</div>
								</div>
							</div>
 */

/**
 * 	<div>
							<div className='border-b-2 border-slate-800 mb-5'>
								<div className='p-2 text-white rounded-t-xl bg-slate-800 w-fit '>
									<p className='text-xl'>2024 Financial Highlights</p>
								</div>
							</div>

							<p className='font-bold text-md'>
								Summary Statement of Financial Position (in Php million)
							</p>

							<div className='w-full flex items-center justify-center mt-5 mb-10'>
								<div className='w-5/6 space-y-10'>
									<table
										className='w-full border-b-2 border-slate-800'
										border='1'
										cellPadding='10'
										cellSpacing='0'>
										<thead className='border-b-2 border-slate-800'>
											<tr>
												<td colSpan='2'>
													<h1>Assets</h1>
												</td>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colSpan='1'>
													<strong>Current Assets</strong>
												</td>
											</tr>
											<tr>
												<td>Cash and Cash Equivalents</td>
												<td>200,000</td>
											</tr>
											<tr>
												<td>Accounts Receivable</td>
												<td>150,000</td>
											</tr>

											<tr>
												<td>
													<strong>Total Current Assets</strong>
												</td>
												<td>
													<strong>450,000</strong>
												</td>
											</tr>
											<tr>
												<td colSpan='2'>
													<strong>Non-Current Assets</strong>
												</td>
											</tr>
											<tr>
												<td>Property, Plant, and Equipment</td>
												<td>500,000</td>
											</tr>
											<tr>
												<td>Construction Equipment</td>
												<td>300,000</td>
											</tr>

											<tr>
												<td>
													<strong>Total Non-Current Assets</strong>
												</td>
												<td>
													<strong>900,000</strong>
												</td>
											</tr>
											<tr>
												<td>
													<strong>Total Assets</strong>
												</td>
												<td>
													<strong>1,350,000</strong>
												</td>
											</tr>
										</tbody>
									</table>
									<table
										className='w-full border-b-2 border-slate-800'
										border='1'
										cellPadding='10'
										cellSpacing='0'>
										<thead className='border-b-2 border-slate-800'>
											<tr>
												<td colSpan='2'>
													<h1>Liabilities</h1>
												</td>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colSpan='1'>
													<strong>Current Liabilities </strong>
												</td>
											</tr>
											<tr>
												<td>Short-Term Loans</td>
												<td>200,000</td>
											</tr>

											<tr>
												<td>
													<strong>Total Current Liabilities</strong>
												</td>
												<td>
													<strong>450,000</strong>
												</td>
											</tr>
											<tr>
												<td colSpan='2'>
													<strong>Non-Current Assets</strong>
												</td>
											</tr>
											<tr>
												<td>Long-Term Debt </td>
												<td>500,000</td>
											</tr>
											<tr>
												<td>Construction Equipment</td>
												<td>300,000</td>
											</tr>

											<tr>
												<td>
													<strong>Total Non-Current Assets</strong>
												</td>
												<td>
													<strong>900,000</strong>
												</td>
											</tr>
											<tr>
												<td>
													<strong>Total Liabilities </strong>
												</td>
												<td>
													<strong>1,350,000</strong>
												</td>
											</tr>
										</tbody>
									</table>

									<table
										className='w-full border-b-2 border-slate-800'
										border='1'
										cellPadding='10'
										cellSpacing='0'>
										<thead className='border-b-2 border-slate-800'>
											<tr>
												<td colSpan='2'>
													<h1>Equity</h1>
												</td>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colSpan='2'>Owner’s Equity</td>
												<td>200,000</td>
											</tr>

											<tr>
												<td colSpan='2'>
													<strong>Total Equity</strong>
												</td>
												<td>
													<strong>450,000</strong>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>

							<p className='font-bold text-md'>
								Summary Statement of Income (in Php million)
							</p>

							<div className='w-full flex items-center justify-center mt-5 mb-20'>
								<div className='w-5/6 space-y-10'>
									<table
										className='w-full border-b-2 border-slate-800'
										border='1'
										cellPadding='10'
										cellSpacing='0'>
										<thead className='border-b-2 border-slate-800'>
											<tr>
												<td colSpan='2'>
													<h1>Assets</h1>
												</td>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colSpan='1'>
													<strong>Current Assets</strong>
												</td>
											</tr>
											<tr>
												<td>Cash and Cash Equivalents</td>
												<td>200,000</td>
											</tr>
											<tr>
												<td>Accounts Receivable</td>
												<td>150,000</td>
											</tr>

											<tr>
												<td>
													<strong>Total Current Assets</strong>
												</td>
												<td>
													<strong>450,000</strong>
												</td>
											</tr>
											<tr>
												<td colSpan='2'>
													<strong>Non-Current Assets</strong>
												</td>
											</tr>
											<tr>
												<td>Property, Plant, and Equipment</td>
												<td>500,000</td>
											</tr>
											<tr>
												<td>Construction Equipment</td>
												<td>300,000</td>
											</tr>

											<tr>
												<td>
													<strong>Total Non-Current Assets</strong>
												</td>
												<td>
													<strong>900,000</strong>
												</td>
											</tr>
											<tr>
												<td>
													<strong>Total Assets</strong>
												</td>
												<td>
													<strong>1,350,000</strong>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
 */
