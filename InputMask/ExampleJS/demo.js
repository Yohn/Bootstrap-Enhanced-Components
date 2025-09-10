/**
 * Demo JavaScript for InputMask Example Page
 * Initializes all InputMask instances and provides interactive functionality
 */

document.addEventListener('DOMContentLoaded', function() {
	// Initialize all data-mask inputs
	PatternHelpers.initFromDataAttributes('[data-mask]');

	// Custom pattern examples
	initCustomPatterns();

	// Real-time output demo
	initOutputDemo();

	// API demo
	initApiDemo();

	// Form validation
	initFormValidation();

	// Initialize theme
	initTheme();
});

/**
 * Initialize custom pattern examples
 */
function initCustomPatterns() {
	// Product code with custom pattern
	new InputMask('#product-code', {
		pattern: 'AAA-9999',
		customPatterns: {
			'A': { validator: '[A-Z]', cardinality: 1, casing: 'upper' }
		},
		placeholder: '_',
		onComplete: function() {
			this.element.classList.add('is-valid');
		},
		onIncomplete: function() {
			this.element.classList.remove('is-valid');
		}
	});

	// Currency input
	new InputMask('#currency-amount', {
		pattern: '999,999.99',
		placeholder: '0',
		rightAlign: true,
		numericInput: true,
		stripMask: true,
		onInput: function() {
			// Format as currency on input
			let value = this.getUnmaskedValue();
			if (value) {
				const formatted = parseFloat(value.replace(/,/g, '')).toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
				// Don't update if already properly formatted to avoid cursor issues
				if (this.element.value !== formatted) {
					this.setValue(formatted);
				}
			}
		}
	});

	// IP Address
	new InputMask('#ip-address', PatternHelpers.getPreset('ipAddress', {
		onComplete: function() {
			const value = this.element.value;
			const isValid = validateIPAddress(value);
			this.element.classList.toggle('is-valid', isValid);
			this.element.classList.toggle('is-invalid', !isValid);
		}
	}));

	// MAC Address
	new InputMask('#mac-address', PatternHelpers.getPreset('macAddress', {
		onComplete: function() {
			this.element.classList.add('is-valid');
		},
		onIncomplete: function() {
			this.element.classList.remove('is-valid');
		}
	}));
}

/**
 * Initialize real-time output demo
 */
function initOutputDemo() {
	const outputDemo = new InputMask('#output-demo', PatternHelpers.getPreset('phone', {
		onInput: function() {
			updateOutput();
		},
		onComplete: function() {
			this.element.classList.add('mask-complete');
			updateOutput();

			// Remove animation class after animation completes
			setTimeout(() => {
				this.element.classList.remove('mask-complete');
			}, 600);
		},
		onIncomplete: function() {
			updateOutput();
		},
		onCleared: function() {
			updateOutput();
		}
	}));

	function updateOutput() {
		const maskedValue = outputDemo.getMaskedValue();
		const unmaskedValue = outputDemo.getUnmaskedValue();
		const isComplete = outputDemo.isComplete;

		document.getElementById('masked-output').textContent = maskedValue || '-';
		document.getElementById('unmasked-output').textContent = unmaskedValue || '-';
		document.getElementById('complete-output').textContent = isComplete.toString();

		// Update output styling based on completion
		const outputDiv = document.querySelector('.output-display');
		outputDiv.style.borderLeft = isComplete ? '4px solid var(--bs-success)' : '4px solid var(--bs-secondary)';
	}
}

/**
 * Initialize API demo
 */
function initApiDemo() {
	window.apiDemoMask = new InputMask('#api-demo', PatternHelpers.getPreset('phone', {
		onComplete: function() {
			logApiResult('Event: onComplete - Phone number is complete!');
		},
		onIncomplete: function() {
			logApiResult('Event: onIncomplete - Phone number is incomplete');
		}
	}));
}

/**
 * Initialize form validation
 */
