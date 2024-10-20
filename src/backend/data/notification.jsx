import axios from 'axios';

export const calculatePercentage = (budget, contractPrice) => {
	if (contractPrice || budget === 0) {
		//throw new Error('Contract Price cannot be zero');
		return '0%';
	}
	return ((budget / contractPrice) * 100).toFixed(2) + '%';
};

export const handleNotification = async (notificationData) => {
	try {
		console.log(notificationData);
		await axios.post('/api/set-notification', notificationData);
	} catch (error) {
		console.error('Failed to send notification:', error);
	}
};

export const projectHealthPercentage = (budget, contractPrice) => {
	const projectHealthPercentage = calculatePercentage(budget, contractPrice).replace(
		/[₱,#%]/g,
		'',
	);
	return projectHealthPercentage;
};

export const projectHealthStatus = (healthPercent, projectName, projectId, warningValue) => {
	if (!healthPercent === 0) {
		if (healthPercent <= warningValue) {
			const notificationData = {
				title: 'BUDGET WARNING!',
				description: `Project ${projectName} is reaching its budget limit.`,
				projectId: projectId,
			};

			// Send the notification
			handleNotification(notificationData);

			return (
				<div
					className='text-center p-1 text-white tracking-wide font-bold z-100'
					style={{ backgroundColor: '#FF0000' }}>
					Your project budget is nearing its limit
				</div>
			);
		}
	}
};

export const projectHealthNotif = (budget, warningValue) => {
	let warningPercent = warningValue / 100;
	if (budget <= budget * warningPercent)
		return (
			<div className='flex flex-col bg-red-100 justify-center items-center rounded-lg border-1'>
				<img
					src='/sadface.svg'
					alt=''
					width='100px'
				/>
				<h1 className='font-bold text-red-700'>Your project looks bad!</h1>
				<p className='text-red-700 w-[80%]'>
					You should contact your client for payment or else the project will need to stop.
				</p>
			</div>
		);
	else {
		return (
			<div className='flex flex-col bg-green-100 justify-center items-center rounded-lg border-1'>
				<img
					src='/smiley.svg'
					alt=''
					width='100px'
				/>
				<h1 className='font-bold text-green-700'>Your project looks good!</h1>
			</div>
		);
	}
};
