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

const {
	clientInsertData,
	projectInsertData,
	salesPaymentInsert,
	vendorInsertData,
	expenseInsert,
	salesInsert,
	transferDataInsert,
	notificationStatusInsert,
	setNotificationInsert,
	expenseScanInsert,
} = require('../models/INSERT/dbInsert');

const {
	fetchClients,
	fetchProject,
	fetchClientSelect,
	fetchProjectView,
	fetchClientView,
	fetchAllClientProject,
	fetchSales,
	fetchSalesProject,
	fetchInvoiceData,
	fetchPayment,
	fetchPaymentData,
	fetchTransactionClient,
	fetchProjectSelect,
	fetchExpenses,
	fetchInvoiceExpensesData,
	fetchVendor,
	fetchVendorSelect,
	fetchVendorId,
	fetchExpensesProject,
	fetchTransactionDetails,
	fetchAccounts,
	fetchDashboardData,
	fetchAccountsTransaction,
	fetchAccountsTransactionId,
	fetchNotifications,
	fetchAlltransaction,
	fetchProjectName,
} = require('../models/SELECT/dbSelect');
const {
	deleteProject,
	deleteClient,
	deleteExpense,
	deleteSales,
	deleteVendor,
} = require('../models/DELETE/dbDelete');

const { updateProject, editVendor, ApproveTransfer } = require('../models/UPDATE/dbUpdate');

/**
const password = 'capstone_admin';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function (err, hash) {
	console.log(hash);
}); 
*/

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
};

router.post('/api/login', async (req, res) => {
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

		const token = jwt.sign(
			{ userId: user.id, username: user.username, name: user.name, position: user.position },
			JWT_SECRET,
			{ expiresIn: '5h' },
		);

		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 5 * 60 * 60 * 1000,
			sameSite: 'Strict',
		});

		res.json({ token });
	} catch (error) {
		console.error('Error during login:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

router.post('/logout', (req, res) => {
	res.clearCookie('token', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'Strict',
	});

	res.json({ message: 'Logout successful' });
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

			const clientInsertedData = await clientInsertData(clientFormData);

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

			const projectInsertedData = await projectInsertData(projectFormData);

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

			const vendorInsertedData = await vendorInsertData(vendorFormData);

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

		await salesPaymentInsert({
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
		const expenseInsertData = await expenseInsert(expenseFormData);
		res.status(200).json({ message: 'Expense inserted successfully' });
	} catch (error) {
		console.error('Error inserting expense:', error);
		res.status(500).json({ message: 'Error inserting expense', error: error.message });
	}
});

router.post('/scan-expense', async (req, res) => {
	try {
		const expenseFormData = req.body;
		const expenseInsertData = await expenseScanInsert(expenseFormData);
		res.status(200).json({ message: 'Expense inserted successfully' });
	} catch (error) {
		console.error('Error inserting expense:', error);
		res.status(500).json({ message: 'Error inserting expense', error: error.message });
	}
});

router.post('/add-sales', async (req, res) => {
	try {
		const salesFormData = req.body;
		await salesInsert(salesFormData);
		res.status(200).json({ message: 'Sales inserted successfully' });
	} catch (error) {
		console.error('Error inserting expense:', error);
		res.status(500).json({ message: 'Error inserting sales expense', error: error.message });
	}
});

router.post('/transfer-account', async (req, res) => {
	try {
		const transferData = req.body;
		await transferDataInsert(transferData);
		res.status(200).json({ message: 'Transfer successfully' });
	} catch (error) {
		console.error('Error inserting expense:', error);
		res.status(500).json({ message: 'Error Transfering', error: error.message });
	}
});

router.post('/approve-transfer/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const approveTransfer = await ApproveTransfer(id);
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

		await notificationStatusInsert(id);
		res.status(200).json({ message: 'Notification successfully marked as seen' });
	} catch (error) {
		console.error('Error marking notification as seen:', error);
		res.status(500).json({ message: 'Error marked notification', error: error.message });
	}
});

router.post('/set-notification', async (req, res) => {
	try {
		const notificationBody = req.body;
		await setNotificationInsert(notificationBody);

		res.status(200).json({ message: 'Notification successfully inserted' });
	} catch (error) {
		console.error('Error marking notification as seen:', error);
		res.status(500).json({ message: 'Error notification inserting', error: error.message });
	}
});

//update

router.post('/update-project/:id', (req, res, next) => {
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
			const projectUpdateData = await updateProject(formData, id);

			res.status(201).json({ message: 'Data updated successfully', data: projectUpdateData });
		} catch (error) {
			console.error('Error handling request:', error);
			res.status(500).json({ message: 'Failed to update data', error: error.message });
		}
	});
});

router.post('/edit-vendor/:id', (req, res, next) => {
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
			const vendorEdit = await editVendor(editForm, id);

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
		const clients = await fetchClients();
		res.json(clients);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch clients' });
	}
});

router.get('/accounts-transactions', async (req, res) => {
	try {
		const accountTransaction = await fetchAccountsTransaction();
		res.json(accountTransaction);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch accounts transaction' });
	}
});

