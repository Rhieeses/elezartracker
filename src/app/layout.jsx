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
				<link
					href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=optional' // Updated display parameter
					rel='stylesheet'
				/>
				<link
					href='https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded&display=optional' // Updated display parameter
					rel='stylesheet'
				/>
				<link
					href='https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp&display=optional' // Updated display parameter
					rel='stylesheet'
				/>
				<link
					rel='stylesheet'
					href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,-25&display=optional' // Updated display parameter
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
