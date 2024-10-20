const connection = require('../../config/db');

async function fetchClients() {
	const selectResult = `SELECT * FROM client`;

	try {
		const result = await connection.query(selectResult);
		return result.rows; // Return the result to be handled by the calling function
	} catch (error) {
		throw new Error('Failed to fetch clients');
	}
}

async function fetchProject() {
	const selectResult = `
    SELECT 
        p.*, 
        "c"."client_profilePicture", 
        "c"."client_firstName",
        "c"."client_email",
        "c"."client_lastName" 
    FROM 
        project p
    LEFT JOIN 
        client c 
    ON 
        c.id = p.client_id`;

	try {
		const result = await connection.query(selectResult);
		return result.rows; // Return the result to be handled by the calling function
	} catch (error) {
		throw new Error('Failed to project');
	}
}

async function fetchClientSelect() {
	const selectResult = `SELECT id, "client_firstName", "client_lastName","client_profilePicture","client_email" FROM client`;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch clients');
	}
}

async function fetchProjectView(id) {
	try {
		const projectQuery = `
            SELECT 
                project.*,
                client.id AS client_id, 
                client."client_lastName",   
                client."client_firstName",
                client."client_middleName",
                client."client_profilePicture",
                client."client_email",
                client."client_contactNo"
            FROM project
            LEFT JOIN client ON project.client_id = client.id
            WHERE project.id = $1;
        `;
		const transactionQuery = `
           SELECT
    p.id as id,
    c."client_profilePicture" AS profile_picture,
    c."client_lastName" || ' ' || c."client_firstName" AS name,
    p.invoice_id AS invoice_id,
    p.payment_description AS description,
    p.payment_amount AS amount,
    p.payment_date AS transaction_date,
    p.payment_type AS type,
    'PAYMENT' AS transaction_type,
    NULL AS debit,  -- Payments are usually credits
    p.payment_amount AS credit
FROM 
    payments p
JOIN 
    project pr ON p.recipient_id = pr.client_id
JOIN
    client c ON c.id = p.recipient_id
WHERE
    p.project_id = $1

UNION ALL

SELECT
    e.id as id,
    v.vendor_picture AS profile_picture,
    v.vendor_name AS name,
    e."invoiceNo" AS invoice_id,
    e.expense_description AS description,
    e.purchase_amount AS amount,
    e.purchase_date AS transaction_date,
    e.payment_type AS type,
    'EXPENSE' AS transaction_type,
    e.purchase_amount AS debit,  -- Expenses are debits
    NULL AS credit
FROM 
    expense e
JOIN 
    project pr ON e.project_id = pr.id
LEFT JOIN
    vendor v ON v.id = e.vendor_id
WHERE
    e.project_id = $1

	ORDER BY
    transaction_date ASC;
        `;

		const projectAccountsQuery = `
            select * from accounts_project where project_id = $1;
        `;

		/**
         * 
         * SELECT
    p.id as id,
    c."client_profilePicture" AS profile_picture,
    c."client_lastName" || ' ' || c."client_firstName" AS name,
    p.invoice_id AS invoice_id,
    p.payment_description AS description,
    p.payment_amount AS amount,
    p.payment_date AS transaction_date,
    p.payment_type AS type,
    'PAYMENT' AS transaction_type,
    NULL AS debit,  -- Payments are usually credits
    p.payment_amount AS credit
FROM 
    payments p
JOIN 
    project pr ON p.recipient_id = pr.client_id
JOIN
    client c ON c.id = p.recipient_id
WHERE
    p.project_id = $1

UNION ALL

SELECT
    e.id as id,
    v.vendor_picture AS profile_picture,
    v.vendor_name AS name,
    e."invoiceNo" AS invoice_id,
    e.expense_description AS description,
    e.purchase_amount AS amount,
    e.purchase_date AS transaction_date,
    e.payment_type AS type,
    'EXPENSE' AS transaction_type,
    e.purchase_amount AS debit,  -- Expenses are debits
    NULL AS credit
FROM 
    expense e
JOIN 
    project pr ON e.project_id = pr.id
LEFT JOIN
    vendor v ON v.id = e.vendor_id
WHERE
    e.project_id = $1

UNION ALL

-- Payroll Expenses
SELECT
    prx.id as id,
    NULL AS profile_picture,  -- Payroll may not have a picture
    'Payroll' AS name,
    prx."invoiceNo" AS invoice_id,
    'Employee Wages' AS description,
    prx.wages_amount AS amount,  -- Assuming you have a wages_amount column
    prx.payment_date AS transaction_date,
    'Payroll' AS type,
    'EXPENSE' AS transaction_type,
    prx.wages_amount AS debit,  -- Payroll is an expense (debit)
    NULL AS credit
FROM
    payroll_expenses prx  -- Assuming you have a payroll_expenses table
JOIN
    project pr ON prx.project_id = pr.id
WHERE
    prx.project_id = $1

-- Order the entire result set by transaction_date
ORDER BY
    transaction_date DESC;

         */

		// Execute the queries
		const projectResult = await connection.query(projectQuery, [id]);
		const transactionResult = await connection.query(transactionQuery, [id]);
		const projectAccountsResult = await connection.query(projectAccountsQuery, [id]);

		// Structure the data for output
		const projectDetails = projectResult.rows[0]; // Assuming you only fetch one project
		const transactions = transactionResult.rows; // This will contain all payments and expenses
		const projectAccounts = projectAccountsResult.rows[0];

		return {
			projectDetails,
			transactions,
			projectAccounts,
		};
	} catch (error) {
		throw new Error('Failed to fetch project and transaction details');
	}
}

