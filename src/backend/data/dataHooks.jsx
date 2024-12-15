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

export const columnsReceivables = [
	{ name: 'No', uid: 'no' },
	{ name: 'DESCRIPTION', uid: 'description' },
	{ name: 'CLIENT NAME', uid: 'name', sortable: true },
	{ name: 'DUE DATE', uid: 'due_date', sortable: true },
	{ name: 'PAID', uid: 'paid_amount', sortable: true },
	{ name: 'BALANCE', uid: 'balance', sortable: true },
	{ name: 'STATUS', uid: 'status', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const paymentOptions = [
	{ name: 'BANK', uid: 'BANK' },
	{ name: 'GCASH', uid: 'GCASH' },
	{ name: 'CASH', uid: 'CASH' },
];

export const statusOptions = [
	{ name: 'Paid', uid: 'FULLY PAID' },
	{ name: 'Unpaid', uid: 'UNPAID' },
	{ name: 'Partially', uid: 'PARTIALLY PAID' },
];

export const statusColorMap = {
	'FULLY PAID': 'success',
	PAID: 'success',
	UNPAID: 'danger',
	'PARTIALLY PAID': 'warning',
	'ON PROGRESS': 'primary',
	PENDING: 'warning',
	FINISHED: 'success',
};
//

//expense table
export const columnExpense = [
	{ name: 'NO.', uid: 'no' },
	{ name: 'INVOICE', uid: 'invoiceNo' },
	{ name: 'PURCHASE DATE', uid: 'purchase_date', sortable: true },
	{ name: 'VENDOR', uid: 'vendor_name', sortable: true },
	{ name: 'PROJECT', uid: 'project_name', sortable: true },
	//{ name: 'PAYMENT TYPE', uid: 'payment_type', sortable: true },
	{ name: 'DESCRIPTION', uid: 'expense_description' },
	{ name: 'AMOUNT', uid: 'purchase_amount', sortable: true },
	{ name: 'BALANCE', uid: 'balance', sortable: true },
	{ name: 'STATUS', uid: 'status', sortable: true },
	{ name: 'DIRECT EXPENSE', uid: 'direct_expense', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const services = [
	{ name: 'Tools And Equipment', uid: 'Tools And Equipment' },
	{ name: 'Food', uid: 'Food' },
	{ name: 'Others', uid: 'Others' },
];

//expense project table

export const columnProjectExpense = [
	{ name: 'No', uid: 'no' },
	{ name: 'INVOICE', uid: 'invoiceNo' },
	{ name: 'VENDOR', uid: 'vendor_name', sortable: true },
	{ name: 'DESCRIPTION', uid: 'expense_description' },
	{ name: 'PURCHASE DATE', uid: 'purchase_date', sortable: true },
	{ name: 'PAYMENT TYPE', uid: 'payment_type', sortable: true },
	{ name: 'AMOUNT', uid: 'purchase_amount', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const transactionColumnsProject = [
	//{ name: 'No', uid: 'no' },
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
	{ name: 'No', uid: 'no', sortable: true },
	{ name: 'DESCRIPTION', uid: 'payment_description', sortable: true },
	{ name: 'CLIENT', uid: 'name' },
	{ name: 'DATE', uid: 'payment_date', sortable: true },
	{ name: 'PAYMENT TYPE', uid: 'payment_type', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const salesProjectColumns = [
	{ name: 'No', uid: 'no', sortable: true },
	{ name: 'CLIENT', uid: 'name' },
	{ name: 'DESCRIPTION', uid: 'description' },
	{ name: 'PAYMENT TERMS', uid: 'payment_terms' },
	{ name: 'CONTRACT PRICE', uid: 'amount', sortable: true },
	{ name: 'AMOUNT RECEIVED', uid: 'amount_paid' },
	{ name: 'BALANCE', uid: 'balance' },
	{ name: 'START DATE', uid: 'date', sortable: true },
	{ name: 'END DATE', uid: 'end_date', sortable: true },
	{ name: 'STATUS', uid: 'project_status', sortable: true },
	//{ name: 'STATUS', uid: 'status', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const payablestransactionColumns = [
	{ name: 'No', uid: 'no' },
	{ name: 'INVOICE NO.', uid: 'invoice_id', sortable: true },
	{ name: 'VENDOR', uid: 'name' },
	{ name: 'DESCRIPTION', uid: 'payment_description', sortable: true },
	{ name: 'DATE', uid: 'payment_date', sortable: true },
	{ name: 'AMOUNT', uid: 'payment_amount', sortable: true },
	{ name: 'PAYMENT TYPE', uid: 'payment_type', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const payablesColumns = [
	{ name: 'No', uid: 'no' },
	{ name: 'INVOICE NO.', uid: 'invoice_no', sortable: true },
	{ name: 'VENDOR', uid: 'vendor_name', sortable: true },
	{ name: 'PROJECT', uid: 'project_id' },
	{ name: 'INVOICE DATE', uid: 'invoice_date', sortable: true },
	{ name: 'DUE DATE', uid: 'due_date', sortable: true },
	{ name: 'DESCRIPTION', uid: 'description', sortable: true },
	{ name: 'AMOUNT', uid: 'amount', sortable: true },
	{ name: 'PAID', uid: 'amount_paid', sortable: true },
	{ name: 'BALANCE', uid: 'balance', sortable: true },
	{ name: 'STATUS', uid: 'status', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

export const transactionClientColumns = [
	{ name: 'No', uid: 'no' },
	{ name: 'INVOICE', uid: 'invoice_id' },
	{ name: 'PROJECT', uid: 'project_name' },
	{ name: 'DESCRIPTION', uid: 'payment_description' },
	{ name: 'DATE', uid: 'payment_date', sortable: true },
	{ name: 'AMOUNT', uid: 'payment_amount', sortable: true },
	{ name: 'PAYMENT TYPE', uid: 'payment_type', sortable: true },
];

//vendor table
export const vendorColumns = [
	{ name: 'No', uid: 'no' },
	{ name: 'NAME', uid: 'vendor_name', sortable: true },
	{ name: 'CONTACT', uid: 'vendor_contactNo' },
	{ name: 'ADDRESS', uid: 'vendor_address' },
	{ name: 'SERVICES', uid: 'vendor_services' },
	{ name: 'TOTAL ORDERS', uid: 'total_expenses', sortable: true },
	{ name: 'TOTAL PURCHASED', uid: 'total_purchase_amount', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
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
				axios.get('/api/project-details', { withCredentials: true }),
				axios.get('/api/client-select', { withCredentials: true }),
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

export const ProjectName = ({ projectId }) => {
	const [projectName, setProjectName] = useState('');

	const fetchProjectName = async () => {
		try {
			const response = await axios.get(`/api/project-name/${projectId}`, {
				withCredentials: true,
			});
			setProjectName(response.data[0].project_name);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		if (projectId) {
			fetchProjectName();
		}
	}, [projectId]);

	return { projectName };
};

export const ClientData = () => {
	const [client, setClient] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchClientData = async () => {
		setLoading(true);
		try {
			const clientsResponse = await axios.get('/api/client-details', {
				withCredentials: true,
			});

			setClient(clientsResponse.data);
		} catch (err) {
			console.error('Error fetching client data:', err);
			setError(err.response?.data?.error || 'An error occurred');
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
			const response = await axios.get('/api/vendor-details', { withCredentials: true });
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
			const vendorsResponse = await axios.get(`/api/vendor-details/${editVendorId}`, {
				withCredentials: true,
			});
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
			const accountsResponse = await axios.get('/api/accounts-details', {
				withCredentials: true,
			});
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

import useSWR from 'swr';

const fetcher = (url) => axios.get(url, { withCredentials: true }).then((res) => res.data);

export const useProjectId = ({ projectId }) => {
	const {
		data: project,
		error: projectError,
		isValidating: projectLoading,
	} = useSWR(`/api/project-details/${projectId}`, fetcher);

	const loading = projectLoading;
	const error = projectError;

	return {
		project,

		loading,
		error,
	};
};

export const ProjectDataId = ({ projectId }) => {
	const [project, setProject] = useState([null]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchProjectData = useCallback(async () => {
		setLoading(true);
		try {
			const projectsResponse = await axios.get(`/api/project-details/${projectId}`, {
				withCredentials: true,
			});

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
			const response = await axios.get('/api/sales-details', { withCredentials: true });
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
			const response = await axios.get(`/api/sales-details/${projectId}`, {
				withCredentials: true,
			});
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
			const response = await axios.get('/api/expenses-details', { withCredentials: true });
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
			const response = await axios.get(`/api/expensesInvoice-details/${viewIdExpense}`, {
				withCredentials: true,
			});
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
			const response = await axios.get(`/api/expenses-details/${projectId}`, {
				withCredentials: true,
			});
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
			const projectsResponse = await axios.get(`/api/transaction-client/${clientId}`, {
				withCredentials: true,
			});
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
				axios.get(`/api/client-details/${clientId}`, { withCredentials: true }),
				axios.get(`/api/allclient-project/${clientId}`, { withCredentials: true }),
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
			const response = await axios.get('/api/payment-details', { withCredentials: true });
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

export const Sales = () => {
	const [sales, setSales] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchSalesData = async () => {
		setLoading(true);
		try {
			const response = await axios.get('/api/salesProject-details', {
				withCredentials: true,
			});
			if (Array.isArray(response.data)) {
				setSales(response.data);
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
		fetchSalesData();
	}, []);

	return { sales, loading, refetch: fetchSalesData };
};

export const PayablesTransaction = () => {
	const [payableTransaction, setPayment] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchPayableData = async () => {
		setLoading(true);
		try {
			const response = await axios.get('/api/payabletransaction-details', {
				withCredentials: true,
			});
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
		fetchPayableData();
	}, []);

	return { payableTransaction, loading, refetch: fetchPayableData };
};

export const PayablesData = () => {
	const [payables, setPayables] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchPayableData = async () => {
		setLoading(true);
		try {
			const response = await axios.get('/api/payables-details', { withCredentials: true });
			if (Array.isArray(response.data)) {
				setPayables(response.data);
			} else {
				console.error('Data is not an array:', response.data);
			}
		} catch (error) {
			console.error('Error fetching payables data:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPayableData();
	}, []);

	return { payables, loading, refetch: fetchPayableData };
};

export const DashboardData = () => {
	const [dashboard, setDashboard] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchDashboardData = async () => {
		setLoading(true);
		try {
			const response = await axios.get('/api/dashboard-data', { withCredentials: true });
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
			const response = await axios.get('/api/accounts-transactions', {
				withCredentials: true,
			});
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
			const response = await axios.get(`/api/accounts-transactions/${viewId}`, {
				withCredentials: true,
			});
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
			const response = await axios.get('/api/notifications', { withCredentials: true });
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
			const response = await axios.get('/api/all-transactions', { withCredentials: true });
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

export const TopVendorData = ({ projectId }) => {
	const [topVendor, setTopVendor] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchTopVendorData = useCallback(async () => {
		setLoading(true);
		try {
			const topVendorRes = await axios.get(`/api/top-vendor/${projectId}`, {
				withCredentials: true,
			});
			setTopVendor(topVendorRes.data);
		} catch (err) {
			console.error('Error fetching your top vendor data:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [projectId]);

	useEffect(() => {
		if (projectId) {
			fetchTopVendorData();
		}
	}, [fetchTopVendorData, projectId]);

	return { topVendor, loading, error };
};

export const Additionals = ({ projectId }) => {
	const [additionals, setAdditionals] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchTopAdditionalsData = useCallback(async () => {
		setLoading(true);
		try {
			const additionalsRes = await axios.get(`/api/additionals/${projectId}`, {
				withCredentials: true,
			});
			setAdditionals(additionalsRes.data);
		} catch (err) {
			console.error('Error fetching your additionals data:', err);
			setError(err);
		} finally {
			setLoading(false);
		}
	}, [projectId]);

	useEffect(() => {
		if (projectId) {
			fetchTopAdditionalsData();
		}
	}, [fetchTopAdditionalsData, projectId]);

	return { additionals, loading, error };
};
