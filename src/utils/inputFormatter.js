const capitalizeFirstLetter = (input) => {
	// If input is null, undefined, or not a string, return it as is
	if (input == null || typeof input !== 'string') return '';

	// If the string is empty, return it as is
	if (input.trim() === '') return input;

	// Capitalize the first letter of each word
	return input
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};
const capitalizeOnlyFirstLetter = (string) => {
	if (string == null || typeof string !== 'string') return '';

	if (string.trim() === '') return string;

	if (!string) return '';
	return string.charAt(0).toUpperCase() + string.slice(1);
};

const allCapitalize = (string) => {
	if (!string) return '';
	return string.toUpperCase();
};

const formatNumber = (amount) => {
	if (isNaN(amount) || amount === null || amount === undefined || amount === '') return '';

	const parts = amount.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return `₱ ${parts.join('.')}`;
};

const formatNumberDecimal = (amount) => {
	if (isNaN(amount) || amount === null || amount === undefined || amount === '') return '';
	amount = parseFloat(amount).toFixed(2);

	const parts = amount.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return `₱ ${parts.join('.')}`;
};

const removeFormatting = (formattedValue) => {
	return formattedValue.replace(/[₱,#]/g, '');
};

const calculateDateDifference = (startDate, endDate) => {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const diffTime = end - start;
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays == 1) {
		return `${diffDays} Day`;
	} else if (diffDays < 0) {
		return `Not due yet`;
	} else {
		return `${diffDays} Days`;
	}
};

const calculateDuration = (startDate, endDate) => {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const today = new Date(); // Get today's date

	if (start <= today) {
		//mag bilang kana
		const daysFromToday = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
		if (daysFromToday === 1) {
			return `${daysFromToday} Day`;
		}
		return `${daysFromToday} Days`;
	} else if (start > today) {
		return 'Starting soon!';
	} else if (end === today) {
		return 'Project Ended!';
	}

	//const diffTime = end - start;
	//const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	//const daysFromToday = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

	//return `${daysFromToday} Day`;
};

const formatDate = (dateString) => {
	const date = new Date(dateString);
	const monthNames = [
		'Jan.',
		'Feb.',
		'Mar.',
		'Apr.',
		'May',
		'Jun',
		'Jul',
		'Aug.',
		'Sept.',
		'Oct',
		'Nov.',
		'Dec.',
	];
	const day = date.getDate();
	const month = monthNames[date.getMonth()];
	const year = date.getFullYear();
	return `${month} ${day}, ${year}`;
};

const formatDateTime = (dateString) => {
	const date = new Date(dateString);
	const monthNames = [
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
	const day = date.getDate();
	const month = monthNames[date.getMonth()];
	const year = date.getFullYear();
	let hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
	const ampm = hours >= 12 ? 'PM' : 'AM';

	hours = hours % 12;
	hours = hours ? hours : 12; // If hours is 0, display as 12
	return `${month} ${day}, ${year} - ${hours}:${minutes} ${ampm}`;
};

const generateRandomInvoiceNumber = () => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const length = 8;
	let invoiceNum = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		invoiceNum += characters.charAt(randomIndex);
	}
	return invoiceNum;
};

const calculateProgressPayment = (contractPrice, downpayment, startDate, completionDate) => {
	const downpaymentAmount = (contractPrice * downpayment) / 100;
	const start = new Date(startDate);
	const completion = new Date(completionDate);
	const duration =
		(completion.getFullYear() - start.getFullYear()) * 12 +
		(completion.getMonth() - start.getMonth());
	const monthlyPayment = (contractPrice - downpaymentAmount) / duration;
	return {
		downpayment: downpaymentAmount,
		duration: duration,
		monthlyPayment: monthlyPayment,
	};
};

function formatStatusEx(paidAmount, balance) {
	if (balance === 0) {
		return 'FULLY PAID';
	} else if (paidAmount > 0 && paidAmount < balance) {
		return 'PARTIALLY PAID';
	} else if (paidAmount === 0) {
		return 'UNPAID';
	} else {
		return 'DUNNO';
	}
}

function checkStatus(startDate, endDate) {
	const currentDate = new Date();
	const start = new Date(startDate);
	const end = new Date(endDate);

	const diffTime = end - start;

	if (start > currentDate) {
		return 'PENDING';
	} else if (start <= currentDate && (end === null || end > currentDate)) {
		return 'ON PROGRESS';
	} else if (end !== null && end < currentDate) {
		return 'FINISHED';
	} else {
		return `${currentDate}`; // Default value
	}
}

const calculatePercentageIncrease = (currentMonthValue, lastMonthValue) => {
	// Convert lastMonthValue to a number
	const last = Number(lastMonthValue); // or use parseFloat(lastMonthValue)

	// Handle case when last month value is 0
	if (last === 0) {
		return currentMonthValue > 0 ? '+100% from last month' : '0%';
	}

	// Calculate the percentage increase
	const increase = Math.round(((currentMonthValue - last) / last) * 100);
	const sign = increase >= 0 ? '+' : '';
	return `${sign}${increase}% from last month`;
};

const getTextColor = (type) => {
	if (type === 'PAYMENT') {
		return 'text-green-600';
	} else if (type === 'EXPENSE') {
		return 'text-red-500';
	}
	return '';
};

module.exports = {
	capitalizeFirstLetter,
	capitalizeOnlyFirstLetter,
	allCapitalize,
	formatNumber,
	formatNumberDecimal,
	removeFormatting,
	calculateDateDifference,
	calculateDuration,
	formatDate,
	formatDateTime,
	generateRandomInvoiceNumber,
	calculateProgressPayment,
	formatStatusEx,
	checkStatus,
	calculatePercentageIncrease,
	getTextColor,
};
