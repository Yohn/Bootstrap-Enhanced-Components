# EditInPlace Component - Usage Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Field Types](#field-types)
3. [Integration Guide](#integration-guide)
4. [Advanced Features](#advanced-features)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Quick Start

### Basic Setup

```html
<!-- Include CSS -->
<link href="scss/edit-in-place.css" rel="stylesheet">

<!-- Include JavaScript -->
<script src="js/EditInPlaceField.js"></script>
<script src="js/EditInPlace.js"></script>
```

### Simple Text Field

```html
<span class="editable"
	data-field-type="text"
	data-field-name="username"
	data-value="John Doe">
	John Doe
</span>

<script>
const editInPlace = new EditInPlace({
	selector: '.editable',
	onSave: async (fieldName, value, element) => {
		// Your save logic here
		console.log(`Saving ${fieldName}:`, value);
		return true; // Return true on success
	}
});
</script>
```

## Field Types

### 1. Text Input

Best for: Short, single-line text (names, titles, labels)

```html
<span class="editable"
	data-field-type="text"
	data-field-name="title"
	data-value="My Title"
	data-required="true"
	data-max-length="100"
	data-pattern="^[A-Za-z\s]+$">
	My Title
</span>
```

**Options:**
- `data-required`: Mark as required
- `data-min-length`: Minimum character length
- `data-max-length`: Maximum character length
- `data-pattern`: Regex validation pattern
- `data-placeholder`: Input placeholder text

### 2. Textarea

Best for: Multi-line text (descriptions, comments, notes)

```html
<div class="editable"
	data-field-type="textarea"
	data-field-name="description"
	data-value="Long description here..."
	data-max-length="500">
	Long description here...
</div>
```

**Auto-resize Integration:**
```javascript
const editInPlace = new EditInPlace({
	components: {
		autotextarea: {
			class: AutoTextarea,
			defaultOptions: {
				minRows: 3,
				maxRows: 10
			}
		}
	}
});
```

### 3. WYSIWYG Editor

Best for: Rich text content (articles, blog posts, formatted text)

```html
<div class="editable"
	data-field-type="wysiwyg"
	data-field-name="content"
	data-wysiwyg-toolbar='["bold","italic","underline","|","link"]'
	data-wysiwyg-height="300">
	<p>Rich text content here...</p>
</div>
```

**Integration Example:**
```javascript
const editInPlace = new EditInPlace({
	components: {
		wysiwyg: {
			class: YourWYSIWYGClass,
			defaultOptions: {
				toolbar: ['bold', 'italic', 'link'],
				height: 200
			}
		}
	}
});
```

### 4. Select Dropdown

Best for: Single choice from predefined options (status, category, type)

```html
<span class="editable"
	data-field-type="select"
	data-field-name="status"
	data-value="active"
	data-options='[
		{"value":"active","text":"Active"},
		{"value":"inactive","text":"Inactive"},
		{"value":"pending","text":"Pending"}
	]'>
	Active
</span>
```

**Dynamic Options (AJAX):**
```html
<span class="editable"
	data-field-type="select"
	data-field-name="category"
	data-value="tech"
	data-option-url="/api/categories">
	Technology
</span>
```

### 5. Multi-Select

Best for: Multiple choices (tags, skills, categories)

```html
<div class="editable"
	data-field-type="multiselect"
	data-field-name="skills"
	data-value='["javascript","python","react"]'
	data-options='[
		{"value":"javascript","text":"JavaScript"},
		{"value":"python","text":"Python"},
		{"value":"react","text":"React"}
	]'
	data-multiselect-searchable="true"
	data-multiselect-max="5">
	<span class="badge bg-primary">JavaScript</span>
	<span class="badge bg-primary">Python</span>
	<span class="badge bg-primary">React</span>
</div>
```

### 6. File Upload

Best for: Images, documents, avatars

```html
<div class="editable"
	data-field-type="file"
	data-field-name="avatar"
	data-file-accept="image/*"
	data-file-max-size="2048"
	data-file-preview="true"
	data-file-url="/uploads/current-avatar.jpg">
	<img src="/uploads/current-avatar.jpg" alt="Avatar">
</div>
```

**Handling File Uploads:**
```javascript
const editInPlace = new EditInPlace({
	onSave: async (fieldName, value, element) => {
		if (element.dataset.fieldType === 'file') {
			const formData = new FormData();
			formData.append('file', value[0]);
			formData.append('field', fieldName);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			return response.ok;
		}

		// Handle other field types
		return true;
	}
});
```

### 7. Masked Input

Best for: Formatted inputs (phone numbers, dates, credit cards)

```html
<span class="editable"
	data-field-type="masked"
	data-field-name="phone"
	data-value="555-123-4567"
	data-mask-pattern="999-999-9999"
	data-mask-placeholder="_">
	(555) 123-4567
</span>
```

**Common Mask Patterns:**
- Phone: `(999) 999-9999`
- Date: `99/99/9999`
- SSN: `999-99-9999`
- Credit Card: `9999 9999 9999 9999`
- ZIP Code: `99999-9999`

## Integration Guide

### Integrating Your Own Components

The EditInPlace component is designed to work with any custom components. Here's how to integrate:

#### Step 1: Create Your Component Class

Your component must implement:
- Constructor that accepts `(element, options)`
- `getContent()` or `getValue()` method
- `destroy()` method (optional)

```javascript
class YourCustomComponent {
	constructor(element, options = {}) {
		this.element = element;
		this.options = options;
		// Initialize your component
	}

	getValue() {
		// Return the current value
		return this.element.value;
	}

	destroy() {
		// Cleanup when editing ends
	}
}
```

#### Step 2: Register Component

```javascript
const editInPlace = new EditInPlace({
	components: {
		yourcomponent: {
			class: YourCustomComponent,
			defaultOptions: {
				// Default options for your component
			}
		}
	}
});
```

#### Step 3: Use in HTML

```html
<div class="editable"
	data-field-type="yourcomponent"
	data-field-name="customField"
	data-your-option="value">
	Initial Value
</div>
```

### Real Component Integration Examples

#### TinyMCE Integration

```javascript
const editInPlace = new EditInPlace({
	components: {
		wysiwyg: {
			class: class TinyMCEWrapper {
				constructor(element, options) {
					this.element = element;
					this.editor = null;

					tinymce.init({
						target: element,
						...options,
						init_instance_callback: (editor) => {
							this.editor = editor;
						}
					});
				}

				getContent() {
					return this.editor ? this.editor.getContent() : '';
				}

				destroy() {
					if (this.editor) {
						tinymce.remove(this.editor);
					}
				}
			},
			defaultOptions: {
				menubar: false,
				plugins: 'link lists',
				toolbar: 'bold italic | link'
			}
		}
	}
});
```

#### Select2 Integration

```javascript
const editInPlace = new EditInPlace({
	components: {
		multiselect: {
			class: class Select2Wrapper {
				constructor(element, options) {
					this.element = $(element);
					this.element.select2(options);
				}

				getValue() {
					return this.element.val();
				}

				destroy() {
					this.element.select2('destroy');
				}
			},
			defaultOptions: {
				width: '100%',
				theme: 'bootstrap-5'
			}
		}
	}
});
```

## Advanced Features

### Custom Validation

```javascript
const editInPlace = new EditInPlace({
	onValidate: (value, element) => {
		const fieldName = element.dataset.fieldName;

		// Email validation
		if (fieldName === 'email') {
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailPattern.test(value)) {
				return {
					valid: false,
					message: 'Please enter a valid email address'
				};
			}
		}

		// URL validation
		if (fieldName === 'website') {
			try {
				new URL(value);
			} catch {
				return {
					valid: false,
					message: 'Please enter a valid URL'
				};
			}
		}

		// Custom business logic
		if (fieldName === 'price') {
			const price = parseFloat(value.replace(', ''));
			if (price < 0 || price > 10000) {
				return {
					valid: false,
					message: 'Price must be between $0 and $10,000'
				};
			}
		}

		return { valid: true };
	}
});
```

### Conditional Field Behavior

```javascript
const editInPlace = new EditInPlace({
	onEdit: (element, field) => {
		// Disable other fields when editing
		document.querySelectorAll('.editable').forEach(el => {
			if (el !== element) {
				el.style.pointerEvents = 'none';
				el.style.opacity = '0.5';
			}
		});
	},

	onSave: async (fieldName, value, element) => {
		// Re-enable all fields
		document.querySelectorAll('.editable').forEach(el => {
			el.style.pointerEvents = '';
			el.style.opacity = '';
		});

		// Update related fields
		if (fieldName === 'country') {
			// Trigger state field update
			const stateField = document.querySelector('[data-field-name="state"]');
			if (stateField) {
				// Load new state options based on country
				await loadStateOptions(value);
			}
		}

		return true;
	}
});
```

### Auto-Save on Blur

```html
<span class="editable"
	data-field-type="text"
	data-field-name="title"
	data-value="My Title"
	data-save-on-blur="true">
	My Title
</span>
```

```javascript
const editInPlace = new EditInPlace({
	showButtons: false, // Hide save/cancel buttons
	// Field will auto-save when it loses focus
});
```

### Batch Operations

```javascript
// Save all fields at once
async function saveAll() {
	const results = await editInPlace.saveAll();

	const failures = results.filter(r => !r.success);
	if (failures.length > 0) {
		alert(`Failed to save: ${failures.map(f => f.field).join(', ')}`);
	} else {
		alert('All fields saved successfully!');
	}
}

// Get all field values
function exportData() {
	const values = editInPlace.getValues();
	console.log('Current data:', values);

	// Export as JSON
	const json = JSON.stringify(values, null, 2);
	downloadFile('data.json', json);
}

// Update multiple fields
function bulkUpdate(updates) {
	Object.entries(updates).forEach(([fieldName, value]) => {
		editInPlace.setValue(fieldName, value);
	});
}
```

### Event Handling

```javascript
// Listen to save events
document.addEventListener('editinplace:save', (e) => {
	const { element, field, value } = e.detail;

	// Update UI
	showNotification(`${field.fieldName} saved successfully`);

	// Update other parts of the page
	updateRelatedContent(field.fieldName, value);
});

// Listen to error events
document.addEventListener('editinplace:error', (e) => {
	const { element, field, error } = e.detail;

	// Log to analytics
	logError('EditInPlace Error', {
		field: field.fieldName,
		error: error
	});

	// Show user-friendly message
	showErrorNotification('Save failed. Please try again.');
});

// Listen to validation events
document.addEventListener('editinplace:validate', (e) => {
	const { element, field, valid, message } = e.detail;

	if (!valid) {
		// Highlight related fields
		highlightDependentFields(field.fieldName);
	}
});
```

### Dynamic Field Management

```javascript
// Add a new editable field dynamically
function addField() {
	const container = document.getElementById('fields-container');

	const newField = document.createElement('div');
	newField.className = 'mb-3';
	newField.innerHTML = `
		<label class="form-label">New Field</label>
		<div class="editable"
			data-field-type="text"
			data-field-name="dynamicField${Date.now()}"
			data-value="Initial value">
			Initial value
		</div>
	`;

	container.appendChild(newField);

	// Refresh EditInPlace to recognize new field
	editInPlace.refresh();
}

// Remove a field
function removeField(fieldName) {
	const element = document.querySelector(`[data-field-name="${fieldName}"]`);
	if (element) {
		editInPlace.removeField(element);
		element.parentElement.remove();
	}
}

// Temporarily disable editing
function disableEditing() {
	editInPlace.disable();
}

// Re-enable editing
function enableEditing() {
	editInPlace.enable();
}
```

## Best Practices

### 1. Field Naming Convention

Use descriptive, consistent field names:

```javascript
// Good
data-field-name="user_email"
data-field-name="product_price"
data-field-name="article_title"

// Avoid
data-field-name="field1"
data-field-name="data"
data-field-name="input"
```

### 2. Validation Strategy

Implement validation at multiple levels:

```javascript
const editInPlace = new EditInPlace({
	// Client-side validation
	onValidate: (value, element) => {
		// Basic format checks
		return { valid: true };
	},

	onSave: async (fieldName, value, element) => {
		try {
			// Server-side validation
			const response = await fetch('/api/validate', {
				method: 'POST',
				body: JSON.stringify({ field: fieldName, value })
			});

			if (!response.ok) {
				const error = await response.json();
				// Show server validation error
				alert(error.message);
				return false;
			}

			// Save if validation passes
			return await saveToServer(fieldName, value);
		} catch (error) {
			return false;
		}
	}
});
```

### 3. Error Handling

Always handle errors gracefully:

```javascript
const editInPlace = new EditInPlace({
	onSave: async (fieldName, value, element) => {
		try {
			const response = await fetch('/api/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ field: fieldName, value })
			});

			if (!response.ok) {
				// Parse error from server
				const errorData = await response.json();
				console.error('Server error:', errorData);

				// Show user-friendly message
				showToast('error', errorData.message || 'Failed to save');
				return false;
			}

			showToast('success', 'Saved successfully');
			return true;

		} catch (error) {
			// Network or other errors
			console.error('Save error:', error);
			showToast('error', 'Network error. Please check your connection.');
			return false;
		}
	}
});
```

### 4. Performance Optimization

For pages with many editable fields:

```javascript
// Use event delegation instead of individual listeners
const editInPlace = new EditInPlace({
	selector: '.editable',

	// Debounce save operations
	onSave: debounce(async (fieldName, value, element) => {
		// Save logic
		return true;
	}, 300)
});

// Debounce utility
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
```

### 5. Accessibility

Ensure your editable fields are accessible:

```html
<!-- Add ARIA labels -->
<span class="editable"
	data-field-type="text"
	data-field-name="username"
	data-value="John Doe"
	role="button"
	tabindex="0"
	aria-label="Edit username">
	John Doe
</span>

<script>
// Add keyboard navigation
document.querySelectorAll('.editable').forEach(el => {
	el.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			el.click();
		}
	});
});
</script>
```

### 6. Mobile Optimization

```css
/* Increase touch targets on mobile */
@media (max-width: 768px) {
	.edit-in-place-field {
		min-height: 44px; /* Minimum touch target */
		padding: 0.5rem;
	}

	.edit-in-place-buttons button {
		min-width: 44px;
		min-height: 44px;
	}
}
```

## Troubleshooting

### Field Not Editable

**Problem:** Clicking on field doesn't enter edit mode

**Solutions:**
1. Check if selector matches the element:
```javascript
console.log(document.querySelectorAll('.editable').length);
```

2. Verify no CSS is blocking pointer events:
```css
.editable {
	pointer-events: auto !important;
}
```

3. Check for JavaScript errors in console

### Save Not Working

**Problem:** Changes don't persist after saving

**Solutions:**
1. Ensure `onSave` callback returns `true`:
```javascript
onSave: async (fieldName, value, element) => {
	// Must return true or false
	return true; //