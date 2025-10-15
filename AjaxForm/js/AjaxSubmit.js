/**
 * AjaxSubmit - Vanilla JavaScript drop-in replacement for jQuery ajaxSubmit()
 * Immediately submits a form via AJAX without binding event listeners
 *
 * @class AjaxSubmit
 * @version 1.0.0
 */
class AjaxSubmit {
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
	 * Submit a form immediately via AJAX
	 * @param {HTMLFormElement|string} form - Form element or selector
	 * @param {Object} options - Configuration options
	 * @returns {Promise}
	 */
	static submit(form, options = {}) {
		// Get form element
		let formElement;
		if (typeof form === 'string') {
			formElement = document.querySelector(form);
		} else {
			formElement = form;
		}

		if (!formElement || formElement.tagName !== 'FORM') {
			throw new Error('AjaxSubmit: Invalid form element provided');
		}

		// Merge options with defaults
		const config = { ...AjaxSubmit.defaults, ...options };

		// Run beforeSerialize callback
		if (typeof config.beforeSerialize === 'function') {
			if (config.beforeSerialize(formElement, config) === false) {
				return Promise.resolve(false);
			}
		}

		// Serialize form data
		const formData = AjaxSubmit.serializeForm(formElement, config);

		// Run beforeSubmit callback
		if (typeof config.beforeSubmit === 'function') {
			const formArray = AjaxSubmit.formToArray(formElement);
			if (config.beforeSubmit(formArray, formElement, config) === false) {
				return Promise.resolve(false);
			}
		}

		// Determine if we have file uploads
		const hasFiles = AjaxSubmit.hasFileUploads(formElement);

		// Get submission URL
		const url = config.url || formElement.getAttribute('action') || window.location.href;
		const method = (config.type || formElement.getAttribute('method') || 'POST').toUpperCase();

		// Submit based on file upload presence
		if (hasFiles || config.iframe) {
			return AjaxSubmit.submitWithFiles(formElement, url, method, formData, config);
		} else {
			return AjaxSubmit.submitStandard(formElement, url, method, formData, config);
		}
	}

	/**
	 * Serialize form into FormData or URLSearchParams
	 * @param {HTMLFormElement} form - Form element
	 * @param {Object} options - Configuration options
	 * @returns {FormData|URLSearchParams}
	 */
	static serializeForm(form, options) {
		const hasFiles = AjaxSubmit.hasFileUploads(form);

		if (hasFiles) {
			// Use FormData for file uploads
			const formData = new FormData(form);

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
			const elements = form.elements;
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
	 * @param {HTMLFormElement} form - Form element
	 * @param {string} url - Submission URL
	 * @param {string} method - HTTP method
	 * @param {URLSearchParams} data - Form data
	 * @param {Object} options - Configuration options
	 * @returns {Promise}
	 */
	static submitStandard(form, url, method, data, options) {
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
						console.error('AjaxSubmit: Failed to parse JSON response', e);
					}
				} else if (options.dataType === 'xml') {
					responseData = xhr.responseXML;
				}

				if (xhr.status >= 200 && xhr.status < 300) {
					// Success
					AjaxSubmit.handleSuccess(form, responseData, xhr.statusText, xhr, options);
					resolve(responseData);
				} else {
					// Error
					AjaxSubmit.handleError(xhr, xhr.statusText, null, options);
					reject(new Error(xhr.statusText));
				}

				// Complete callback
				if (typeof options.complete === 'function') {
					options.complete(xhr, xhr.statusText);
				}
			};

			// Handle error
			xhr.onerror = () => {
				AjaxSubmit.handleError(xhr, 'error', null, options);

				if (typeof options.complete === 'function') {
					options.complete(xhr, 'error');
				}

				reject(new Error('Network error'));
			};

			// Handle timeout
			xhr.ontimeout = () => {
				AjaxSubmit.handleError(xhr, 'timeout', null, options);

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
	 * @param {HTMLFormElement} form - Form element
	 * @param {string} url - Submission URL
	 * @param {string} method - HTTP method
	 * @param {FormData} data - Form data with files
	 * @param {Object} options - Configuration options
	 * @returns {Promise}
	 */
	static submitWithFiles(form, url, method, data, options) {
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
						console.error('AjaxSubmit: Failed to parse JSON response', e);
					}
				} else if (options.dataType === 'xml') {
					responseData = xhr.responseXML;
				}

				if (xhr.status >= 200 && xhr.status < 300) {
					// Success
					AjaxSubmit.handleSuccess(form, responseData, xhr.statusText, xhr, options);
					resolve(responseData);
				} else {
					// Error
					AjaxSubmit.handleError(xhr, xhr.statusText, null, options);
					reject(new Error(xhr.statusText));
				}

				// Complete callback
				if (typeof options.complete === 'function') {
					options.complete(xhr, xhr.statusText);
				}
			};

			// Handle error
			xhr.onerror = () => {
				AjaxSubmit.handleError(xhr, 'error', null, options);

				if (typeof options.complete === 'function') {
					options.complete(xhr, 'error');
				}

				reject(new Error('Network error'));
			};

			// Handle timeout
			xhr.ontimeout = () => {
				AjaxSubmit.handleError(xhr, 'timeout', null, options);

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
	 * @param {HTMLFormElement} form - Form element
	 * @param {*} data - Response data
	 * @param {string} textStatus - Status text
	 * @param {XMLHttpRequest} xhr - XHR object
	 * @param {Object} options - Configuration options
	 */
	static handleSuccess(form, data, textStatus, xhr, options) {
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
			form.reset();
		}
		if (options.clearForm) {
			AjaxSubmit.clearForm(form);
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
	static handleError(xhr, textStatus, errorThrown, options) {
		if (typeof options.error === 'function') {
			options.error(xhr, textStatus, errorThrown);
		}
	}

	/**
	 * Check if form has file uploads
	 * @param {HTMLFormElement} form - Form element
	 * @returns {boolean}
	 */
	static hasFileUploads(form) {
		const fileInputs = form.querySelectorAll('input[type="file"]');

		for (let i = 0; i < fileInputs.length; i++) {
			if (fileInputs[i].files && fileInputs[i].files.length > 0) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Convert form to array format
	 * @param {HTMLFormElement} form - Form element
	 * @returns {Array}
	 */
	static formToArray(form) {
		const array = [];
		const elements = form.elements;

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
	 * @param {HTMLFormElement} form - Form element
	 */
	static clearForm(form) {
		const elements = form.elements;

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
}