router.get('/accounts-transactions/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const accountTransaction = await fetchAccountsTransactionId(id);
		res.json(accountTransaction);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch accounts transaction' });
	}
});

router.get('/client-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const client = await fetchClientView(id);
		res.json(client);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch clients' });
	}
});

router.get('/client-select', async (req, res) => {
	try {
		const clientSelect = await fetchClientSelect();
		res.json(clientSelect);
	} catch (error) {
		console.error('Error fetching clients:', error);
		res.status(500).json({ message: 'Failed to fetch clients' });
	}
});

router.get('/project-details', async (req, res) => {
	try {
		const project = await fetchProject();
		res.json(project);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch project' });
	}
});

router.get('/project-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const project = await fetchProjectView(id);
		res.json(project);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch project' });
	}
});

router.get('/allclient-project/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const clientProject = await fetchAllClientProject(id);
		res.json(clientProject);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch project' });
	}
});

router.get('/sales-details', async (req, res) => {
	try {
		const sales = await fetchSales();
		res.json(sales);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch sales' });
	}
});

router.get('/sales-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const sales = await fetchSalesProject(id);
		res.json(sales);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch sales' });
	}
});

router.get('/invoice-details/:invoice', async (req, res) => {
	try {
		const { invoice } = req.params;
		const invoiceData = await fetchInvoiceData(invoice);
		res.json(invoiceData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch invoice' });
	}
});

router.get('/payment-details', async (req, res) => {
	try {
		const payment = await fetchPayment();
		res.json(payment);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch Payments' });
	}
});

router.get('/payment-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const invoiceData = await fetchPaymentData(id);
		res.json(invoiceData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch payment' });
	}
});

router.get('/transaction-client/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const transactionClient = await fetchTransactionClient(id);
		res.json(transactionClient);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch payment' });
	}
});

router.get('/project-select', async (req, res) => {
	try {
		const projectSelect = await fetchProjectSelect();
		res.json(projectSelect);
	} catch (error) {
		console.error('Error fetching clients:', error);
		res.status(500).json({ message: 'Failed to fetch clients' });
	}
});

router.get('/expenses-details', async (req, res) => {
	try {
		const expenses = await fetchExpenses();
		res.json(expenses);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch sales' });
	}
});

router.get('/expenses-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const expenses = await fetchExpensesProject(id);
		res.json(expenses);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch sales' });
	}
});

router.get('/expensesInvoice-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const invoiceExpensesData = await fetchInvoiceExpensesData(id);
		res.json(invoiceExpensesData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch invoice' });
	}
});

router.get('/vendor-select', async (req, res) => {
	try {
		const vendorSelect = await fetchVendorSelect();
		res.json(vendorSelect);
	} catch (error) {
		console.error('Error fetching vendors:', error);
		res.status(500).json({ message: 'Failed to fetch vendors' });
	}
});

router.get('/transaction-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const transacData = await fetchTransactionDetails(id);
		res.json(transacData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch transaction' });
	}
});

router.get('/accounts-details', async (req, res) => {
	try {
		const accountsSelect = await fetchAccounts();
		res.json(accountsSelect);
	} catch (error) {
		console.error('Error fetching accounts:', error);
		res.status(500).json({ message: 'Failed to fetch accounts' });
	}
});

router.get('/dashboard-data', async (req, res) => {
	try {
		const dashboardData = await fetchDashboardData();
		res.json(dashboardData);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch dashboard data' });
	}
});

router.get('/vendor-details', async (req, res) => {
	try {
		const vendor = await fetchVendor();
		res.json(vendor);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch vendor' });
	}
});

router.get('/vendor-details/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const vendor = await fetchVendorId(id);
		res.json(vendor);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch vendor' });
	}
});

router.get('/project-name/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const projectName = await fetchProjectName(id);
		res.json(projectName);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch project name' });
	}
});

router.get('/notifications', async (req, res) => {
	try {
		const notifications = await fetchNotifications();
		res.json(notifications);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch notifications' });
	}
});

router.get('/all-transactions', async (req, res) => {
	try {
		const transactions = await fetchAlltransaction();
		res.json(transactions);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch transactions' });
	}
});

//delete

router.delete('/project-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const project = await deleteProject(id);
		res.json(project);
	} catch (error) {
		res.status(500).json({ error: 'Failed to delete project' });
	}
});

router.delete('/client-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const client = await deleteClient(id);
		res.json(client);
	} catch (error) {
		res.status(500).json({ error: 'Failed to delete client' });
	}
});

router.delete('/expense-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const expense = await deleteExpense(id);
		res.json(expense);
	} catch (error) {
		res.status(500).json({ error: 'Failed to delete expense' });
	}
});

router.delete('/sales-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const sales = await deleteSales(id);
		res.json(sales);
	} catch (error) {
		res.status(500).json({ error: 'Failed to delete sales' });
	}
});

router.delete('/vendor-delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const vendor = await deleteVendor(id);
		res.json(vendor);
	} catch (error) {
		res.status(500).json({ error: 'Failed to delete vendor' });
	}
});

module.exports = router;