async function fetchClientView(id) {
	const selectResult = `SELECT * FROM client
    WHERE id = $1;
    `;

	try {
		const result = await connection.query(selectResult, [id]);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch clients');
	}
}

async function fetchAllClientProject(id) {
	const selectResult = `SELECT * FROM project WHERE client_id = $1;
    `;

	try {
		const result = await connection.query(selectResult, [id]);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to project from clients');
	}
}

async function fetchSales() {
	const selectResult = `
    WITH AggregatedTotals AS (
    SELECT 
        project."id" AS "project_id",
        SUM(sales."billed_amount") AS "total_billed_amount",
        SUM(sales."balance") AS "total_balance",
        SUM(sales."paid_amount") AS "total_paid_amount"
    FROM 
        sales
    JOIN 
        project ON sales."project_id" = project."id"
    GROUP BY 
        project."id"
)

SELECT 
    sales.*,                  
    project."project_name",
    client."client_profilePicture",
    client."client_firstName" || ' ' || client."client_lastName" AS name, 
    totals."total_billed_amount",
    totals."total_balance",
    totals."total_paid_amount"
FROM 
    sales
JOIN 
    project ON sales."project_id" = project."id"
JOIN 
    client ON client."id" = project."client_id"
JOIN
    AggregatedTotals AS totals ON sales."project_id" = totals."project_id"
ORDER BY 
    CASE 
        WHEN sales."status" IN ('UNPAID', 'PARTIALLY PAID') THEN 1
        ELSE 2
    END,
	    sales.due_date ASC
    `;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch sales');
	}
}

async function fetchSalesProject(id) {
	const selectResult = `
    WITH AggregatedTotals AS (
    SELECT 
        project."id" AS "project_id",
        SUM(sales."billed_amount") AS "total_billed_amount",
        SUM(sales."balance") AS "total_balance",
        SUM(sales."paid_amount") AS "total_paid_amount"
    FROM 
        sales
    JOIN 
        project ON sales."project_id" = project."id"
    GROUP BY 
        project."id"
)

SELECT 
    sales.*,                  
    project."project_name",
    client."client_profilePicture",
    client."client_firstName" || ' ' || client."client_lastName" AS name, 
    totals."total_billed_amount",
    totals."total_balance",
    totals."total_paid_amount"
FROM 
    sales
JOIN 
    project ON sales."project_id" = project."id"
JOIN 
    client ON client."id" = project."client_id"
JOIN
    AggregatedTotals AS totals ON sales."project_id" = totals."project_id"
WHERE 
    project."id" = $1
ORDER BY 
    CASE 
        WHEN sales."status" IN ('UNPAID', 'PARTIALLY PAID') THEN 1
        ELSE 2
    END,
    sales."due_date" ASC;

    `;

	try {
		const result = await connection.query(selectResult, [id]);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch sales');
	}
}