function initFormValidation() {
	const form = document.querySelector('.needs-validation');

	form.addEventListener('submit', function(event) {
		event.preventDefault();
		event.stopPropagation();

		// Custom validation for phone input
		const phoneInput = document.getElementById('phone-validation');
		const phoneValue = phoneInput.value.replace(/\D/g, '');
		const isPhoneValid = phoneValue.length === 10;

		phoneInput.classList.toggle('is-valid', isPhoneValid);
		phoneInput.classList.toggle('is-invalid', !isPhoneValid);

		// Standard Bootstrap validation
		if (form.checkValidity() && isPhoneValid) {
			alert('Form is valid! In a real application, this would submit the data.');
		}

		form.classList.add('was-validated');
	});
}

/**
 * Initialize theme functionality
 */
function initTheme() {
	// Set initial theme based on user preference or default to dark
	const savedTheme = localStorage.getItem('theme') || 'dark';
	document.documentElement.setAttribute('data-bs-theme', savedTheme);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
	const currentTheme = document.documentElement.getAttribute('data-bs-theme');
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

	document.documentElement.setAttribute('data-bs-theme', newTheme);
	localStorage.setItem('theme', newTheme);

	// Update theme toggle button text
	const toggleBtn = document.querySelector('button[onclick="toggleTheme()"]');
	toggleBtn.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌓 Dark Mode';
}

/**
 * API Demo Functions
 */
function setValue() {
	window.apiDemoMask.setValue('5551234567');
	logApiResult('setValue("5551234567") - Value set programmatically');
}

function getValue() {
	const maskedValue = window.apiDemoMask.getMaskedValue();
	const unmaskedValue = window.apiDemoMask.getUnmaskedValue();
	logApiResult(`getValue() - Masked: "${maskedValue}", Unmasked: "${unmaskedValue}"`);
}

function clearValue() {
	window.apiDemoMask.clear();
	logApiResult('clear() - Input cleared');
}

function validateInput() {
	const isValid = window.apiDemoMask.validate();
	logApiResult(`validate() - Is valid: ${isValid}`);
}

function logApiResult(message) {
	const resultsDiv = document.getElementById('api-results');
	const timestamp = new Date().toLocaleTimeString();
	resultsDiv.innerHTML = `<div>[${timestamp}] ${message}</div>` + resultsDiv.innerHTML;

	// Keep only last 5 results
	const results = resultsDiv.querySelectorAll('div');
	if (results.length > 5) {
		results[results.length - 1].remove();
	}
}

/**
 * Utility Functions
 */

/**
 * Validate IP Address
 * @param {string} ip - IP address string
 * @returns {boolean} True if valid IP address
 */
function validateIPAddress(ip) {
	const parts = ip.split('.');
	if (parts.length !== 4) return false;

	return parts.every(part => {
		const num = parseInt(part, 10);
		return !isNaN(num) && num >= 0 && num <= 255;
	});
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number string
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phone) {
	const cleaned = phone.replace(/\D/g, '');
	const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

	if (match) {
		return `(${match[1]}) ${match[2]}-${match[3]}`;
	}

	return phone;
}

/**
 * Demonstrate dynamic pattern creation
 */
function createDynamicPattern() {
	// Example: Create a pattern for a custom ID format
	const customPattern = PatternHelpers.generatePattern(8, 'alphanumeric', '-', 4);
	console.log('Generated pattern:', customPattern); // Will output: "****-****"

	// Apply to an input
	const dynamicInput = document.querySelector('#dynamic-example');
	if (dynamicInput) {
		new InputMask(dynamicInput, {
			pattern: customPattern,
			placeholder: '_',
			customPatterns: {
				'*': { validator: '[A-Za-z0-9]', cardinality: 1, casing: 'upper' }
			}
		});
	}
}

/**
 * Example of handling multiple instances
 */
