const connection = require('../../config/db');
const {
	generateRandomInvoiceNumber,
	calculateProgressPayment,
} = require('../../../utils/inputFormatter');

async function clientInsertData(clientFormData) {
	const {
		lastName,
		firstName,
		middleName,
		clientEmail,
		contactNo,
		clientAddress,
		profilePicture,
		description,
	} = clientFormData;

	const queryInsert = `
  INSERT INTO client
  ("client_lastName", "client_firstName", "client_middleName", "client_email", "client_contactNo", "client_address", "client_dateJoined", "client_profilePicture" ,"client_description")
  VALUES($1, $2, $3, $4, $5, $6, NOW(), $7, $8)
  RETURNING *;
`;

	try {
		const result = await connection.query(queryInsert, [
			lastName,
			firstName,
			middleName,
			clientEmail,
			contactNo,
			clientAddress,
			profilePicture,
			description,
		]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error inserting data: ${error.message}`);
		throw new Error(`Error inserting data: ${error.message}`);
	}
}

async function projectInsertData(projectFormData) {
	const {
		selectClient,
		projectName,
		projectCategory,
		projectAddress,
		contractPrice,
		paymentTerms,
		downpayment,
		startDate,
		endDate,
		projectDescription,
		projectPicture,
	} = projectFormData;

	const queryInsertProject = `
    INSERT INTO project
    ("client_id", "project_name", "project_category", "project_address", "project_contractPrice", "project_paymentTerms", "project_startDate", "project_endDate", "project_description", "project_projectPicture", "downpayment","warningvalue")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12)
    RETURNING id;
  `;

	console.log(contractPrice);

	try {
		// Insert the project details
		const result = await connection.query(queryInsertProject, [
			selectClient,
			projectName,
			projectCategory,
			projectAddress,
			contractPrice,
			paymentTerms,
			startDate,
			endDate,
			projectDescription,
			projectPicture,
			downpayment,
			20,
		]);
		const projectId = result.rows[0].id;

		const accountsProjectSql = `
					INSERT INTO accounts_project
					("project_id", "contract_price", "total_paid", "total_expenses") 
					VALUES ($1, $2, $3,$4)
					RETURNING id;
					`;

		const accountsProjectValues = [projectId, contractPrice, 0, 0];

		await connection.query(accountsProjectSql, accountsProjectValues);

		if (paymentTerms === 'Full payment') {
			const fullPaymentSql = `
				INSERT INTO sales 
				("project_id", "invoice_no", "due_date", "description", "billed_amount", "paid_amount", "balance", "status") 
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
				RETURNING id;
				`;

			const fullpaymentValues = [
				projectId,
				generateRandomInvoiceNumber(),
				startDate,
				'Full payment',
				contractPrice,
				0,
				contractPrice,
				'UNPAID',
			];

			await connection.query(fullPaymentSql, fullpaymentValues);
		} else {
			const paymentDetails = calculateProgressPayment(
				contractPrice,
				downpayment,
				startDate,
				endDate,
			);

			const downpaymentSql = `
				INSERT INTO sales 
				("project_id", "invoice_no", "due_date", "description", "billed_amount", "paid_amount", "balance", "status") 
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
				RETURNING id;
			`;
			const downpaymentValues = [
				projectId,
				generateRandomInvoiceNumber(),
				startDate,
				'Downpayment',
				paymentDetails.downpayment,
				0,
				paymentDetails.downpayment,
				'UNPAID',
			];

			const downpaymentResult = await connection.query(downpaymentSql, downpaymentValues);
			const downpaymentId = downpaymentResult.rows[0].id;

			// Insert the monthly payments
			for (let i = 0; i < paymentDetails.duration; i++) {
				const monthlyPaymentDate = new Date(startDate);
				monthlyPaymentDate.setMonth(monthlyPaymentDate.getMonth() + i + 1);

				// Check if this is the last iteration
				const isLastMonth = i === paymentDetails.duration - 1;

				// Append month to the description
				let description;
				if (isLastMonth) {
					description = 'Completion Payment';
				} else {
					const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
						monthlyPaymentDate,
					);
					description = `Monthly Payment - ${monthName}`;
				}

				const monthlyPaymentSql = `
					INSERT INTO sales 
					("project_id", "invoice_no", "due_date", "description", "billed_amount", "paid_amount", "balance", "status") 
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
				`;
				const monthlyPaymentValues = [
					projectId,
					generateRandomInvoiceNumber(),
					monthlyPaymentDate,
					description,
					paymentDetails.monthlyPayment,
					0,
					paymentDetails.monthlyPayment,
					'UNPAID',
				];

				await connection.query(monthlyPaymentSql, monthlyPaymentValues);
			}
			console.log('Monthly payments inserted successfully.');
		}

		return result.rows[0];
	} catch (error) {
		console.error(`Error inserting data: ${error.message}`);
		throw new Error(`Error inserting data: ${error.message}`);
	}
}

async function vendorInsertData(vendorFormData) {
	const { vendorName, vendorService, vendorEmail, vendorContactNo, vendorAddress, vendorPicture } =
		vendorFormData;

	const queryInsert = `
  INSERT INTO vendor
  ("vendor_name", "vendor_address", "vendor_email", "vendor_contactNo", "vendor_services", "vendor_dateJoined", "vendor_picture")
  VALUES($1, $2, $3, $4, $5, NOW(), $6)
  RETURNING *;
`;

	try {
		const result = await connection.query(queryInsert, [
			vendorName,
			vendorAddress,
			vendorEmail,
			vendorContactNo,
			vendorService,
			vendorPicture,
		]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error inserting data: ${error.message}`);
		throw new Error(`Error inserting data: ${error.message}`);
	}
}

