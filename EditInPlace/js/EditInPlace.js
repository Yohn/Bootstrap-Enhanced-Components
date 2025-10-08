/**
 * EditInPlace - Main controller for edit-in-place functionality
 * Manages multiple editable fields and their interactions
 */
class EditInPlace {
	constructor(options = {}) {
		// Default options
		this.options = {
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
			errorClass: 'is-invalid',
			editingClass: 'editing',
			onSave: null,
			onCancel: null,
			onEdit: null,
			onValidate: null,
			components: {
				wysiwyg: {
					class: null,
					defaultOptions: {}
				},
				multiselect: {
					class: null,
					defaultOptions: {}
				},
				fileupload: {
					class: null,
					defaultOptions: {}
				},
				inputmask: {
					class: null,
					defaultOptions: {}
				},
				autotextarea: {
					class: null,
					defaultOptions: {}
				}
			},
			...options
		};

		// Storage for field instances
		this.fields = new Map();

		// Currently editing field
		this.currentField = null;

		// Initialize
		this._init();
	}

	/**
	 * Initialize EditInPlace
	 */
	_init() {
		// Find all editable elements
		this._initializeFields();

		// Set up document-level event listeners
		this._setupDocumentListeners();
	}

	/**
	 * Initialize all editable fields
	 */
	_initializeFields() {
		const elements = document.querySelectorAll(this.options.selector);

		elements.forEach(element => {
			this._initializeField(element);
		});
	}

	/**
	 * Initialize a single field
	 */
	_initializeField(element) {
		// Check if already initialized
		if (this.fields.has(element)) {
			return;
		}

		// Create field instance
		const field = new EditInPlaceField(element, this.options);
		this.fields.set(element, field);

		// Add event listener for trigger event
		element.addEventListener(this.options.triggerEvent, (e) => {
			// Don't trigger if already editing
			if (field.isEditing) return;

			// Don't trigger if clicking on a link or button inside
			if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			this._startEditing(field);
		});
	}

	/**
	 * Set up document-level event listeners
	 */
	_setupDocumentListeners() {
		// Click outside to cancel editing
		this.documentClickHandler = (e) => {
			if (this.currentField && this.currentField.isEditing) {
				// Check if click is outside the editing element
				if (!this.currentField.element.contains(e.target)) {
					// Auto-save if save-on-blur is enabled
					if (this.currentField.element.dataset.saveOnBlur === 'true' && !this.options.showButtons) {
						this.currentField.save();
					} else if (!this.options.showButtons) {
						// Cancel if no buttons shown
						this.currentField.cancel();
					}
				}
			}
		};

		document.addEventListener('click', this.documentClickHandler);

		// Global escape key handler
		this.documentKeyHandler = (e) => {
			if (e.key === 'Escape' && this.currentField && this.currentField.isEditing) {
				if (this.options.cancelOnEscape) {
					this.currentField.cancel();
				}
			}
		};

		document.addEventListener('keydown', this.documentKeyHandler);
	}

	/**
	 * Start editing a field
	 */
	_startEditing(field) {
		// Cancel any currently editing field
		if (this.currentField && this.currentField.isEditing && this.currentField !== field) {
			this.currentField.cancel();
		}

		// Set as current field
		this.currentField = field;

		// Enter edit mode
		field.edit();
	}

	/**
	 * Get field instance for an element
	 */
	getField(element) {
		return this.fields.get(element) || null;
	}

	/**
	 * Refresh - Re-initialize all fields
	 * Useful when new editable elements are added to the DOM
	 */
	refresh() {
		// Clear existing fields
		this.fields.forEach(field => field.destroy());
		this.fields.clear();

		// Re-initialize
		this._initializeFields();
	}

	/**
	 * Add a new editable element
	 */
	addField(element) {
		if (typeof element === 'string') {
			element = document.querySelector(element);
		}

		if (element && !this.fields.has(element)) {
			this._initializeField(element);
		}
	}

	/**
	 * Remove an editable element
	 */
	removeField(element) {
		if (typeof element === 'string') {
			element = document.querySelector(element);
		}

		if (element && this.fields.has(element)) {
			const field = this.fields.get(element);
			field.destroy();
			this.fields.delete(element);
		}
	}

	/**
	 * Enable editing for all fields
	 */
	enable() {
		this.fields.forEach(field => {
			field.element.style.pointerEvents = '';
		});
	}

	/**
	 * Disable editing for all fields
	 */
	disable() {
		this.fields.forEach(field => {
			if (field.isEditing) {
				field.cancel();
			}
			field.element.style.pointerEvents = 'none';
		});
	}

	/**
	 * Get all field values
	 */
	getValues() {
		const values = {};

		this.fields.forEach(field => {
			if (field.fieldName) {
				values[field.fieldName] = field.currentValue;
			}
		});

		return values;
	}

	/**
	 * Set field value programmatically
	 */
	setValue(fieldName, value) {
		this.fields.forEach(field => {
			if (field.fieldName === fieldName) {
				field.currentValue = value;
				field._updateDisplay();
			}
		});
	}

	/**
	 * Get field value by name
	 */
	getValue(fieldName) {
		let value = null;

		this.fields.forEach(field => {
			if (field.fieldName === fieldName) {
				value = field.currentValue;
			}
		});

		return value;
	}

	/**
	 * Validate all fields
	 */
	async validateAll() {
		const results = [];

		for (const [element, field] of this.fields) {
			const isValid = await field._validate(field.currentValue);
			results.push({
				field: field.fieldName,
				element: element,
				valid: isValid
			});
		}

		return results;
	}

	/**
	 * Save all fields
	 */
	async saveAll() {
		const results = [];

		for (const [element, field] of this.fields) {
			try {
				if (this.options.onSave) {
					const success = await this.options.onSave(
						field.fieldName,
						field.currentValue,
						element
					);

					results.push({
						field: field.fieldName,
						success: success
					});
				}
			} catch (error) {
				console.error(`Error saving field ${field.fieldName}:`, error);
				results.push({
					field: field.fieldName,
					success: false,
					error: error.message
				});
			}
		}

		return results;
	}

	/**
	 * Reset all fields to original values
	 */
	reset() {
		this.fields.forEach(field => {
			if (field.isEditing) {
				field.cancel();
			}

			// Reset to original display
			if (field.originalDisplay) {
				field.element.innerHTML = field.originalDisplay;
			}
		});
	}

	/**
	 * Get editing status
	 */
	isEditing() {
		return this.currentField !== null && this.currentField.isEditing;
	}

	/**
	 * Get currently editing field
	 */
	getCurrentField() {
		return this.currentField;
	}

	/**
	 * Cancel current editing
	 */
	cancelCurrent() {
		if (this.currentField && this.currentField.isEditing) {
			this.currentField.cancel();
		}
	}

	/**
	 * Save current editing
	 */
	async saveCurrent() {
		if (this.currentField && this.currentField.isEditing) {
			await this.currentField.save();
		}
	}

	/**
	 * Destroy EditInPlace instance
	 */
	destroy() {
		// Remove document listeners
		if (this.documentClickHandler) {
			document.removeEventListener('click', this.documentClickHandler);
		}

		if (this.documentKeyHandler) {
			document.removeEventListener('keydown', this.documentKeyHandler);
		}

		// Destroy all fields
		this.fields.forEach(field => field.destroy());
		this.fields.clear();

		// Clear references
		this.currentField = null;
	}
}