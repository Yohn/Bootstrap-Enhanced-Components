# InputMask Component for Bootstrap 5.3

A powerful and flexible input masking component that formats user input in real-time with customizable patterns. Perfect for phone numbers, social security numbers, credit cards, dates, and custom formats.

## Features

- 🎯 **Real-time formatting** - Input is formatted as the user types
- 🎨 **Bootstrap 5.3 integration** - Seamlessly works with Bootstrap styling
- 🔧 **Highly customizable** - Extensive configuration options
- 📱 **Mobile friendly** - Works on touch devices
- ♿ **Accessible** - Supports screen readers and keyboard navigation
- 🌓 **Dark mode support** - Full dark theme compatibility
- 🎭 **Pre-built patterns** - Common patterns ready to use
- 🔍 **Validation support** - Built-in validation with Bootstrap classes
- 📋 **Copy/paste support** - Handles pasted content intelligently

## Installation

Include the JavaScript and SCSS files in your project:

```html
<!-- CSS -->
<link href="path/to/inputmask.css" rel="stylesheet">

<!-- JavaScript -->
<script src="path/to/InputMask.js"></script>
<script src="path/to/PatternHelpers.js"></script>
```

## Quick Start

### Basic Usage

```html
<input type="text" id="phone" class="form-control">

<script>
const phoneInput = new InputMask('#phone', {
	pattern: '(999) 999-9999',
	placeholder: '_'
});
</script>
```

### Using Presets

```javascript
// Phone number with preset
const phoneInput = new InputMask('#phone',
	PatternHelpers.getPreset('phone')
);

// SSN with custom options
const ssnInput = new InputMask('#ssn',
	PatternHelpers.getPreset('ssn', {
		showMaskOnFocus: true,
		validateOnBlur: true
	})
);
```

### Data Attribute Initialization

```html
<input data-mask="phone" data-mask-placeholder="_" class="form-control">
<input data-mask="ssn" data-mask-showmaskonfocus="true" class="form-control">
<input data-mask="creditCard" data-mask-validateonblur="true" class="form-control">

<script>
// Initialize all data-mask elements
PatternHelpers.initFromDataAttributes();
</script>
```

## Configuration Options

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pattern` | String | `''` | The mask pattern (e.g., "(999) 999-9999") |
| `placeholder` | String | `'_'` | Character to show for empty positions |
| `allowIncomplete` | Boolean | `false` | Accept partial entries as valid |
| `stripMask` | Boolean | `true` | Remove mask characters on form submit |
| `customPatterns` | Object | `{}` | Define custom pattern characters |
| `validateOnBlur` | Boolean | `true` | Validate when focus leaves input |
| `showMaskOnFocus` | Boolean | `false` | Show mask template on focus |
| `clearIncomplete` | Boolean | `false` | Clear input if incomplete on blur |
| `autoUnmask` | Boolean | `true` | Automatically remove mask for processing |
| `insertMode` | Boolean | `true` | Insert characters vs overwrite |
| `numericInput` | Boolean | `false` | Optimize for numeric input |
| `rightAlign` | Boolean | `false` | Right-align input text |

### Pattern Characters

| Character | Description | Regex |
|-----------|-------------|-------|
| `9` | Numeric digit | `[0-9]` |
| `a` | Alphabetic character | `[A-Za-z]` |
| `*` | Alphanumeric character | `[A-Za-z0-9]` |
| `A` | Uppercase letter | `[A-Z]` |
| `#` | Alphanumeric | `[A-Za-z0-9]` |

### Custom Pattern Example

```javascript
const customMask = new InputMask('#input', {
	pattern: 'AA-999-aa',
	customPatterns: {
		'A': { validator: '[A-Z]', cardinality: 1, casing: 'upper' },
		'a': { validator: '[a-z]', cardinality: 1, casing: 'lower' }
	}
});
```

### Event Callbacks

