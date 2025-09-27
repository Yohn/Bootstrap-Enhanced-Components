# YoBox - Bootstrap 5.3+ Modal Dialogs

A modern, vanilla JavaScript replacement for Bootbox that provides alert, confirm, and prompt dialogs using Bootstrap 5.3+ modals.

## Features

- 🚀 No jQuery dependency - Pure vanilla JavaScript
- 📱 Bootstrap 5.3+ compatible
- 🎨 Fully customizable with Bootstrap classes
- 🌍 Internationalization support
- ♿ Accessible with proper ARIA attributes
- 📝 TypeScript-friendly
- 🎯 Promise-based API (optional)

## Installation

Include YoBox after Bootstrap 5.3+ in your HTML:

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/YoBox.js"></script>
```

## Basic Usage

### Alert Dialog

```javascript
yobox.alert('This is an alert!');

yobox.alert('Alert with callback', function() {
	console.log('Alert dismissed');
});

// Object syntax
yobox.alert({
	message: 'Custom alert',
	title: 'Warning',
	className: 'my-custom-class',
	callback: function() {
		console.log('Custom alert dismissed');
	}
});
```

### Confirm Dialog

```javascript
yobox.confirm('Are you sure?', function(result) {
	if (result) {
		console.log('User confirmed');
	} else {
		console.log('User cancelled');
	}
});

// Object syntax
yobox.confirm({
	message: 'Delete this item?',
	title: 'Confirm Action',
	size: 'small',
	callback: function(result) {
		console.log('Result:', result);
	}
});
```

### Prompt Dialog

```javascript
yobox.prompt('What is your name?', function(name) {
	if (name === null) {
		console.log('User cancelled');
	} else {
		console.log('Hello', name);
	}
});

// Object syntax with validation
yobox.prompt({
	title: 'Enter email address',
	inputType: 'email',
	placeholder: 'user@example.com',
	required: true,
	callback: function(email) {
		if (email) {
			console.log('Email:', email);
		}
	}
});
```

### Custom Dialog

```javascript
yobox.dialog({
	title: 'Custom Dialog',
	message: '<p>This is a <strong>custom</strong> dialog.</p>',
	size: 'large',
	buttons: {
		cancel: {
			label: 'Cancel',
			className: 'btn-danger',
			callback: function() {
				console.log('Cancelled');
			}
		},
		save: {
			label: 'Save',
			className: 'btn-success',
			callback: function() {
				console.log('Saved');
				return false; // Prevent dialog from closing
			}
		},
		ok: {
			label: 'OK',
			className: 'btn-primary',
			callback: function() {
				console.log('OK clicked');
			}
		}
	}
});
```

## Configuration Options

### Global Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `locale` | String | `'en'` | Default locale for button labels |
| `backdrop` | Boolean/String | `'static'` | Modal backdrop (`true`, `false`, or `'static'`) |
| `animate` | Boolean | `true` | Enable fade animation |
| `className` | String | `null` | Additional CSS class for modal |
| `closeButton` | Boolean | `true` | Show close button in header |
| `show` | Boolean | `true` | Show modal immediately after creation |
| `container` | String | `'body'` | Container selector for modal placement |
| `value` | String/Array | `''` | Default value for prompt inputs |
| `inputType` | String | `'text'` | Input type for prompts |
| `errorMessage` | String | `null` | Custom validation error message |
| `swapButtonOrder` | Boolean | `false` | Reverse button order (confirm/cancel) |
| `centerVertical` | Boolean | `false` | Center modal vertically |
| `multiple` | Boolean | `false` | Allow multiple selections (select inputs) |
| `scrollable` | Boolean | `false` | Enable scrollable modal body |
| `reusable` | Boolean | `false` | Don't destroy modal on hide |
| `relatedTarget` | Element | `null` | Element that triggered the modal |
| `size` | String | `null` | Modal size (`'sm'`, `'lg'`, `'xl'`) |
| `id` | String | `null` | Custom ID for modal element |

### Dialog Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | String | `null` | Modal title |
| `message` | String/HTMLElement | Required | Modal body content |
| `buttons` | Object | `{}` | Button configuration object |
| `onShow` | Function | `null` | Callback when modal starts showing |
| `onShown` | Function | `null` | Callback when modal is fully shown |
| `onHide` | Function | `null` | Callback when modal starts hiding |
| `onHidden` | Function | `null` | Callback when modal is fully hidden |
| `onEscape` | Function | `null` | Callback when escape key is pressed |

### Button Configuration

Each button in the `buttons` object can have the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | String | Button key | Text displayed on button |
| `className` | String | Auto-assigned | Bootstrap button classes |
| `callback` | Function | `null` | Function called when button is clicked |
| `id` | String | `null` | Custom ID for button element |
| `disabled` | Boolean | `false` | Whether button is disabled |

### Prompt Input Types

| Type | Description | Additional Options |
|------|-------------|-------------------|
| `text` | Single line text input | `placeholder`, `pattern`, `maxlength`, `required` |
| `textarea` | Multi-line text input | `placeholder`, `rows`, `maxlength`, `required` |
| `email` | Email input with validation | `placeholder`, `pattern`, `required` |
| `password` | Password input | `placeholder`, `pattern`, `required` |
| `number` | Number input | `min`, `max`, `step`, `placeholder`, `required` |
| `range` | Range slider | `min`, `max`, `step`, `required` |
| `date` | Date picker | `min`, `max`, `required` |
| `time` | Time picker | `min`, `max`, `step`, `required` |
| `select` | Dropdown select | `inputOptions`, `multiple`, `required` |
| `checkbox` | Checkbox group | `inputOptions`, `required` |
| `radio` | Radio button group | `inputOptions` |

### Input Options Format

For `select`, `checkbox`, and `radio` input types, use the `inputOptions` array:

```javascript
inputOptions: [
	{
		text: 'Option 1',
		value: 'option1'
	},
	{
		text: 'Option 2',
		value: 'option2',
		group: 'Group A' // Optional for select
	}
]
```

## API Methods

### Instance Methods

```javascript
// Add locale
yobox.addLocale('es', {
	OK: 'Aceptar',
	CANCEL: 'Cancelar',
	CONFIRM: 'Confirmar'
});

