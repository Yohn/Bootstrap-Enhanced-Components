/**
 * PatternHelpers - Utility functions for InputMask patterns
 * Provides helper methods for creating and validating mask patterns
 */
class PatternHelpers {
	/**
	 * Pre-defined pattern configurations for common use cases
	 */
	static presets = {
		phone: {
			pattern: '(999) 999-9999',
			placeholder: '_',
			stripMask: true,
			validateOnBlur: true,
			onComplete: function() {
				this.element.classList.add('is-valid');
			}
		},

		phoneInternational: {
			pattern: '+9 (999) 999-9999',
			placeholder: '_',
			stripMask: true,
			validateOnBlur: true
		},

		ssn: {
			pattern: '999-99-9999',
			placeholder: '_',
			stripMask: true,
			validateOnBlur: true,
			showMaskOnFocus: true
		},

		ein: {
			pattern: '99-9999999',
			placeholder: '_',
			stripMask: true,
			validateOnBlur: true
		},

		zipCode: {
			pattern: '99999',
			placeholder: '_',
			stripMask: true,
			allowIncomplete: false
		},

		zipCodePlus4: {
			pattern: '99999-9999',
			placeholder: '_',
			stripMask: true,
			allowIncomplete: true
		},

		creditCard: {
			pattern: '9999 9999 9999 9999',
			placeholder: '_',
			stripMask: true,
			showMaskOnFocus: true,
			validateOnBlur: true
		},

		date: {
			pattern: '99/99/9999',
			placeholder: '_',
			stripMask: false,
			validateOnBlur: true,
			customPatterns: {
				'1': { validator: '[0-1]', cardinality: 1 }, // First digit of month
				'3': { validator: '[0-3]', cardinality: 1 }, // First digit of day
				'2': { validator: '[0-9]', cardinality: 1 }  // Year digits
			},
			onComplete: function() {
				const value = this.element.value;
				const isValidDate = PatternHelpers.validateDate(value);
				this.element.classList.toggle('is-valid', isValidDate);
				this.element.classList.toggle('is-invalid', !isValidDate);
			}
		},

		time12: {
			pattern: '99:99 aa',
			placeholder: '_',
			stripMask: false,
			customPatterns: {
				'a': { validator: '[AaPp]', cardinality: 1, casing: 'upper' }
			}
		},

		time24: {
			pattern: '99:99',
			placeholder: '_',
			stripMask: false,
			customPatterns: {
				'H': { validator: '[0-2]', cardinality: 1 }, // Hours first digit
				'h': { validator: '[0-9]', cardinality: 1 }, // Hours second digit
				'M': { validator: '[0-5]', cardinality: 1 }, // Minutes first digit
				'm': { validator: '[0-9]', cardinality: 1 }  // Minutes second digit
			}
		},

		currency: {
			pattern: '$999,999.99',
			placeholder: '_',
			stripMask: true,
			rightAlign: true,
			numericInput: true
		},

		percentage: {
			pattern: '999.99%',
			placeholder: '_',
			stripMask: true,
			rightAlign: true
		},

		ipAddress: {
			pattern: '999.999.999.999',
			placeholder: '_',
			stripMask: true,
			customPatterns: {
				'I': {
					validator: function(char, maskset, pos, strict, opts) {
						// Custom validator for IP octets (0-255)
						return /[0-9]/.test(char);
					},
					cardinality: 1
				}
			}
		},

		macAddress: {
			pattern: 'AA:AA:AA:AA:AA:AA',
			placeholder: '_',
			stripMask: true,
			customPatterns: {
				'A': { validator: '[0-9A-Fa-f]', cardinality: 1, casing: 'upper' }
			}
		},

		licenseNumber: {
			pattern: 'AAA-999',
			placeholder: '_',
			stripMask: true,
			customPatterns: {
				'A': { validator: '[A-Z]', cardinality: 1, casing: 'upper' }
			}
		},

		accountNumber: {
			pattern: '9999-9999-9999',
			placeholder: '_',
			stripMask: true,
			showMaskOnFocus: true
		}
	};

	/**
	 * Get a preset configuration
	 * @param {string} presetName - Name of the preset
	 * @param {object} overrides - Options to override in the preset
	 * @returns {object} Configuration object
	 */
	static getPreset(presetName, overrides = {}) {
		const preset = this.presets[presetName];
		if (!preset) {
			console.warn(`InputMask: Preset "${presetName}" not found`);
			return overrides;
		}

		return { ...preset, ...overrides };
	}

	/**
	 * Create a custom pattern with validation
	 * @param {string} pattern - The mask pattern
	 * @param {object} customPatterns - Custom pattern definitions
	 * @returns {object} Pattern configuration
	 */
	static createCustomPattern(pattern, customPatterns = {}) {
		return {
			pattern: pattern,
			customPatterns: customPatterns,
			placeholder: '_',
			stripMask: true,
			validateOnBlur: true
		};
	}

	/**
	 * Validate a date string in MM/DD/YYYY format
	 * @param {string} dateString - Date string to validate
	 * @returns {boolean} True if valid date
	 */
	static validateDate(dateString) {
		const parts = dateString.split('/');
		if (parts.length !== 3) return false;

		const month = parseInt(parts[0], 10);
		const day = parseInt(parts[1], 10);
		const year = parseInt(parts[2], 10);

		// Basic range checks
		if (month < 1 || month > 12) return false;
		if (day < 1 || day > 31) return false;
		if (year < 1900 || year > 2100) return false;

		// Create date object and verify
		const date = new Date(year, month - 1, day);
		return date.getFullYear() === year &&
			   date.getMonth() === month - 1 &&
			   date.getDate() === day;
	}

