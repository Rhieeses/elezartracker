'use client';
import { PieChart, LineChart } from '@/components/ui/chart';
import { ContentBox } from '@/components/ui/uiComponent';
import { DashboardData } from '@/backend/data/dataHooks';
import { formatNumber } from '@/utils/inputFormatter';
import { Spinner } from '@nextui-org/react';

export default function AdminDashboard() {
	const { dashboard, loading, error } = DashboardData();

	if (loading) {
		return (
			<div className='absolute top-1/2 left-1/2 text-center'>
				<Spinner />
				<p>Loading dashboard data...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='absolute top-1/2 left-1/2 text-center'>
				<h2>Error loading dashboard data</h2>
				<p>{error.message}</p>
			</div>
		);
	}

	return (
		<div className='bg-[#fafafa] grid gap-5 border-slate-400 m-5 grid-cols-1 md:grid-cols-4 lg:grid-cols-4'>
			<ContentBox
				iconText='construction'
				labelText='Total projects'
				strongText={dashboard.dashboard.total_projects}
				descriptionText='All active and completed projects'
			/>

			<ContentBox
				iconText='trending_up'
				labelText='Total Revenue'
				strongText={formatNumber(dashboard.dashboard.revenue)}
				descriptionText='Total revenue'
			/>
			<ContentBox
				iconText='trending_up'
				labelText='Total Income'
				strongText={formatNumber(dashboard.dashboard.income)}
				descriptionText='Total income'
			/>

			<ContentBox
				iconText='trending_down'
				labelText='Total Expenses'
				strongText={formatNumber(dashboard.dashboard.expenses)}
				descriptionText='Total expenses'
			/>

			<div className='col-span-1 sm:col-span-1 sm:col-span-2 lg:col-span-3 h-fit'>
				<div className='flex group-hover:text-black'>
					<h1>Revenue</h1>
				</div>
				<LineChart dashboard={dashboard} />
			</div>

			<div className='h-fit'>
				<div className='flex group-hover:text-black'>
					<h1>Financial Overview</h1>
				</div>
				<PieChart dashboard={dashboard} />
			</div>
		</div>
	);
}
