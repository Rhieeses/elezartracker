const express = require('express');
const next = require('next');
const apiRoutes = require('./src/backend/routes/routes.js');
const path = require('path');
const cors = require('cors'); // Require CORS

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const dotenv = require('dotenv');
dotenv.config();

app.prepare().then(() => {
	const server = express();

	// Middleware to parse JSON bodies
	server.use(express.json());

	// Use CORS middleware to enable CORS
	server.use(cors());

	// Serve API routes from the routes file
	server.use('/api', apiRoutes);

	server.get('https://elezartracker-db32bacb5edc.herokuapp.com/api/hello', (req, res) => {
		res.json({ message: 'Hello from the API!' });
	  });


	server.use('/uploads', express.static(path.join(__dirname, 'src/backend/public/uploads')));

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