async function fetchInvoiceData(invoice) {
	const selectResult = `
    SELECT 
        sales.*,                  
        project.project_name,
        client."client_profilePicture",
        client.id AS client_id,
        client."client_firstName",
        client."client_middleName",
        client."client_lastName"
    FROM 
        sales
    JOIN 
        project ON sales.project_id = project.id
    JOIN 
        client ON client.id = project.client_id
    WHERE 
        sales.invoice_no = $1;
    `;

	try {
		const result = await connection.query(selectResult, [invoice]);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch invoice from sales: ' + error.message);
	}
}

async function fetchPayment() {
	const selectResult = `
     SELECT 
        payments.*,
        client.id AS client_id, 
        client."client_firstName" || ' ' || client."client_lastName" AS name, 
        "client_profilePicture"
         
    FROM 
        payments
    LEFT JOIN 
        client ON payments.recipient_id = client.id
	ORDER BY
	    payments.payment_date DESC;
    `;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch payment');
	}
}

async function fetchPaymentData(id) {
	const selectResult = `
   SELECT 
    payments.*,                  
    project.project_name,
    client."client_profilePicture",
    client.id AS client_id,
    client."client_firstName" || ' ' || client."client_lastName" AS name
FROM 
    payments
LEFT JOIN 
    client ON payments."recipient_id" = client.id
LEFT JOIN 
    project ON client.id = project.client_id
WHERE 
    payments.id = $1;
    `;

	try {
		const result = await connection.query(selectResult, [id]);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch invoice from sales: ' + error.message);
	}
}

async function fetchTransactionClient(id) {
	const selectResult = `
   SELECT 
    payments.*, 
    project.project_name,
	project."project_projectPicture" 
	
FROM 
    payments 
LEFT JOIN 
    project ON payments.project_id = project.id 
WHERE 
    payments.recipient_id = $1
ORDER BY 
    payments.payment_date ASC;

    `;

	try {
		const result = await connection.query(selectResult, [id]);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch transaction from clients: ' + error.message);
	}
}

async function fetchProjectSelect() {
	const selectResult = `SELECT 
    project.id,
    project."project_name",
    project."project_projectPicture",
	client."client_firstName",
	client."client_lastName"
FROM 
    project 
LEFT JOIN 
    client ON project.client_id = client.id
ORDER BY
    project."project_name";
`;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch clients');
	}
}
async function fetchExpenses() {
	const selectResult = `
  WITH AggregatedTotals AS (
    SELECT 
        expense.project_id,
        SUM(expense.purchase_amount) AS total_purchase_amount
    FROM 
        expense
    GROUP BY 
        expense.project_id
)

SELECT 
    expense.*,                  
    project.project_name,
    vendor."vendor_picture",
    vendor."vendor_name",
    totals.total_purchase_amount
FROM 
    expense
LEFT JOIN 
    project ON expense.project_id = project.id
LEFT JOIN 
    vendor ON vendor.id = expense.vendor_id
LEFT JOIN
    AggregatedTotals AS totals ON expense.project_id = totals.project_id
ORDER BY 
    expense.purchase_date ASC;

    `;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch sales');
	}
}

async function fetchInvoiceExpensesData(id) {
	const selectResult = `
    SELECT 
        expense.*,                  
        project.project_name,
        vendor."vendor_picture",
        vendor."vendor_name"
    FROM 
        expense
    LEFT JOIN 
        project ON expense.project_id = project.id
    LEFT JOIN 
        vendor ON vendor.id = expense.vendor_id
    WHERE 
        expense.id = $1
    ORDER BY 
        expense.purchase_date ASC;
    `;

	try {
		const result = await connection.query(selectResult, [id]);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch invoice from sales: ' + error.message);
	}
}

