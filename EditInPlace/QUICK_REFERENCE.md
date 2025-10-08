# EditInPlace Quick Reference Card

## Installation

```html
<link href="scss/edit-in-place.css" rel="stylesheet">
<script src="js/EditInPlaceField.js"></script>
<script src="js/EditInPlace.js"></script>
```

## Basic Usage

```javascript
const editInPlace = new EditInPlace({
	selector: '.editable',
	onSave: async (fieldName, value, element) => {
		// Your save logic
		return true;
	}
});
```

## Field Types Cheat Sheet

| Type | Use Case | Example |
|------|----------|---------|
| `text` | Short text | Names, titles, labels |
| `textarea` | Long text | Descriptions, comments |
| `wysiwyg` | Rich text | Articles, formatted content |
| `select` | Single choice | Status, category |
| `multiselect` | Multiple choices | Tags, skills |
| `file` | File upload | Images, documents |
| `masked` | Formatted input | Phone, date, SSN |

## Common Data Attributes

```html
<!-- All Fields -->
data-field-type="text"          <!-- Required: Field type -->
data-field-name="fieldName"     <!-- Required: Field identifier -->
data-value="initial value"      <!-- Initial value -->
data-required="true"            <!-- Mark as required -->
data-placeholder="Enter text"   <!-- Placeholder text -->
data-save-on-blur="true"        <!-- Auto-save on blur -->

<!-- Validation -->
data-min-length="5"             <!-- Minimum length -->
data-max-length="100"           <!-- Maximum length -->
data-pattern="^[A-Z]+$"         <!-- Regex pattern -->

<!-- Select/MultiSelect -->
data-options='[...]'            <!-- Options array (JSON) -->
data-multiselect-max="5"        <!-- Max selections -->
data-multiselect-searchable="true" <!-- Enable search -->

<!-- File Upload -->
data-file-accept="image/*"      <!-- Accepted file types -->
data-file-max-size="2048"       <!-- Max size in KB -->
data-file-preview="true"        <!-- Show preview -->

<!-- Masked Input -->
data-mask-pattern="999-999-9999" <!-- Mask pattern -->
data-mask-placeholder="_"       <!-- Mask placeholder char -->

<!-- WYSIWYG -->
data-wysiwyg-toolbar='[...]'    <!-- Toolbar buttons (JSON) -->
data-wysiwyg-height="200"       <!-- Editor height -->
```

## Quick Examples

### Text Input
```html
<span class="editable" data-field-type="text"
	data-field-name="username" data-value="John">John</span>
```

### Textarea
```html
<div class="editable" data-field-type="textarea"
	data-field-name="bio">Long text here...</div>
```

### Select Dropdown
```html
<span class="editable" data-field-type="select"
	data-field-name="status" data-value="active"
	data-options='[{"value":"active","text":"Active"}]'>Active</span>
```

### Multi-Select
```html
<div class="editable" data-field-type="multiselect"
	data-field-name="tags" data-value='["tag1","tag2"]'
	data-options='[{"value":"tag1","text":"Tag 1"}]'>
	Tag 1, Tag 2
</div>
```

### File Upload
```html
<div class="editable" data-field-type="file"
	data-field-name="avatar" data-file-accept="image/*">
	<img src="avatar.jpg">
</div>
```

### Masked Input
```html
<span class="editable" data-field-type="masked"
	data-field-name="phone" data-mask-pattern="999-999-9999">
	555-123-4567
</span>
```

## Options Object

```javascript
{
	selector: '.editable',                     // CSS selector
	triggerEvent: 'click',                     // 'click', 'dblclick', 'focus'
	saveOnEnter: true,                         // Save on Enter key
	cancelOnEscape: true,                      // Cancel on Escape key
	showButtons: true,                         // Show save/cancel buttons
	saveButtonText: 'Save',                    // Save button text
	cancelButtonText: 'Cancel',                // Cancel button text
	saveButtonClass: 'btn btn-sm btn-success', // Save button classes
	cancelButtonClass: 'btn btn-sm btn-secondary', // Cancel button classes
	emptyText: 'Click to edit',                // Empty field placeholder
	loadingText: 'Saving...',                  // Loading text
	errorClass: 'is-invalid',                  // Error class name
	editingClass: 'editing',                   // Editing class name
	onSave: async (name, val, el) => {},       // Save callback
	onCancel: (el, field) => {},               // Cancel callback
	onEdit: (el, field) => {},                 // Edit callback
	onValidate: (val, el) => {},               // Validate callback
	components: {}                             // Component integrations
}
```

