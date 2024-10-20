const dotenv = require('dotenv');
dotenv.config();
require('dotenv').config();

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const connection = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const dbInsert = require('../models/INSERT/dbInsert');
const dbSelect = require('../models/SELECT/dbSelect');
const dbDelete = require('../models/DELETE/dbDelete');
const dbUpdate = require('../models/UPDATE/dbUpdate');
const { jwtVerify } = require('jose');

/**
const password = 'capstone_admin';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function (err, hash) {
	console.log(hash);
}); 
 
const authenticateJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(' ')[1];

		jwt.verify(token, JWT_SECRET, (err, user) => {
			if (err) {
				return res.status(403).json({ error: 'Forbidden: Invalid token' });
			}
			req.user = user; // Optional: Store user info in request object
			next();
		});
	} else {
		return res.status(401).json({ error: 'Unauthorized: Token is missing' });
	}
};*/

router.post('/login', async (req, res) => {
	const { username, password } = req.body;

	try {
		const result = await connection.query('SELECT * FROM users WHERE username = $1', [username]);

		const user = result.rows[0];

		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const payload = {
			userId: user.id,
			username: user.username,
			name: user.name,
			position: user.position,
		};

		const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' });

		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 5 * 60 * 60 * 1000,
			sameSite: 'Strict',
		});

		res.status(200).json({
			message: 'Login successful!',
			user: payload,
			token: token,
		});
	} catch (error) {
		console.error('Error during login:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

router.get('/getUser', async (req, res) => {
	const token = req.cookies.token;

	if (!token) {
		return res.status(401).json({ message: 'Unauthorized, token missing' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure you have a secret key in .env

		const userId = decoded.userId;

		// Query the database for the user using the userId from the token
		const result = await connection.query('SELECT * FROM users WHERE id = $1', [userId]);

		if (result.rows.length > 0) {
			// If user is found, return user details
			res.status(200).json(result.rows[0]);
		} else {
			// If no user is found, return 404
			res.status(404).json({ message: 'User not found' });
		}
	} catch (error) {
		// Handle errors such as invalid token
		return res.status(403).json({ message: 'Invalid token', error });
	}
});

router.post('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error('Error destroying session:', err);
			return res.status(500).json({ message: 'Could not log out' });
		}

		res.clearCookie('token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Strict',
		});

		res.json({ message: 'Logout successful' });
	});
});

//upload photo
let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../public/uploads'));
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	},
});

let storageReceipt = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../public/receipts'));
	},
	filename: function (req, file, cb) {
		const newFileName = 'receipt-' + Date.now() + path.extname(file.originalname);
		cb(null, newFileName);

		//cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	},
});

// Initialize multer upload with storage
const uploadReceipt = multer({
	storage: storageReceipt,
	limits: { fileSize: 1000000 }, // Optional: limit file size to 1MB
}).single('file'); // Use .single() for single file upload

router.post('/upload-receipt', (req, res) => {
	// Use multer to handle the file upload
	uploadReceipt(req, res, function (err) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}
		// If successful, send back the file details or a success message
		res.status(200).json({
			message: 'File uploaded successfully',
			fileName: req.file.filename,
			filePath: `/uploads/${req.file.filename}`,
		});
	});
});

//post
router.post('/add-client', (req, res, next) => {
	const upload = multer({ storage: storage });

	upload.single('profilePicture')(req, res, async (err) => {
		if (err) {
			return res.status(500).json({ message: 'File upload failed', error: err.message });
		}

		try {
			const fileName = req.file ? path.basename(req.file.path) : null;

			const profilePicturePath = fileName ? `/uploads/${fileName}` : null;

			const clientFormData = {
				...req.body,
				profilePicture: profilePicturePath,
			};

			const clientInsertedData = await dbInsert.clientInsertData(clientFormData);

			res.status(201).json({ message: 'Data inserted successfully', data: clientInsertedData });
		} catch (error) {
			console.error('Error handling request:', error);
			res.status(500).json({ message: 'Failed to insert data', error: error.message });
		}
	});
});

router.post('/create-project', (req, res, next) => {
	const upload = multer({ storage: storage });

	upload.single('projectPicture')(req, res, async (err) => {
		if (err) {
			return res.status(500).json({ message: 'File upload failed', error: err.message });
		}

		try {
			const fileName = req.file ? path.basename(req.file.path) : null;

			const projectPicturePath = fileName ? `/uploads/${fileName}` : null;

			const projectFormData = {
				...req.body,
				projectPicture: projectPicturePath,
			};

			const projectInsertedData = await dbInsert.projectInsertData(projectFormData);

			res.status(201).json({ message: 'Data inserted successfully', data: projectInsertedData });
		} catch (error) {
			console.error('Error handling request:', error);
			res.status(500).json({ message: 'Failed to insert data', error: error.message });
		}
	});
});

