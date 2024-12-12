'use client';
import { LineChart } from '@/components/ui/chart';
import Layout from '@/components/ui/layout';
import { ContentBox } from '@/components/ui/uiComponent';
import { DashboardData } from '@/backend/data/dataHooks';
import { formatNumberDecimal, calculatePercentageIncrease } from '@/utils/inputFormatter';
import { Spinner, User } from '@nextui-org/react';
import { PaymentData } from '@/backend/data/dataHooks';

export default function DashboardContent() {
	const { dashboard, loading, error } = DashboardData();
	const { payment, refetch } = PaymentData();

	if (loading) {
		return (
			<Layout>
				<div className='flex justify-center items-center h-[50rem]'>
					<Spinner />
					<p>Loading dashboard data...</p>
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
			<div className='bg-white grid gap-5 border-slate-400 m-5 grid-cols-2 md:grid-cols-4 lg:grid-cols-4'>
				<div className='flex space-x-4 col-span-2 lg:col-span-5 p-5'>
					<span
						className='material-symbols-outlined'
						style={{ fontSize: '36px' }}>
						equalizer
					</span>
					<h1 className='font-bold tracking-wide text-3xl text-left'>Dashboard</h1>
				</div>

				<ContentBox
					iconText='construction'
					labelText='Projects'
					strongText={dashboard.dashboard.total_projects}
					descriptionText={`${dashboard.dashboard.total_active_projects} active project `}
				/>

				<ContentBox
					iconText='attach_money'
					labelText='Total Revenue'
					strongText={formatNumberDecimal(dashboard.dashboard.revenue)}
					descriptionText={calculatePercentageIncrease(
						dashboard.dashboard.current_month_revenue,
						dashboard.dashboard.last_month_revenue,
					)}
				/>

				<ContentBox
					iconText='trending_up'
					labelText='Net Profit'
					strongText={formatNumberDecimal(dashboard.dashboard.net_profit)}
					descriptionText={calculatePercentageIncrease(
						dashboard.dashboard.current_month_income,
						dashboard.dashboard.last_month_income,
					)}
				/>

				<ContentBox
					iconText='trending_down'
					labelText='Expenses'
					strongText={formatNumberDecimal(dashboard.dashboard.expenses)}
					descriptionText={calculatePercentageIncrease(
						dashboard.dashboard.current_month_expenses,
						dashboard.dashboard.last_month_expenses,
					)}
				/>

				<div className='col-span-2 lg:col-span-3 h-fit'>
					<div className='bg-white rounded-2xl shadow-lg p-8 border-1'>
						<h1 className='font-semibold text-xl'>Revenue Graph</h1>

						<LineChart dashboard={dashboard} />
					</div>
				</div>

				<div className='col-span-2 lg:col-span-2'>
					<div className='bg-white rounded-2xl shadow-lg p-8 border-1 space-y-5'>
						<span>
							<h1 className='font-semibold text-xl'>Recent Sales</h1>
							<p className='text-default-500'>You made a total of {payment.length} sales.</p>
						</span>

						{payment.slice(0, 5).map((item) => (
							<div
								key={item.id}
								className='flex items-center justify-between'>
								<User
									name={item.name}
									description='Orchid Rose apartment'
									avatarProps={{
										showFallback: true,
										src:
											item.client_profilePicture && item.client_profilePicture !== 'null'
												? item.client_profilePicture
												: '/default_picture.png',
									}}
								/>

								<p className='text-green-600 text-lg'>{`+ ${formatNumberDecimal(
									item.payment_amount,
								)}`}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</Layout>
	);
}
