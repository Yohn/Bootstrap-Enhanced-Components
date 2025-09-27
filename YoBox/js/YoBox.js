/**
 * YoBox - A modern vanilla JavaScript replacement for Bootbox
 * Bootstrap 5.3+ compatible modal dialogs
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 */

class YoBox {
	constructor(options = {}) {
		this.version = '1.0.0';

		// Default configuration
		this.defaults = {
			locale: 'en',
			backdrop: 'static',
			animate: true,
			className: null,
			closeButton: true,
			show: true,
			container: 'body',
			value: '',
			inputType: 'text',
			errorMessage: null,
			swapButtonOrder: false,
			centerVertical: false,
			multiple: false,
			scrollable: false,
			reusable: false,
			relatedTarget: null,
			size: null,
			id: null,
			...options
		};

		// Locale strings
		this.locales = {
			'en': {
				OK: 'OK',
				CANCEL: 'Cancel',
				CONFIRM: 'OK'
			}
		};

		// HTML templates
		this.templates = {
			dialog: `
				<div class="yobox modal" tabindex="-1" role="dialog" aria-hidden="true">
					<div class="modal-dialog">
						<div class="modal-content">
							<div class="modal-body">
								<div class="yobox-body"></div>
							</div>
						</div>
					</div>
				</div>
			`,
			header: '<div class="modal-header"><h5 class="modal-title"></h5></div>',
			footer: '<div class="modal-footer"></div>',
			closeButton: '<button type="button" class="yobox-close-button btn-close" aria-hidden="true" aria-label="Close"></button>',
			form: '<form class="yobox-form"></form>',
			button: '<button type="button" class="btn"></button>',
			option: '<option value=""></option>',
			promptMessage: '<div class="yobox-prompt-message"></div>',
			inputs: {
				text: '<input class="yobox-input yobox-input-text form-control" autocomplete="off" type="text" />',
				textarea: '<textarea class="yobox-input yobox-input-textarea form-control"></textarea>',
				email: '<input class="yobox-input yobox-input-email form-control" autocomplete="off" type="email" />',
				select: '<select class="yobox-input yobox-input-select form-select"></select>',
				checkbox: '<div class="form-check checkbox"><label class="form-check-label"><input class="form-check-input yobox-input yobox-input-checkbox" type="checkbox" /></label></div>',
				radio: '<div class="form-check radio"><label class="form-check-label"><input class="form-check-input yobox-input yobox-input-radio" type="radio" name="yobox-radio" /></label></div>',
				date: '<input class="yobox-input yobox-input-date form-control" autocomplete="off" type="date" />',
				time: '<input class="yobox-input yobox-input-time form-control" autocomplete="off" type="time" />',
				number: '<input class="yobox-input yobox-input-number form-control" autocomplete="off" type="number" />',
				password: '<input class="yobox-input yobox-input-password form-control" autocomplete="off" type="password" />',
				range: '<input class="yobox-input yobox-input-range form-control-range" autocomplete="off" type="range" />'
			}
		};

		this.activeModals = new Set();
	}

	/**
	 * Add a new locale
	 * @param {string} name - Locale identifier
	 * @param {Object} values - Locale strings
	 */
	addLocale(name, values) {
		const requiredKeys = ['OK', 'CANCEL', 'CONFIRM'];

		for (const key of requiredKeys) {
			if (!values[key]) {
				throw new Error(`Please supply a translation for "${key}"`);
			}
		}

		this.locales[name] = {
			OK: values.OK,
			CANCEL: values.CANCEL,
			CONFIRM: values.CONFIRM
		};

		return this;
	}

	/**
	 * Remove a locale
	 * @param {string} name - Locale identifier
	 */
	removeLocale(name) {
		if (name === 'en') {
			throw new Error('"en" is used as the default and fallback locale and cannot be removed.');
		}
		delete this.locales[name];
		return this;
	}

	/**
	 * Set the default locale
	 * @param {string} name - Locale identifier
	 */
	setLocale(name) {
		return this.setDefaults('locale', name);
	}

	/**
	 * Set default options
	 * @param {string|Object} key - Option key or options object
	 * @param {*} value - Option value (if key is string)
	 */
	setDefaults(key, value) {
		if (typeof key === 'string') {
			this.defaults[key] = value;
		} else {
			Object.assign(this.defaults, key);
		}
		return this;
	}

