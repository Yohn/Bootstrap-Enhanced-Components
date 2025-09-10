/**
 * InputMask - Advanced input formatting component for Bootstrap 5.3
 * Provides real-time input masking with customizable patterns
 */
class InputMask {
	constructor(element, options = {}) {
		this.element = typeof element === 'string' ? document.querySelector(element) : element;

		if (!this.element) {
			throw new Error('InputMask: Element not found');
		}

		// Default configuration
		this.defaults = {
			pattern: '',
			placeholder: '_',
			allowIncomplete: false,
			stripMask: true,
			customPatterns: {},
			validateOnBlur: true,
			showMaskOnFocus: false,
			clearIncomplete: false,
			autoUnmask: true,
			insertMode: true,
			numericInput: false,
			rightAlign: false,
			onBeforeMask: null,
			onBeforeWrite: null,
			onBeforeInput: null,
			onKeyDown: null,
			onKeyPress: null,
			onInput: null,
			onKeyUp: null,
			onUnMask: null,
			onMask: null,
			onComplete: null,
			onIncomplete: null,
			onCleared: null
		};

		this.options = { ...this.defaults, ...options };

		// Built-in pattern definitions
		this.patternDefinitions = {
			'9': { validator: '[0-9]', cardinality: 1 },
			'a': { validator: '[A-Za-z]', cardinality: 1 },
			'*': { validator: '[A-Za-z0-9]', cardinality: 1 },
			'A': { validator: '[A-Z]', cardinality: 1, casing: 'upper' },
			'#': { validator: '[A-Za-z0-9]', cardinality: 1 },
			...this.options.customPatterns
		};

		// Internal state
		this.maskLength = 0;
		this.buffer = [];
		this.focusText = '';
		this.caretPos = 0;
		this.isComplete = false;
		this.isRTL = false;

		this.init();
	}

	init() {
		if (!this.options.pattern) {
			console.warn('InputMask: No pattern specified');
			return;
		}

		this.setupMask();
		this.attachEvents();
		this.applyInitialValue();
	}

	setupMask() {
		this.buffer = [];
		this.maskLength = 0;

		// Parse pattern and create buffer
		for (let i = 0; i < this.options.pattern.length; i++) {
			const char = this.options.pattern.charAt(i);

			if (this.patternDefinitions[char]) {
				this.buffer.push(this.options.placeholder);
				this.maskLength++;
			} else {
				this.buffer.push(char);
			}
		}

		// Set max length
		this.element.setAttribute('maxlength', this.buffer.length);

		// Apply Bootstrap classes if not present
		if (!this.element.classList.contains('form-control')) {
			this.element.classList.add('form-control');
		}
	}

	attachEvents() {
		// Store original value
		this.originalValue = this.element.value;

		// Focus events
		this.element.addEventListener('focus', this.handleFocus.bind(this));
		this.element.addEventListener('blur', this.handleBlur.bind(this));

		// Input events
		this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
		this.element.addEventListener('keypress', this.handleKeyPress.bind(this));
		this.element.addEventListener('input', this.handleInput.bind(this));
		this.element.addEventListener('keyup', this.handleKeyUp.bind(this));

		// Paste event
		this.element.addEventListener('paste', this.handlePaste.bind(this));

		// Form submission
		const form = this.element.closest('form');
		if (form) {
			form.addEventListener('submit', this.handleFormSubmit.bind(this));
		}
	}

	handleFocus(e) {
		if (this.options.showMaskOnFocus && !this.element.value) {
			this.element.value = this.buffer.join('');
			this.setCaret(this.getFirstMaskPos());
		}

		this.focusText = this.element.value;

		if (this.options.onBeforeInput) {
			this.options.onBeforeInput.call(this, e);
		}
	}

	handleBlur(e) {
		if (this.options.validateOnBlur) {
			this.validate();
		}

		if (this.options.clearIncomplete && !this.isComplete) {
			this.element.value = '';
			this.resetBuffer();
		}

		// Remove focus mask if incomplete
		if (this.options.showMaskOnFocus && !this.isComplete) {
			this.element.value = '';
		}
	}

	handleKeyDown(e) {
		const key = e.key;
		const pos = this.getCaret();

		// Prevent default for special cases
		if (key === 'Backspace' || key === 'Delete') {
			this.handleDelete(e, pos, key === 'Backspace');
			return;
		}

		if (this.options.onKeyDown) {
			this.options.onKeyDown.call(this, e);
		}
	}

