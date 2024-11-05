const connection = require('../../config/db');
const bcrypt = require('bcrypt');

async function updateProject(formData, id) {
	const {
		warningvalue,
		clientId,
		projectName,
		projectAddress,
		projectContractPrice,
		projectStartDate,
		projectEndDate,
		projectDescription,
		imageFile,
	} = formData;

	const queryUpdateProject = `
      UPDATE project 
      SET 
	  	warningvalue = $10,
        "client_id" = $1, 
        "project_name" = $2, 
        "project_address" = $3, 
        "project_contractPrice" = $4, 
        "project_startDate" = $5, 
        "project_endDate" = $6, 
        "project_description" = $7, 
        "project_projectPicture" = $8
      WHERE 
        id = $9
      RETURNING *;
    `;

	const queryUpdateSales = `
	UPDATE sales_project 
	SET client_id = $1
	WHERE project_id = $2;
	`;

	try {
		const result = await connection.query(queryUpdateProject, [
			clientId,
			projectName,
			projectAddress,
			projectContractPrice,
			projectStartDate,
			projectEndDate,
			projectDescription,
			imageFile,
			id,
			warningvalue,
		]);

		await connection.query(queryUpdateSales, [clientId, id]);
		return result.rows[0]; // Return the updated project row
	} catch (error) {
		console.error(`Error updating data: ${error.message}`);
		throw new Error(`Error updating data: ${error.message}`);
	}
}

async function updateClient(formData) {
	const {
		clientId,
		clientAddress,
		clientDescription,
		clientEmail,
		clientNumber,
		clientFirstName,
		clientMiddleName,
		clientLastName,
		imageFile,
	} = formData;

	const queryUpdateClient = `
      UPDATE client 
      SET 
	  	"client_address" = $1,
        "client_contactNo" = $2, 
        "client_description" = $3, 
        "client_email" = $4, 
        "client_firstName" = $5, 
        "client_lastName" = $6, 
        "client_middleName" = $7, 
        "client_profilePicture" = $8
      WHERE 
        id = $9
      RETURNING *;
    `;

	try {
		const result = await connection.query(queryUpdateClient, [
			clientAddress,
			clientNumber,
			clientDescription,
			clientEmail,
			clientFirstName,
			clientLastName,
			clientMiddleName,
			imageFile,
			clientId,
		]);

		return result.rows[0];
	} catch (error) {
		console.error(`Error updating data: ${error.message}`);
		throw new Error(`Error updating data: ${error.message}`);
	}
}

async function updateAccount(formData, id) {
	const { username, name, email, imageFile } = formData;

	const queryAccount = `
      UPDATE users 
      SET 
	   username = $1, 
	   name = $2,
	   email = $3,
	   profilepicture = $4
      WHERE 
        id = $5
      RETURNING *;
    `;

	try {
		const result = await connection.query(queryAccount, [username, name, email, imageFile, id]);

		return result.rows[0];
	} catch (error) {
		console.error(`Error updating data: ${error.message}`);
		throw new Error(`Error updating data: ${error.message}`);
	}
}

async function editVendor(editForm, id) {
	const { vendorName, vendorContact, vendorEmail, vendorServices, vendorAddress, imageFile } =
		editForm;

	const queryUpdateVendor = `
      UPDATE vendor 
      SET 
	  	"vendor_name" = $1,
        "vendor_address" = $2, 
        "vendor_email" = $3, 
        "vendor_contactNo" = $4, 
        "vendor_services" = $5, 
        "vendor_picture" = $6
      WHERE 
        id = $7
      RETURNING *;
    `;

	try {
		const result = await connection.query(queryUpdateVendor, [
			vendorName,
			vendorAddress,
			vendorEmail,
			vendorContact,
			vendorServices,
			imageFile,
			id,
		]);

		return result.rows[0];
	} catch (error) {
		console.error(`Error updating data: ${error.message}`);
		throw new Error(`Error updating data: ${error.message}`);
	}
}

async function ApproveTransfer(id) {
	const queryUpdateTransaction = `
    UPDATE accounts_transaction
	SET status = 'SUCCESSFUL'
	WHERE id = $1
    `;

	try {
		const result = await connection.query(queryUpdateTransaction, [id]);
		if (result.rowCount === 0) {
			throw new Error(`Transaction with id ${id} not found.`);
		}

		return { message: 'Transfer approved successfully' };
	} catch (error) {
		console.error(`Error updating transaction: ${error.message}`);
		throw new Error(`Error updating data: ${error.message}`);
	}
}

