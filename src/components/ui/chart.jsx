// components/Charts.js
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';

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
		indexAxis: 'y',
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
				label: 'Sales',
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

export const PieChartAccounts = ({ cash, bank, gcash }) => {
	const data = {
		labels: ['Cash', 'Bank', ' Gcash'],
		datasets: [
			{
				label: 'Financial Breakdown',
				data: [parseFloat(cash), parseFloat(bank), parseFloat(gcash)],
				backgroundColor: ['#228B22', '#FF6384', '#36A2EB'],
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
		<Pie
			data={data}
			options={options}
		/>
	);
};

export const BarChartHorizontal = () => {
	const dataValues = [65, 59, 80, 81, 56, 55, 40];
	const months = [
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
	];

	const labels = months.slice(0, 7); // Select the first 7 months
	const data = {
		labels: labels,
		datasets: [
			{
				label: 'Sales',
				data: dataValues,
				borderColor: 'rgba(54, 162, 235, 1)', // Blue color for the border
				backgroundColor: 'rgba(32, 138, 21,0.5)', // Transparent blue background
			},
			{
				label: 'Expenses',
				data: dataValues,
				borderColor: 'rgba(255, 99, 132, 1)', // Red color for the border
				backgroundColor: 'rgba(255, 0, 0,0.5)', // Transparent red background
			},
		],
	};
	const options = {
		indexAxis: 'y', // Horizontal bars
		elements: {
			bar: {
				borderWidth: 2,
				maxBarThickness: 50, // Maximum thickness for each bar
				borderRadius: 5,
			},
		},

		datalabels: {
			color: '#fff',
			display: true,

			font: {
				weight: 'bold',
				size: 25,
			},
			anchor: 'end',
			align: 'start',
			offset: 20,
		},

		responsive: true,
		scales: {
			y: {
				ticks: {
					// Adjust padding or auto-skip for better visibility
					autoSkip: false,
				},
			},
			x: {
				beginAtZero: true, // Ensure the bars start from zero
			},
		},
		plugins: {
			legend: {
				position: 'right',
			},
			title: {
				display: true,
				text: 'Sales and Expense',
			},
		},
	};

	return (
		<div className='h-full w-full'>
			<Bar
				data={data}
				options={options}
				height={'230%'}
			/>
		</div>
	);
};

export const PieChartProject = () => {
	const data = {
		labels: ['Expenses', 'Income'],
		datasets: [
			{
				label: 'Financial Breakdown',
				data: [60000, 5000],
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
				height={'200%'}
			/>
		</div>
	);
};

export const LineChartReports = () => {
	const [chartData, setChartData] = useState({
		income: [1200, 1400, 1300, 1700, 1900, 2100, 2200, 1800, 1600, 2000, 2300, 2500],
		expenses: [1000, 1100, 900, 1300, 1200, 1500, 1600, 1400, 1200, 1700, 1900, 2100],
	});

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
				label: 'Expenses',
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
				display: false,
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
		<div className='h-full'>
			<Line
				data={data}
				options={options}
			/>
		</div>
	);
};
