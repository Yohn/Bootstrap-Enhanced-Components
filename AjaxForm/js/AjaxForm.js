/**
 * AjaxForm - Vanilla JavaScript drop-in replacement for jQuery ajaxForm()
 * Binds a form to be submitted via AJAX with support for file uploads
 *
 * @class AjaxForm
 * @version 1.0.0
 */
class AjaxForm {
	/**
	 * Default configuration options
	 * @type {Object}
	 */
	static defaults = {
		url: null,                    // Form action URL (defaults to form's action attribute)
		type: 'POST',                 // HTTP method
		dataType: 'json',             // Expected response type: 'json', 'html', 'xml', 'text'
		data: null,                   // Additional data to submit
		beforeSubmit: null,           // Callback before submission (return false to cancel)
		beforeSerialize: null,        // Callback before form serialization
		success: null,                // Success callback
		error: null,                  // Error callback
		complete: null,               // Complete callback (always runs)
		uploadProgress: null,         // Upload progress callback
		resetForm: false,             // Reset form after successful submission
		clearForm: false,             // Clear form after successful submission
		target: null,                 // Element to update with response
		replaceTarget: false,         // Replace target element entirely
		semantic: false,              // Force semantic form data
		iframe: false,                // Force iframe upload (legacy support)
		timeout: 0,                   // Request timeout in milliseconds
		extraData: {},                // Extra data to append to form
		forceSync: false              // Force synchronous submission
	};

	/**
	 * Constructor
	 * @param {HTMLFormElement|string} form - Form element or selector
	 * @param {Object} options - Configuration options
	 */
	constructor(form, options = {}) {
		// Get form element
		if (typeof form === 'string') {
			this.form = document.querySelector(form);
		} else {
			this.form = form;
		}

		if (!this.form || this.form.tagName !== 'FORM') {
			throw new Error('AjaxForm: Invalid form element provided');
		}

		// Merge options with defaults
		this.options = { ...AjaxForm.defaults, ...options };

		// Bind form submit event
		this.boundSubmitHandler = this.handleSubmit.bind(this);
		this.form.addEventListener('submit', this.boundSubmitHandler);

		// Store reference on form element
		this.form._ajaxForm = this;
	}

	/**
	 * Handle form submission
	 * @param {Event} event - Submit event
	 */
	handleSubmit(event) {
		event.preventDefault();
		event.stopPropagation();

		this.submit();
	}

	/**
	 * Submit the form via AJAX
	 * @param {Object} submitOptions - Options to override instance options
	 * @returns {Promise}
	 */
	submit(submitOptions = {}) {
		const options = { ...this.options, ...submitOptions };

		// Run beforeSerialize callback
		if (typeof options.beforeSerialize === 'function') {
			if (options.beforeSerialize(this.form, options) === false) {
				return Promise.resolve(false);
			}
		}

		// Serialize form data
		const formData = this.serializeForm(options);

		// Run beforeSubmit callback
		if (typeof options.beforeSubmit === 'function') {
			const formArray = this.formToArray();
			if (options.beforeSubmit(formArray, this.form, options) === false) {
				return Promise.resolve(false);
			}
		}

		// Determine if we have file uploads
		const hasFiles = this.hasFileUploads();

		// Get submission URL
		const url = options.url || this.form.getAttribute('action') || window.location.href;
		const method = (options.type || this.form.getAttribute('method') || 'POST').toUpperCase();

		// Submit based on file upload presence
		if (hasFiles || options.iframe) {
			return this.submitWithFiles(url, method, formData, options);
		} else {
			return this.submitStandard(url, method, formData, options);
		}
	}

	/**
	 * Serialize form into FormData or URLSearchParams
	 * @param {Object} options - Configuration options
	 * @returns {FormData|URLSearchParams|string}
	 */
	serializeForm(options) {
		const hasFiles = this.hasFileUploads();

		if (hasFiles) {
			// Use FormData for file uploads
			const formData = new FormData(this.form);

			// Append extra data
			if (options.extraData && typeof options.extraData === 'object') {
				for (const [key, value] of Object.entries(options.extraData)) {
					formData.append(key, value);
				}
			}

			return formData;
		} else {
			// Use URLSearchParams for regular forms
			const formData = new URLSearchParams();

			// Serialize form elements
			const elements = this.form.elements;
			for (let i = 0; i < elements.length; i++) {
				const element = elements[i];

				if (!element.name || element.disabled) continue;

				if (element.type === 'checkbox' || element.type === 'radio') {
					if (element.checked) {
						formData.append(element.name, element.value);
					}
				} else if (element.type === 'select-multiple') {
					const select = element;
					for (let j = 0; j < select.options.length; j++) {
						if (select.options[j].selected) {
							formData.append(element.name, select.options[j].value);
						}
					}
				} else if (element.type !== 'file' && element.type !== 'submit' && element.type !== 'button') {
					formData.append(element.name, element.value);
				}
			}

			// Append extra data
			if (options.extraData && typeof options.extraData === 'object') {
				for (const [key, value] of Object.entries(options.extraData)) {
					formData.append(key, value);
				}
			}

			return formData;
		}
	}