async function salesPaymentInsert(salesPaymentData) {
	const {
		invoiceId,
		projectId,
		invoiceNo,
		clientId,
		description,
		paymentAmount,
		paymentDate,
		paymentType,
	} = salesPaymentData;

	const queryPaymentInsert = `
		INSERT INTO payments
		("recipient_id", "project_id","invoice_id", "payment_description", "payment_amount", "payment_date", "payment_type")
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING *;
	`;

	const querySalesUpdate = `
		UPDATE sales
		SET paid_amount = paid_amount + $1, 
			balance = billed_amount - (paid_amount + $1)
		WHERE id = $2
		RETURNING project_id;
	`;

	const accountsPaidSql = `
	UPDATE accounts_project
	SET total_paid = total_paid + $1
	WHERE project_id = $2
	RETURNING *;
				`;

	try {
		await connection.query(accountsPaidSql, [paymentAmount, projectId]);
		console.log('Expenses inserted in accounts!');
	} catch (error) {
		console.error(`Error processing paid data: ${error.message}`);
		console.error(`Error processing accounts paid data: ${error.message}`);
	}

	try {
		// Insert the payment
		await connection.query(queryPaymentInsert, [
			clientId,
			projectId,
			invoiceNo,
			description,
			paymentAmount,
			paymentDate,
			paymentType,
		]);

		await connection.query(querySalesUpdate, [paymentAmount, invoiceId]);
		console.log('Sales updated and Payment inserted!');
	} catch (error) {
		console.error(`Error processing payment data: ${error.message}`);
		throw new Error(`Error processing payment data: ${error.message}`);
	}
}

async function expenseInsert(expenseFormData) {
	const {
		projectId,
		vendor,
		vendorName,
		purchaseDate,
		description,
		purchaseAmount,
		paymentType,
		invoiceNo,
	} = expenseFormData;

	const queryExpenseInsert = `
		INSERT INTO expense
		("project_id", "vendor_id", "purchase_date", "expense_description", "purchase_amount", "payment_type", "invoiceNo", "vendor_name")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING *;
	`;

	const accountsExpenseSql = `
		UPDATE accounts_project
		SET total_expenses = total_expenses + $1
		WHERE project_id = $2
		RETURNING *;
					`;

	try {
		await connection.query(accountsExpenseSql, [purchaseAmount, projectId]);
		console.log('Expenses inserted in accounts!');
	} catch (error) {
		console.error(`Error processing expense data: ${error.message}`);
		console.error(`Error processing accounts expense data: ${error.message}`);
	}

	try {
		// Insert the expense
		await connection.query(queryExpenseInsert, [
			projectId,
			vendor,
			purchaseDate,
			description,
			purchaseAmount,
			paymentType,
			invoiceNo,
			vendorName,
		]);
		console.log('Expense inserted!');
	} catch (error) {
		console.error(`Error processing expense data: ${error.message}`);
		throw new Error(`Error processing expense data: ${error.message}`);
	}
}