	handleKeyPress(e) {
		if (e.ctrlKey || e.altKey || e.metaKey) {
			return;
		}

		const char = e.key;
		const pos = this.getCaret();

		if (char.length === 1 && this.isValidInput(char, pos)) {
			this.writeBuffer(pos, char);
			this.updateValue();
		} else {
			e.preventDefault();
		}

		if (this.options.onKeyPress) {
			this.options.onKeyPress.call(this, e);
		}
	}

	handleInput(e) {
		// Handle programmatic value changes
		this.processInput();

		if (this.options.onInput) {
			this.options.onInput.call(this, e);
		}
	}

	handleKeyUp(e) {
		this.checkComplete();

		if (this.options.onKeyUp) {
			this.options.onKeyUp.call(this, e);
		}
	}

	handlePaste(e) {
		e.preventDefault();

		const pastedData = (e.clipboardData || window.clipboardData).getData('text');
		const pos = this.getCaret();

		this.writeString(pos, pastedData);
		this.updateValue();
	}

	handleDelete(e, pos, isBackspace) {
		e.preventDefault();

		if (isBackspace && pos > 0) {
			pos--;
		}

		const maskPos = this.getMaskPos(pos);
		if (maskPos !== null) {
			this.buffer[maskPos] = this.options.placeholder;
			this.updateValue();
			this.setCaret(isBackspace ? pos : pos + 1);
		}
	}

	handleFormSubmit(e) {
		if (this.options.stripMask) {
			this.element.value = this.getUnmaskedValue();
		}
	}

	isValidInput(char, pos) {
		const maskPos = this.getMaskPos(pos);
		if (maskPos === null) return false;

		const pattern = this.getPatternAt(maskPos);
		if (!pattern) return false;

		const regex = new RegExp(pattern.validator);
		let testChar = char;

		// Apply casing
		if (pattern.casing === 'upper') {
			testChar = char.toUpperCase();
		} else if (pattern.casing === 'lower') {
			testChar = char.toLowerCase();
		}

		return regex.test(testChar);
	}

	writeBuffer(pos, char) {
		const maskPos = this.getMaskPos(pos);
		if (maskPos === null) return false;

		const pattern = this.getPatternAt(maskPos);
		if (!pattern) return false;

		// Apply casing
		if (pattern.casing === 'upper') {
			char = char.toUpperCase();
		} else if (pattern.casing === 'lower') {
			char = char.toLowerCase();
		}

		this.buffer[maskPos] = char;
		return true;
	}

	writeString(pos, str) {
		let currentPos = pos;

		for (let i = 0; i < str.length && currentPos < this.buffer.length; i++) {
			const char = str.charAt(i);

			if (this.isValidInput(char, currentPos)) {
				this.writeBuffer(currentPos, char);
				currentPos = this.getNextMaskPos(currentPos);
				if (currentPos === null) break;
			}
		}
	}

	processInput() {
		const value = this.element.value;
		this.resetBuffer();

		let bufferPos = 0;
		for (let i = 0; i < value.length && bufferPos < this.buffer.length; i++) {
			const char = value.charAt(i);
			const nextMaskPos = this.getNextMaskPos(bufferPos - 1);

			if (nextMaskPos !== null && this.isValidInput(char, nextMaskPos)) {
				this.writeBuffer(nextMaskPos, char);
				bufferPos = nextMaskPos + 1;
			}
		}
	}

	updateValue() {
		const newValue = this.buffer.join('');
		this.element.value = newValue;
		this.checkComplete();
	}

	getMaskPos(pos) {
		let maskPos = 0;
		let realPos = 0;

		while (realPos < pos && maskPos < this.options.pattern.length) {
			if (this.patternDefinitions[this.options.pattern.charAt(maskPos)]) {
				realPos++;
			}
			maskPos++;
		}

		// Find the actual mask position
		while (maskPos < this.options.pattern.length &&
			   !this.patternDefinitions[this.options.pattern.charAt(maskPos)]) {
			maskPos++;
		}

		return maskPos < this.options.pattern.length ? maskPos : null;
	}

	getNextMaskPos(pos) {
		let maskPos = pos + 1;

		while (maskPos < this.options.pattern.length &&
			   !this.patternDefinitions[this.options.pattern.charAt(maskPos)]) {
			maskPos++;
		}

		return maskPos < this.options.pattern.length ? maskPos : null;
	}