## Callbacks

### onSave (Required)
```javascript
onSave: async (fieldName, value, element) => {
	// Save to server
	const response = await fetch('/api/save', {
		method: 'POST',
		body: JSON.stringify({ field: fieldName, value })
	});
	return response.ok; // Return true/false
}
```

### onValidate
```javascript
onValidate: (value, element) => {
	if (!value) {
		return { valid: false, message: 'Required field' };
	}
	return { valid: true };
}
```

### onEdit
```javascript
onEdit: (element, field) => {
	console.log('Editing:', field.fieldName);
}
```

### onCancel
```javascript
onCancel: (element, field) => {
	console.log('Canceled:', field.fieldName);
}
```

## Public Methods

```javascript
// Field Management
editInPlace.refresh()                  // Re-initialize all fields
editInPlace.addField(element)          // Add new field
editInPlace.removeField(element)       // Remove field
editInPlace.getField(element)          // Get field instance

// Values
editInPlace.getValue('fieldName')      // Get single value
editInPlace.setValue('fieldName', val) // Set single value
editInPlace.getValues()                // Get all values as object

// Control
editInPlace.enable()                   // Enable all fields
editInPlace.disable()                  // Disable all fields
editInPlace.isEditing()                // Check if editing
editInPlace.getCurrentField()          // Get current field

// Current Edit
editInPlace.saveCurrent()              // Save current edit
editInPlace.cancelCurrent()            // Cancel current edit

// Batch Operations
await editInPlace.saveAll()            // Save all fields
await editInPlace.validateAll()        // Validate all fields
editInPlace.reset()                    // Reset all to original

// Cleanup
editInPlace.destroy()                  // Destroy instance
```

## Custom Events

```javascript
// Listen to events
document.addEventListener('editinplace:save', (e) => {
	console.log('Saved:', e.detail);
});

document.addEventListener('editinplace:error', (e) => {
	console.error('Error:', e.detail);
});

document.addEventListener('editinplace:cancel', (e) => {
	console.log('Canceled:', e.detail);
});

document.addEventListener('editinplace:validate', (e) => {
	console.log('Validation:', e.detail);
});

// Event detail structure
{
	element: HTMLElement,    // The editable element
	field: EditInPlaceField, // Field instance
	value: any,              // Current value (save event)
	valid: boolean,          // Validation result (validate event)
	message: string,         // Error message (validate event)
	error: string            // Error message (error event)
}
```

## Component Integration

```javascript
const editInPlace = new EditInPlace({
	components: {
		componentname: {
			class: YourComponentClass,
			defaultOptions: {
				// Default options
			}
		}
	}
});

// Your component must implement:
class YourComponentClass {
	constructor(element, options) {
		this.element = element;
		// Initialize
	}

	getValue() {
		// Return current value
		return this.element.value;
	}

	destroy() {
		// Cleanup
	}
}
```

## Common Patterns

### AJAX Save with Error Handling
```javascript
onSave: async (fieldName, value, element) => {
	try {
		const res = await fetch('/api/update', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ field: fieldName, value })
		});

		if (!res.ok) throw new Error('Save failed');
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}
```

### Auto-Save Configuration
```javascript
new EditInPlace({
	selector: '.editable',
	showButtons: false,
	onSave: async (name, val) => {
		// Save logic
		return true;
	}
});

// Add data-save-on-blur="true" to HTML elements
```

### Conditional Validation
```javascript
onValidate: (value, element) => {
	const fieldName = element.dataset.fieldName;

	if (fieldName === 'email') {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			return { valid: false, message: 'Invalid email' };
		}
	}

	if (fieldName === 'age') {
		const age = parseInt(value);
		if (age < 0 || age > 120) {
			return { valid: false, message: 'Age must be 0-120' };
		}
	}

	return { valid: true };
}
```

### Batch Update
```javascript
// Update multiple fields at once
const updates = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john@example.com'
};

Object.entries(updates).forEach(([name, value]) => {
	editInPlace.setValue(name, value);
});
```