async function expenseScanInsert(expenseFormData) {
	const { projectId, vendorName, date, description, amount, paymentType, invoiceNumber } =
		expenseFormData;

	const queryExpenseInsert = `
		WITH vendor_insert AS (
			INSERT INTO vendor (vendor_name)
			VALUES ($2) 
			ON CONFLICT (vendor_name) DO NOTHING
			RETURNING id
		),
		selected_vendor AS (
			SELECT id FROM vendor WHERE vendor_name = $2
			UNION ALL
			SELECT id FROM vendor_insert
		)
		INSERT INTO expense (
			"project_id", 
			"vendor_name", 
			"purchase_date", 
			"expense_description", 
			"purchase_amount", 
			"payment_type", 
			"invoiceNo",
			"vendor_id"
		) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT id FROM selected_vendor LIMIT 1))
		RETURNING *;
	`;

	const accountsExpenseSql = `
		UPDATE accounts_project
		SET total_expenses = total_expenses + $1
		WHERE project_id = $2
		RETURNING *;
					`;

	try {
		await connection.query(accountsExpenseSql, [purchaseAmount, projectId]);
		console.log('Expenses inserted in accounts!');
	} catch (error) {
		console.error(`Error processing expense data: ${error.message}`);
		console.error(`Error processing accounts expense data: ${error.message}`);
	}

	try {
		// Insert the expense
		await connection.query(queryExpenseInsert, [
			projectId,
			vendorName,
			date,
			description,
			amount,
			paymentType,
			invoiceNumber,
		]);
		console.log('Expense inserted!');
	} catch (error) {
		console.error(`Error processing expense data: ${error.message}`);
		throw new Error(`Error processing expense data: ${error.message}`);
	}
}

async function salesInsert(salesFormData) {
	const { projectId, dueDate, description, amount } = salesFormData;

	const queryExpenseInsert = `
		INSERT INTO sales
		("project_id", "invoice_no", "due_date", "description", "billed_amount", "paid_amount", "status")
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING *;
	`;

	const queryUpdateProject = `
		UPDATE project
		SET "project_contractPrice" = "project_contractPrice" + $1
		WHERE id = $2;
	`;

	try {
		// Insert the expense
		await connection.query(queryExpenseInsert, [
			projectId,
			generateRandomInvoiceNumber(),
			dueDate,
			description,
			amount,
			0,
			0,
			'UNPAID',
		]);
		console.log('Sales inserted!');

		await connection.query(queryUpdateProject, [amount, projectId]);
	} catch (error) {
		console.error(`Error processing expense data: ${error.message}`);
		throw new Error(`Error processing expense data: ${error.message}`);
	}
}

async function transferDataInsert(transferData) {
	const { transferFrom, transferTo, transferAmount } = transferData;
	const transferName = transferFrom.toString();
	const transferNameTo = transferTo.toString();
	const amount = parseFloat(transferAmount);

	/**const queryTransfer = `
	UPDATE accounts
	SET total_balance = CASE
		WHEN account_name = $1 THEN total_sales - $2
		WHEN account_name = $3 THEN total_sales + $2
	END
	WHERE account_name IN ($1, $3);
`;**/

	const queryTransaction = `
INSERT INTO accounts_transaction(account_name, description, date, amount, transferto)
VALUES($1, $2, NOW(), $3, $4);
`;

	/** 
	try {
		await connection.query(queryTransfer, [transferFrom, amount, transferTo]);
		console.log('Transfer Succesfull!');
	} catch (error) {
		console.error(`Error processing Transfer: ${error.message}`);
		throw new Error(`Error processing Transfer: ${error.message}`);
	}*/

	try {
		await connection.query(queryTransaction, [
			transferName,
			`Transfer fund from ${transferName} to ${transferNameTo}`,
			amount,
			transferTo,
		]);
		console.log('Transaction Succesfull!');
	} catch (error) {
		console.error(`Error processing Transfer: ${error.message}`);
		throw new Error(`Error processing Transfer: ${error.message}`);
	}
}

async function notificationStatusInsert(id) {
	const queryInsert = `
	UPDATE notification
		SET isseen = true
		WHERE id = $1;
	`;

	try {
		const result = await connection.query(queryInsert, [id]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error inserting status notification: ${error.message}`);
		throw new Error(`Error inserting status notification: ${error.message}`);
	}
}

async function setNotificationInsert(notificationBody) {
	const { title, description, projectId } = notificationBody;

	const queryInsert = `
		WITH no_duplicate AS (
		SELECT 1 FROM notification WHERE project_id = $4
		)
		INSERT INTO notification(description, date, isseen, title, project_id)
		SELECT $1, NOW(), $2, $3, $4
		WHERE NOT EXISTS (SELECT 1 FROM no_duplicate)
		RETURNING id;
	`;

	try {
		const result = await connection.query(queryInsert, [description, false, title, projectId]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error inserting notification: ${error.message}`);
		throw new Error(`Error inserting notification: ${error.message}`);
	}
}

module.exports = {
	clientInsertData,
	projectInsertData,
	salesPaymentInsert,
	vendorInsertData,
	expenseInsert,
	expenseScanInsert,
	salesInsert,
	transferDataInsert,
	notificationStatusInsert,
	setNotificationInsert,
};