	/**
	 * Hide all active modals
	 */
	hideAll() {
		this.activeModals.forEach(modal => {
			const bsModal = bootstrap.Modal.getInstance(modal);
			if (bsModal) {
				bsModal.hide();
			}
		});
		return this;
	}

	/**
	 * Create a custom dialog
	 * @param {Object} options - Dialog configuration
	 */
	dialog(options) {
		if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
			throw new Error('Bootstrap 5.3+ is required for YoBox to function properly');
		}

		options = this._sanitize(options);

		const dialogElement = this._createDialogElement(options);
		const modal = this._setupModal(dialogElement, options);

		return modal;
	}

	/**
	 * Create an alert dialog
	 * @param {string|Object} message - Alert message or options object
	 * @param {Function} callback - Optional callback function
	 */
	alert(message, callback) {
		let options;

		if (typeof message === 'string') {
			options = {
				message: message,
				callback: callback
			};
		} else {
			options = message;
		}

		options = this._mergeDialogOptions('alert', ['ok'], ['message', 'callback'], options);

		if (options.callback && typeof options.callback !== 'function') {
			throw new Error('Alert requires the "callback" property to be a function when provided');
		}

		options.buttons.ok.callback = options.onEscape = () => {
			if (typeof options.callback === 'function') {
				return options.callback.call(this);
			}
			return true;
		};

		return this.dialog(options);
	}

	/**
	 * Create a confirm dialog
	 * @param {string|Object} message - Confirm message or options object
	 * @param {Function} callback - Callback function with boolean result
	 */
	confirm(message, callback) {
		let options;

		if (typeof message === 'string') {
			options = {
				message: message,
				callback: callback
			};
		} else {
			options = message;
		}

		options = this._mergeDialogOptions('confirm', ['cancel', 'confirm'], ['message', 'callback'], options);

		if (typeof options.callback !== 'function') {
			throw new Error('Confirm requires a callback');
		}

		options.buttons.cancel.callback = options.onEscape = () => {
			return options.callback.call(this, false);
		};

		options.buttons.confirm.callback = () => {
			return options.callback.call(this, true);
		};

		return this.dialog(options);
	}

	/**
	 * Create a prompt dialog
	 * @param {string|Object} title - Prompt title or options object
	 * @param {Function} callback - Callback function with input value
	 */
	prompt(title, callback) {
		let options;

		if (typeof title === 'string') {
			options = {
				title: title,
				callback: callback
			};
		} else {
			options = title;
		}

		if (!options.title) {
			throw new Error('Prompt requires a title');
		}

		if (typeof options.callback !== 'function') {
			throw new Error('Prompt requires a callback');
		}

		options = this._mergeDialogOptions('prompt', ['cancel', 'confirm'], ['title', 'callback'], options);

		const form = this._createPromptForm(options);
		options.message = form.element;

		const shouldShow = options.show !== false;
		options.show = false;

		options.buttons.cancel.callback = options.onEscape = () => {
			return options.callback.call(this, null);
		};

		options.buttons.confirm.callback = () => {
			const value = form.getValue();
			if (value === false) return false; // Validation failed
			return options.callback.call(this, value);
		};

		const promptDialog = this.dialog(options);

		// Focus the input when shown
		promptDialog.addEventListener('shown.bs.modal', () => {
			const input = form.element.querySelector('.yobox-input');
			if (input) input.focus();
		});

		if (shouldShow) {
			const bsModal = bootstrap.Modal.getInstance(promptDialog);
			bsModal.show();
		}

		return promptDialog;
	}

	// Private methods continue in next part...

	_sanitize(options) {
		if (typeof options !== 'object') {
			throw new Error('Please supply an object of options');
		}

		if (!options.message) {
			throw new Error('"message" option must not be null or an empty string.');
		}

		// Merge with defaults
		options = { ...this.defaults, ...options };

		// Sanitize backdrop
		if (!options.backdrop) {
			options.backdrop = (options.backdrop === false || options.backdrop === 0) ? false : 'static';
		} else {
			options.backdrop = typeof options.backdrop === 'string' && options.backdrop.toLowerCase() === 'static' ? 'static' : true;
		}

		// Ensure buttons object exists
		if (!options.buttons) {
			options.buttons = {};
		}

		// Process buttons
		const buttons = options.buttons;
		const buttonKeys = Object.keys(buttons);
		const total = buttonKeys.length;

		buttonKeys.forEach((key, index) => {
			let button = buttons[key];

			if (typeof button === 'function') {
				button = buttons[key] = { callback: button };
			}

			if (typeof button !== 'object') {
				throw new Error(`Button with key "${key}" must be an object`);
			}

			if (!button.label) {
				button.label = key;
			}

			if (!button.className) {
				const isPrimary = options.swapButtonOrder ? index === 0 : index === total - 1;

				if (total <= 2 && isPrimary) {
					button.className = 'btn-primary';
				} else {
					button.className = 'btn-secondary';
				}
			}
		});

		return options;
	}

	_createDialogElement(options) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(this.templates.dialog, 'text/html');
		const dialog = doc.querySelector('.yobox.modal');

		const innerDialog = dialog.querySelector('.modal-dialog');
		const body = dialog.querySelector('.modal-body');
		const yoboxBody = body.querySelector('.yobox-body');

		// Set message content
		if (typeof options.message === 'string') {
			yoboxBody.innerHTML = options.message;
		} else if (options.message instanceof HTMLElement) {
			yoboxBody.appendChild(options.message);
		}

		// Add header if title or close button
		if (options.title || options.closeButton) {
			const headerDoc = parser.parseFromString(this.templates.header, 'text/html');
			const header = headerDoc.querySelector('.modal-header');

			if (options.title) {
				header.querySelector('.modal-title').textContent = options.title;
			} else {
				header.classList.add('border-0');
			}

			if (options.closeButton) {
				const closeButtonDoc = parser.parseFromString(this.templates.closeButton, 'text/html');
				const closeButton = closeButtonDoc.querySelector('.yobox-close-button');
				header.appendChild(closeButton);
			}

			body.parentNode.insertBefore(header, body);
		}

		// Add footer with buttons
		if (Object.keys(options.buttons).length > 0) {
			const footerDoc = parser.parseFromString(this.templates.footer, 'text/html');
			const footer = footerDoc.querySelector('.modal-footer');

			Object.entries(options.buttons).forEach(([key, buttonConfig]) => {
				const buttonDoc = parser.parseFromString(this.templates.button, 'text/html');
				const button = buttonDoc.querySelector('.btn');

				button.dataset.yoboxHandler = key;
				button.className = `btn ${buttonConfig.className}`;
				button.textContent = buttonConfig.label;

				if (buttonConfig.id) {
					button.id = buttonConfig.id;
				}

				if (buttonConfig.disabled === true) {
					button.disabled = true;
				}

				// Add semantic classes
				switch (key) {
					case 'ok':
					case 'confirm':
						button.classList.add('yobox-accept');
						break;
					case 'cancel':
						button.classList.add('yobox-cancel');
						break;
				}

				footer.appendChild(button);
			});

			body.parentNode.appendChild(footer);
		}

		// Apply styling options
		if (options.animate === true) {
			dialog.classList.add('fade');
		}

		if (options.className) {
			dialog.classList.add(options.className);
		}

		if (options.id) {
			dialog.id = options.id;
		}

		if (options.size) {
			switch (options.size) {
				case 'small':
				case 'sm':
					innerDialog.classList.add('modal-sm');
					break;
				case 'large':
				case 'lg':
					innerDialog.classList.add('modal-lg');
					break;
				case 'extra-large':
				case 'xl':
					innerDialog.classList.add('modal-xl');
					break;
			}
		}

		if (options.scrollable) {
			innerDialog.classList.add('modal-dialog-scrollable');
		}

		if (options.centerVertical) {
			innerDialog.classList.add('modal-dialog-centered');
		}

		return dialog;
	}

	_setupModal(dialogElement, options) {
		const container = document.querySelector(options.container);
		container.appendChild(dialogElement);

		// Setup event listeners
		this._attachEventListeners(dialogElement, options);

		// Initialize Bootstrap modal
		const modal = new bootstrap.Modal(dialogElement, {
			backdrop: options.backdrop,
			keyboard: false
		});

		this.activeModals.add(dialogElement);

		// Handle modal cleanup
		dialogElement.addEventListener('hidden.bs.modal', () => {
			this.activeModals.delete(dialogElement);
			if (!options.reusable) {
				dialogElement.remove();
			}
		});

		// Show modal if requested
		if (options.show) {
			modal.show();
		}

		return dialogElement;
	}

	_attachEventListeners(dialogElement, options) {
		const callbacks = {
			onEscape: options.onEscape,
			...Object.fromEntries(
				Object.entries(options.buttons).map(([key, button]) => [key, button.callback])
			)
		};

		// Button click handlers
		dialogElement.addEventListener('click', (e) => {
			if (e.target.matches('.modal-footer button:not(.disabled)')) {
				const handler = e.target.dataset.yoboxHandler;
				if (handler && callbacks[handler]) {
					this._processCallback(e, dialogElement, callbacks[handler]);
				}
			}

			if (e.target.matches('.yobox-close-button')) {
				this._processCallback(e, dialogElement, callbacks.onEscape);
			}
		});

		// Escape key handler
		dialogElement.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				dialogElement.dispatchEvent(new CustomEvent('escape.close.yobox'));
			}
		});

		dialogElement.addEventListener('escape.close.yobox', (e) => {
			if (callbacks.onEscape) {
				this._processCallback(e, dialogElement, callbacks.onEscape);
			}
		});

		// Backdrop click handler
		if (options.backdrop === true) {
			dialogElement.addEventListener('click', (e) => {
				if (e.target === dialogElement) {
					dialogElement.dispatchEvent(new CustomEvent('escape.close.yobox'));
				}
			});
		}

		// Custom event handlers
		['onShow', 'onShown', 'onHide', 'onHidden'].forEach(eventName => {
			if (options[eventName] && typeof options[eventName] === 'function') {
				const bsEventName = eventName.replace('on', '').toLowerCase() + '.bs.modal';
				dialogElement.addEventListener(bsEventName, options[eventName]);
			}
		});
	}

	_processCallback(e, dialogElement, callback) {
		e.stopPropagation();
		e.preventDefault();

		const preserveDialog = typeof callback === 'function' && callback.call(dialogElement, e) === false;

		if (!preserveDialog) {
			const bsModal = bootstrap.Modal.getInstance(dialogElement);
			if (bsModal) {
				bsModal.hide();
			}
		}
	}

	_mergeDialogOptions(className, labels, properties, args) {
		const locale = (args && args.locale) || this.defaults.locale;
		const swapButtons = (args && args.swapButtonOrder) || this.defaults.swapButtonOrder;

		if (swapButtons) {
			labels = [...labels].reverse();
		}

		const baseOptions = {
			className: `yobox-${className}`,
			buttons: this._createLabels(labels, locale)
		};

		return { ...baseOptions, ...args };
	}

	_createLabels(labels, locale) {
		const buttons = {};

		labels.forEach(label => {
			const key = label.toLowerCase();
			const value = label.toUpperCase();

			buttons[key] = {
				label: this._getText(value, locale)
			};
		});

		return buttons;
	}

	_getText(key, locale) {
		const labels = this.locales[locale];
		return labels ? labels[key] : this.locales.en[key];
	}

	_createPromptForm(options) {
		const parser = new DOMParser();
		const formDoc = parser.parseFromString(this.templates.form, 'text/html');
		const form = formDoc.querySelector('.yobox-form');

		if (!this.templates.inputs[options.inputType || 'text']) {
			throw new Error('Invalid prompt type');
		}

		const inputDoc = parser.parseFromString(this.templates.inputs[options.inputType || 'text'], 'text/html');
		let input = inputDoc.querySelector('.yobox-input') || inputDoc.querySelector('.yobox-input').parentElement;

		// Configure input based on type
		this._configureInput(input, options);

		form.appendChild(input);

		// Add prompt message if provided
		if (options.message && options.message.trim() !== '') {
			const messageDoc = parser.parseFromString(this.templates.promptMessage, 'text/html');
			const message = messageDoc.querySelector('.yobox-prompt-message');
			message.innerHTML = options.message;
			form.insertBefore(message, form.firstChild);
		}

		// Handle form submission
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			e.stopPropagation();

			const acceptButton = form.closest('.modal').querySelector('.yobox-accept');
			if (acceptButton) {
				acceptButton.click();
			}
		});

		return {
			element: form,
			getValue: () => this._getInputValue(input, options)
		};
	}

	_configureInput(input, options) {
		const inputElement = input.querySelector('input, textarea, select') || input;

		switch (options.inputType) {
			case 'text':
			case 'textarea':
			case 'email':
			case 'password':
				inputElement.value = options.value || '';
				if (options.placeholder) inputElement.placeholder = options.placeholder;
				if (options.pattern) inputElement.pattern = options.pattern;
				if (options.maxlength) inputElement.maxLength = options.maxlength;
				if (options.required) inputElement.required = true;
				if (options.rows && options.inputType === 'textarea') inputElement.rows = options.rows;
				break;

			case 'date':
			case 'time':
			case 'number':
			case 'range':
				inputElement.value = options.value || '';
				if (options.placeholder) inputElement.placeholder = options.placeholder;
				if (options.required) inputElement.required = true;
				if (options.step) inputElement.step = options.step;
				if (options.min !== undefined) inputElement.min = options.min;
				if (options.max !== undefined) inputElement.max = options.max;
				break;

			case 'select':
				this._configureSelect(inputElement, options);
				break;

			case 'checkbox':
			case 'radio':
				this._configureCheckboxRadio(input, options);
				break;
		}
	}

	_configureSelect(select, options) {
		const inputOptions = options.inputOptions || [];

		if (!inputOptions.length) {
			throw new Error('Prompt with inputType "select" requires at least one option');
		}

		if (options.required) select.required = true;
		if (options.multiple) select.multiple = true;

		const groups = {};

		inputOptions.forEach(option => {
			if (option.value === undefined || option.text === undefined) {
				throw new Error('Each option needs a "value" property and a "text" property');
			}

			let container = select;

			if (option.group) {
				if (!groups[option.group]) {
					groups[option.group] = document.createElement('optgroup');
					groups[option.group].label = option.group;
				}
				container = groups[option.group];
			}

			const optionElement = document.createElement('option');
			optionElement.value = option.value;
			optionElement.textContent = option.text;
			container.appendChild(optionElement);
		});

		Object.values(groups).forEach(group => {
			select.appendChild(group);
		});

		select.value = options.value || '';
	}

	_configureCheckboxRadio(container, options) {
		const inputOptions = options.inputOptions || [];

		if (!inputOptions.length) {
			throw new Error(`Prompt with inputType "${options.inputType}" requires at least one option`);
		}

		// Remove the template and create a container
		container.innerHTML = '';
		container.className = `yobox-${options.inputType}-list`;

		const values = Array.isArray(options.value) ? options.value : [options.value];

		inputOptions.forEach((option, index) => {
			if (option.value === undefined || option.text === undefined) {
				throw new Error('Each option needs a "value" property and a "text" property');
			}

			const wrapper = document.createElement('div');
			wrapper.className = `form-check ${options.inputType}`;

			const input = document.createElement('input');
			input.className = `form-check-input yobox-input yobox-input-${options.inputType}`;
			input.type = options.inputType;
			input.value = option.value;
			input.id = `yobox-${options.inputType}-${index}`;

			if (options.inputType === 'radio') {
				input.name = 'yobox-radio';
			}

			const label = document.createElement('label');
			label.className = 'form-check-label';
			label.htmlFor = input.id;
			label.textContent = option.text;

			// Set checked state
			if (options.inputType === 'radio') {
				if (option.value === options.value || (index === 0 && options.value === undefined)) {
					input.checked = true;
				}
			} else {
				if (values.includes(option.value)) {
					input.checked = true;
				}
			}

			wrapper.appendChild(input);
			wrapper.appendChild(label);
			container.appendChild(wrapper);
		});
	}

	_getInputValue(input, options) {
		if (options.inputType === 'checkbox') {
			const checked = Array.from(input.querySelectorAll('input:checked')).map(cb => cb.value);
			if (checked.length === 0 && options.required) {
				return false; // Validation failed
			}
			return checked;
		}

		if (options.inputType === 'radio') {
			const checked = input.querySelector('input:checked');
			return checked ? checked.value : null;
		}

		const inputElement = input.querySelector('input, textarea, select') || input;

		// Validate input
		if (inputElement.checkValidity && !inputElement.checkValidity()) {
			if (options.errorMessage) {
				inputElement.setCustomValidity(options.errorMessage);
			}
			if (inputElement.reportValidity) {
				inputElement.reportValidity();
			}
			return false; // Validation failed
		}

		if (options.inputType === 'select' && options.multiple) {
			return Array.from(inputElement.selectedOptions).map(opt => opt.value);
		}

		return inputElement.value;
	}
}

// Create global instance
const yobox = new YoBox();