async function fetchVendor() {
	const selectResult = `SELECT v.*, 
       COALESCE(e.total_expenses, 0) AS total_expenses, 
       COALESCE(e.total_purchase_amount, 0) AS total_purchase_amount
FROM vendor v
LEFT JOIN (
    SELECT vendor_name, 
           COUNT(*) AS total_expenses, 
           SUM(purchase_amount) AS total_purchase_amount
    FROM expense
    GROUP BY vendor_name
) e ON v.vendor_name = e.vendor_name
ORDER BY v.vendor_name ASC`;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch vendors');
	}
}

async function fetchVendorId(id) {
	const selectResult = `SELECT * FROM vendor WHERE id = $1`;

	try {
		const result = await connection.query(selectResult, [id]);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch vendor');
	}
}

async function fetchVendorSelect() {
	const selectResult = `SELECT id, "vendor_name", "vendor_services","vendor_picture" FROM vendor`;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch vendor');
	}
}
async function fetchExpensesProject(id) {
	const expenseResult = `	SELECT 
        expense.*,                  
        vendor."vendor_picture",
        vendor."vendor_name"
    FROM 
        expense
    LEFT JOIN
        vendor ON vendor.id = expense.vendor_id
    WHERE 
        expense.project_id = $1
    ORDER BY 
        expense.purchase_date DESC;`;

	try {
		const resultExpense = await connection.query(expenseResult, [id]);

		return resultExpense.rows;
	} catch (error) {
		throw new Error('Failed to fetch expenses: ' + error.message);
	}
}

async function fetchTransactionDetails(id) {
	const selectResult = `
        SELECT
            p.id as id,
            c."client_profilePicture" AS profile_picture,
            c."client_lastName" AS name,  
            p.invoice_id AS invoice_id,
            p.payment_description AS description,
            p.payment_amount AS amount,
            p.payment_date AS transaction_date,
            p.payment_type AS type,
            'PAYMENT' AS transaction_type 
        FROM 
            payments p
        JOIN 
            project pr
        ON 
            p.recipient_id = pr.client_id
        JOIN
            client c
        ON 
            c.id = p.recipient_id
        WHERE
            pr.id = $1

        UNION ALL

        SELECT
            e.id as id,
            v.vendor_picture AS profile_picture,
            v.vendor_name AS name,
            e."invoiceNo" AS invoice_id,
            e.expense_description AS description,
            e.purchase_amount AS amount,
            e.purchase_date AS transaction_date,
            e.payment_type AS type,
            'EXPENSE' AS transaction_type  
        FROM 
            expense e
        JOIN 
            project pr
        ON 
            e.project_id = pr.id
        LEFT JOIN
            vendor v
        ON
            v.id = e.vendor_id
        WHERE
            pr.id = $1

        ORDER BY
            transaction_date DESC;
    `;

	try {
		const result = await connection.query(selectResult, [id]);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch transaction');
	}
}

async function fetchAccounts() {
	const selectResult = `SELECT *,
       (SELECT SUM(total_balance) FROM accounts) AS total_balance_sum
FROM accounts ORDER BY ID ASC;
`;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch accounts');
	}
}