	/**
	 * Submit form with standard AJAX (no files)
	 * @param {string} url - Submission URL
	 * @param {string} method - HTTP method
	 * @param {URLSearchParams} data - Form data
	 * @param {Object} options - Configuration options
	 * @returns {Promise}
	 */
	submitStandard(url, method, data, options) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			// Setup request
			xhr.open(method, url, true);

			// Set timeout
			if (options.timeout > 0) {
				xhr.timeout = options.timeout;
			}

			// Set request headers for URL encoded data
			if (!(data instanceof FormData)) {
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			}

			// Handle response based on dataType
			if (options.dataType === 'json') {
				xhr.setRequestHeader('Accept', 'application/json');
			}

			// Upload progress
			if (typeof options.uploadProgress === 'function' && xhr.upload) {
				xhr.upload.addEventListener('progress', (e) => {
					if (e.lengthComputable) {
						const percentComplete = (e.loaded / e.total) * 100;
						options.uploadProgress(e, e.loaded, e.total, percentComplete);
					}
				});
			}

			// Handle response
			xhr.onload = () => {
				let responseData = xhr.responseText;

				// Parse response based on dataType
				if (options.dataType === 'json' && responseData) {
					try {
						responseData = JSON.parse(responseData);
					} catch (e) {
						console.error('AjaxForm: Failed to parse JSON response', e);
					}
				} else if (options.dataType === 'xml') {
					responseData = xhr.responseXML;
				}

				if (xhr.status >= 200 && xhr.status < 300) {
					// Success
					this.handleSuccess(responseData, xhr.statusText, xhr, options);
					resolve(responseData);
				} else {
					// Error
					this.handleError(xhr, xhr.statusText, null, options);
					reject(new Error(xhr.statusText));
				}

				// Complete callback
				if (typeof options.complete === 'function') {
					options.complete(xhr, xhr.statusText);
				}
			};

			// Handle error
			xhr.onerror = () => {
				this.handleError(xhr, 'error', null, options);

				if (typeof options.complete === 'function') {
					options.complete(xhr, 'error');
				}

				reject(new Error('Network error'));
			};

			// Handle timeout
			xhr.ontimeout = () => {
				this.handleError(xhr, 'timeout', null, options);

				if (typeof options.complete === 'function') {
					options.complete(xhr, 'timeout');
				}

				reject(new Error('Request timeout'));
			};