async function changePassword(changePasswordForm, id, res) {
	const { oldPassword, newPassword } = changePasswordForm;

	const queryCheckPassword = `
        SELECT password FROM users WHERE id = $1;
    `;

	const queryUpdatePassword = `
        UPDATE users SET password = $1 WHERE id = $2;
    `;

	try {
		const resultPassword = await connection.query(queryCheckPassword, [id]);
		const user = resultPassword.rows[0];

		if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
			return res.status(400).json({ message: 'Old password is incorrect' });
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 10);
		await connection.query(queryUpdatePassword, [hashedNewPassword, id]);

		return res.json({ message: 'Password changed successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Server error' });
	}
}

async function salesArchive(id) {
	const queryUpdateSales = `
  	UPDATE payments
		SET is_archived = NOT is_archived
		WHERE id = $1;
		;
    `;

	try {
		const result = await connection.query(queryUpdateSales, [id]);
		if (result.rowCount === 0) {
			throw new Error(`Sales with id ${id} not found.`);
		}

		return { message: 'Sales archived successfully' };
	} catch (error) {
		console.error(`Error archiving sales: ${error.message}`);
		throw new Error(`Error archiving sales: ${error.message}`);
	}
}

async function payablesTransactionArchive(id) {
	const queryUpdateSales = `
  	UPDATE payables_transaction
		SET is_archived = NOT is_archived
		WHERE id = $1;
		
    `;

	try {
		const result = await connection.query(queryUpdateSales, [id]);
		if (result.rowCount === 0) {
			throw new Error(`Transaction with id ${id} not found.`);
		}

		return { message: 'Transaction archived successfully' };
	} catch (error) {
		console.error(`Error archiving Transaction: ${error.message}`);
		throw new Error(`Error archiving Transaction: ${error.message}`);
	}
}

async function expenseArchive(id) {
	const queryUpdateExpense = `
  	UPDATE expense
		SET is_archived = NOT is_archived
		WHERE id = $1;
		;
    `;

	try {
		const result = await connection.query(queryUpdateExpense, [id]);
		if (result.rowCount === 0) {
			throw new Error(`Expense with id ${id} not found.`);
		}

		return { message: 'Expense archived successfully' };
	} catch (error) {
		console.error(`Error archiving Expense: ${error.message}`);
		throw new Error(`Error archiving Expense: ${error.message}`);
	}
}

async function payableArchive(id) {
	const queryUpdatePayable = `
  	UPDATE payable
		SET is_archived = NOT is_archived
		WHERE id = $1;
		;
    `;

	try {
		const result = await connection.query(queryUpdatePayable, [id]);
		if (result.rowCount === 0) {
			throw new Error(`Expense with id ${id} not found.`);
		}

		return { message: 'Payable archived successfully' };
	} catch (error) {
		console.error(`Error archiving Payable: ${error.message}`);
		throw new Error(`Error archiving Payable: ${error.message}`);
	}
}

