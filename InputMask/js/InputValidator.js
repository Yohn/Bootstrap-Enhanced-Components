/**
 * InputValidator - Advanced validation utilities for InputMask
 * Provides comprehensive validation methods for various input types
 */
class InputValidator {
	/**
	 * Phone number validation with international support
	 */
	static validatePhone(phone, countryCode = 'US') {
		const cleaned = phone.replace(/\D/g, '');

		const patterns = {
			US: /^1?[2-9]\d{2}[2-9]\d{2}\d{4}$/,
			CA: /^1?[2-9]\d{2}[2-9]\d{2}\d{4}$/,
			UK: /^44[1-9]\d{8,9}$/,
			AU: /^61[2-478]\d{8}$/,
			DE: /^49[1-9]\d{10,11}$/,
			FR: /^33[1-9]\d{8}$/,
			JP: /^81[1-9]\d{8,9}$/,
			BR: /^55[1-9]\d{9,10}$/,
			IN: /^91[6-9]\d{9}$/,
			CN: /^86[1-9]\d{9,10}$/
		};

		const pattern = patterns[countryCode.toUpperCase()];
		if (!pattern) {
			console.warn(`Phone validation pattern not found for country: ${countryCode}`);
			return cleaned.length >= 10 && cleaned.length <= 15;
		}

		return pattern.test(cleaned);
	}

	/**
	 * Enhanced SSN validation with format checking
	 */
	static validateSSN(ssn, strict = true) {
		const cleaned = ssn.replace(/\D/g, '');

		// Basic length check
		if (cleaned.length !== 9) return false;

		if (strict) {
			// Invalid SSN patterns
			const invalidPatterns = [
				/^0{3}/, // Area number 000
				/^666/, // Area number 666
				/^9/, // Area number starting with 9
				/^\d{3}0{2}/, // Group number 00
				/^\d{5}0{4}$/ // Serial number 0000
			];

			// Test sequences
			const testSequences = [
				'000000000', '111111111', '222222222', '333333333',
				'444444444', '555555555', '666666666', '777777777',
				'888888888', '999999999', '123456789'
			];

			if (testSequences.includes(cleaned)) return false;

			return !invalidPatterns.some(pattern => pattern.test(cleaned));
		}

		return true;
	}

	/**
	 * Credit card validation using Luhn algorithm with type detection
	 */
	static validateCreditCard(cardNumber, expectedType = null) {
		const cleaned = cardNumber.replace(/\D/g, '');

		// Length check
		if (cleaned.length < 13 || cleaned.length > 19) return false;

		// Luhn algorithm
		if (!this.luhnCheck(cleaned)) return false;

		// Type validation if specified
		if (expectedType) {
			const detectedType = this.detectCardType(cleaned);
			return detectedType === expectedType.toLowerCase();
		}

		return true;
	}

	/**
	 * Luhn algorithm implementation
	 */
	static luhnCheck(cardNumber) {
		let sum = 0;
		let alternate = false;

		for (let i = cardNumber.length - 1; i >= 0; i--) {
			let n = parseInt(cardNumber.charAt(i), 10);

			if (alternate) {
				n *= 2;
				if (n > 9) n = (n % 10) + 1;
			}

			sum += n;
			alternate = !alternate;
		}

		return sum % 10 === 0;
	}

	/**
	 * Detect credit card type
	 */
	static detectCardType(cardNumber) {
		const patterns = {
			visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
			mastercard: /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
			amex: /^3[47][0-9]{13}$/,
			discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
			diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
			jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
			unionpay: /^(62|88)\d{14,17}$/,
			maestro: /^(?:5[0678]\d\d|6304|6390|67\d\d)\d{8,15}$/
		};

		for (const [type, pattern] of Object.entries(patterns)) {
			if (pattern.test(cardNumber)) return type;
		}

		return 'unknown';
	}

	/**
	 * Enhanced date validation with range checking
	 */
	static validateDate(dateString, format = 'MM/DD/YYYY', minDate = null, maxDate = null) {
		let month, day, year;

		switch (format.toUpperCase()) {
			case 'MM/DD/YYYY':
				const parts1 = dateString.split('/');
				if (parts1.length !== 3) return false;
				[month, day, year] = parts1.map(Number);
				break;

			case 'DD/MM/YYYY':
				const parts2 = dateString.split('/');
				if (parts2.length !== 3) return false;
				[day, month, year] = parts2.map(Number);
				break;

			case 'YYYY-MM-DD':
				const parts3 = dateString.split('-');
				if (parts3.length !== 3) return false;
				[year, month, day] = parts3.map(Number);
				break;

			default:
				console.warn(`Unsupported date format: ${format}`);
				return false;
		}

		// Basic range validation
		if (month < 1 || month > 12) return false;
		if (day < 1 || day > 31) return false;
		if (year < 1900 || year > 2100) return false;

		// Create date and validate
		const date = new Date(year, month - 1, day);
		const isValidDate = date.getFullYear() === year &&
						   date.getMonth() === month - 1 &&
						   date.getDate() === day;

		if (!isValidDate) return false;

		// Range checking
		if (minDate && date < new Date(minDate)) return false;
		if (maxDate && date > new Date(maxDate)) return false;

		return true;
	}

