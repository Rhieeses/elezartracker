export const checkEnvironment = () => {
	let base_url =
		process.env.NODE_ENV === 'development'
			? 'http://localhost:3000'
			: 'https://elezartracker-db32bacb5edc.herokuapp.com/';

	return base_url;
};
