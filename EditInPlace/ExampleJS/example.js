/**
 * Example implementation of EditInPlace component
 * Demonstrates various features and configurations
 */

// Activity logger utility
const ActivityLogger = {
	container: null,

	init() {
		this.container = document.getElementById('activityLog');
	},

	log(message, type = 'info') {
		if (!this.container) return;

		const timestamp = new Date().toLocaleTimeString();
		const colors = {
			info: 'text-info',
			success: 'text-success',
			warning: 'text-warning',
			error: 'text-danger'
		};

		const entry = document.createElement('div');
		entry.className = colors[type] || 'text-light';
		entry.innerHTML = `[${timestamp}] ${message}`;

		// Remove placeholder if exists
		const placeholder = this.container.querySelector('.text-muted');
		if (placeholder) {
			placeholder.remove();
		}

		this.container.insertBefore(entry, this.container.firstChild);

		// Keep only last 50 entries
		while (this.container.children.length > 50) {
			this.container.removeChild(this.container.lastChild);
		}
	},

	clear() {
		if (this.container) {
			this.container.innerHTML = '<div class="text-muted">Activity log cleared...</div>';
		}
	}
};

// Initialize activity logger
ActivityLogger.init();

// Initialize EditInPlace component with mock components
const editInPlace = new EditInPlace({
	selector: '.editable',
	triggerEvent: 'click',
	saveOnEnter: true,
	cancelOnEscape: true,
	showButtons: true,
	saveButtonText: 'Save',
	cancelButtonText: 'Cancel',
	saveButtonClass: 'btn btn-sm btn-success',
	cancelButtonClass: 'btn btn-sm btn-secondary',
	emptyText: 'Click to edit',
	loadingText: 'Saving...',

	// Component integrations
	components: {
		wysiwyg: {
			class: typeof MockWYSIWYG !== 'undefined' ? MockWYSIWYG : null,
			defaultOptions: {
				toolbar: ['bold', 'italic', 'underline', '|', 'link', 'unlink'],
				height: 200
			}
		},
		multiselect: {
			class: typeof MockMultiSelect !== 'undefined' ? MockMultiSelect : null,
			defaultOptions: {
				searchable: true,
				maxSelections: null
			}
		},
		inputmask: {
			class: typeof MockInputMask !== 'undefined' ? MockInputMask : null,
			defaultOptions: {}
		},
		autotextarea: {
			class: typeof MockAutoTextarea !== 'undefined' ? MockAutoTextarea : null,
			defaultOptions: {
				minRows: 3,
				maxRows: 10
			}
		}
	},

	// Edit callback
	onEdit: (element, field) => {
		const fieldName = element.dataset.fieldName || 'unknown';
		ActivityLogger.log(`Started editing field: <strong>${fieldName}</strong>`, 'info');
	},

	// Validation callback
	onValidate: (value, element) => {
		const fieldName = element.dataset.fieldName || 'unknown';

		// Custom validation for email fields
		if (fieldName === 'email') {
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailPattern.test(value)) {
				ActivityLogger.log(`Validation failed for ${fieldName}: Invalid email format`, 'error');
				return {
					valid: false,
					message: 'Please enter a valid email address'
				};
			}
		}

		// Custom validation for price fields
		if (fieldName.includes('price')) {
			const pricePattern = /^\$\d+\.\d{2}$/;
			if (!pricePattern.test(value)) {
				ActivityLogger.log(`Validation failed for ${fieldName}: Invalid price format`, 'error');
				return {
					valid: false,
					message: 'Price must be in format $XX.XX'
				};
			}
		}

		// Custom validation for stock fields
		if (fieldName.includes('stock')) {
			const stockValue = parseInt(value);
			if (isNaN(stockValue) || stockValue < 0) {
				ActivityLogger.log(`Validation failed for ${fieldName}: Invalid stock value`, 'error');
				return {
					valid: false,
					message: 'Stock must be a positive number'
				};
			}
		}

		return { valid: true };
	},

	// Save callback - simulates AJAX save
	onSave: async (fieldName, value, element) => {
		ActivityLogger.log(`Saving field: <strong>${fieldName}</strong>`, 'warning');

		try {
			// Simulate AJAX request delay
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Simulate occasional save failure for demonstration
			const shouldFail = Math.random() < 0.05; // 5% failure rate

			if (shouldFail) {
				ActivityLogger.log(`Failed to save ${fieldName}: Server error`, 'error');
				return false;
			}

			// Log successful save
			let displayValue = value;
			if (Array.isArray(value)) {
				displayValue = value.join(', ');
			} else if (typeof value === 'object' && value !== null) {
				displayValue = JSON.stringify(value);
			}

			ActivityLogger.log(
				`Successfully saved ${fieldName}: <em>${displayValue}</em>`,
				'success'
			);

			// You would normally make an actual AJAX request here:
			/*
			const response = await fetch('/api/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					field: fieldName,
					value: value,
					recordId: element.dataset.recordId || null
				})
			});

			return response.ok;
			*/

			return true;
		} catch (error) {
			ActivityLogger.log(`Error saving ${fieldName}: ${error.message}`, 'error');
			return false;
		}
	},

	// Cancel callback
	onCancel: (element, field) => {
		const fieldName = element.dataset.fieldName || 'unknown';
		ActivityLogger.log(`Canceled editing field: <strong>${fieldName}</strong>`, 'warning');
	}
});

