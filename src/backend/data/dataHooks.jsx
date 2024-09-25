import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

//sales table columns
export const columns = [
	{ name: 'CLIENT NAME', uid: 'name', sortable: true },
	{ name: 'DUE DATE', uid: 'due_date', sortable: true },
	{ name: 'INVOICE', uid: 'invoice_no' },
	{ name: 'DESCRIPTION', uid: 'description' },
	{ name: 'BILLED', uid: 'billed_amount', sortable: true },
	{ name: 'PAID', uid: 'paid_amount', sortable: true },
	{ name: 'BALANCE', uid: 'balance', sortable: true },
	{ name: 'STATUS', uid: 'status', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const statusOptions = [
	{ name: 'Paid', uid: 'FULLY PAID' },
	{ name: 'Unpaid', uid: 'UNPAID' },
	{ name: 'Partially', uid: 'PARTIALLY PAID' },
];

export const statusColorMap = {
	'FULLY PAID': 'success',
	UNPAID: 'danger',
	'PARTIALLY PAID': 'warning',
};
//

//expense table

export const columnExpense = [
	{ name: 'INVOICE', uid: 'invoiceNo' },
	{ name: 'VENDOR', uid: 'vendor_name', sortable: true },
	{ name: 'PROJECT', uid: 'project_name', sortable: true },
	{ name: 'PURCHASE DATE', uid: 'purchase_date', sortable: true },
	{ name: 'PAYMENT TYPE', uid: 'payment_type', sortable: true },
	{ name: 'DESCRIPTION', uid: 'expense_description' },
	{ name: 'AMOUNT', uid: 'purchase_amount', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const paymentOptions = [
	{ name: 'Cash', uid: 'CASH' },
	{ name: 'Bank Transfer', uid: 'BANK TRANSFER' },
];

//expense project table

export const columnProjectExpense = [
	{ name: 'INVOICE', uid: 'invoiceNo' },
	{ name: 'VENDOR', uid: 'vendor_name', sortable: true },
	{ name: 'DESCRIPTION', uid: 'expense_description' },
	{ name: 'PURCHASE DATE', uid: 'purchase_date', sortable: true },
	{ name: 'PAYMENT TYPE', uid: 'payment_type', sortable: true },
	{ name: 'AMOUNT', uid: 'purchase_amount', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const transactionColumnsProject = [
	{ name: 'INVOICE', uid: 'invoice_id' },
	{ name: 'DATE', uid: 'transaction_date', sortable: true },
	{ name: 'CLIENT/VENDOR', uid: 'name', sortable: true },
	{ name: 'DESCRIPTION', uid: 'description' },
	{ name: 'PAYMENT TYPE', uid: 'type', sortable: true },
	{ name: 'DEBIT', uid: 'debit', sortable: true }, // Debit column for expenses
	{ name: 'CREDIT', uid: 'credit', sortable: true }, // Credit column for payments
];

export const transactionType = [
	{ name: 'DEBIT', uid: 'EXPENSE' },
	{ name: 'CREDIT', uid: 'PAYMENT' },
];

export const paymentType = [
	{ name: 'CASH', uid: 'CASH' },
	{ name: 'BANK', uid: 'BANK' },
];

export const transactionColumns = [
	{ name: 'INVOICE', uid: 'invoice_id' },
	{ name: 'CLIENT', uid: 'name' },
	{ name: 'DESCRIPTION', uid: 'payment_description' },
	{ name: 'DATE', uid: 'payment_date', sortable: true },
	{ name: 'AMOUNT', uid: 'payment_amount', sortable: true },
	{ name: 'PAYMENT TYPE', uid: 'payment_type', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const transactionClientColumns = [
	{ name: 'INVOICE', uid: 'invoice_id' },
	{ name: 'PROJECT', uid: 'project_name' },
	{ name: 'DESCRIPTION', uid: 'payment_description' },
	{ name: 'DATE', uid: 'payment_date', sortable: true },
	{ name: 'AMOUNT', uid: 'payment_amount', sortable: true },
	{ name: 'PAYMENT TYPE', uid: 'payment_type', sortable: true },
];

export const ProjectData = () => {
	const [project, setProject] = useState([]);
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchProjectData = async () => {
		setLoading(true);
		try {
			const [projectsResponse, clientsResponse] = await Promise.all([
				axios.get('/api/project-details'),
				axios.get('/api/client-select'),
			]);
			setProject(projectsResponse.data);
			setClients(clientsResponse.data);
		} catch (err) {
			console.error('Error fetching project data:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProjectData();
	}, []);

	return { project, clients, loading, error, refetch: fetchProjectData };
};

export const ClientData = () => {
	const [client, setClient] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchClientData = async () => {
		setLoading(true);
		try {
			const clientsResponse = await axios.get(`/api/client-details`);
			setClient(clientsResponse.data);
		} catch (err) {
			console.error('Error fetching client  data:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchClientData();
	}, []);

	return { client, loading, error, refetch: fetchClientData };
};

export const VendorData = () => {
	const [vendor, setVendor] = useState([]);
	const [loadingVendor, setLoadingVendor] = useState(true);
	const [errorVendor, setErrorVendor] = useState(null);

	const fetchVendorData = async () => {
		setLoadingVendor(true);
		try {
			const response = await axios.get('/api/vendor-details');
			if (Array.isArray(response.data)) {
				setVendor(response.data);
			} else {
				setErrorVendor('Unexpected data format');
				setVendor([]);
			}
		} catch (err) {
			console.error('Error fetching vendors data:', err);
			setErrorVendor(err);
		} finally {
			setLoadingVendor(false);
		}
	};

	useEffect(() => {
		fetchVendorData();
	}, []);

	return { vendor, loadingVendor, errorVendor, refetch: fetchVendorData };
};

export const VendorDataID = ({ editVendorId }) => {
	const [vendorDataId, setVendor] = useState([]);
	const [loadingVendorId, setLoadingVendor] = useState(true);
	const [errorVendor, setErrorVendor] = useState(null);

	const fetchVendorDataId = async () => {
		setLoadingVendor(true);
		try {
			const vendorsResponse = await axios.get(`/api/vendor-details/${editVendorId}`);
			setVendor(vendorsResponse.data);
		} catch (err) {
			console.error('Error fetching vendors data:', err);
			setErrorVendor(err);
		} finally {
			setLoadingVendor(false);
		}
	};

	useEffect(() => {
		if (editVendorId) {
			fetchVendorDataId();
		}
	}, [editVendorId]);

	return { vendorDataId, loadingVendorId, errorVendor, refetch: fetchVendorDataId };
};

export const AccountsData = () => {
	const [accounts, setAccounts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchAccountsData = async () => {
		setLoading(true);
		try {
			const accountsResponse = await axios.get('/api/accounts-details');
			setAccounts(accountsResponse.data);
		} catch (err) {
			console.error('Error fetching vendors data:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAccountsData();
	}, []);

	return { accounts, loading, error, refetch: fetchAccountsData };
};

export const ProjectDataId = ({ projectId }) => {
	const [project, setProject] = useState([null]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchProjectData = useCallback(async () => {
		setLoading(true);
		try {
			const projectsResponse = await axios.get(`/api/project-details/${projectId}`);
			setProject(projectsResponse.data);
		} catch (err) {
			console.error('Error fetching your project data:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [projectId]); // Include editVendorId as a dependency

	useEffect(() => {
		fetchProjectData();
	}, [projectId, fetchProjectData]);

	return { project, loading, error, refetch: fetchProjectData };
};

export const ReceivableData = () => {
	const [receivable, setReceivable] = useState([null]);

	const fetchReceivableData = async () => {
		try {
			const response = await axios.get('/api/sales-details');
			if (Array.isArray(response.data)) {
				setReceivable(response.data);
			} else {
				console.error('Data is not an array:', response.data);
			}
		} catch (error) {
			console.error('Error fetching receivable data:', error);
		}
	};

	useEffect(() => {
		fetchReceivableData();
	}, []);

	return { receivable, refetch: fetchReceivableData };
};

export const ReceivableDataProject = ({ projectId }) => {
	const [receivableProject, setReceivable] = useState([null]);

	const fetchReceivableDataProject = useCallback(async () => {
		try {
			const response = await axios.get(`/api/sales-details/${projectId}`);
			if (Array.isArray(response.data)) {
				setReceivable(response.data);
			} else {
				console.error('Data is not an array:', response.data);
			}
		} catch (error) {
			console.error('Error fetching receivable data:', error);
		}
	}, [projectId]);

	useEffect(() => {
		fetchReceivableDataProject();
	}, [projectId, fetchReceivableDataProject]);

	return { receivableProject, refetchReceivableProject: fetchReceivableDataProject };
};

export const ExpenseData = () => {
	const [expense, setExpense] = useState([null]);

	const fetchExpenseData = async () => {
		try {
			const response = await axios.get('/api/expenses-details');
			if (Array.isArray(response.data)) {
				setExpense(response.data);
			} else {
				console.error('Data is not an array:', response.data);
			}
		} catch (error) {
			console.error('Error fetching expense data:', error);
		}
	};

	useEffect(() => {
		fetchExpenseData();
	}, []);

	return { expense, refetch: fetchExpenseData };
};

export const ExpenseDataInvoice = ({ viewIdExpense }) => {
	const [invoiceExpense, setInvoiceExpense] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchExpenseDataInvoice = async () => {
		setLoading(true);

		try {
			const response = await axios.get(`/api/expensesInvoice-details/${viewIdExpense}`);
			if (Array.isArray(response.data)) {
				setInvoiceExpense(response.data);
			} else {
				console.error('Data is not an array:', response.data);
			}
		} catch (error) {
			console.error('Error fetching expense invoice data:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (viewIdExpense) {
			fetchExpenseDataInvoice();
		}
	}, [viewIdExpense]);

	return { invoiceExpense, loading, refetchExpenseInvoice: fetchExpenseDataInvoice };
};

export const ExpenseProjectView = ({ projectId }) => {
	const [expenseProject, setExpenseProject] = useState([]); // For expenses
	const [loadingExpense, setLoadingExpense] = useState(true);
	const [error, setError] = useState(null);

	const fetchExpenseData = async () => {
		setLoadingExpense(true);

		try {
			const response = await axios.get(`/api/expenses-details/${projectId}`);
			setExpenseProject(response.data);
		} catch (error) {
			console.error('Error fetching expense data:', error);
			setError(error);
		} finally {
			setLoadingExpense(false);
		}
	};

	useEffect(() => {
		fetchExpenseData();
	}, [projectId]);

	return {
		expenseProject,
		error,
		loadingExpense,
		refetchExpenseProject: fetchExpenseData,
	};
};

export const TransactionClientData = ({ clientId }) => {
	const [clientTransaction, setclientTransaction] = useState([null]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchClientTransaction = useCallback(async () => {
		setLoading(true);
		try {
			const projectsResponse = await axios.get(`/api/transaction-client/${clientId}`);
			setclientTransaction(projectsResponse.data);
		} catch (err) {
			console.error('Error fetching your transaction data:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [clientId]);

	useEffect(() => {
		fetchClientTransaction();
	}, [clientId, fetchClientTransaction]);

	return { clientTransaction, loading, error, refetch: fetchClientTransaction };
};

export const ClientDataId = ({ clientId }) => {
	const [client, setClient] = useState([]);
	const [project, setProject] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchClientDataId = useCallback(async () => {
		setLoading(true);
		try {
			const [clientsResponse, projectsResponse] = await Promise.all([
				axios.get(`/api/client-details/${clientId}`),
				axios.get(`/api/allclient-project/${clientId}`),
			]);
			setClient(clientsResponse.data);
			setProject(projectsResponse.data);
		} catch (err) {
			console.error('Error fetching clients data:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [clientId]);

	useEffect(() => {
		fetchClientDataId();
	}, [clientId, fetchClientDataId]);

	return { client, project, loading, error, refetch: fetchClientDataId };
};

export const PaymentData = () => {
	const [payment, setPayment] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchPaymentData = async () => {
		setLoading(true);
		try {
			const response = await axios.get('/api/payment-details');
			if (Array.isArray(response.data)) {
				setPayment(response.data);
			} else {
				console.error('Data is not an array:', response.data);
			}
		} catch (error) {
			console.error('Error fetching sales data:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPaymentData();
	}, []);

	return { payment, loading, refetch: fetchPaymentData };
};

export const DashboardData = () => {
	const [dashboard, setDashboard] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchDashboardData = async () => {
		setLoading(true);
		try {
			const response = await axios.get('/api/dashboard-data');
			setDashboard(response.data);
		} catch (error) {
			console.error('Error fetching sales data:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	return { dashboard, loading, refetch: fetchDashboardData };
};

export const AccountsTransaction = () => {
	const [accTransaction, setAccTransaction] = useState([]);

	const fetchAccountsTransaction = async () => {
		try {
			const response = await axios.get('/api/accounts-transactions');
			if (Array.isArray(response.data)) {
				setAccTransaction(response.data);
			} else {
				console.error('Data is not an array:', response.data);
			}
		} catch (error) {
			console.error('Error fetching expense data:', error);
		}
	};

	useEffect(() => {
		fetchAccountsTransaction();
	}, []);

	return { accTransaction, refetchTransaction: fetchAccountsTransaction };
};

export const AccountsTransactionId = ({ viewId }) => {
	const [accountsTransactionId, setAccounts] = useState([]);
	const [loadingTransact, setLoading] = useState(true);

	const fetchAccountTransactionId = async () => {
		setLoading(true);

		try {
			const response = await axios.get(`/api/accounts-transactions/${viewId}`);
			if (Array.isArray(response.data)) {
				setAccounts(response.data);
			} else {
				console.error('Data is not an array:', response.data);
			}
		} catch (error) {
			console.error('Error fetching expense invoice data:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (viewId) {
			fetchAccountTransactionId();
		}
	}, [viewId]);

	return { accountsTransactionId, loadingTransact, refetchTransact: fetchAccountTransactionId };
};

export const Notification = () => {
	const [notifications, setNotification] = useState([]);

	const fetchNotifications = async () => {
		try {
			const response = await axios.get('/api/notifications');
			if (Array.isArray(response.data)) {
				setNotification(response.data);
			} else {
				console.error('Data is not an array:', response.data);
			}
		} catch (error) {
			console.error('Error fetching notification data:', error);
		}
	};

	useEffect(() => {
		fetchNotifications();
	}, []);

	return { notifications, refetch: fetchNotifications };
};

export const AllTransactions = () => {
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchAllTransactions = async () => {
		setLoading(true);
		try {
			const response = await axios.get('/api/all-transactions');
			if (Array.isArray(response.data)) {
				setTransactions(response.data);
				setLoading(false);
			} else {
				console.error('Data is not an array:', response.data);
			}
		} catch (error) {
			console.error('Error fetching transactions data:', error);
		}
	};

	useEffect(() => {
		fetchAllTransactions();
	}, []);

	return { transactions, loading, refetch: fetchAllTransactions };
};