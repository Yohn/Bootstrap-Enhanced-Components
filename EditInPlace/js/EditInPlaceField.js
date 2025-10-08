/**
 * EditInPlaceField - Manages individual editable field behavior
 * Handles field state, rendering, and interaction for a single editable element
 */
if (typeof EditInPlaceField !== 'undefined') {
	console.warn('EditInPlaceField is already defined. Skipping redefinition.');
} else {
	window.EditInPlaceField = class EditInPlaceField {
		constructor(element, options = {}) {
			this.element = element;
			this.options = options;
			this.isEditing = false;
			this.originalValue = null;
			this.inputElement = null;
			this.buttonContainer = null;
			this.componentInstance = null;

			// Extract field configuration from data attributes
			this.fieldType = element.dataset.fieldType || 'text';
			this.fieldName = element.dataset.fieldName || '';
			this.currentValue = this._parseValue(element.dataset.value || element.textContent.trim());

			this._init();
		}

		/**
		 * Initialize field
		 */
		_init() {
			// Store original display value
			this.originalDisplay = this.element.innerHTML;

			// Add empty text if needed
			if (!this.currentValue || (Array.isArray(this.currentValue) && this.currentValue.length === 0)) {
				this._showEmptyState();
			}

			// Add hover effect class
			this.element.classList.add('edit-in-place-field');

			// Set cursor style
			this.element.style.cursor = 'pointer';
		}

		/**
		 * Parse value from string to appropriate type
		 */
		_parseValue(value) {
			if (!value) return '';

			// Try to parse as JSON for arrays/objects
			if ((value.startsWith('[') || value.startsWith('{')) && (value.endsWith(']') || value.endsWith('}'))) {
				try {
					return JSON.parse(value);
				} catch (e) {
					return value;
				}
			}

			return value;
		}

		/**
		 * Show empty state
		 */
		_showEmptyState() {
			this.element.innerHTML = `<span class="text-muted fst-italic">${this.options.emptyText}</span>`;
		}

		/**
		 * Enter edit mode
		 */
		edit() {
			if (this.isEditing) return;

			this.isEditing = true;
			this.originalValue = this.currentValue;
			this.element.classList.add(this.options.editingClass);

			// Trigger callback
			if (this.options.onEdit) {
				this.options.onEdit(this.element, this);
			}

			// Dispatch custom event
			this._dispatchEvent('editinplace:edit');

			// Render edit interface
			this._renderEditMode();
		}

		/**
		 * Render edit mode interface
		 */
		_renderEditMode() {
			// Clear current content
			this.element.innerHTML = '';

			// Create input based on field type
			this.inputElement = this._createInput();
			this.element.appendChild(this.inputElement);

			// Create buttons if enabled
			if (this.options.showButtons) {
				this.buttonContainer = this._createButtons();
				this.element.appendChild(this.buttonContainer);
			}

			// Focus the input
			this._focusInput();
		}

		/**
		 * Create input element based on field type
		 */
		_createInput() {
			switch (this.fieldType) {
				case 'textarea':
					return this._createTextarea();
				case 'wysiwyg':
					return this._createWYSIWYG();
				case 'select':
					return this._createSelect();
				case 'multiselect':
					return this._createMultiSelect();
				case 'file':
					return this._createFileUpload();
				case 'masked':
					return this._createMaskedInput();
				case 'text':
				default:
					return this._createTextInput();
			}
		}

		/**
		 * Create text input
		 */
		_createTextInput() {
			const input = document.createElement('input');
			input.type = 'text';
			input.className = 'form-control form-control-sm';
			input.value = this.currentValue || '';
			input.placeholder = this.element.dataset.placeholder || '';

			// Add validation attributes
			if (this.element.dataset.required) {
				input.required = true;
			}
			if (this.element.dataset.maxLength) {
				input.maxLength = parseInt(this.element.dataset.maxLength);
			}
			if (this.element.dataset.pattern) {
				input.pattern = this.element.dataset.pattern;
			}

			// Add event listeners
			if (this.options.saveOnEnter) {
				input.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						this.save();
					}
				});
			}

			if (this.options.cancelOnEscape) {
				input.addEventListener('keydown', (e) => {
					if (e.key === 'Escape') {
						e.preventDefault();
						this.cancel();
					}
				});
			}

			// Auto-save on blur if enabled
			if (this.element.dataset.saveOnBlur === 'true' && !this.options.showButtons) {
				input.addEventListener('blur', () => {
					setTimeout(() => this.save(), 100);
				});
			}

			return input;
		}

		/**
		 * Create textarea input
		 */
		_createTextarea() {
			const textarea = document.createElement('textarea');
			textarea.className = 'form-control form-control-sm';
			textarea.value = this.currentValue || '';
			textarea.placeholder = this.element.dataset.placeholder || '';
			textarea.rows = 3;

			// Initialize AutoTextarea if available
			if (this.options.components && this.options.components.autotextarea) {
				const AutoTextareaClass = this.options.components.autotextarea.class;
				if (AutoTextareaClass) {
					setTimeout(() => {
						this.componentInstance = new AutoTextareaClass(textarea, {
							...this.options.components.autotextarea.defaultOptions
						});
					}, 0);
				}
			}

			// Add validation attributes
			if (this.element.dataset.required) {
				textarea.required = true;
			}
			if (this.element.dataset.maxLength) {
				textarea.maxLength = parseInt(this.element.dataset.maxLength);
			}

			// Escape key handling
			if (this.options.cancelOnEscape) {
				textarea.addEventListener('keydown', (e) => {
					if (e.key === 'Escape') {
						e.preventDefault();
						this.cancel();
					}
				});
			}

			return textarea;
		}

		/**
		 * Create WYSIWYG editor
		 */
		_createWYSIWYG() {
			const container = document.createElement('div');
			container.className = 'wysiwyg-container';

			const textarea = document.createElement('textarea');
			textarea.className = 'form-control';
			textarea.value = this.currentValue || '';
			container.appendChild(textarea);

			// Initialize WYSIWYG if available
			if (this.options.components && this.options.components.wysiwyg) {
				const WYSIWYGClass = this.options.components.wysiwyg.class;
				if (WYSIWYGClass) {
					setTimeout(() => {
						const toolbar = this.element.dataset.wysiwygToolbar
							? JSON.parse(this.element.dataset.wysiwygToolbar)
							: this.options.components.wysiwyg.defaultOptions.toolbar;

						const height = this.element.dataset.wysiwygHeight
							? parseInt(this.element.dataset.wysiwygHeight)
							: this.options.components.wysiwyg.defaultOptions.height;

						this.componentInstance = new WYSIWYGClass(textarea, {
							...this.options.components.wysiwyg.defaultOptions,
							toolbar: toolbar,
							height: height,
							placeholder: this.element.dataset.wysiwygPlaceholder || ''
						});
					}, 0);
				}
			}

			return container;
		}

		/**
		 * Create select dropdown
		 */
		_createSelect() {
			const select = document.createElement('select');
			select.className = 'form-select form-select-sm';

			// Parse options
			let options = [];
			if (this.element.dataset.options) {
				options = JSON.parse(this.element.dataset.options);
			}

			// Add options
			options.forEach(opt => {
				const option = document.createElement('option');
				option.value = opt.value;
				option.textContent = opt.text;
				if (opt.value === this.currentValue) {
					option.selected = true;
				}
				select.appendChild(option);
			});

			// Add validation
			if (this.element.dataset.required) {
				select.required = true;
			}

			// Keyboard handling
			if (this.options.cancelOnEscape) {
				select.addEventListener('keydown', (e) => {
					if (e.key === 'Escape') {
						e.preventDefault();
						this.cancel();
					}
				});
			}

			return select;
		}

		/**
		 * Create multi-select
		 */
		_createMultiSelect() {
			const container = document.createElement('div');
			container.className = 'multiselect-container';

			const select = document.createElement('select');
			select.multiple = true;
			select.className = 'form-select';

			// Parse options
			let options = [];
			if (this.element.dataset.options) {
				options = JSON.parse(this.element.dataset.options);
			}

			// Add options
			const currentValues = Array.isArray(this.currentValue) ? this.currentValue : [];
			options.forEach(opt => {
				const option = document.createElement('option');
				option.value = opt.value;
				option.textContent = opt.text;
				if (currentValues.includes(opt.value)) {
					option.selected = true;
				}
				select.appendChild(option);
			});

			container.appendChild(select);

			// Initialize MultiSelect if available
			if (this.options.components && this.options.components.multiselect) {
				const MultiSelectClass = this.options.components.multiselect.class;
				if (MultiSelectClass) {
					setTimeout(() => {
						this.componentInstance = new MultiSelectClass(select, {
							...this.options.components.multiselect.defaultOptions,
							searchable: this.element.dataset.multiselectSearchable === 'true',
							maxSelections: this.element.dataset.multiselectMax ? parseInt(this.element.dataset.multiselectMax) : null,
							placeholder: this.element.dataset.multiselectPlaceholder || 'Select options...'
						});
					}, 0);
				}
			}

			return container;
		}

		/**
		 * Create file upload
		 */
		_createFileUpload() {
			const container = document.createElement('div');
			container.className = 'file-upload-container';

			const input = document.createElement('input');
			input.type = 'file';
			input.className = 'form-control form-control-sm';

			// Configure file input
			if (this.element.dataset.fileAccept) {
				input.accept = this.element.dataset.fileAccept;
			}
			if (this.element.dataset.fileMultiple === 'true') {
				input.multiple = true;
			}

			container.appendChild(input);

			// Initialize FileUpload if available
			if (this.options.components && this.options.components.fileupload) {
				const FileUploadClass = this.options.components.fileupload.class;
				if (FileUploadClass) {
					setTimeout(() => {
						this.componentInstance = new FileUploadClass(input, {
							...this.options.components.fileupload.defaultOptions,
							maxSize: this.element.dataset.fileMaxSize ? parseInt(this.element.dataset.fileMaxSize) : null,
							preview: this.element.dataset.filePreview === 'true'
						});
					}, 0);
				}
			}

			return container;
		}

		/**
		 * Create masked input
		 */
		_createMaskedInput() {
			const input = document.createElement('input');
			input.type = 'text';
			input.className = 'form-control form-control-sm';
			input.value = this.currentValue || '';

			// Initialize InputMask if available
			if (this.options.components && this.options.components.inputmask) {
				const InputMaskClass = this.options.components.inputmask.class;
				if (InputMaskClass) {
					setTimeout(() => {
						this.componentInstance = new InputMaskClass(input, {
							...this.options.components.inputmask.defaultOptions,
							pattern: this.element.dataset.maskPattern || '',
							placeholder: this.element.dataset.maskPlaceholder || '_',
							reverse: this.element.dataset.maskReverse === 'true'
						});
					}, 0);
				}
			}

			// Keyboard handling
			if (this.options.saveOnEnter) {
				input.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						this.save();
					}
				});
			}

			if (this.options.cancelOnEscape) {
				input.addEventListener('keydown', (e) => {
					if (e.key === 'Escape') {
						e.preventDefault();
						this.cancel();
					}
				});
			}

			return input;
		}

		/**
		 * Create save/cancel buttons
		 */
		_createButtons() {
			const container = document.createElement('div');
			container.className = 'edit-in-place-buttons mt-2';

			const saveBtn = document.createElement('button');
			saveBtn.type = 'button';
			saveBtn.className = this.options.saveButtonClass;
			saveBtn.textContent = this.options.saveButtonText;
			saveBtn.addEventListener('click', () => this.save());

			const cancelBtn = document.createElement('button');
			cancelBtn.type = 'button';
			cancelBtn.className = this.options.cancelButtonClass + ' ms-2';
			cancelBtn.textContent = this.options.cancelButtonText;
			cancelBtn.addEventListener('click', () => this.cancel());

			container.appendChild(saveBtn);
			container.appendChild(cancelBtn);

			return container;
		}

		/**
		 * Focus the input element
		 */
		_focusInput() {
			setTimeout(() => {
				if (this.inputElement) {
					const focusElement = this.inputElement.tagName === 'DIV'
						? this.inputElement.querySelector('input, textarea, select')
						: this.inputElement;

					if (focusElement) {
						focusElement.focus();

						// Select text if applicable
						if (focusElement.tagName === 'INPUT' || focusElement.tagName === 'TEXTAREA') {
							focusElement.select();
						}
					}
				}
			}, 0);
		}

		/**
		 * Get current input value
		 */
		_getInputValue() {
			if (!this.inputElement) return null;

			switch (this.fieldType) {
				case 'wysiwyg':
					if (this.componentInstance && this.componentInstance.getContent) {
						return this.componentInstance.getContent();
					}
					return this.inputElement.querySelector('textarea')?.value || '';

				case 'multiselect':
					if (this.componentInstance && this.componentInstance.getValue) {
						return this.componentInstance.getValue();
					}
					const select = this.inputElement.querySelector('select');
					return Array.from(select.selectedOptions).map(opt => opt.value);

				case 'file':
					if (this.componentInstance && this.componentInstance.getFiles) {
						return this.componentInstance.getFiles();
					}
					return this.inputElement.querySelector('input[type="file"]')?.files || null;

				case 'textarea':
				case 'select':
				case 'masked':
				case 'text':
				default:
					const inputEl = this.inputElement.tagName === 'DIV'
						? this.inputElement.querySelector('input, textarea, select')
						: this.inputElement;
					return inputEl?.value || '';
			}
		}

		/**
		 * Validate input value
		 */
		async _validate(value) {
			// Remove any existing error classes
			const inputEl = this.inputElement.tagName === 'DIV'
				? this.inputElement.querySelector('input, textarea, select')
				: this.inputElement;

			if (inputEl) {
				inputEl.classList.remove(this.options.errorClass);
			}

			// Required field validation
			if (this.element.dataset.required === 'true') {
				if (!value || (Array.isArray(value) && value.length === 0)) {
					this._showValidationError('This field is required');
					return false;
				}
			}

			// Min length validation
			if (this.element.dataset.minLength && typeof value === 'string') {
				const minLength = parseInt(this.element.dataset.minLength);
				if (value.length < minLength) {
					this._showValidationError(`Minimum length is ${minLength} characters`);
					return false;
				}
			}

			// Max length validation
			if (this.element.dataset.maxLength && typeof value === 'string') {
				const maxLength = parseInt(this.element.dataset.maxLength);
				if (value.length > maxLength) {
					this._showValidationError(`Maximum length is ${maxLength} characters`);
					return false;
				}
			}

			// Pattern validation
			if (this.element.dataset.pattern && typeof value === 'string') {
				const pattern = new RegExp(this.element.dataset.pattern);
				if (!pattern.test(value)) {
					this._showValidationError('Invalid format');
					return false;
				}
			}

			// Custom validation
			if (this.options.onValidate) {
				const result = await this.options.onValidate(value, this.element);
				if (result && !result.valid) {
					this._showValidationError(result.message || 'Validation failed');
					return false;
				}
			}

			// Dispatch validation event
			this._dispatchEvent('editinplace:validate', { valid: true });

			return true;
		}

		/**
		 * Show validation error
		 */
		_showValidationError(message) {
			const inputEl = this.inputElement.tagName === 'DIV'
				? this.inputElement.querySelector('input, textarea, select')
				: this.inputElement;

			if (inputEl) {
				inputEl.classList.add(this.options.errorClass);

				// Create or update error message
				let errorDiv = this.element.querySelector('.invalid-feedback');
				if (!errorDiv) {
					errorDiv = document.createElement('div');
					errorDiv.className = 'invalid-feedback d-block';
					this.element.appendChild(errorDiv);
				}
				errorDiv.textContent = message;
			}

			// Dispatch validation event
			this._dispatchEvent('editinplace:validate', { valid: false, message });
		}

		/**
		 * Save changes
		 */
		async save() {
			// Get current value
			const value = this._getInputValue();

			// Validate
			const isValid = await this._validate(value);
			if (!isValid) {
				return;
			}

			// Show loading state
			this._showLoadingState();

			try {
				// Call save callback
				if (this.options.onSave) {
					const success = await this.options.onSave(this.fieldName, value, this.element);

					if (success) {
						// Update current value
						this.currentValue = value;

						// Exit edit mode
						this._exitEditMode(true);

						// Dispatch success event
						this._dispatchEvent('editinplace:save', { value });
					} else {
						// Show error
						this._showValidationError('Save failed. Please try again.');
						this._hideLoadingState();

						// Dispatch error event
						this._dispatchEvent('editinplace:error', { error: 'Save failed' });
					}
				} else {
					// No save callback, just update display
					this.currentValue = value;
					this._exitEditMode(true);
				}
			} catch (error) {
				console.error('Save error:', error);
				this._showValidationError('An error occurred while saving.');
				this._hideLoadingState();

				// Dispatch error event
				this._dispatchEvent('editinplace:error', { error: error.message });
			}
		}

		/**
		 * Cancel editing
		 */
		cancel() {
			// Restore original value
			this.currentValue = this.originalValue;

			// Exit edit mode
			this._exitEditMode(false);

			// Trigger callback
			if (this.options.onCancel) {
				this.options.onCancel(this.element, this);
			}

			// Dispatch cancel event
			this._dispatchEvent('editinplace:cancel');
		}

		/**
		 * Exit edit mode
		 */
		_exitEditMode(saved) {
			// Destroy component instance if exists
			if (this.componentInstance && this.componentInstance.destroy) {
				this.componentInstance.destroy();
				this.componentInstance = null;
			}

			// Update display
			this._updateDisplay();

			// Remove editing class
			this.element.classList.remove(this.options.editingClass);

			// Reset state
			this.isEditing = false;
			this.inputElement = null;
			this.buttonContainer = null;
		}

		/**
		 * Update display with current value
		 */
		_updateDisplay() {
			// Format value for display
			let displayValue = this._formatDisplayValue(this.currentValue);

			if (!displayValue) {
				this._showEmptyState();
			} else {
				this.element.innerHTML = displayValue;
			}

			// Update data-value attribute
			if (typeof this.currentValue === 'object') {
				this.element.dataset.value = JSON.stringify(this.currentValue);
			} else {
				this.element.dataset.value = this.currentValue;
			}
		}

		/**
		 * Format value for display
		 */
		_formatDisplayValue(value) {
			if (!value) return '';

			switch (this.fieldType) {
				case 'multiselect':
					if (Array.isArray(value)) {
						// Get option text for selected values
						let options = [];
						if (this.element.dataset.options) {
							options = JSON.parse(this.element.dataset.options);
						}

						const texts = value.map(val => {
							const opt = options.find(o => o.value === val);
							return opt ? opt.text : val;
						});

						return texts.join(', ');
					}
					return '';

				case 'select':
					// Get option text for selected value
					let options = [];
					if (this.element.dataset.options) {
						options = JSON.parse(this.element.dataset.options);
					}

					const opt = options.find(o => o.value === value);
					return opt ? opt.text : value;

				case 'file':
					// Show file name or preview
					if (value && value.length > 0) {
						const file = value[0];
						if (file.name) {
							return `<span class="badge bg-secondary">${file.name}</span>`;
						}
					}
					return this.element.dataset.fileUrl || '';

				case 'wysiwyg':
					// Return HTML content
					return value;

				default:
					// Escape HTML for plain text
					const div = document.createElement('div');
					div.textContent = value;
					return div.innerHTML;
			}
		}

		/**
		 * Show loading state
		 */
		_showLoadingState() {
			if (this.buttonContainer) {
				const saveBtn = this.buttonContainer.querySelector('button:first-child');
				if (saveBtn) {
					saveBtn.disabled = true;
					saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>${this.options.loadingText}`;
				}

				const cancelBtn = this.buttonContainer.querySelector('button:last-child');
				if (cancelBtn) {
					cancelBtn.disabled = true;
				}
			}
		}

		/**
		 * Hide loading state
		 */
		_hideLoadingState() {
			if (this.buttonContainer) {
				const saveBtn = this.buttonContainer.querySelector('button:first-child');
				if (saveBtn) {
					saveBtn.disabled = false;
					saveBtn.textContent = this.options.saveButtonText;
				}

				const cancelBtn = this.buttonContainer.querySelector('button:last-child');
				if (cancelBtn) {
					cancelBtn.disabled = false;
				}
			}
		}

		/**
		 * Dispatch custom event
		 */
		_dispatchEvent(eventName, detail = {}) {
			const event = new CustomEvent(eventName, {
				detail: {
					element: this.element,
					field: this,
					...detail
				},
				bubbles: true,
				cancelable: true
			});

			this.element.dispatchEvent(event);
		}

		/**
		 * Destroy field
		 */
		destroy() {
			// Destroy component instance if exists
			if (this.componentInstance && this.componentInstance.destroy) {
				this.componentInstance.destroy();
				this.componentInstance = null;
			}

			// Remove classes and styles
			this.element.classList.remove('edit-in-place-field', this.options.editingClass);
			this.element.style.cursor = '';

			// Clear references
			this.inputElement = null;
			this.buttonContainer = null;
		}
	};
}