| Callback | Description | Parameters |
|----------|-------------|------------|
| `onBeforeMask` | Before mask is applied | `(value, opts)` |
| `onBeforeWrite` | Before writing to buffer | `(event, buffer, caretPos, opts)` |
| `onBeforeInput` | Before input processing | `(event)` |
| `onKeyDown` | On key down | `(event)` |
| `onKeyPress` | On key press | `(event)` |
| `onInput` | On input change | `(event)` |
| `onKeyUp` | On key up | `(event)` |
| `onUnMask` | When mask is removed | `(maskedValue, unmaskedValue)` |
| `onMask` | When mask is applied | `(value)` |
| `onComplete` | When mask is complete | `()` |
| `onIncomplete` | When mask is incomplete | `()` |
| `onCleared` | When input is cleared | `()` |

```javascript
const maskedInput = new InputMask('#input', {
	pattern: '(999) 999-9999',
	onComplete: function() {
		console.log('Phone number is complete!');
		this.element.classList.add('mask-complete');
	},
	onIncomplete: function() {
		this.element.classList.remove('mask-complete');
	}
});
```

## Pre-built Patterns

### Available Presets

| Preset | Pattern | Description |
|--------|---------|-------------|
| `phone` | `(999) 999-9999` | US phone number |
| `phoneInternational` | `+9 (999) 999-9999` | International phone |
| `ssn` | `999-99-9999` | Social Security Number |
| `ein` | `99-9999999` | Employer ID Number |
| `zipCode` | `99999` | US ZIP code |
| `zipCodePlus4` | `99999-9999` | ZIP+4 code |
| `creditCard` | `9999 9999 9999 9999` | Credit card number |
| `date` | `99/99/9999` | Date MM/DD/YYYY |
| `time12` | `99:99 aa` | 12-hour time |
| `time24` | `99:99` | 24-hour time |
| `currency` | `$999,999.99` | Currency amount |
| `percentage` | `999.99%` | Percentage |
| `ipAddress` | `999.999.999.999` | IP address |
| `macAddress` | `AA:AA:AA:AA:AA:AA` | MAC address |
| `licenseNumber` | `AAA-999` | License plate |
| `accountNumber` | `9999-9999-9999` | Account number |

### Using Presets

```javascript
// Simple preset usage
const phoneInput = new InputMask('#phone', PatternHelpers.getPreset('phone'));

// Preset with overrides
const ssnInput = new InputMask('#ssn', PatternHelpers.getPreset('ssn', {
	showMaskOnFocus: true,
	onComplete: function() {
		console.log('SSN complete');
	}
}));
```

## Methods

### Instance Methods

```javascript
const mask = new InputMask('#input', options);

// Set value programmatically
mask.setValue('1234567890');

// Get unmasked value
const unmasked = mask.getUnmaskedValue();

// Get masked value
const masked = mask.getMaskedValue();

// Clear the input
mask.clear();

// Validate current input
const isValid = mask.validate();

// Destroy the instance
mask.destroy();
```

### Static Methods

```javascript
// Create multiple instances
const masks = InputMask.create('.phone-input', {
	pattern: '(999) 999-9999'
});

// Auto-detect pattern
const detectedPattern = PatternHelpers.detectPattern('(555) 123-4567');
// Returns: 'phone'

// Generate dynamic pattern
const pattern = PatternHelpers.generatePattern(10, 'numeric', '-', 3);
// Returns: '999-999-9999'

// Initialize from data attributes
PatternHelpers.initFromDataAttributes('[data-mask]');
```

## Examples

### Phone Number Input

```html
<div class="mb-3">
	<label for="phone" class="form-label">Phone Number</label>
	<input type="tel" id="phone" class="form-control" data-mask="phone">
	<div class="form-text">Format: (555) 123-4567</div>
</div>
```

### Credit Card with Validation

