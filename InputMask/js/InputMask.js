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
		this.isProcessingInput = false; // Add flag to prevent input loops

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
			this.setCaret(this.getFirstInputPos());
		} else if (!this.element.value.trim()) {
			// If empty, position at first input position
			this.setCaret(this.getFirstInputPos());
		} else {
			// If has value, position at first empty input position
			const nextEmptyPos = this.findNextInputPosition(0);
			if (nextEmptyPos !== null) {
				this.setCaret(nextEmptyPos);
			}
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
			e.preventDefault(); // Prevent default input handling

			const actualPos = this.writeBuffer(pos, char);
			if (actualPos !== false) {
				this.updateValue();

				// Move cursor to next valid position after the character was written
				const nextPos = this.getNextWritablePos(actualPos);
				if (nextPos !== null) {
					this.setCaret(nextPos);
				} else {
					// If no next position, move to end
					this.setCaret(this.buffer.length);
				}
			}
		} else {
			e.preventDefault();
		}

		if (this.options.onKeyPress) {
			this.options.onKeyPress.call(this, e);
		}
	}

	handleInput(e) {
		// Prevent infinite loops by checking if we're already processing
		if (this.isProcessingInput) {
			return;
		}

		this.isProcessingInput = true;

		// Store current cursor position
		const currentPos = this.getCaret();

		// Handle programmatic value changes
		this.processInput();
		this.checkComplete();

		// Find appropriate cursor position after processing
		let newPos = currentPos;

		// If we're at a literal position, move to next input position
		if (this.isLiteralPos(currentPos)) {
			newPos = this.getNextWritablePos(currentPos);
		}

		// If no valid position found, try to find next empty input position
		if (newPos === null) {
			newPos = this.findNextInputPosition(0);
		}

		// If still no position, go to end
		if (newPos === null) {
			newPos = this.buffer.length;
		}

		// Update the display value and position cursor
		const newValue = this.buffer.join('');
		if (this.element.value !== newValue) {
			this.element.value = newValue;
			setTimeout(() => {
				this.setCaret(newPos);
				this.isProcessingInput = false;
			}, 0);
		} else {
			this.isProcessingInput = false;
		}

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

		let targetPos = pos;

		if (isBackspace) {
			// For backspace, find the previous input position to delete
			targetPos = this.getPrevWritablePos(pos);
			if (targetPos === null) return; // No previous input position
		} else {
			// For delete, find the current or next input position
			if (this.isLiteralPos(pos)) {
				targetPos = this.getNextWritablePos(pos);
				if (targetPos === null) return; // No next input position
			}
		}

		// Make sure we're targeting an input position, not a literal
		if (!this.isLiteralPos(targetPos)) {
			const patternChar = this.options.pattern.charAt(targetPos);
			if (this.patternDefinitions[patternChar]) {
				this.buffer[targetPos] = this.options.placeholder;
				this.updateValue();

				// Position cursor appropriately
				if (isBackspace) {
					this.setCaret(targetPos);
				} else {
					// For delete key, stay at current position
					this.setCaret(pos);
				}
			}
		}
	}

	handleFormSubmit(e) {
		if (this.options.stripMask) {
			this.element.value = this.getUnmaskedValue();
		}
	}

	isValidInput(char, pos) {
		// Skip to next input position if current position is a literal
		const inputPos = this.skipLiterals(pos);
		if (inputPos === null) return false;

		const patternChar = this.options.pattern.charAt(inputPos);
		const pattern = this.patternDefinitions[patternChar];
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
		// Skip to next input position if current position is a literal
		const inputPos = this.skipLiterals(pos);
		if (inputPos === null) return false;

		const patternChar = this.options.pattern.charAt(inputPos);
		const pattern = this.patternDefinitions[patternChar];
		if (!pattern) return false;

		// Apply casing
		if (pattern.casing === 'upper') {
			char = char.toUpperCase();
		} else if (pattern.casing === 'lower') {
			char = char.toLowerCase();
		}

		this.buffer[inputPos] = char;
		return inputPos; // Return the actual position where character was written
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

		let valueIndex = 0;
		let bufferIndex = 0;

		// Process each character in the input value
		while (valueIndex < value.length && bufferIndex < this.buffer.length) {
			const char = value.charAt(valueIndex);
			const patternChar = this.options.pattern.charAt(bufferIndex);

			if (this.patternDefinitions[patternChar]) {
				// This is an input position
				const pattern = this.patternDefinitions[patternChar];
				const regex = new RegExp(pattern.validator);
				let testChar = char;

				// Apply casing
				if (pattern.casing === 'upper') {
					testChar = char.toUpperCase();
				} else if (pattern.casing === 'lower') {
					testChar = char.toLowerCase();
				}

				if (regex.test(testChar)) {
					this.buffer[bufferIndex] = testChar;
					valueIndex++;
				}
				bufferIndex++;
			} else {
				// This is a literal character in the mask
				if (char === patternChar) {
					// Skip matching literal characters in input
					valueIndex++;
				}
				bufferIndex++;
			}
		}
	}

	updateValue() {
		const currentPos = this.getCaret();
		const newValue = this.buffer.join('');

		// Only update if value actually changed
		if (this.element.value !== newValue) {
			this.element.value = newValue;
		}

		this.checkComplete();

		// Restore cursor position if we're not actively processing input
		if (!this.isProcessingInput) {
			const nextPos = this.findNextInputPosition(currentPos);
			if (nextPos !== null) {
				this.setCaret(nextPos);
			}
		}
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
			// Use setTimeout to ensure DOM updates are complete
			setTimeout(() => {
				this.element.setSelectionRange(pos, pos);
			}, 0);
		}
	}

	/**
	 * Convert visual cursor position to buffer position
	 */
	visualToBufferPos(visualPos) {
		let bufferPos = 0;
		let currentVisualPos = 0;

		while (bufferPos < this.buffer.length && currentVisualPos < visualPos) {
			currentVisualPos++;
			bufferPos++;
		}

		// Find the next pattern position from this buffer position
		while (bufferPos < this.buffer.length &&
			   !this.patternDefinitions[this.options.pattern.charAt(bufferPos)]) {
			bufferPos++;
		}

		return bufferPos < this.buffer.length ? bufferPos : null;
	}

	/**
	 * Get the next writable position after the current position
	 */
	/**
	 * Convert visual cursor position to buffer position
	 */
	visualToBufferPos(visualPos) {
		// Visual position directly corresponds to buffer position
		// since buffer includes both literals and placeholders
		if (visualPos >= 0 && visualPos < this.buffer.length) {
			return visualPos;
		}
		return null;
	}

	/**
	 * Get the next writable position after the current position
	 */
	getNextWritablePos(currentPos) {
		// Start from the position after current
		for (let pos = currentPos + 1; pos < this.buffer.length; pos++) {
			// Check if this position corresponds to a pattern character (not literal)
			const patternChar = this.options.pattern.charAt(pos);
			if (this.patternDefinitions[patternChar]) {
				return pos;
			}
		}
		return null;
	}

	/**
	 * Get the previous writable position before the current position
	 */
	getPrevWritablePos(currentPos) {
		// Start from the position before current
		for (let pos = currentPos - 1; pos >= 0; pos--) {
			// Check if this position corresponds to a pattern character (not literal)
			const patternChar = this.options.pattern.charAt(pos);
			if (this.patternDefinitions[patternChar]) {
				return pos;
			}
		}
		return null;
	}

	/**
	 * Find the next appropriate input position
	 */
	findNextInputPosition(currentPos) {
		// First, try to find the next placeholder position from current position
		for (let i = currentPos; i < this.buffer.length; i++) {
			const patternChar = this.options.pattern.charAt(i);
			if (this.patternDefinitions[patternChar] && this.buffer[i] === this.options.placeholder) {
				return i;
			}
		}

		// If no placeholder found, find the next writable position
		const nextWritable = this.getNextWritablePos(currentPos);
		if (nextWritable !== null) {
			return nextWritable;
		}

		// If no writable position found, position at end
		return this.buffer.length;
	}

	/**
	 * Get the first input position in the mask
	 */
	getFirstInputPos() {
		for (let i = 0; i < this.options.pattern.length; i++) {
			if (this.patternDefinitions[this.options.pattern.charAt(i)]) {
				return i;
			}
		}
		return 0;
	}

	/**
	 * Check if a position is a literal character in the pattern
	 */
	isLiteralPos(pos) {
		if (pos < 0 || pos >= this.options.pattern.length) {
			return false;
		}
		const patternChar = this.options.pattern.charAt(pos);
		return !this.patternDefinitions[patternChar];
	}

	/**
	 * Skip literal characters and move to next input position
	 */
	skipLiterals(pos) {
		while (pos < this.buffer.length && this.isLiteralPos(pos)) {
			pos++;
		}
		return pos < this.buffer.length ? pos : null;
	}

	/**
	 * Find the next appropriate input position
	 */
	findNextInputPosition(currentPos) {
		// Look for the next placeholder position
		for (let i = currentPos; i < this.buffer.length; i++) {
			if (this.buffer[i] === this.options.placeholder) {
				return i;
			}
		}

		// If no placeholder found, go to the end
		return this.buffer.length;
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