	/**
	 * Time validation with format support
	 */
	static validateTime(timeString, format = '24') {
		const timeParts = timeString.split(':');
		if (timeParts.length < 2 || timeParts.length > 3) return false;

		const hours = parseInt(timeParts[0], 10);
		const minutes = parseInt(timeParts[1], 10);
		const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

		// Minutes and seconds validation
		if (minutes < 0 || minutes > 59) return false;
		if (seconds < 0 || seconds > 59) return false;

		// Hours validation based on format
		if (format === '12') {
			return hours >= 1 && hours <= 12;
		} else if (format === '24') {
			return hours >= 0 && hours <= 23;
		}

		return false;
	}

	/**
	 * IP address validation with version support
	 */
	static validateIPAddress(ip, version = 'v4') {
		if (version === 'v4') {
			return this.validateIPv4(ip);
		} else if (version === 'v6') {
			return this.validateIPv6(ip);
		} else if (version === 'both') {
			return this.validateIPv4(ip) || this.validateIPv6(ip);
		}

		return false;
	}

	/**
	 * IPv4 validation
	 */
	static validateIPv4(ip) {
		const parts = ip.split('.');
		if (parts.length !== 4) return false;

		return parts.every(part => {
			const num = parseInt(part, 10);
			return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
		});
	}

	/**
	 * IPv6 validation
	 */
	static validateIPv6(ip) {
		const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
		const ipv6CompressedRegex = /^(([0-9a-fA-F]{1,4}:)*)?::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;

		return ipv6Regex.test(ip) || ipv6CompressedRegex.test(ip);
	}

	/**
	 * Email validation with advanced checking
	 */
	static validateEmail(email, strict = false) {
		const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!basicRegex.test(email)) return false;

		if (strict) {
			// More comprehensive email validation
			const strictRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
			return strictRegex.test(email);
		}

		return true;
	}

	/**
	 * URL validation
	 */
	static validateURL(url, protocols = ['http', 'https']) {
		try {
			const urlObj = new URL(url);
			return protocols.includes(urlObj.protocol.slice(0, -1));
		} catch {
			return false;
		}
	}

	/**
	 * MAC address validation
	 */
	static validateMACAddress(mac, format = 'colon') {
		const patterns = {
			colon: /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/,
			hyphen: /^([0-9A-Fa-f]{2}[-]){5}([0-9A-Fa-f]{2})$/,
			dot: /^([0-9A-Fa-f]{4}[.]){2}([0-9A-Fa-f]{4})$/,
			none: /^[0-9A-Fa-f]{12}$/
		};

		const pattern = patterns[format];
		return pattern ? pattern.test(mac) : false;
	}

	/**
	 * ZIP code validation with international support
	 */
	static validateZIPCode(zip, country = 'US') {
		const patterns = {
			US: /^\d{5}(-\d{4})?$/,
			CA: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
			UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/,
			DE: /^\d{5}$/,
			FR: /^\d{5}$/,
			AU: /^\d{4}$/,
			JP: /^\d{3}-\d{4}$/,
			IN: /^\d{6}$/,
			BR: /^\d{5}-?\d{3}$/,
			CN: /^\d{6}$/
		};

		const pattern = patterns[country.toUpperCase()];
		return pattern ? pattern.test(zip) : false;
	}

	/**
	 * Custom pattern validation
	 */
	static validatePattern(value, pattern, flags = '') {
		try {
			const regex = new RegExp(pattern, flags);
			return regex.test(value);
		} catch (error) {
			console.error('Invalid regex pattern:', pattern, error);
			return false;
		}
	}

	/**
	 * Composite validation for complex rules
	 */
	static validateComposite(value, rules) {
		const results = {};

		for (const [ruleName, ruleConfig] of Object.entries(rules)) {
			try {
				if (typeof ruleConfig === 'function') {
					results[ruleName] = ruleConfig(value);
				} else if (typeof ruleConfig === 'object') {
					const { method, args = [] } = ruleConfig;
					if (typeof this[method] === 'function') {
						results[ruleName] = this[method](value, ...args);
					} else {
						console.warn(`Validation method not found: ${method}`);
						results[ruleName] = false;
					}
				} else {
					console.warn(`Invalid rule configuration for: ${ruleName}`);
					results[ruleName] = false;
				}
			} catch (error) {
				console.error(`Error validating rule ${ruleName}:`, error);
				results[ruleName] = false;
			}
		}

		results.isValid = Object.values(results).every(result => result === true);
		return results;
	}

	/**
	 * Get validation suggestions for failed validations
	 */
	static getValidationSuggestions(value, type) {
		const suggestions = {
			phone: [
				'Include area code: (555) 123-4567',
				'Use only digits and standard formatting',
				'Ensure 10 digits for US numbers'
			],
			ssn: [
				'Format: 123-45-6789',
				'Must be 9 digits',
				'Cannot be all zeros or test numbers'
			],
			creditCard: [
				'Remove spaces and dashes',
				'Check for typos in card number',
				'Ensure number passes Luhn validation'
			],
			email: [
				'Include @ symbol',
				'Add domain extension (.com, .org, etc.)',
				'Remove invalid characters'
			],
			date: [
				'Use MM/DD/YYYY format',
				'Check month (1-12) and day (1-31)',
				'Ensure valid calendar date'
			],
			time: [
				'Use HH:MM format',
				'Hours: 00-23 for 24-hour, 01-12 for 12-hour',
				'Minutes: 00-59'
			],
			ip: [
				'Each octet must be 0-255',
				'Use dots to separate: 192.168.1.1',
				'No leading zeros in octets'
			],
			mac: [
				'Use colon format: AA:BB:CC:DD:EE:FF',
				'Each pair must be hexadecimal (0-9, A-F)',
				'Exactly 6 pairs required'
			]
		};

		return suggestions[type] || ['Check format and try again'];
	}
}