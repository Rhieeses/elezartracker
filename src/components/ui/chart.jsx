// components/Charts.js
import { useState, useEffect } from 'react';
import { formatNumber } from '@/utils/inputFormatter';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from 'chart.js';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	Title,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	ChartDataLabels,
);

export const BarChart = () => {
	const dataValues = [65, 59, 80, 81, 56, 55, 40];
	const maxDataValue = Math.max(...dataValues);

	const data = {
		labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
		datasets: [
			{
				label: 'Sales',
				data: dataValues,
				backgroundColor: dataValues.map((value) =>
					value === maxDataValue ? '#4f46e5' : '#d1d5db',
				),
				borderWidth: 1,
				hoverBackgroundColor: dataValues.map((value) =>
					value === maxDataValue ? 'rgb(54, 162, 235)' : '#e2e8f0',
				),
				hoverBorderColor: 'rgba(0, 0, 0, 0.3)',
				hoverBorderWidth: 2,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top',
				labels: {
					color: 'black',
				},
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						let label = context.dataset.label || '';
						if (label) {
							label += ': ';
						}
						if (context.parsed.y !== null) {
							label += new Intl.NumberFormat().format(context.parsed.y);
						}
						return label;
					},
				},
				titleColor: 'white',
				bodyColor: 'white',
				backgroundColor: 'rgba(0, 0, 0, 0.7)',
			},
		},
		scales: {
			x: {
				ticks: {
					color: 'black',
				},
			},
			y: {
				ticks: {
					color: 'black',
				},
			},
		},
		elements: {
			bar: {
				borderSkipped: 'bottom',
				borderRadius: 9,
				hoverBorderWidth: 2,
				hoverBorderColor: 'rgba(0, 0, 0, 0.3)',
			},
		},
	};

	return (
		<div className='h-full'>
			<Bar
				data={data}
				options={options}
			/>
		</div>
	);
};
export const LineChart = ({ dashboard }) => {
	const [chartData, setChartData] = useState({
		income: Array(12).fill(0), // Initialize with 12 months, all set to 0
		expenses: Array(12).fill(0),
	});

	useEffect(() => {
		const getData = async () => {
			try {
				// Initialize arrays with 0 for each month (index 0 = January, index 11 = December)
				const incomeArray = Array(12).fill(0);
				const expensesArray = Array(12).fill(0);

				// Map the data and assign values to the correct month index
				dashboard.chartData.sales.forEach((month) => {
					const monthIndex = new Date(`${month.month} 1, 2024`).getMonth(); // Convert month name to index
					incomeArray[monthIndex] = month.total_monthly_revenue;
				});

				dashboard.chartData.expenses.forEach((month) => {
					const monthIndex = new Date(`${month.month} 1, 2024`).getMonth(); // Convert month name to index
					expensesArray[monthIndex] = month.total_monthly_expense;
				});

				setChartData({
					income: incomeArray,
					expenses: expensesArray,
				});
			} catch (error) {
				console.error('Error fetching chart data:', error);
			}
		};

		getData();
	}, [dashboard]);

	const data = {
		labels: [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		],
		datasets: [
			{
				label: 'Income',
				data: chartData.income,
				borderColor: 'rgba(75, 192, 192, 1)',
				backgroundColor: 'rgba(75, 192, 192, 0.2)',
				tension: 0.4,
				fill: true,
			},
			{
				label: 'Expense',
				data: chartData.expenses,
				borderColor: 'rgba(255, 99, 132, 1)',
				backgroundColor: 'rgba(255, 99, 132, 0.2)',
				tension: 0.4,
				fill: true,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top',
			},
			title: {
				display: true,
				text: 'Income and Expenses (2024)',
			},
		},
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	};

	return (
		<Line
			data={data}
			options={options}
		/>
	);
};
export const PieChart = ({ dashboard }) => {
	const data = {
		labels: ['Expenses', 'Income'],
		datasets: [
			{
				label: 'Financial Breakdown',
				data: [
					parseFloat(dashboard.dashboard.expenses), // Ensure these are numbers
					parseFloat(dashboard.dashboard.income),
				],
				backgroundColor: ['#FF6384', '#36A2EB'],
				hoverOffset: 4,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top',
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						let label = context.label || '';
						if (context.parsed) {
							label += `: ${context.parsed}`;
						}
						return label;
					},
				},
			},
			datalabels: {
				color: '#fff',
				display: true,
				formatter: (value, context) => {
					const parsedValue = parseFloat(value);
					const total = context.chart.data.datasets[0].data
						.map((val) => parseFloat(val)) // Ensure all values are numbers
						.reduce((acc, val) => acc + val, 0);

					if (total === 0) {
						return '0%';
					}
					const percentage = ((parsedValue / total) * 100).toFixed(2);
					return `${percentage}%`;
				},
				font: {
					weight: 'bold',
					size: 25,
				},
				anchor: 'end',
				align: 'start',
				offset: 20,
			},
		},
		layout: {
			padding: {
				right: 50,
			},
		},
	};

	return (
		<div className='h-full'>
			<Pie
				data={data}
				options={options}
			/>
		</div>
	);
};