async function fetchDashboardData() {
	const activeResult = `SELECT COUNT(*) from project where status = 'ACTIVE';`;

	const selectResult = `
      
SELECT 
  (SELECT SUM(total_sales) FROM accounts) AS revenue, 
        (SELECT SUM(total_expense) FROM accounts) AS expenses, 
        (SELECT SUM(total_sales) - SUM(total_expense) FROM accounts) AS income,
    -- Total revenue for the current month (from payments)
    (SELECT COALESCE(SUM(payment_amount), 0) 
     FROM payments 
     WHERE DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', payment_date)) AS current_month_revenue,

    -- Total expenses for the current month (from expense)
    (SELECT COALESCE(SUM(purchase_amount), 0) 
     FROM expense 
     WHERE DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', purchase_date)) AS current_month_expenses,

    -- Income for the current month (revenue - expenses)
    (
      (SELECT COALESCE(SUM(payment_amount), 0) 
       FROM payments 
       WHERE DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', payment_date))
      -
      (SELECT COALESCE(SUM(purchase_amount), 0) 
       FROM expense 
       WHERE DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', purchase_date))
    ) AS current_month_income,

    -- Total revenue for the last month (from payments)
    (SELECT COALESCE(SUM(payment_amount), 0) 
     FROM payments 
     WHERE DATE_TRUNC('month', NOW() - INTERVAL '1 month') = DATE_TRUNC('month', payment_date)) AS last_month_revenue,

    -- Total expenses for the last month (from expense)
    (SELECT COALESCE(SUM(purchase_amount), 0) 
     FROM expense 
     WHERE DATE_TRUNC('month', NOW() - INTERVAL '1 month') = DATE_TRUNC('month', purchase_date)) AS last_month_expenses,

    -- Income for the last month (revenue - expenses)
    (
      (SELECT COALESCE(SUM(payment_amount), 0) 
       FROM payments 
       WHERE DATE_TRUNC('month', NOW() - INTERVAL '1 month') = DATE_TRUNC('month', payment_date))
      -
      (SELECT COALESCE(SUM(purchase_amount), 0) 
       FROM expense 
       WHERE DATE_TRUNC('month', NOW() - INTERVAL '1 month') = DATE_TRUNC('month', purchase_date))
    ) AS last_month_income,

    -- Total projects
    (SELECT COUNT(*) FROM project) AS total_projects,

    (SELECT COUNT(*) FROM project WHERE status = 'ACTIVE') AS total_active_project;
    ;
    `;

	const selectChartResultSales = `
      SELECT 
        CASE 
          WHEN EXTRACT(MONTH FROM payment_date) = 1 THEN 'January'
          WHEN EXTRACT(MONTH FROM payment_date) = 2 THEN 'February'
          WHEN EXTRACT(MONTH FROM payment_date) = 3 THEN 'March'
          WHEN EXTRACT(MONTH FROM payment_date) = 4 THEN 'April'
          WHEN EXTRACT(MONTH FROM payment_date) = 5 THEN 'May'
          WHEN EXTRACT(MONTH FROM payment_date) = 6 THEN 'June'
          WHEN EXTRACT(MONTH FROM payment_date) = 7 THEN 'July'
          WHEN EXTRACT(MONTH FROM payment_date) = 8 THEN 'August'
          WHEN EXTRACT(MONTH FROM payment_date) = 9 THEN 'September'
          WHEN EXTRACT(MONTH FROM payment_date) = 10 THEN 'October'
          WHEN EXTRACT(MONTH FROM payment_date) = 11 THEN 'November'
          WHEN EXTRACT(MONTH FROM payment_date) = 12 THEN 'December'
        END AS month,
        SUM(payment_amount) AS total_monthly_revenue
      FROM payments
      WHERE EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM NOW())
      GROUP BY EXTRACT(MONTH FROM payment_date)
      ORDER BY EXTRACT(MONTH FROM payment_date);
    `;

	const selectChartResultExpense = `
      SELECT 
        CASE 
          WHEN EXTRACT(MONTH FROM purchase_date) = 1 THEN 'January'
          WHEN EXTRACT(MONTH FROM purchase_date) = 2 THEN 'February'
          WHEN EXTRACT(MONTH FROM purchase_date) = 3 THEN 'March'
          WHEN EXTRACT(MONTH FROM purchase_date) = 4 THEN 'April'
          WHEN EXTRACT(MONTH FROM purchase_date) = 5 THEN 'May'
          WHEN EXTRACT(MONTH FROM purchase_date) = 6 THEN 'June'
          WHEN EXTRACT(MONTH FROM purchase_date) = 7 THEN 'July'
          WHEN EXTRACT(MONTH FROM purchase_date) = 8 THEN 'August'
          WHEN EXTRACT(MONTH FROM purchase_date) = 9 THEN 'September'
          WHEN EXTRACT(MONTH FROM purchase_date) = 10 THEN 'October'
          WHEN EXTRACT(MONTH FROM purchase_date) = 11 THEN 'November'
          WHEN EXTRACT(MONTH FROM purchase_date) = 12 THEN 'December'
        END AS month,
        SUM(purchase_amount) AS total_monthly_expense
      FROM expense
      WHERE EXTRACT(YEAR FROM purchase_date) = EXTRACT(YEAR FROM NOW())
      GROUP BY EXTRACT(MONTH FROM purchase_date)
      ORDER BY EXTRACT(MONTH FROM purchase_date);
    `;

	try {
		const activeCountResult = await connection.query(activeResult);
		const result = await connection.query(selectResult);
		const resultChartSales = await connection.query(selectChartResultSales);
		const resultChartExpense = await connection.query(selectChartResultExpense);

		return {
			activeProjectCount: activeCountResult[0],
			dashboard: result.rows[0],
			chartData: {
				sales: resultChartSales.rows,
				expenses: resultChartExpense.rows,
			},
		};
	} catch (error) {
		console.error('Error fetching dashboard data:', error.message);
		throw new Error('Failed to fetch dashboard data');
	}
}