router.post('/add-vendor', (req, res, next) => {
	const upload = multer({ storage: storage });

	upload.single('vendorPicture')(req, res, async (err) => {
		if (err) {
			return res.status(500).json({ message: 'File upload failed', error: err.message });
		}

		try {
			const fileName = req.file ? path.basename(req.file.path) : null;

			const profilePicturePath = fileName ? `/uploads/${fileName}` : null;

			const vendorFormData = {
				...req.body,
				vendorPicture: profilePicturePath,
			};

			const vendorInsertedData = await dbInsert.vendorInsertData(vendorFormData);

			res.status(201).json({ message: 'Data inserted successfully', data: vendorInsertedData });
		} catch (error) {
			console.error('Error handling request:', error);
			res.status(500).json({ message: 'Failed to insert data', error: error.message });
		}
	});
});

router.post('/sales-payment', async (req, res) => {
	try {
		const {
			invoiceId,
			projectId,
			invoiceNo,
			clientId,
			description,
			paymentAmount,
			paymentDate,
			paymentType,
		} = req.body;

		//const salesPaymentInsertResult =

		await dbInsert.salesPaymentInsert({
			invoiceId,
			projectId,
			invoiceNo,
			clientId,
			description,
			paymentAmount,
			paymentDate,
			paymentType,
		});

		res.status(200).json({ message: 'Payment processed successfully' });
	} catch (error) {
		console.error('Error processing payment:', error);
		res.status(500).json({ message: 'Error processing payment', error: error.message });
	}
});

router.post('/add-expense', async (req, res) => {
	try {
		const expenseFormData = req.body;
		const expenseInsertData = await dbInsert.expenseInsert(expenseFormData);
		res.status(200).json({ message: 'Expense inserted successfully' });
	} catch (error) {
		console.error('Error inserting expense:', error);
		res.status(500).json({ message: 'Error inserting expense', error: error.message });
	}
});

router.post('/scan-expense', async (req, res) => {
	try {
		const expenseFormData = req.body;
		const expenseInsertData = await dbInsert.expenseScanInsert(expenseFormData);
		res.status(200).json({ message: 'Expense inserted successfully' });
	} catch (error) {
		console.error('Error inserting expense:', error);
		res.status(500).json({ message: 'Error inserting expense', error: error.message });
	}
});

router.post('/add-sales', async (req, res) => {
	try {
		const salesFormData = req.body;
		await dbInsert.salesInsert(salesFormData);
		res.status(200).json({ message: 'Sales inserted successfully' });
	} catch (error) {
		console.error('Error inserting expense:', error);
		res.status(500).json({ message: 'Error inserting sales expense', error: error.message });
	}
});

router.post('/transfer-account', async (req, res) => {
	try {
		const transferData = req.body;
		await dbInsert.transferDataInsert(transferData);
		res.status(200).json({ message: 'Transfer successfully' });
	} catch (error) {
		console.error('Error inserting expense:', error);
		res.status(500).json({ message: 'Error Transfering', error: error.message });
	}
});

router.post('/approve-transfer/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const approveTransfer = await dbUpdate.ApproveTransfer(id);
		res.json(approveTransfer);
	} catch (error) {
		res.status(500).json({ error: 'Failed to approve' });
	}
});

router.post('/notification-seen', async (req, res) => {
	try {
		const { id } = req.body;
		if (!id) {
			return res.status(400).json({ message: 'Notification ID is required' });
		}

		await dbInsert.notificationStatusInsert(id);
		res.status(200).json({ message: 'Notification successfully marked as seen' });
	} catch (error) {
		console.error('Error marking notification as seen:', error);
		res.status(500).json({ message: 'Error marked notification', error: error.message });
	}
});

router.post('/set-notification', async (req, res) => {
	try {
		const notificationBody = req.body;
		await dbInsert.setNotificationInsert(notificationBody);

		res.status(200).json({ message: 'Notification successfully inserted' });
	} catch (error) {
		console.error('Error marking notification as seen:', error);
		res.status(500).json({ message: 'Error notification inserting', error: error.message });
	}
});

router.post('/change-password/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const changePasswordForm = req.body;

		const changePassword = await dbUpdate.changePassword(id, changePasswordForm);
		res.json(changePassword);
	} catch (error) {
		res.status(500).json({ error: 'Failed to change password!' });
	}
});

