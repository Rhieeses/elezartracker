import { GeistSans } from 'geist/font/sans';
import './globals.css';

export const metadata = {
	title: 'Capstone - Sales and Expense Tracker',
	description: 'Capstone',
};

export default function RootLayout({ children }) {
	return (
		<html
			lang='en'
			className={GeistSans.className}>
			<head>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
				/>
				<link
					href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap'
					rel='stylesheet'
				/>
				<link
					href='https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded&display=swap'
					rel='stylesheet'
				/>
				<link
					href='https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp&display=swap'
					rel='stylesheet'
				/>
				<link
					rel='stylesheet'
					href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,-25&display=swap' // Updated display parameter
				/>
				<link
					rel='icon'
					href='/favicon.png'
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
