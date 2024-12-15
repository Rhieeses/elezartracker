const connection = require('../../config/db');

async function fetchAllAccounts() {
	const selectResult = `SELECT * FROM users`;

	try {
		const result = await connection.query(selectResult);
		return result.rows; // Return the result to be handled by the calling function
	} catch (error) {
		throw new Error('Failed to fetch clients');
	}
}

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

async function fetchSalesProjectTotal() {
	const selectResult = `
    SELECT 
        sales_project.*,
        client."client_firstName" || ' ' || client."client_lastName" AS name, 
        "client_profilePicture",
		project_name,
		"project_projectPicture",
		"project_contractPrice"
         
    FROM 
        sales_project
	LEFT JOIN 
        project ON sales_project.project_id = project.id
    LEFT JOIN 
        client ON sales_project.client_id = client.id
   
	ORDER BY
	    sales_project.date DESC;
    `;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch payment');
	}
}

async function fetchPayableTransaction() {
	const selectResult = `
     SELECT 
        payables_transaction.*,
		vendor.vendor_name AS name,
        vendor.vendor_services,
		vendor.vendor_picture
    FROM 
        payables_transaction
    LEFT JOIN 
        vendor ON payables_transaction.vendor_id = vendor.id
   
	ORDER BY
	    payables_transaction.payment_date DESC;
    `;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch payment');
	}
}