```html
<div class="mb-3">
	<label for="credit-card" class="form-label">Credit Card</label>
	<input type="text" id="credit-card" class="form-control">
	<div class="valid-feedback">Card number is valid</div>
	<div class="invalid-feedback">Please enter a valid card number</div>
</div>

<script>
new InputMask('#credit-card', {
	pattern: '9999 9999 9999 9999',
	validateOnBlur: true,
	onComplete: function() {
		const isValid = PatternHelpers.validateCreditCard(this.element.value);
		this.element.classList.toggle('is-valid', isValid);
		this.element.classList.toggle('is-invalid', !isValid);
	}
});
</script>
```

### Currency Input

```html
<div class="mb-3">
	<label for="amount" class="form-label">Amount</label>
	<input type="text" id="amount" class="form-control text-end" data-mask="currency">
</div>
```

### Custom Pattern

```html
<div class="mb-3">
	<label for="product-code" class="form-label">Product Code</label>
	<input type="text" id="product-code" class="form-control">
	<div class="form-text">Format: ABC-1234</div>
</div>

<script>
new InputMask('#product-code', {
	pattern: 'AAA-9999',
	customPatterns: {
		'A': { validator: '[A-Z]', cardinality: 1, casing: 'upper' }
	},
	placeholder: '_'
});
</script>
```

### Date with Validation

```html
<div class="mb-3">
	<label for="birthdate" class="form-label">Birth Date</label>
	<input type="text" id="birthdate" class="form-control">
	<div class="invalid-feedback">Please enter a valid date</div>
</div>

<script>
new InputMask('#birthdate', PatternHelpers.getPreset('date', {
	onComplete: function() {
		const isValid = PatternHelpers.validateDate(this.element.value);
		this.element.classList.toggle('is-valid', isValid);
		this.element.classList.toggle('is-invalid', !isValid);
	}
}));
</script>
```

## Bootstrap Integration

### Form Validation

```html
<form class="needs-validation" novalidate>
	<div class="mb-3">
		<label for="phone" class="form-label">Phone Number *</label>
		<input type="tel" id="phone" class="form-control" required data-mask="phone">
		<div class="valid-feedback">Looks good!</div>
		<div class="invalid-feedback">Please provide a valid phone number.</div>
	</div>
	<button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### Input Groups

```html
<div class="input-group mb-3">
	<span class="input-group-text">📞</span>
	<input type="tel" class="form-control" data-mask="phone" placeholder="Phone number">
</div>

<div class="input-group mb-3">
	<span class="input-group-text">$</span>
	<input type="text" class="form-control text-end" data-mask="currency">
	<span class="input-group-text">.00</span>
</div>
```

### Floating Labels

```html
<div class="form-floating mb-3">
	<input type="tel" id="phone" class="form-control" data-mask="phone" placeholder="Phone">
	<label for="phone">Phone Number</label>
</div>
```

### Size Variants

```html
<!-- Small -->
<input type="tel" class="form-control form-control-sm" data-mask="phone">

<!-- Default -->
<input type="tel" class="form-control" data-mask="phone">

<!-- Large -->
<input type="tel" class="form-control form-control-lg" data-mask="phone">
```

## Accessibility Features

- **Screen Reader Support**: Proper ARIA labels and announcements
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Enhanced visibility in high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Proper focus handling and visual indicators

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## Performance Considerations

- Minimal DOM manipulation
- Efficient event handling
- Optimized for mobile devices
- Lightweight footprint (~15KB minified)

## Migration from Other Libraries

### From jQuery Mask Plugin

```javascript
// jQuery Mask Plugin
$('#phone').mask('(000) 000-0000');

// InputMask
new InputMask('#phone', { pattern: '(999) 999-9999' });
```

### From Cleave.js

```javascript
// Cleave.js
new Cleave('#phone', {
	phone: true,
	phoneRegionCode: 'US'
});

// InputMask
new InputMask('#phone', PatternHelpers.getPreset('phone'));
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.