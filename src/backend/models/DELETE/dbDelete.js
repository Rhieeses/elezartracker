const connection = require('../../config/db');
const fs = require('fs');
const path = require('path');

async function deleteProject(id) {
	const deleteSalesQuery = `
        DELETE FROM sales
        WHERE project_id = $1;
    `;

	const deleteProjectQuery = `
        DELETE FROM project
        WHERE id = $1
		RETURNING "project_projectPicture";
    `;

	const deleteAccountQuery = `
        DELETE FROM accounts_project
        WHERE project_id = $1;
    `;

	const client = await connection.connect();

	try {
		await client.query('BEGIN');

		const result = await client.query(deleteProjectQuery, [id]);
		const projectProfilePicturePath = result.rows[0]?.project_profilePicture;

		if (projectProfilePicturePath) {
			const fullPath = path.resolve(projectProfilePicturePath);
			fs.unlink(fullPath, (err) => {
				if (err) {
					console.error(`Error deleting file at path: ${fullPath}`, err);
				} else {
					console.log(`Successfully deleted file at path: ${fullPath}`);
				}
			});
		}

		await client.query(deleteAccountQuery, [id]);
		await client.query(deleteSalesQuery, [id]);

		if (result.rowCount === 0) {
			await client.query('ROLLBACK');
			throw new Error('Project not found or already deleted.');
		}

		await client.query('COMMIT');
		return { success: true, message: 'Project and associated sales deleted successfully' };
	} catch (error) {
		await client.query('ROLLBACK');
		throw new Error('Failed to delete project');
	} finally {
		client.release();
	}
}

async function deleteClient(id) {
	const deleteQuery = `
        DELETE FROM client
        WHERE id = $1
		RETURNING "client_profilePicture";
    `;

	try {
		const result = await connection.query(deleteQuery, [id]);
		const clientProfilePicturePath = result.rows[0]?.client_profilePicture;

		if (clientProfilePicturePath) {
			const fullPath = path.resolve(clientProfilePicturePath);
			fs.unlink(fullPath, (err) => {
				if (err) {
					console.error(`Error deleting file at path: ${fullPath}`, err);
				} else {
					console.log(`Successfully deleted file at path: ${fullPath}`);
				}
			});
		}

		if (result.rowCount === 0) {
			throw new Error('Client not found or already deleted.');
		}

		return { success: true, message: 'Client deleted successfully' };
	} catch (error) {
		throw new Error('Failed to delete Client');
	}
}
async function deleteExpense(id) {
	const deleteQuery = `
        DELETE FROM expense
        WHERE id = $1
        RETURNING purchase_amount, project_id;
    `;

	const updateAccountsQuery = `
        UPDATE accounts_project
        SET total_expenses = total_expenses - $1
        WHERE project_id = $2;
    `;

	try {
		// Execute the delete query and retrieve the purchase_amount
		const result = await connection.query(deleteQuery, [id]);

		if (result.rowCount === 0) {
			throw new Error('Expense not found or already deleted.');
		}

		const purchase_amount = result.rows[0].purchase_amount; // Get the returned purchase amount
		const project_id = result.rows[0].project_id;

		// Update the accounts_project table
		await connection.query(updateAccountsQuery, [purchase_amount, project_id]);

		return { success: true, message: 'Expense deleted successfully' };
	} catch (error) {
		throw new Error(`Failed to delete Expense: ${error.message}`);
	}
}

async function deleteSales(id) {
	const deleteQuery = `
        DELETE FROM payments
        WHERE id = $1
		RETURNING payment_amount, project_id;
    `;

	const updateAccountsQuery = `
        UPDATE accounts_project
        SET total_paid = total_paid - $1
        WHERE project_id = $2;
    `;

	try {
		const result = await connection.query(deleteQuery, [id]);

		if (result.rowCount === 0) {
			throw new Error('Sales not found or already deleted.');
		}

		const purchase_amount = result.rows[0].purchase_amount; // Get the returned purchase amount
		const project_id = result.rows[0].project_id; // Get the returned purchase amount

		// Update the accounts_project table
		await connection.query(updateAccountsQuery, [purchase_amount, project_id]);

		return { success: true, message: 'Sales deleted successfully' };
	} catch (error) {
		throw new Error('Failed to delete Sales');
	}
}

async function deleteSalesProject(id) {
	const deleteQuery = `
        DELETE FROM sales_project
        WHERE id = $1;
    `;

	try {
		const result = await connection.query(deleteQuery, [id]);

		if (result.rowCount === 0) {
			throw new Error('Sales not found or already deleted.');
		}

		return { success: true, message: 'Sales deleted successfully' };
	} catch (error) {
		throw new Error('Failed to delete Sales');
	}
}

async function deletePayable(id) {
	const deleteQuery = `
        DELETE FROM payable
        WHERE id = $1;
    `;

	try {
		const result = await connection.query(deleteQuery, [id]);

		if (result.rowCount === 0) {
			throw new Error('Payable not found or already deleted.');
		}

		return { success: true, message: 'Payable deleted successfully' };
	} catch (error) {
		throw new Error('Failed to delete Payable');
	}
}

async function deletePayableTransaction(id) {
	const deleteQuery = `
        DELETE FROM payables_transaction
        WHERE id = $1;
    `;

	try {
		const result = await connection.query(deleteQuery, [id]);

		if (result.rowCount === 0) {
			throw new Error('Payable not found or already deleted.');
		}

		return { success: true, message: 'Payable deleted successfully' };
	} catch (error) {
		throw new Error('Failed to delete Payable');
	}
}

async function deleteVendor(id) {
	const deleteQuery = `
        DELETE FROM vendor
        WHERE id = $1
		RETURNING "vendor_picture";

    `;

	try {
		const result = await connection.query(deleteQuery, [id]);
		const vendorPicturePath = result.rows[0]?.vendor_picture;

		if (vendorPicturePath) {
			const fullPath = path.resolve(vendorPicturePath);
			fs.unlink(fullPath, (err) => {
				if (err) {
					console.error(`Error deleting file at path: ${fullPath}`, err);
				} else {
					console.log(`Successfully deleted file at path: ${fullPath}`);
				}
			});
		}

		if (result.rowCount === 0) {
			throw new Error('Vendor not found or already deleted.');
		}

		return { success: true, message: 'Vendor deleted successfully' };
	} catch (error) {
		throw new Error('Failed to delete Vendor');
	}
}

module.exports = {
	deleteProject,
	deleteClient,
	deleteExpense,
	deleteSales,
	deleteSalesProject,
	deletePayable,
	deletePayableTransaction,
	deleteVendor,
};