//update

router.put('/update-project/:id', (req, res, next) => {
	const upload = multer({ storage: storage });

	upload.single('imageFile')(req, res, async (err) => {
		if (err) {
			return res.status(500).json({ message: 'File upload failed', error: err.message });
		}

		const { id } = req.params;

		try {
			const fileName = req.file ? path.basename(req.file.path) : null;
			const profilePicturePath = fileName ? `/uploads/${fileName}` : null;

			const formData = {
				...req.body,
				imageFile: profilePicturePath || req.body.projectPicture,
			};

			// Update project in the database
			const projectUpdateData = await dbUpdate.updateProject(formData, id);

			res.status(201).json({ message: 'Data updated successfully', data: projectUpdateData });
		} catch (error) {
			console.error('Error handling request:', error);
			res.status(500).json({ message: 'Failed to update data', error: error.message });
		}
	});
});

router.put('/update-account/:id', (req, res, next) => {
	const upload = multer({ storage: storage });

	upload.single('imageFile')(req, res, async (err) => {
		if (err) {
			return res.status(500).json({ message: 'File upload failed', error: err.message });
		}

		const { id } = req.params;

		try {
			const fileName = req.file ? path.basename(req.file.path) : null;
			const profilePicturePath = fileName ? `/uploads/${fileName}` : null;

			const formData = {
				...req.body,
				imageFile: profilePicturePath || req.body.profilepicture,
			};

			// Update project in the database
			const accountUpdate = await dbUpdate.updateAccount(formData, id);

			res.status(201).json({ message: 'Data updated successfully', data: accountUpdate });
		} catch (error) {
			console.error('Error handling request:', error);
			res.status(500).json({ message: 'Failed to update data', error: error.message });
		}
	});
});

router.put('/edit-vendor/:id', (req, res, next) => {
	const upload = multer({ storage: storage });

	upload.single('imageFile')(req, res, async (err) => {
		if (err) {
			return res.status(500).json({ message: 'File upload failed', error: err.message });
		}

		const { id } = req.params;

		try {
			const fileName = req.file ? path.basename(req.file.path) : null;
			const profilePicturePath = fileName ? `/uploads/${fileName}` : null;

			const editForm = {
				...req.body,
				imageFile: profilePicturePath || req.body.vendorPicture,
			};

			// Update project in the database
			const vendorEdit = await dbUpdate.editVendor(editForm, id);

			res.status(201).json({ message: 'Data updated successfully', data: vendorEdit });
		} catch (error) {
			console.error('Error handling request:', error);
			res.status(500).json({ message: 'Failed to update data', error: error.message });
		}
	});
});

//get
router.get('/client-details', async (req, res) => {
	try {
		const clients = await dbSelect.fetchClients();
		res.json(clients);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch clients' });
	}
});

router.get('/accounts-transactions', async (req, res) => {
	try {
		const accountTransaction = await dbSelect.fetchAccountsTransaction();
		res.json(accountTransaction);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch accounts transaction' });
	}
});

router.get('/accounts-transactions/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const accountTransaction = await dbSelect.fetchAccountsTransactionId(id);
		res.json(accountTransaction);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch accounts transaction' });
	}
});

router.get('/client-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const client = await dbSelect.fetchClientView(id);
		res.json(client);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch clients' });
	}
});

router.get('/client-select', async (req, res) => {
	try {
		const clientSelect = await dbSelect.fetchClientSelect();
		res.json(clientSelect);
	} catch (error) {
		console.error('Error dbSelect.fetching clients:', error);
		res.status(500).json({ message: 'Failed to dbSelect.fetch clients' });
	}
});

router.get('/project-details', async (req, res) => {
	try {
		const project = await dbSelect.fetchProject();
		res.json(project);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch project' });
	}
});

router.get('/project-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const project = await dbSelect.fetchProjectView(id);
		res.json(project);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch project' });
	}
});

router.get('/allclient-project/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const clientProject = await dbSelect.fetchAllClientProject(id);
		res.json(clientProject);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch project' });
	}
});

router.get('/sales-details', async (req, res) => {
	try {
		const sales = await dbSelect.fetchSales();
		res.json(sales);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch sales' });
	}
});

router.get('/sales-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const sales = await dbSelect.fetchSalesProject(id);
		res.json(sales);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch sales' });
	}
});

