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
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const userId = decoded.userId;

		const result = await connection.query('SELECT * FROM users WHERE id = $1', [userId]);

		if (result.rows.length > 0) {
			res.status(200).json(result.rows[0]);
		} else {
			res.status(404).json({ message: 'User not found' });
		}
	} catch (error) {
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
	},
});

const uploadReceipt = multer({
	storage: storageReceipt,
	limits: { fileSize: 1000000 },
}).single('file');

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

router.post('/payable-payment', async (req, res) => {
	try {
		const expenseFormData = req.body;
		const expenseInsertData = await dbInsert.payablePaymentInsert(expenseFormData);
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

router.post('/add-payables', async (req, res) => {
	try {
		const payableFormData = req.body;
		await dbInsert.payableInsert(payableFormData);
		res.status(200).json({ message: 'Payable inserted successfully' });
	} catch (error) {
		console.error('Error inserting expense:', error);
		res.status(500).json({ message: 'Error inserting payable', error: error.message });
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

router.put('/update-client', (req, res, next) => {
	const upload = multer({ storage: storage });

	upload.single('imageFile')(req, res, async (err) => {
		if (err) {
			return res.status(500).json({ message: 'File upload failed', error: err.message });
		}

		try {
			const fileName = req.file ? path.basename(req.file.path) : null;
			const profilePicturePath = fileName ? `/uploads/${fileName}` : null;

			const formData = {
				...req.body,
				imageFile: profilePicturePath || req.body.clientPicture,
			};

			// Update project in the database
			const clientUpdateData = await dbUpdate.updateClient(formData);

			res.status(201).json({ message: 'Data updated successfully', data: clientUpdateData });
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

router.patch('/sales-archive/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const salesArchive = await dbUpdate.salesArchive(id);
		res.json(salesArchive);
	} catch (error) {
		res.status(500).json({ error: 'Failed to archive sales' });
	}
});

router.patch('/payablesTransaction-archive/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const salesArchive = await dbUpdate.payablesTransactionArchive(id);
		res.json(salesArchive);
	} catch (error) {
		res.status(500).json({ error: 'Failed to archive transaction' });
	}
});

router.patch('/expense-archive/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const expenseArchive = await dbUpdate.expenseArchive(id);
		res.json(expenseArchive);
	} catch (error) {
		res.status(500).json({ error: 'Failed to archive expense' });
	}
});

router.patch('/payable-archive/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const payableArchive = await dbUpdate.payableArchive(id);
		res.json(payableArchive);
	} catch (error) {
		res.status(500).json({ error: 'Failed to archive payable' });
	}
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

router.get('/salesProject-details', async (req, res) => {
	try {
		const sales = await dbSelect.fetchSalesProjectTotal();
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

router.get('/payabletransaction-details', async (req, res) => {
	try {
		const payables = await dbSelect.fetchPayableTransaction();
		res.json(payables);
	} catch (error) {
		res.status(500).json({ error: 'Failed to select payable transaction' });
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

router.get('/payables-details', async (req, res) => {
	try {
		const payables = await dbSelect.fetchPayablesData();
		res.json(payables);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch Payables' });
	}
});

router.get('/payables-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const payables = await dbSelect.fetchPayablesDataId(id);
		res.json(payables);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch payables' });
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

//
router.get('/all-transactions', async (req, res) => {
	try {
		const transactions = await dbSelect.fetchAlltransaction();
		res.json(transactions);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbSelect.fetch transactions' });
	}
});

router.get('/generate-report', async (req, res) => {
	try {
		const reportBody = {
			quarters: req.query.quarters,
			timeFrame: req.query.timeFrame,
			formattedMonth: Number(req.query.formattedMonth),
			selectedYear: Number(req.query.selectedYear),
		};

		const reportData = await dbSelect.fetchReport(reportBody);
		res.json(reportData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to generate report: ' + error.message }); // Updated error message
	}
});

//

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

router.delete('/salesproject-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const sales = await dbDelete.deleteSalesProject(id);
		res.json(sales);
	} catch (error) {
		res.status(500).json({ error: 'Failed to dbDelete.delete sales' });
	}
});

router.delete('/payable-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const payable = await dbDelete.deletePayable(id);
		res.json(payable);
	} catch (error) {
		res.status(500).json({ error: 'Failed to delete payable' });
	}
});

router.delete('/payableTransaction-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const payable = await dbDelete.deletePayableTransaction(id);
		res.json(payable);
	} catch (error) {
		res.status(500).json({ error: 'Failed to delete payable' });
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