// Control buttons
document.getElementById('saveAllBtn').addEventListener('click', async () => {
	ActivityLogger.log('=== Saving all fields ===', 'info');

	const results = await editInPlace.saveAll();

	const successCount = results.filter(r => r.success).length;
	const failCount = results.filter(r => !r.success).length;

	ActivityLogger.log(
		`Save all completed: ${successCount} succeeded, ${failCount} failed`,
		failCount > 0 ? 'warning' : 'success'
	);
});

document.getElementById('resetAllBtn').addEventListener('click', () => {
	if (confirm('Are you sure you want to reset all fields to their original values?')) {
		editInPlace.reset();
		ActivityLogger.log('All fields reset to original values', 'warning');
	}
});

document.getElementById('getValuesBtn').addEventListener('click', () => {
	const values = editInPlace.getValues();

	ActivityLogger.log('=== Current Field Values ===', 'info');

	Object.entries(values).forEach(([fieldName, value]) => {
		let displayValue = value;
		if (Array.isArray(value)) {
			displayValue = `[${value.join(', ')}]`;
		} else if (typeof value === 'object' && value !== null) {
			displayValue = JSON.stringify(value);
		}

		ActivityLogger.log(`${fieldName}: ${displayValue}`, 'info');
	});

	console.log('All values:', values);
});

// Listen to custom events
document.addEventListener('editinplace:save', (e) => {
	console.log('Field saved:', e.detail);
});

document.addEventListener('editinplace:error', (e) => {
	console.error('Save error:', e.detail);
});

document.addEventListener('editinplace:cancel', (e) => {
	console.log('Editing canceled:', e.detail);
});

document.addEventListener('editinplace:validate', (e) => {
	console.log('Validation:', e.detail);
});

// Theme toggle (optional)
const themeToggle = document.createElement('button');
themeToggle.className = 'btn btn-sm btn-outline-light position-fixed';
themeToggle.style.cssText = 'bottom: 20px; right: 20px; z-index: 1000;';
themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
themeToggle.title = 'Toggle theme';

themeToggle.addEventListener('click', () => {
	const html = document.documentElement;
	const currentTheme = html.getAttribute('data-bs-theme');
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

	html.setAttribute('data-bs-theme', newTheme);

	if (newTheme === 'dark') {
		themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
		themeToggle.className = 'btn btn-sm btn-outline-light position-fixed';
	} else {
		themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
		themeToggle.className = 'btn btn-sm btn-outline-dark position-fixed';
	}

	ActivityLogger.log(`Theme changed to: ${newTheme}`, 'info');
});

document.body.appendChild(themeToggle);

// Demo: Programmatically set a value
setTimeout(() => {
	// Example of setting a value programmatically
	// editInPlace.setValue('fullName', 'Jane Smith');
	// ActivityLogger.log('Programmatically updated fullName field', 'info');
}, 2000);

// Demo: Add a new editable field dynamically
function addNewEditableField() {
	const container = document.querySelector('.demo-card');
	const newField = document.createElement('div');
	newField.className = 'mb-3';
	newField.innerHTML = `
		<label class="form-label fw-bold">
			<i class="bi bi-geo-alt me-1"></i> Location
		</label>
		<div class="editable"
			data-field-type="text"
			data-field-name="location"
			data-value="San Francisco, CA"
			data-required="true">
			San Francisco, CA
		</div>
	`;

	container.appendChild(newField);

	// Refresh EditInPlace to recognize new field
	editInPlace.refresh();

	ActivityLogger.log('Added new editable field: location', 'success');
}

// Add button to demonstrate dynamic field addition
const addFieldBtn = document.createElement('button');
addFieldBtn.className = 'btn btn-sm btn-outline-primary mt-3';
addFieldBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Add Dynamic Field';
addFieldBtn.addEventListener('click', addNewEditableField);

// You can uncomment this to enable the dynamic field button
// document.querySelector('.profile-header').parentElement.appendChild(addFieldBtn);

// Log initialization
ActivityLogger.log('EditInPlace component initialized successfully', 'success');
ActivityLogger.log(`Monitoring ${editInPlace.fields.size} editable fields`, 'info');

// Keyboard shortcuts info
console.log('EditInPlace Keyboard Shortcuts:');
console.log('- Enter: Save changes (single-line fields)');
console.log('- Escape: Cancel editing');
console.log('- Click outside: Save or cancel based on configuration');

// Example: Batch update multiple fields
function batchUpdateExample() {
	const updates = {
		fullName: 'Jane Smith',
		title: 'Lead Developer',
		email: 'jane.smith@example.com',
		phone: '555-987-6543'
	};

	Object.entries(updates).forEach(([fieldName, value]) => {
		editInPlace.setValue(fieldName, value);
	});

	ActivityLogger.log('Batch updated multiple fields', 'success');
}

// You can call this function to test batch updates
// setTimeout(batchUpdateExample, 3000);