async function payableEdit(id, editPayableForm) {
	const {
		vendor,
		amount,
		projectId,
		invoiceDate,
		dueDate,
		description,
		invoiceNo,
		isDirect,
		vendorName,
		purchaseDate,
		expenseDescription,
		purchaseAmount,
		paymentType,
		directExpense,
		status,
		isPayable,
		balance,
	} = editPayableForm;

	const queryUpdatePayable = `
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
		UPDATE payable
		SET 
			project_id = $1,
			invoice_date = $3,
			due_date = $4,
			description = $5,
			amount = $6,
			vendor_id = (SELECT id FROM selected_vendor LIMIT 1),
			invoice_no = $7,
			is_direct = $8
		WHERE id = $9
		RETURNING *;
	`;

	const queryUpdatePayableDirectVendor = `
		UPDATE payable
		SET 
			project_id = $1,
			invoice_date = $2,
			due_date = $3,
			description = $4,
			amount = $5,
			vendor_id = $6,
			invoice_no = $7,
			is_direct = $8
		WHERE id = $9
		RETURNING balance, status;
	`;

	const queryExpenseUpdate = `
		UPDATE expense
		SET 
			project_id = $1,
			vendor_id = $2,
			purchase_date = $3,
			expense_description = $4,
			purchase_amount = $5,
			payment_type = $6,
			"invoiceNo" = $7,
			vendor_name = $8,
			direct_expense = $9,
			is_payable = $10,
			balance = $11,
			status = $12
		WHERE "invoiceNo" = $13
		RETURNING balance, status;
	`;

	try {
		let result;

		// Update payable with a new vendor if vendor is "Others" (custom vendor name)
		if (vendor === 'Others') {
			result = await connection.query(queryUpdatePayable, [
				projectId,
				vendorName,
				invoiceDate,
				dueDate,
				description,
				amount,
				invoiceNo,
				isDirect,
				id,
			]);
		} else {
			// Update payable with an existing vendor ID
			result = await connection.query(queryUpdatePayableDirectVendor, [
				projectId,
				invoiceDate,
				dueDate,
				description,
				amount,
				vendor,
				invoiceNo,
				isDirect,
				id,
			]);
		}

		// Check if payable update was successful
		if (result.rowCount === 0) {
			throw new Error(`Payable with id ${id} not found.`);
		}

		//let balance = result.rows[0].balance;

		const { balance, status } = result.rows[0];

		// Update expense table based on the provided expense details
		const expenseResult = await connection.query(queryExpenseUpdate, [
			projectId,
			vendor,
			invoiceDate,
			description,
			amount,
			null,
			invoiceNo,
			vendorName,
			isDirect,
			true,
			balance,
			status,
			invoiceNo,
		]);

		// Check if expense update was successful
		if (expenseResult.rowCount === 0) {
			throw new Error(`Expense with id ${id} not found.`);
		}

		return {
			message: 'Payable and Expense updated successfully',
			data: { payable: result.rows[0], expense: expenseResult.rows[0] },
		};
	} catch (error) {
		console.error(`Error updating Payable and Expense: ${error.message}`);
		throw new Error(`Error updating Payable and Expense: ${error.message}`);
	}
}

async function expenseEdit(id, editExpenseForm) {
	const {
		vendor, // Existing vendor ID if available
		amount, // Corresponds to purchase_amount
		projectId,
		invoiceDate, // Corresponds to purchase_date
		description, // Corresponds to expense_description
		invoiceNo,
		isDirect, // Corresponds to direct_expense
		vendorName, // Vendor name for new vendor if not existing
	} = editExpenseForm;

	// SQL query to update the expense with vendor management
	const queryExpenseUpdate = `
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
		UPDATE expense
		SET 
			project_id = $1,
			vendor_name = $2,
			purchase_date = $3,
			expense_description = $4,
			purchase_amount = $5,
			"invoiceNo" = $6,
			vendor_id = (SELECT id FROM selected_vendor LIMIT 1),
			direct_expense = $7
		WHERE id = $8
		RETURNING *;
	`;

	// SQL query to update the total expenses in accounts_project
	const accountsExpenseSql = `
		UPDATE accounts_project
		SET total_expenses = total_expenses + $1
		WHERE project_id = $2
		RETURNING *;
	`;

	try {
		if (projectId) {
			await connection.query(accountsExpenseSql, [amount, projectId]);
			console.log('Expenses updated in accounts!');
		}

		// Update the expense
		const result = await connection.query(queryExpenseUpdate, [
			projectId ? projectId : null,
			vendorName,
			invoiceDate,
			description,
			amount,
			invoiceNo,
			isDirect,
			id, // The expense ID for the WHERE clause
		]);

		if (result.rowCount === 0) {
			throw new Error(`Expense with id ${id} not found.`);
		}

		console.log('Expense updated successfully!');
		return { message: 'Expense updated successfully', data: result.rows[0] };
	} catch (error) {
		console.error(`Error processing expense update: ${error.message}`);
		throw new Error(`Error processing expense update: ${error.message}`);
	}
}

module.exports = {
	updateProject,
	updateClient,
	updateAccount,
	editVendor,
	ApproveTransfer,
	changePassword,
	salesArchive,
	payablesTransactionArchive,
	expenseArchive,
	payableArchive,
	payableEdit,
	expenseEdit,
};
