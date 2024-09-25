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