async function fetchPayableTransactionId(id) {
	const selectResult = `
     SELECT 
        payables_transaction.*,
		vendor.vendor_name AS name,
        vendor.vendor_services,
		vendor.vendor_picture
    FROM 
        payables_transaction
    LEFT JOIN 
        vendor ON payables_transaction.vendor_id = vendor.id
    WHERE payables_transaction.id = $1
   
	ORDER BY
	    payables_transaction.payment_date DESC;
    `;

	try {
		const result = await connection.query(selectResult, [id]);
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

async function fetchPayablesData() {
	const selectResult = `
     SELECT 
        payable.*,
		project.project_name, 
		project."project_projectPicture",
        vendor.vendor_name, 
        vendor.vendor_picture,
        vendor.vendor_services,
        vendor.vendor_address	
    FROM 
        payable
    LEFT JOIN 
        vendor ON payable.vendor_id = vendor.id
	LEFT JOIN 
        project ON payable.project_id = project.id
	ORDER BY
	    payable.due_date DESC;
    `;

	try {
		const result = await connection.query(selectResult);
		return result.rows;
	} catch (error) {
		throw new Error('Failed to fetch payables');
	}
}

async function fetchPayablesDataId(id) {
	const selectResult = `
    SELECT 
        payable.*,
		project.project_name, 
		project."project_projectPicture",
        vendor.vendor_name, 
        vendor.vendor_picture,
        vendor.vendor_services,
        vendor.vendor_address	
    FROM 
        payable
    LEFT JOIN 
        vendor ON payable.vendor_id = vendor.id
	LEFT JOIN 
        project ON payable.project_id = project.id
    WHERE payable.id = $1
	ORDER BY
	    payable.due_date DESC;
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
    expense.purchase_date DESC;

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
	// First query for expenses
	const selectResultExpense = `
      SELECT
        COALESCE(SUM(CASE WHEN payment_type = 'CASH' THEN purchase_amount ELSE 0 END), 0) AS total_expense_cash,
        COALESCE(SUM(CASE WHEN payment_type = 'BANK' THEN purchase_amount ELSE 0 END), 0) AS total_expense_bank,
        COALESCE(SUM(CASE WHEN payment_type = 'GCASH' THEN purchase_amount ELSE 0 END), 0) AS total_expense_gcash
      FROM expense;
    `;

	// Second query for payments
	const selectResultPayment = `
      SELECT
        COALESCE(SUM(CASE WHEN p.payment_type = 'CASH' THEN p.payment_amount ELSE 0 END), 0) AS total_payment_cash,
        COALESCE(SUM(CASE WHEN p.payment_type = 'BANK' THEN p.payment_amount ELSE 0 END), 0) AS total_payment_bank,
        COALESCE(SUM(CASE WHEN p.payment_type = 'GCASH' THEN p.payment_amount ELSE 0 END), 0) AS total_payment_gcash
      FROM payments p;
    `;

	try {
		// Execute the first query for expenses
		const expenseResult = await connection.query(selectResultExpense);

		// Execute the second query for payments
		const paymentResult = await connection.query(selectResultPayment);

		// Combine both results in a single object or array as needed
		return {
			total_expense_cash: expenseResult.rows[0].total_expense_cash,
			total_expense_bank: expenseResult.rows[0].total_expense_bank,
			total_expense_gcash: expenseResult.rows[0].total_expense_gcash,
			total_payment_cash: paymentResult.rows[0].total_payment_cash,
			total_payment_bank: paymentResult.rows[0].total_payment_bank,
			total_payment_gcash: paymentResult.rows[0].total_payment_gcash,
		};
	} catch (error) {
		throw new Error('Failed to fetch accounts: ' + error.message);
	}
}

async function fetchDashboardData() {
	const selectResult = `
   
  SELECT 
    -- Total revenue from billed amounts and balances in sales
    COALESCE((SELECT SUM(paid_amount) FROM sales), 0) AS revenue,

    -- Total income calculation: revenue - accounts payable - total expenses
    COALESCE(

        (SELECT SUM(paid_amount) FROM sales) - 
        (SELECT SUM(purchase_amount) FROM expense), 
        0
    ) AS net_profit,

    -- Total sales from billed amounts
    COALESCE((SELECT SUM(paid_amount) FROM sales), 0) AS sales,

    -- Total expenses from purchase amounts
    COALESCE((SELECT SUM(purchase_amount) FROM expense), 0) AS expenses,

    -- Total revenue for the current month (from payments)
    COALESCE(
        (SELECT SUM(payment_amount) 
         FROM payments 
         WHERE DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', payment_date)), 
        0
    ) AS current_month_revenue,

	  -- Total revenue for the last month (from payments)
    COALESCE(
        (SELECT SUM(payment_amount) 
         FROM payments 
         WHERE DATE_TRUNC('month', NOW() - INTERVAL '1 month') = DATE_TRUNC('month', payment_date)), 
        0
    ) AS last_month_revenue,

    -- Total expenses for the current month (from expense)
    COALESCE(
        (SELECT SUM(purchase_amount) 
         FROM expense 
         WHERE DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', purchase_date)), 
        0
    ) AS current_month_expenses,

    -- Income for the current month (revenue - expenses)
    COALESCE(
        (SELECT SUM(payment_amount) 
         FROM payments 
         WHERE DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', payment_date)) - 
        (SELECT SUM(purchase_amount) 
         FROM expense 
         WHERE DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', purchase_date)), 
        0
    ) AS current_month_income,

  

    -- Total expenses for the last month (from expense)
    COALESCE(
        (SELECT SUM(purchase_amount) 
         FROM expense 
         WHERE DATE_TRUNC('month', NOW() - INTERVAL '1 month') = DATE_TRUNC('month', purchase_date)), 
        0
    ) AS last_month_expenses,

    -- Income for the last month (revenue - expenses)
    COALESCE(
        (SELECT SUM(payment_amount) 
         FROM payments 
         WHERE DATE_TRUNC('month', NOW() - INTERVAL '1 month') = DATE_TRUNC('month', payment_date)) - 
        (SELECT SUM(purchase_amount) 
         FROM expense 
         WHERE DATE_TRUNC('month', NOW() - INTERVAL '1 month') = DATE_TRUNC('month', purchase_date)), 
        0
    ) AS last_month_income,

    -- Total projects
    COALESCE((SELECT COUNT(*) FROM project), 0) AS total_projects,

    -- Total active projects
    COALESCE((SELECT COUNT(*) FROM project WHERE status = 'ACTIVE'), 0) AS total_active_projects;
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
		const result = await connection.query(selectResult);
		const resultChartSales = await connection.query(selectChartResultSales);
		const resultChartExpense = await connection.query(selectChartResultExpense);

		return {
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
    p.id AS id,
    c."client_profilePicture" AS profile_picture,
    c."client_lastName" || ' ' || c."client_firstName" AS name,
    p.invoice_id AS invoice_id,
    p.payment_description AS description,
    p.payment_amount AS amount,
    p.payment_date AS transaction_date,
    p.payment_type AS type,
    'PAYMENT' AS transaction_type,
    NULL AS credit,  -- Payments are usually credits
    p.payment_amount AS debit
FROM 
    payments p
JOIN 
    project pr ON p.recipient_id = pr.client_id
JOIN
    client c ON c.id = p.recipient_id

UNION ALL

SELECT
    e.id AS id,
    v.vendor_picture AS profile_picture,
    v.vendor_name AS name,
    e."invoiceNo" AS invoice_id,
    e.expense_description AS description,
    e.purchase_amount AS amount,
    e.purchase_date AS transaction_date,
    e.payment_type AS type,
    'EXPENSE' AS transaction_type,
    e.purchase_amount AS credit, 
    NULL AS debit
FROM 
    expense e
JOIN 
    project pr ON e.project_id = pr.id  -- Corrected JOIN position
LEFT JOIN
    vendor v ON v.id = e.vendor_id
WHERE 
    e.is_payable = false 

UNION ALL

SELECT
    p.id AS id,
    v.vendor_picture AS profile_picture,
    v.vendor_name AS name,
    p.invoice_id AS invoice_id,
   	'Payment for' || ' ' || p.payment_description AS description ,
    p.payment_amount AS amount,
    p.payment_date AS transaction_date,
    p.payment_type AS type,
    'EXPENSE' AS transaction_type,
    p.payment_amount AS credit, 
    NULL AS debit
FROM 
    payables_transaction p
JOIN
    vendor v ON v.id = p.vendor_id

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

async function fetchAdditionals(id) {
	const additionalsQuery = ` 
    SELECT *
    FROM sales
    WHERE invoice_no LIKE 'ADS-%' AND project_id = $1;
`;

	try {
		const additionalsRes = await connection.query(additionalsQuery, [id]);
		return additionalsRes.rows;
	} catch (error) {
		throw new Error('Failed to fetch additionals: ' + error.message);
	}
}
/**
async function fetchReport() {
	//const { formattedMonth, selectedYear } = reportBody;

	const reportsQuery = `
   SELECT COUNT(*) 
    FROM project 
    WHERE "project_startDate" >= DATE_TRUNC('month', DATE '$1-$2-01') 
        AND "project_startDate" < DATE_TRUNC('month', DATE '$1-$2-01') + INTERVAL '1 month';
`;

	const reportsQuery = `
SELECT COUNT(*) 
FROM project 
WHERE "project_startDate" >= DATE_TRUNC('month', DATE '2024-10-01') 
      AND "project_startDate" < DATE_TRUNC('month', DATE '2024-10-01') + INTERVAL '1 month';
`;

	try {
		const reportsResult = await connection.query(reportsQuery);
		return reportsResult.rows;
	} catch (error) {
		throw new Error('Failed to fetch project count: ' + error.message);
	}
}*/

async function fetchReport(reportBody) {
	const { timeFrame, quarters, formattedMonth, selectedYear } = reportBody;

	const firstQuarter = [
		`${selectedYear}-01-01`, // January 1, 2024
		`${selectedYear}-03-31`, // March 31, 2024
	];

	const secondQuarter = [
		`${selectedYear}-04-01`, // April 1, 2024
		`${selectedYear}-06-30`, // June 30, 2024
	];

	const thirdQuarter = [
		`${selectedYear}-07-01`, // July 1, 2024
		`${selectedYear}-09-30`, // // September 30, 2024
	];

	const fourthQuarter = [
		`${selectedYear}-10-01`, // October 1, 2024
		`${selectedYear}-12-31`, // December 31, 2024
	];

	let date = [];

	switch (timeFrame) {
		case 'monthly':
			if (formattedMonth) {
				const startDate = `${selectedYear}-${formattedMonth}-01`;
				const endDate = new Date(selectedYear, formattedMonth, 0)
					.toISOString()
					.split('T')[0];
				date = [startDate, endDate];
			}
			break;

		case 'quarterly':
			switch (quarters) {
				case 'Q1':
					date = firstQuarter;
					break;
				case 'Q2':
					date = secondQuarter;
					break;
				case 'Q3':
					date = thirdQuarter;
					break;
				case 'Q4':
					date = fourthQuarter;
					break;
				default:
					date = ['No value found'];
			}
			break;
		case 'annually':
			date = [`${selectedYear}-01-01`, `${selectedYear}-12-31`];
			break;
		default:
			date = ['No value found'];
	}

	if (!date[0] || !date[1]) {
		throw new Error('Invalid date range');
	}

	// SQL Query using the selected date range
	const generatedValue = `
            WITH 
            project_count AS (
                SELECT COUNT(*) AS project_acquired
                FROM project
                WHERE "project_startDate" >= $1
                AND "project_startDate" <= $2
            ),
            revenue AS (
                SELECT COALESCE(SUM(payment_amount), 0) AS revenue
                FROM payments
                WHERE payment_date >= $1
                AND payment_date <= $2
            ),
            net_income AS (
                SELECT 
                    COALESCE(SUM(payments.payment_amount), 0) - COALESCE(SUM(expenses.purchase_amount), 0) AS net_income
                FROM 
                    (SELECT SUM(payment_amount) AS payment_amount
                    FROM payments 
                    WHERE payment_date >= $1 
                    AND payment_date <= $2) AS payments,
                    (SELECT SUM(purchase_amount) AS purchase_amount
                    FROM expense 
                    WHERE purchase_date >= $1 
                    AND purchase_date <= $2) AS expenses
            ),
            expenses AS (
                SELECT COALESCE(SUM(purchase_amount), 0) AS expenses
                FROM expense
                WHERE purchase_date >= $1 
                AND purchase_date <= $2
            )
        SELECT 
            pc.project_acquired,
            r.revenue,
            ni.net_income,
            e.expenses
        FROM 
            project_count pc,
            revenue r,
            net_income ni,
            expenses e;
        `;

	const customerAccounts = `
    SELECT 
        client.id AS client_id,
        client."client_firstName" || ' ' || client."client_middleName" || ' ' || client."client_lastName" AS client_name,
        client."client_contactNo",
        client."client_email",
        client."client_address",
        COALESCE(payments.payment_amount, 0) AS total_paid_amount
    FROM 
        client
    LEFT JOIN 
        payments ON payments.recipient_id = client.id 
            AND payments.payment_date >= $1
            AND payments.payment_date <= $2;

    `;

	const vendorAccounts = `
    SELECT 
        vendor.id,
        vendor.vendor_name, 
        vendor."vendor_contactNo", 
        vendor.vendor_email, 
        vendor.vendor_address, 
        COALESCE(SUM(expense.purchase_amount), 0) AS total_expense_amount,
        COUNT(expense.id) AS total_order 
    FROM 
        vendor
    LEFT JOIN 
        expense ON expense.vendor_id = vendor.id 
    WHERE 
        expense.purchase_date >= $1
            AND expense.purchase_date <= $2
    GROUP BY 
        vendor.id, 
        vendor.vendor_name;
     `;

	const salesAccounts = `
    SELECT 
        sales_project.id,
        client."client_firstName" || ' ' || client."client_middleName" || ' ' || client."client_lastName" AS client_name,
        date,
        client_id,
        payment_terms,
        amount
    FROM sales_project

    LEFT JOIN 
        client ON sales_project.client_id = client.id 
    WHERE 
        sales_project.date >= $1
        AND sales_project.date <= $2;
       `;

	const expenseAccounts = `
    SELECT 
        purchase_date,
        vendor_name,
        payment_type,
        purchase_amount
    FROM 
        expense
    WHERE 
        purchase_date >= $1
        AND purchase_date <= $2;
     `;

	const cashFlow = `
    SELECT
        p.id AS id,
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
        client c ON c.id = pr.client_id
    WHERE 
        p.payment_date >= $1
        AND p.payment_date <= $2

    UNION ALL

    SELECT
        e.id AS id,
        v.vendor_name AS name,
        e."invoiceNo" AS invoice_id,
        e.expense_description AS description,
        e.purchase_amount AS amount,
        e.purchase_date AS transaction_date,
        e.payment_type AS type,
        'EXPENSE' AS transaction_type,
        e.purchase_amount AS debit, 
        NULL AS credit
    FROM 
        expense e
    JOIN 
        project pr ON e.project_id = pr.id  
    LEFT JOIN
        vendor v ON v.id = e.vendor_id
    WHERE 
        e.purchase_date >= $1
        AND e.purchase_date <= $2
        AND e.is_payable = false 

    UNION ALL

    SELECT
        p.id AS id,
        v.vendor_name AS name,
        p.invoice_id AS invoice_id,
        'Payment for ' || p.payment_description AS description,
        p.payment_amount AS amount,
        p.payment_date AS transaction_date,
        p.payment_type AS type,
        'EXPENSE' AS transaction_type,
        p.payment_amount AS debit, 
        NULL AS credit
    FROM 
        payables_transaction p
    JOIN
        vendor v ON v.id = p.vendor_id
    WHERE 
        p.payment_date >= $1
        AND p.payment_date <= $2

    ORDER BY
        transaction_date ASC;
     `;

	try {
		//const result = await connection.query(selectResult, [selectedYear, formattedMonth]);
		const generatedValueResult = await connection.query(generatedValue, [date[0], date[1]]);
		const customerAccountsResult = await connection.query(customerAccounts, [date[0], date[1]]);
		const vendorAccountsResult = await connection.query(vendorAccounts, [date[0], date[1]]);
		const salesAccountsResult = await connection.query(salesAccounts, [date[0], date[1]]);
		const expenseAccountsResult = await connection.query(expenseAccounts, [date[0], date[1]]);
		const cashFlowResult = await connection.query(cashFlow, [date[0], date[1]]);

		return {
			generatedValue: generatedValueResult.rows,
			customerAccounts: customerAccountsResult.rows,
			vendorAccounts: vendorAccountsResult.rows,
			salesAccounts: salesAccountsResult.rows,
			expenseAccounts: expenseAccountsResult.rows,
			cashFlow: cashFlowResult.rows,
		};
	} catch (error) {
		throw new Error('Failed to fetch Reports');
	}
}

module.exports = {
	fetchAllAccounts,
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
	fetchSalesProjectTotal,
	fetchPayableTransaction,
	fetchPayableTransactionId,
	fetchPaymentData,
	fetchPayablesData,
	fetchPayablesDataId,
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
	fetchReport,
	fetchAdditionals,
};