router.get('/invoice-details/:invoice', async (req, res) => {
	try {
		const { invoice } = req.params;
		const invoiceData = await dbSelect.fetchInvoiceData(invoice);
		res.json(invoiceData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch invoice' });
	}
});

router.get('/payment-details', async (req, res) => {
	try {
		const payment = await dbSelect.fetchPayment();
		res.json(payment);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch Payments' });
	}
});

router.get('/payment-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const invoiceData = await dbSelect.fetchPaymentData(id);
		res.json(invoiceData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch payment' });
	}
});

router.get('/transaction-client/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const transactionClient = await dbSelect.fetchTransactionClient(id);
		res.json(transactionClient);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch payment' });
	}
});

router.get('/project-select', async (req, res) => {
	try {
		const projectSelect = await dbSelect.fetchProjectSelect();
		res.json(projectSelect);
	} catch (error) {
		console.error('Error dbSelect.fetching clients:', error);
		res.status(500).json({ message: 'Failed to dbSelect.fetch clients' });
	}
});

router.get('/expenses-details', async (req, res) => {
	try {
		const expenses = await dbSelect.fetchExpenses();
		res.json(expenses);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch sales' });
	}
});

router.get('/expenses-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const expenses = await dbSelect.fetchExpensesProject(id);
		res.json(expenses);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch sales' });
	}
});

router.get('/expensesInvoice-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const invoiceExpensesData = await dbSelect.fetchInvoiceExpensesData(id);
		res.json(invoiceExpensesData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch invoice' });
	}
});

router.get('/vendor-select', async (req, res) => {
	try {
		const vendorSelect = await dbSelect.fetchVendorSelect();
		res.json(vendorSelect);
	} catch (error) {
		console.error('Error dbSelect.fetching vendors:', error);
		res.status(500).json({ message: 'Failed to dbSelect.fetch vendors' });
	}
});

router.get('/transaction-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const transacData = await dbSelect.fetchTransactionDetails(id);
		res.json(transacData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch transaction' });
	}
});

router.get('/accounts-details', async (req, res) => {
	try {
		const accountsSelect = await dbSelect.fetchAccounts();
		res.json(accountsSelect);
	} catch (error) {
		console.error('Error dbSelect.fetching accounts:', error);
		res.status(500).json({ message: 'Failed to dbSelect.fetch accounts' });
	}
});

router.get('/dashboard-data', async (req, res) => {
	try {
		const dashboardData = await dbSelect.fetchDashboardData();
		res.json(dashboardData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch dashboard data' });
	}
});

router.get('/vendor-details', async (req, res) => {
	try {
		const vendor = await dbSelect.fetchVendor();
		res.json(vendor);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch vendor' });
	}
});

router.get('/vendor-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const vendor = await dbSelect.fetchVendorId(id);
		res.json(vendor);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch vendor' });
	}
});

router.get('/project-name/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const projectName = await dbSelect.fetchProjectName(id);
		res.json(projectName);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch project name' });
	}
});

router.get('/notifications', async (req, res) => {
	try {
		const notifications = await dbSelect.fetchNotifications();
		res.json(notifications);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch notifications' });
	}
});

router.get('/all-transactions', async (req, res) => {
	try {
		const transactions = await dbSelect.fetchAlltransaction();
		res.json(transactions);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch transactions' });
	}
});

router.get('/top-vendor/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const topVendor = await dbSelect.fetchTopVendor(id);
		res.json(topVendor);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch transactions' });
	}
});

//dbDelete.delete

router.delete('/project-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const project = await dbDelete.deleteProject(id);
		res.json(project);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbDelete.delete project' });
	}
});

router.delete('/client-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const client = await dbDelete.deleteClient(id);
		res.json(client);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbDelete.delete client' });
	}
});

router.delete('/expense-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const expense = await dbDelete.deleteExpense(id);
		res.json(expense);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbDelete.delete expense' });
	}
});

router.delete('/sales-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const sales = await dbDelete.deleteSales(id);
		res.json(sales);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbDelete.delete sales' });
	}
});

router.delete('/vendor-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const vendor = await dbDelete.deleteVendor(id);
		res.json(vendor);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbDelete.delete vendor' });
	}
});

router.get('/test-db', async (req, res) => {
	try {
		const result = await connection.query('SELECT NOW() AS current_time'); // Simple query to get current time
		res.status(200).json({ message: 'Database connection successful', data: result.rows[0] });
	} catch (error) {
		console.error('Database connection error:', error);
		res.status(500).json({ message: 'Database connection failed', error: error.message });
	}
});

module.exports = router;