### Dynamic Field Addition
```javascript
function addField(config) {
	const field = document.createElement('div');
	field.className = 'editable';
	field.dataset.fieldType = config.type;
	field.dataset.fieldName = config.name;
	field.dataset.value = config.value;
	field.textContent = config.value;

	document.body.appendChild(field);
	editInPlace.refresh();
}

addField({ type: 'text', name: 'newField', value: 'New Value' });
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Click/Enter | Start editing |
| Enter | Save (single-line fields) |
| Escape | Cancel editing |
| Tab | Move to next field (browser default) |

## Styling Classes

```css
/* Applied by component */
.edit-in-place-field     /* Base field class */
.editing                 /* When field is being edited */
.is-invalid              /* Validation error state */
.invalid-feedback        /* Error message container */
.edit-in-place-buttons   /* Button container */

/* Custom styling example */
.edit-in-place-field:hover {
	background-color: rgba(var(--bs-primary-rgb), 0.1);
	border: 1px dashed var(--bs-primary);
}

.edit-in-place-field.editing {
	border: 2px solid var(--bs-primary);
	box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.15);
}
```

## Validation Patterns

```javascript
// Common regex patterns
const patterns = {
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	phone: /^\d{3}-\d{3}-\d{4}$/,
	url: /^https?:\/\/.+\..+/,
	zipCode: /^\d{5}(-\d{4})?$/,
	alphanumeric: /^[a-zA-Z0-9]+$/,
	integer: /^\d+$/,
	decimal: /^\d+\.?\d*$/,
	currency: /^\$\d+\.\d{2}$/
};

// Use in validation
onValidate: (value, element) => {
	const type = element.dataset.validationType;
	if (type && patterns[type]) {
		if (!patterns[type].test(value)) {
			return { valid: false, message: `Invalid ${type} format` };
		}
	}
	return { valid: true };
}
```

## Mask Patterns

```javascript
// Common mask patterns
const masks = {
	phone: '(999) 999-9999',
	ssn: '999-99-9999',
	date: '99/99/9999',
	creditCard: '9999 9999 9999 9999',
	zipCode: '99999-9999',
	time: '99:99'
};

// Pattern characters:
// 9 = digit (0-9)
// a = letter (a-z, A-Z)
// * = alphanumeric
// All other characters are literals
```

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Field not editable | Check selector matches element |
| Save not working | Ensure `onSave` returns true/false |
| Component not loading | Verify component class is registered |
| Validation persists | Return `{ valid: true }` from `onValidate` |
| Memory leak | Call `destroy()` when done |

## Browser Support

- Chrome/Edge: ✅ Latest
- Firefox: ✅ Latest
- Safari: ✅ Latest
- Opera: ✅ Latest
- IE11: ❌ Not supported

## Dependencies

- **Required:** Bootstrap 5.3.7
- **Optional:** WYSIWYG, MultiSelect, FileUpload, InputMask, AutoTextarea components

## Performance Tips

1. **Use event delegation** - Already handled by default
2. **Limit concurrent edits** - Consider disabling other fields when one is active
3. **Debounce save operations** - For auto-save scenarios
4. **Lazy load components** - Load WYSIWYG only when needed
5. **Clean up properly** - Always call `destroy()` when done

## Security Considerations

1. **Server-side validation** - Always validate on the server
2. **Sanitize HTML** - Escape user input before display
3. **CSRF protection** - Include CSRF tokens in AJAX requests
4. **Authorization** - Check user permissions server-side
5. **Rate limiting** - Prevent abuse of save endpoint

```javascript
// CSRF token example
onSave: async (fieldName, value) => {
	const response = await fetch('/api/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
		},
		body: JSON.stringify({ field: fieldName, value })
	});
	return response.ok;
}
```

## Accessibility Checklist

- ✅ Keyboard navigation support
- ✅ ARIA labels on editable elements
- ✅ Focus management
- ✅ Screen reader announcements
- ✅ High contrast mode support
- ✅ Minimum touch target size (44x44px)

```html
<!-- Accessible editable field -->
<span class="editable"
	data-field-type="text"
	data-field-name="username"
	role="button"
	tabindex="0"
	aria-label="Edit username">
	John Doe
</span>
```

## Common Use Cases

1. **Inline table editing** - Product catalogs, data grids
2. **Profile editing** - User profiles, settings pages
3. **Content management** - Articles, blog posts
4. **Form builders** - Dynamic form creation
5. **Dashboard customization** - Widget settings
6. **Spreadsheet-like** - Financial data, reports
7. **Inventory management** - Stock levels, pricing
8. **Configuration panels** - Application settings

## Resources

- **Documentation:** README.md
- **Usage Guide:** USAGE_GUIDE.md
- **Example:** Example.html
- **Bootstrap Docs:** https://getbootstrap.com/docs/5.3/

---

*Last Updated: 2025*