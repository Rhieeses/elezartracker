'use client';
import Layout from '@/components/ui/layout';
import {
	Button,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
} from '@nextui-org/react';

import { LineChartReports } from '@/components/ui/chart';

export default function ReportsContent() {
	return (
		<Layout>
			<>
				<div className='p-10 border-b-[1px] flex justify-between items-center'>
					<div className='flex space-x-4'>
						<img
							src='/report.png'
							alt=''
							className='w-8 object-contain'
						/>

						<h1 className='font-bold tracking-wide text-3xl text-left'>Reports</h1>
					</div>
					<div className='flex items-center justify-end gap-2'>
						<Button
							endContent={
								<span className='material-symbols-outlined'>keyboard_arrow_down</span>
							}
							size='md'
							color='default'
							className='font-semibold'
							disableRipple
							disableAnimations
							variant='bordered'
							radius='sm'>
							Sort by
						</Button>
					</div>
				</div>
				<div className='w-full p-3'>
					<div className='flex items-center justify-center p-2 bg-green-100 border-2 border-green-500'>
						<h1 className='font-bold'>ANUAL EXPENSE REPORT</h1>
					</div>
					<div className='grid grid-cols-5'>
						<div className='col-span-2'>
							<table>
								<tbody>
									<td>Year</td>
									<td>2030</td>
								</tbody>
							</table>
						</div>
						<div className='col-span-3 p-5'>
							<div>
								<p className='font-bold text-xl'>QUARTER 1</p>
								<div className='border-1 p-2'>
									<LineChartReports />
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		</Layout>
	);
}