			// Send request
			const sendData = (data instanceof FormData) ? data : data.toString();
			xhr.send(sendData);
		});
	}

	/**
	 * Submit form with file uploads
	 * @param {string} url - Submission URL
	 * @param {string} method - HTTP method
	 * @param {FormData} data - Form data with files
	 * @param {Object} options - Configuration options
	 * @returns {Promise}
	 */
	submitWithFiles(url, method, data, options) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			// Setup request
			xhr.open(method, url, true);

			// Set timeout
			if (options.timeout > 0) {
				xhr.timeout = options.timeout;
			}

			// Set accept header
			if (options.dataType === 'json') {
				xhr.setRequestHeader('Accept', 'application/json');
			}

			// Upload progress
			if (typeof options.uploadProgress === 'function' && xhr.upload) {
				xhr.upload.addEventListener('progress', (e) => {
					if (e.lengthComputable) {
						const percentComplete = (e.loaded / e.total) * 100;
						options.uploadProgress(e, e.loaded, e.total, percentComplete);
					}
				});
			}

			// Handle response
			xhr.onload = () => {
				let responseData = xhr.responseText;

				// Parse response based on dataType
				if (options.dataType === 'json' && responseData) {
					try {
						responseData = JSON.parse(responseData);
					} catch (e) {
						console.error('AjaxForm: Failed to parse JSON response', e);
					}
				} else if (options.dataType === 'xml') {
					responseData = xhr.responseXML;
				}

				if (xhr.status >= 200 && xhr.status < 300) {
					// Success
					this.handleSuccess(responseData, xhr.statusText, xhr, options);
					resolve(responseData);
				} else {
					// Error
					this.handleError(xhr, xhr.statusText, null, options);
					reject(new Error(xhr.statusText));
				}

				// Complete callback
				if (typeof options.complete === 'function') {
					options.complete(xhr, xhr.statusText);
				}
			};

			// Handle error
			xhr.onerror = () => {
				this.handleError(xhr, 'error', null, options);

				if (typeof options.complete === 'function') {
					options.complete(xhr, 'error');
				}

				reject(new Error('Network error'));
			};

			// Handle timeout
			xhr.ontimeout = () => {
				this.handleError(xhr, 'timeout', null, options);

				if (typeof options.complete === 'function') {
					options.complete(xhr, 'timeout');
				}

				reject(new Error('Request timeout'));
			};

			// Send request with FormData (includes files)
			xhr.send(data);
		});
	}

	/**
	 * Handle successful submission
	 * @param {*} data - Response data
	 * @param {string} textStatus - Status text
	 * @param {XMLHttpRequest} xhr - XHR object
	 * @param {Object} options - Configuration options
	 */
	handleSuccess(data, textStatus, xhr, options) {
		// Update target element
		if (options.target) {
			const target = typeof options.target === 'string'
				? document.querySelector(options.target)
				: options.target;

			if (target) {
				if (options.replaceTarget) {
					target.outerHTML = data;
				} else {
					target.innerHTML = data;
				}
			}
		}

		// Reset or clear form
		if (options.resetForm) {
			this.form.reset();
		}
		if (options.clearForm) {
			this.clearForm();
		}

		// Success callback
		if (typeof options.success === 'function') {
			options.success(data, textStatus, xhr);
		}
	}

	/**
	 * Handle submission error
	 * @param {XMLHttpRequest} xhr - XHR object
	 * @param {string} textStatus - Status text
	 * @param {Error} errorThrown - Error object
	 * @param {Object} options - Configuration options
	 */
	handleError(xhr, textStatus, errorThrown, options) {
		if (typeof options.error === 'function') {
			options.error(xhr, textStatus, errorThrown);
		}
	}

	/**
	 * Check if form has file uploads
	 * @returns {boolean}
	 */
	hasFileUploads() {
		const fileInputs = this.form.querySelectorAll('input[type="file"]');

		for (let i = 0; i < fileInputs.length; i++) {
			if (fileInputs[i].files && fileInputs[i].files.length > 0) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Convert form to array format
	 * @returns {Array}
	 */
	formToArray() {
		const array = [];
		const elements = this.form.elements;

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];

			if (!element.name || element.disabled) continue;

			if (element.type === 'checkbox' || element.type === 'radio') {
				if (element.checked) {
					array.push({ name: element.name, value: element.value, type: element.type });
				}
			} else if (element.type === 'select-multiple') {
				const select = element;
				for (let j = 0; j < select.options.length; j++) {
					if (select.options[j].selected) {
						array.push({ name: element.name, value: select.options[j].value, type: element.type });
					}
				}
			} else if (element.type === 'file') {
				if (element.files && element.files.length > 0) {
					for (let j = 0; j < element.files.length; j++) {
						array.push({ name: element.name, value: element.files[j], type: element.type });
					}
				}
			} else if (element.type !== 'submit' && element.type !== 'button') {
				array.push({ name: element.name, value: element.value, type: element.type });
			}
		}

		return array;
	}

	/**
	 * Clear form inputs
	 */
	clearForm() {
		const elements = this.form.elements;

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];

			if (element.type === 'checkbox' || element.type === 'radio') {
				element.checked = false;
			} else if (element.type === 'select-one' || element.type === 'select-multiple') {
				element.selectedIndex = -1;
			} else if (element.type !== 'submit' && element.type !== 'button') {
				element.value = '';
			}
		}
	}

	/**
	 * Destroy the AjaxForm instance
	 */
	destroy() {
		this.form.removeEventListener('submit', this.boundSubmitHandler);
		delete this.form._ajaxForm;
	}

	/**
	 * Static method to initialize AjaxForm on an element
	 * @param {HTMLFormElement|string} form - Form element or selector
	 * @param {Object} options - Configuration options
	 * @returns {AjaxForm}
	 */
	static init(form, options = {}) {
		return new AjaxForm(form, options);
	}
}