	getFirstMaskPos() {
		return this.getNextMaskPos(-1) || 0;
	}

	getPatternAt(pos) {
		const char = this.options.pattern.charAt(pos);
		return this.patternDefinitions[char] || null;
	}

	resetBuffer() {
		this.buffer = [];
		for (let i = 0; i < this.options.pattern.length; i++) {
			const char = this.options.pattern.charAt(i);

			if (this.patternDefinitions[char]) {
				this.buffer.push(this.options.placeholder);
			} else {
				this.buffer.push(char);
			}
		}
	}

	getCaret() {
		return this.element.selectionStart || 0;
	}

	setCaret(pos) {
		if (this.element.setSelectionRange) {
			this.element.setSelectionRange(pos, pos);
		}
	}

	checkComplete() {
		this.isComplete = this.buffer.indexOf(this.options.placeholder) === -1;

		if (this.isComplete && this.options.onComplete) {
			this.options.onComplete.call(this);
		} else if (!this.isComplete && this.options.onIncomplete) {
			this.options.onIncomplete.call(this);
		}

		// Update validation classes
		this.updateValidationClasses();
	}

	updateValidationClasses() {
		if (this.options.validateOnBlur) {
			if (this.isComplete) {
				this.element.classList.remove('is-invalid');
				this.element.classList.add('is-valid');
			} else if (this.element.value.length > 0) {
				this.element.classList.remove('is-valid');
				this.element.classList.add('is-invalid');
			} else {
				this.element.classList.remove('is-valid', 'is-invalid');
			}
		}
	}

	validate() {
		const isValid = this.isComplete || (this.options.allowIncomplete && this.element.value.length > 0);

		this.element.classList.toggle('is-valid', isValid);
		this.element.classList.toggle('is-invalid', !isValid);

		return isValid;
	}

	getUnmaskedValue() {
		let unmasked = '';
		let bufferPos = 0;

		for (let i = 0; i < this.options.pattern.length; i++) {
			const char = this.options.pattern.charAt(i);

			if (this.patternDefinitions[char]) {
				const bufferChar = this.buffer[i];
				if (bufferChar !== this.options.placeholder) {
					unmasked += bufferChar;
				}
			}
		}

		return unmasked;
	}

	getMaskedValue() {
		return this.buffer.join('');
	}

	setValue(value) {
		this.element.value = value || '';
		this.processInput();
		this.updateValue();
	}

	clear() {
		this.resetBuffer();
		this.element.value = '';
		this.element.classList.remove('is-valid', 'is-invalid');
		this.isComplete = false;

		if (this.options.onCleared) {
			this.options.onCleared.call(this);
		}
	}

	destroy() {
		// Remove event listeners
		this.element.removeEventListener('focus', this.handleFocus);
		this.element.removeEventListener('blur', this.handleBlur);
		this.element.removeEventListener('keydown', this.handleKeyDown);
		this.element.removeEventListener('keypress', this.handleKeyPress);
		this.element.removeEventListener('input', this.handleInput);
		this.element.removeEventListener('keyup', this.handleKeyUp);
		this.element.removeEventListener('paste', this.handlePaste);

		// Remove form listener
		const form = this.element.closest('form');
		if (form) {
			form.removeEventListener('submit', this.handleFormSubmit);
		}

		// Reset element
		this.element.removeAttribute('maxlength');
		this.element.value = this.originalValue || '';
		this.element.classList.remove('is-valid', 'is-invalid');
	}

	// Static methods for common patterns
	static patterns = {
		phone: '(999) 999-9999',
		phoneExt: '(999) 999-9999 x99999',
		ssn: '999-99-9999',
		ein: '99-9999999',
		zipCode: '99999',
		zipCodePlus4: '99999-9999',
		creditCard: '9999 9999 9999 9999',
		date: '99/99/9999',
		time: '99:99',
		currency: '$999,999.99',
		percentage: '999.99%',
		ipAddress: '999.999.999.999'
	};

	static create(selector, options = {}) {
		const elements = document.querySelectorAll(selector);
		const instances = [];

		elements.forEach(element => {
			instances.push(new InputMask(element, options));
		});

		return instances.length === 1 ? instances[0] : instances;
	}

	applyInitialValue() {
		if (this.element.value) {
			this.processInput();
			this.updateValue();
		}
	}
}