	/**
	 * Validate a time string in HH:MM format
	 * @param {string} timeString - Time string to validate
	 * @returns {boolean} True if valid time
	 */
	static validateTime(timeString) {
		const parts = timeString.split(':');
		if (parts.length !== 2) return false;

		const hours = parseInt(parts[0], 10);
		const minutes = parseInt(parts[1], 10);

		return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
	}

	/**
	 * Validate a phone number
	 * @param {string} phoneString - Phone number string
	 * @returns {boolean} True if valid phone number format
	 */
	static validatePhone(phoneString) {
		const cleaned = phoneString.replace(/\D/g, '');
		return cleaned.length === 10 || cleaned.length === 11;
	}

	/**
	 * Validate an SSN
	 * @param {string} ssnString - SSN string
	 * @returns {boolean} True if valid SSN format
	 */
	static validateSSN(ssnString) {
		const cleaned = ssnString.replace(/\D/g, '');
		return cleaned.length === 9 &&
			   cleaned !== '000000000' &&
			   cleaned !== '123456789';
	}

	/**
	 * Validate a credit card number using Luhn algorithm
	 * @param {string} cardString - Credit card number string
	 * @returns {boolean} True if valid credit card number
	 */
	static validateCreditCard(cardString) {
		const cleaned = cardString.replace(/\D/g, '');

		if (cleaned.length < 13 || cleaned.length > 16) {
			return false;
		}

		// Luhn algorithm
		let sum = 0;
		let alternate = false;

		for (let i = cleaned.length - 1; i >= 0; i--) {
			let n = parseInt(cleaned.charAt(i), 10);

			if (alternate) {
				n *= 2;
				if (n > 9) {
					n = (n % 10) + 1;
				}
			}

			sum += n;
			alternate = !alternate;
		}

		return sum % 10 === 0;
	}

	/**
	 * Format a number as currency
	 * @param {number} value - Numeric value
	 * @param {string} currency - Currency symbol (default: $)
	 * @returns {string} Formatted currency string
	 */
	static formatCurrency(value, currency = '$') {
		return `${currency}${value.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}`;
	}

	/**
	 * Create a dynamic pattern based on input length
	 * @param {number} length - Desired length
	 * @param {string} type - Type of pattern ('numeric', 'alpha', 'alphanumeric')
	 * @param {string} separator - Separator character (optional)
	 * @param {number} groupSize - Size of each group (optional)
	 * @returns {string} Generated pattern
	 */
	static generatePattern(length, type = 'numeric', separator = '', groupSize = 0) {
		let patternChar;
		switch (type) {
			case 'numeric':
				patternChar = '9';
				break;
			case 'alpha':
				patternChar = 'a';
				break;
			case 'alphanumeric':
				patternChar = '*';
				break;
			default:
				patternChar = '9';
		}

		let pattern = '';
		for (let i = 0; i < length; i++) {
			if (groupSize > 0 && i > 0 && i % groupSize === 0 && separator) {
				pattern += separator;
			}
			pattern += patternChar;
		}

		return pattern;
	}

	/**
	 * Auto-detect pattern type based on input value
	 * @param {string} value - Input value to analyze
	 * @returns {string|null} Detected pattern name or null
	 */
	static detectPattern(value) {
		const cleaned = value.replace(/\D/g, '');

		// Phone number patterns
		if (/^\(\d{3}\) \d{3}-\d{4}$/.test(value)) {
			return 'phone';
		}

		// SSN pattern
		if (/^\d{3}-\d{2}-\d{4}$/.test(value)) {
			return 'ssn';
		}

		// Date patterns
		if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
			return 'date';
		}

		// Credit card pattern
		if (/^\d{4} \d{4} \d{4} \d{4}$/.test(value)) {
			return 'creditCard';
		}

		// Zip code patterns
		if (/^\d{5}$/.test(cleaned)) {
			return 'zipCode';
		}
		if (/^\d{5}-\d{4}$/.test(value)) {
			return 'zipCodePlus4';
		}

		return null;
	}

	/**
	 * Batch initialize InputMask instances with data attributes
	 * @param {string} selector - CSS selector for elements
	 */
	static initFromDataAttributes(selector = '[data-mask]') {
		const elements = document.querySelectorAll(selector);

		elements.forEach(element => {
			const maskType = element.dataset.mask;
			const options = {};

			// Parse data attributes
			Object.keys(element.dataset).forEach(key => {
				if (key.startsWith('mask') && key !== 'mask') {
					const optionKey = key.replace('mask', '').toLowerCase();
					let value = element.dataset[key];

					// Convert string values to appropriate types
					if (value === 'true') value = true;
					else if (value === 'false') value = false;
					else if (!isNaN(value) && value !== '') value = Number(value);

					options[optionKey] = value;
				}
			});

			// Get preset or create custom pattern
			let config;
			if (this.presets[maskType]) {
				config = this.getPreset(maskType, options);
			} else {
				config = {
					pattern: maskType,
					...options
				};
			}

			new InputMask(element, config);
		});
	}
}