// Set default locale
yobox.setLocale('es');

// Remove locale
yobox.removeLocale('es');

// Set default options
yobox.setDefaults({
	size: 'lg',
	animate: false
});

yobox.setDefaults('backdrop', false);

// Hide all open modals
yobox.hideAll();
```

## Examples

### Advanced Prompt with Validation

```javascript
yobox.prompt({
	title: 'User Registration',
	message: 'Please fill in your details:',
	inputType: 'select',
	inputOptions: [
		{ text: 'Select Country...', value: '' },
		{ text: 'United States', value: 'us' },
		{ text: 'Canada', value: 'ca' },
		{ text: 'United Kingdom', value: 'uk' }
	],
	required: true,
	callback: function(country) {
		if (country) {
			console.log('Selected country:', country);
		}
	}
});
```

### Multi-select Checkbox Prompt

```javascript
yobox.prompt({
	title: 'Select Features',
	inputType: 'checkbox',
	inputOptions: [
		{ text: 'Email notifications', value: 'email' },
		{ text: 'SMS notifications', value: 'sms' },
		{ text: 'Push notifications', value: 'push' }
	],
	value: ['email'], // Pre-select email
	callback: function(features) {
		if (features && features.length > 0) {
			console.log('Selected features:', features);
		} else {
			console.log('No features selected');
		}
	}
});
```

### Custom Styled Dialog

```javascript
yobox.dialog({
	title: 'Delete Confirmation',
	message: '<div class="text-center"><i class="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i><p>This action cannot be undone!</p></div>',
	className: 'yobox-danger',
	centerVertical: true,
	buttons: {
		cancel: {
			label: 'Keep It',
			className: 'btn-outline-secondary'
		},
		delete: {
			label: 'Delete Forever',
			className: 'btn-danger',
			callback: function() {
				// Perform deletion
				console.log('Item deleted');
			}
		}
	}
});
```

### Non-blocking Dialog

```javascript
yobox.dialog({
	title: 'Processing...',
	message: '<div class="text-center"><div class="spinner-border" role="status"></div><p class="mt-3">Please wait...</p></div>',
	buttons: {
		cancel: {
			label: 'Cancel',
			className: 'btn-secondary',
			callback: function() {
				// Handle cancellation
				return false; // Prevent dialog from closing
			}
		}
	},
	backdrop: false, // Allow clicking outside
	closeButton: false
});
```

## Localization

### Built-in Locales

- `en` (English) - Default

### Adding Custom Locales

```javascript
yobox.addLocale('fr', {
	OK: 'OK',
	CANCEL: 'Annuler',
	CONFIRM: 'Confirmer'
});

yobox.addLocale('de', {
	OK: 'OK',
	CANCEL: 'Abbrechen',
	CONFIRM: 'Bestätigen'
});

// Use specific locale for a dialog
yobox.confirm({
	message: 'Êtes-vous sûr?',
	locale: 'fr',
	callback: function(result) {
		console.log(result);
	}
});
```

## CSS Customization

### Custom CSS Classes

```css
/* Custom dialog styling */
.yobox-danger .modal-content {
	border-color: #dc3545;
}

.yobox-danger .modal-header {
	background-color: #dc3545;
	color: white;
	border-bottom-color: #dc3545;
}

/* Custom button styling */
.yobox .btn-custom {
	background-color: #6f42c1;
	border-color: #6f42c1;
	color: white;
}

/* Input styling */
.yobox-input:focus {
	border-color: #6f42c1;
	box-shadow: 0 0 0 0.2rem rgba(111, 66, 193, 0.25);
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- Bootstrap 5.3+ CSS and JavaScript
- Modern browser with ES6+ support

## Migration from Bootbox

YoBox provides a similar API to Bootbox but with some differences:

### Key Differences

1. **No jQuery dependency** - Uses vanilla JavaScript
2. **Bootstrap 5.3+ only** - Doesn't support older Bootstrap versions
3. **Modern ES6+ syntax** - Uses classes and modern JavaScript features
4. **Different CSS classes** - Uses `yobox-*` prefixes instead of `bootbox-*`

### Migration Tips

1. Replace `bootbox` with `yobox` in your code
2. Update CSS selectors from `.bootbox-*` to `.yobox-*`
3. Ensure Bootstrap 5.3+ is loaded
4. Test all dialog configurations

## License

MIT License - See LICENSE file for details