async function fetchAccountsTransaction() {
	const selectResult = `
    SELECT * FROM accounts_transaction ORDER BY date DESC;`;
	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch Accounts Transactions');
	}
}

async function fetchAccountsTransaction() {
	const selectResult = `
    SELECT * FROM accounts_transaction ORDER BY date DESC;`;
	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch Accounts Transactions');
	}
}

async function fetchAccountsTransactionId(id) {
	const selectResult = `
   SELECT * FROM accounts_transaction WHERE id = $1`;
	try {
		const result = await connection.query(selectResult, [id]);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch Accounts Transactions');
	}
}

async function fetchNotifications() {
	const selectResult = `SELECT * from notification`;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch notification');
	}
}

async function fetchAlltransaction() {
	try {
		const transactionQuery = `
          SELECT
    p.id as id,
    c."client_profilePicture" AS profile_picture,
    c."client_lastName" || ' ' || c."client_firstName" AS name,
    p.invoice_id AS invoice_id,
    p.payment_description AS description,
    p.payment_amount AS amount,
    p.payment_date AS transaction_date,
    p.payment_type AS type,
    'PAYMENT' AS transaction_type,
    NULL AS debit,  -- Payments are usually credits
    p.payment_amount AS credit
FROM 
    payments p
JOIN 
    project pr ON p.recipient_id = pr.client_id
JOIN
    client c ON c.id = p.recipient_id

UNION ALL

SELECT
    e.id as id,
    v.vendor_picture AS profile_picture,
    v.vendor_name AS name,
    e."invoiceNo" AS invoice_id,
    e.expense_description AS description,
    e.purchase_amount AS amount,
    e.purchase_date AS transaction_date,
    e.payment_type AS type,
    'EXPENSE' AS transaction_type,
    e.purchase_amount AS debit,  -- Expenses are debits
    NULL AS credit
FROM 
    expense e
JOIN 
    project pr ON e.project_id = pr.id
LEFT JOIN
    vendor v ON v.id = e.vendor_id

	ORDER BY
    transaction_date ASC;
        
        `;

		const transactionResult = await connection.query(transactionQuery);
		return transactionResult.rows;
	} catch (error) {
		throw new Error('Failed to fetch project and transaction details');
	}
}

async function fetchProjectName(id) {
	const projectNameQuery = `SELECT project_name from project WHERE id = $1;`;

	try {
		const projectNameResult = await connection.query(projectNameQuery, [id]);
		return projectNameResult.rows;
	} catch (error) {
		throw new Error('Failed to fetch project name: ' + error.message);
	}
}

async function fetchTopVendor(id) {
	const projectNameQuery = `SELECT 
    v.id, 
    v.vendor_name, 
    v.vendor_picture, 
    v.vendor_services, 
    COUNT(e.*) AS total_expenses, 
    SUM(e.purchase_amount) AS total_purchase_amount
FROM 
    expense e
JOIN 
    vendor v ON e.vendor_id = v.id 
WHERE 
    e.project_id = $1
GROUP BY 
    v.id, v.vendor_name, v.vendor_picture, v.vendor_services;
        `;

	try {
		const topVendorResult = await connection.query(projectNameQuery, [id]);
		return topVendorResult.rows;
	} catch (error) {
		throw new Error('Failed to fetch project name: ' + error.message);
	}
}

module.exports = {
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
	fetchTopVendor,
};
