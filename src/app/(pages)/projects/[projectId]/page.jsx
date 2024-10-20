'use client';
import { useState, useEffect } from 'react';
import Pagelayout from '@/app/(pages)/projects/[projectId]/pageLayout';
import {
	Spinner,
	Progress,
	Table,
	TableRow,
	TableBody,
	TableColumn,
	TableHeader,
	TableCell,
	User,
} from '@nextui-org/react';
import {
	formatNumber,
	formatNumberDecimal,
	calculateDateDifference,
	formatDate,
} from '@/utils/inputFormatter';
import { ProjectDataId } from '@/backend/data/dataHooks';
import { projectHealthNotif } from '@/backend/data/notification';
import { TopVendorData } from '@/backend/data/dataHooks';

export default function ProjectView({ params }) {
	const projectId = params.projectId;
	const { topVendor } = TopVendorData({ projectId });

	console.log(topVendor);

	const { project, loading, error } = ProjectDataId({ projectId });

	if (loading) {
		return (
			<Pagelayout>
				<div className='absolute top-1/2 left-1/2 text-center'>
					<Spinner />
					<p>Loading Project data...</p>
				</div>
			</Pagelayout>
		);
	}

	if (error) {
		return (
			<Pagelayout>
				<div className='absolute top-1/2 left-1/2 text-center'>
					<h2>Error loading Project data</h2>
					<p>{error.message}</p>
				</div>
			</Pagelayout>
		);
	}

	return (
		<Pagelayout
			projectId={projectId}
			projectName={project.projectDetails.project_name}
			projectPicture={project.projectDetails.project_projectPicture}
			desciption={project.projectDetails.project_description}>
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-10 h-fit p-10'>
				<div className='rounded border p-2'>
					<p className='font-bold text-md'>BALANCE</p>
					<div className='flex items-center space-x-2'>
						<span
							className='material-symbols-sharp'
							aria-label='contract price icon'>
							payments
						</span>
						<p className='text-lg font-semibold'>
							{formatNumber(project.projectDetails.project_contractPrice)}
						</p>
					</div>
					<Progress
						size='md'
						radius='none'
						classNames={{
							base: 'max-w-md',
							track: 'drop-shadow-md border border-default',
							indicator: 'bg-gradient-to-r from-yellow-500 to-green-500',
							label: 'tracking-wider font-medium text-default-600',
							value: 'text-foreground/60 text-end',
						}}
						label={`${formatNumber(project.projectAccounts.total_paid)} / ${formatNumber(
							project.projectAccounts.contract_price,
						)}`} //'$975,000.00 / $1,500,000.00 paid'
						value={Math.round(
							project.projectAccounts.total_paid / project.projectAccounts.contract_price,
						)}
						showValueLabel={true}
					/>
				</div>

				<div className='rounded border p-2'>
					<p className='font-bold text-md'>BUDGET</p>
					<div className='flex items-center space-x-2'>
						<span
							className='material-symbols-sharp'
							aria-label='payments icon'>
							savings
						</span>
						<p className='text-lg font-semibold'>
							{formatNumberDecimal(
								project.projectAccounts.total_paid - project.projectAccounts.total_expenses,
							)}
						</p>
					</div>
					<Progress
						size='md'
						radius='none'
						classNames={{
							base: 'max-w-md',
							track: 'drop-shadow-md border border-default',
							indicator: 'bg-gradient-to-r from-yellow-500 to-green-500',
							label: 'tracking-wider font-medium text-default-600',
							value: 'text-foreground/60 text-end',
						}}
						label={`${formatNumberDecimal(
							project.projectAccounts.total_paid - project.projectAccounts.total_expenses,
						)} / ${formatNumberDecimal(project.projectAccounts.contract_price * 0.7)}`}
						value={Math.round(
							((project.projectAccounts.total_paid -
								project.projectAccounts.total_expenses) /
								(project.projectAccounts.contract_price * 0.3)) *
								100,
						)}
						showValueLabel={true}
					/>
				</div>

				<div className='rounded border p-2'>
					<p className='font-bold text-md'>PAYMENTS</p>
					<div className='flex items-center space-x-2'>
						<span
							className='material-symbols-sharp'
							aria-label='expenses icon'>
							payments
						</span>
						<p className='text-lg font-semibold'>
							{formatNumberDecimal(project.projectAccounts.total_paid)}
						</p>
					</div>
					<Progress
						size='md'
						radius='none'
						classNames={{
							base: 'max-w-md',
							track: 'drop-shadow-md border border-default',
							indicator: 'bg-gradient-to-r from-yellow-500 to-green-500',
							label: 'tracking-wider font-medium text-default-600',
							value: 'text-foreground/60 text-end',
						}}
						label={`${formatNumber(
							project.projectAccounts.contract_price - project.projectAccounts.total_paid,
						)} / ${formatNumber(project.projectAccounts.contract_price)} remaining`}
						value={Math.round(
							project.projectAccounts.total_paid / project.projectAccounts.contract_price,
						)}
						showValueLabel={true}
					/>
				</div>
				<div className='rounded border p-2'>
					<p className='font-bold text-md'>EXPENSES</p>
					<div className='flex items-center space-x-2'>
						<span
							className='material-symbols-sharp'
							aria-label='payments icon'>
							payments
						</span>
						<p className='text-lg font-semibold'>
							{formatNumberDecimal(project.projectAccounts.total_expenses)}
						</p>
					</div>
					<Progress
						size='md'
						radius='none'
						classNames={{
							base: 'max-w-md',
							track: 'drop-shadow-md border border-default',
							indicator: 'bg-gradient-to-r from-yellow-500 to-green-500',
							label: 'tracking-wider font-medium text-default-600',
							value: 'text-foreground/60 text-end',
						}}
						label={`${formatNumberDecimal(
							project.projectAccounts.total_expenses,
						)} / ${formatNumberDecimal(
							project.projectAccounts.contract_price * 0.7 -
								project.projectAccounts.total_expenses,
						)}`} //'$850,000.00 / $1,500,000.00 expended'
						value={Math.round(
							(project.projectAccounts.total_expenses /
								(project.projectAccounts.contract_price * 0.7)) *
								100,
						)}
						showValueLabel={true}
					/>
				</div>

				<div className='col-span-2 lg:col-span-3 grid grid-cols-2 p-2 border-1'>
					<div className='space-x-5'>
						<span>
							<p className='font-bold text-xs'>CONTRACT PRICE</p>
							<h1>{formatNumberDecimal(project.projectAccounts.contract_price)}</h1>
						</span>
						<span>
							<p className='font-bold text-xs'>DOWNPAYMENT</p>
							<h1>{project.projectDetails.downpayment}%</h1>
						</span>
						<span>
							<p className='font-bold text-xs'>CLIENT</p>
							<h1 className='text-blue-500 cursor-pointer'>
								{project.projectDetails.client_firstName}{' '}
								{project.projectDetails.client_lastName}
							</h1>
						</span>
					</div>
					<div className='space-x-5'>
						<span>
							<p className='font-bold text-xs'>ADDRESS</p>
							<h1>{project.projectDetails.project_address}</h1>
						</span>
						<span>
							<p className='font-bold text-xs'>DURATION</p>
							<h1>
								{calculateDateDifference(
									project.projectDetails.project_startDate,
									project.projectDetails.project_endDate,
								)}
							</h1>
							<p>
								{formatDate(project.projectDetails.project_startDate)} -{' '}
								{formatDate(project.projectDetails.project_endDate)}
							</p>
						</span>
					</div>
					<div className='col-span-2 mt-5'>
						<span>
							<p className='font-bold text-xs'>DESCRIPTION</p>
							<p>{project.projectDetails.project_description}</p>
						</span>
					</div>
				</div>
				{projectHealthNotif(
					project.projectAccounts.total_paid - project.projectAccounts.total_expenses,
					project.projectDetails.warningvalue,
				)}
				<div className='col-span-4 text-center'>
					<h1>Top vendors</h1>
					<Table
						aria-label='table'
						classNames={{ th: 'bg-slate-900 text-white', td: 'border-b-1' }}
						className='p-2 w-full rounded-none'>
						<TableHeader>
							<TableColumn>No</TableColumn>
							<TableColumn>Vendor</TableColumn>
							<TableColumn>Total order</TableColumn>
							<TableColumn>Total amount</TableColumn>
						</TableHeader>
						<TableBody emptyContent={'No vendor found'}>
							{topVendor.map((vendorItem, index) => (
								<TableRow key={vendorItem?.id}>
									<TableCell>{index + 1}</TableCell>
									<TableCell>
										<User
											avatarProps={{ radius: 'lg', src: vendorItem?.vendor_picture }}
											name={vendorItem?.vendor_name}
											description={vendorItem?.vendor_services}
										/>
									</TableCell>
									<TableCell>{vendorItem?.total_expenses}</TableCell>
									<TableCell>
										{formatNumberDecimal(vendorItem?.total_purchase_amount)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</Pagelayout>
	);
}
