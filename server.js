const express = require('express');
const next = require('next');
const apiRoutes = require('./src/backend/routes/routes.js');
const path = require('path');
const cors = require('cors'); // Require CORS
const session = require('express-session');

const cookieParser = require('cookie-parser');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const dotenv = require('dotenv');
dotenv.config();

app.prepare().then(() => {
	const server = express();

	// Use CORS middleware to enable CORS
	server.use(cors());

	server.use(
		session({
			secret: 'your-secret-key', // Use a secure secret key
			resave: false,
			saveUninitialized: false, // Do not create session until something is stored
			cookie: {
				maxAge: 30 * 60 * 1000, // Set session to expire after 30 minutes
				secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
			},
		}),
	);

	// Use cookie-parser middleware
	server.use(cookieParser());
	// 	 to parse JSON bodies
	server.use(express.json());
	// Serve API routes from the routes file
	server.use('/api', apiRoutes);

	server.use('/uploads', express.static(path.join(__dirname, 'src/backend/public/uploads')));

	server.use('/receipts', express.static(path.join(__dirname, 'src/backend/public/receipts')));

	// For all other routes, use Next.js handling
	server.all('*', (req, res) => {
		return handle(req, res);
	});

	// Error handling middleware
	server.use((err, req, res, next) => {
		console.error(err.stack);
		res.status(500).json({ message: 'Internal Server Error' });
	});

	const port = process.env.PORT || 3000;

	server.listen(port, (err) => {
		if (err) throw err;
		console.log('> Ready on http://localhost:3000');
	});
});