function initMultiplePhoneInputs() {
	// Create multiple phone inputs at once
	const phoneInputs = InputMask.create('.phone-input', PatternHelpers.getPreset('phone', {
		onComplete: function() {
			// Add completion styling
			this.element.classList.add('border-success');

			// Validate phone number
			const isValid = PatternHelpers.validatePhone(this.element.value);
			this.element.classList.toggle('is-valid', isValid);
		}
	}));

	console.log(`Initialized ${phoneInputs.length} phone inputs`);
}

/**
 * Example of pattern detection
 */
function demonstratePatternDetection() {
	const testValues = [
		'(555) 123-4567',
		'123-45-6789',
		'12/25/2024',
		'1234 5678 9012 3456'
	];

	testValues.forEach(value => {
		const detected = PatternHelpers.detectPattern(value);
		console.log(`Value: "${value}" -> Detected pattern: ${detected}`);
	});
}

/**
 * Advanced validation example
 */
function setupAdvancedValidation() {
	// Credit card with Luhn validation
	const creditCardInput = new InputMask('#advanced-credit-card', {
		pattern: '9999 9999 9999 9999',
		onComplete: function() {
			const isValid = PatternHelpers.validateCreditCard(this.element.value);
			this.element.classList.toggle('is-valid', isValid);
			this.element.classList.toggle('is-invalid', !isValid);

			if (isValid) {
				// Show card type detection
				const cardType = detectCardType(this.getUnmaskedValue());
				console.log('Detected card type:', cardType);
			}
		}
	});
}

/**
 * Detect credit card type
 * @param {string} number - Credit card number
 * @returns {string} Card type
 */
function detectCardType(number) {
	const patterns = {
		visa: /^4/,
		mastercard: /^5[1-5]/,
		amex: /^3[47]/,
		discover: /^6(?:011|5)/
	};

	for (const [type, pattern] of Object.entries(patterns)) {
		if (pattern.test(number)) {
			return type;
		}
	}

	return 'unknown';
}

/**
 * Example of custom event handling
 */
function setupCustomEventHandling() {
	const input = new InputMask('#custom-events', {
		pattern: '(999) 999-9999',

		// Custom validation on each keystroke
		onBeforeWrite: function(event, buffer, caretPos, opts) {
			// Example: Block certain area codes
			const areaCode = buffer.slice(1, 4).join('');
			const blockedAreaCodes = ['555', '666', '900'];

			if (areaCode.length === 3 && blockedAreaCodes.includes(areaCode)) {
				event.preventDefault();
				this.element.classList.add('is-invalid');
				return false;
			}

			this.element.classList.remove('is-invalid');
			return true;
		},

		// Custom completion handling
		onComplete: function() {
			// Simulate async validation (e.g., API call)
			this.element.classList.add('validating');

			setTimeout(() => {
				this.element.classList.remove('validating');
				this.element.classList.add('is-valid');

				// Trigger custom event
				this.element.dispatchEvent(new CustomEvent('maskValidated', {
					detail: { value: this.getMaskedValue(), isValid: true }
				}));
			}, 1000);
		}
	});

	// Listen for custom events
	input.element.addEventListener('maskValidated', function(e) {
		console.log('Custom validation completed:', e.detail);
	});
}

/**
 * Performance monitoring example
 */
function monitorPerformance() {
	let startTime;

	const performanceInput = new InputMask('#performance-test', {
		pattern: '(999) 999-9999',

		onBeforeInput: function() {
			startTime = performance.now();
		},

		onInput: function() {
			const endTime = performance.now();
			const duration = endTime - startTime;

			if (duration > 16) { // More than one frame (60fps)
				console.warn(`InputMask processing took ${duration.toFixed(2)}ms`);
			}
		}
	});
}

// Initialize additional demos when page loads
document.addEventListener('DOMContentLoaded', function() {
	// Uncomment these to see additional examples in console
	// demonstratePatternDetection();
	// createDynamicPattern();
	// setupAdvancedValidation();
});