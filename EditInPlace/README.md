# Edit In Place Component

A flexible Bootstrap 5.3 component that transforms static content into editable fields, supporting multiple input types including WYSIWYG, multi-select, file upload, input masks, and auto-resizing textareas.

## Features

- **Multiple Input Types**: text, textarea, wysiwyg, select, multiselect, file, masked
- **Inline & Block Editing**: Supports both inline and block-level elements
- **Component Integration**: Seamlessly integrates with WYSIWYG, MultiSelect, FileUpload, InputMask, and AutoTextarea components
- **Visual Feedback**: Clear editing states with Bootstrap styling
- **Keyboard Support**: Enter to save, Escape to cancel
- **AJAX Support**: Built-in save callback system
- **Validation**: Field validation before save
- **Events**: Custom events for lifecycle hooks

## Installation

```html
<!-- Bootstrap 5.3.7 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- EditInPlace CSS -->
<link href="scss/edit-in-place.css" rel="stylesheet">

<!-- EditInPlace JS -->
<script src="js/EditInPlaceField.js"></script>
<script src="js/EditInPlace.js"></script>
```

## Basic Usage

```html
<span class="editable"
	data-field-type="text"
	data-field-name="username"
	data-value="John Doe">
	John Doe
</span>
```

```javascript
const editInPlace = new EditInPlace({
	selector: '.editable',
	onSave: async (fieldName, value, element) => {
		// Handle save operation
		return true; // Return true on success
	}
});
```

## Configuration Options

### EditInPlace Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `selector` | string | '.editable' | CSS selector for editable elements |
| `triggerEvent` | string | 'click' | Event to trigger edit mode ('click', 'dblclick', 'focus') |
| `saveOnEnter` | boolean | true | Save on Enter key (single-line fields) |
| `cancelOnEscape` | boolean | true | Cancel on Escape key |
| `showButtons` | boolean | true | Show save/cancel buttons |
| `saveButtonText` | string | 'Save' | Text for save button |
| `cancelButtonText` | string | 'Cancel' | Text for cancel button |
| `saveButtonClass` | string | 'btn btn-sm btn-success' | Save button CSS classes |
| `cancelButtonClass` | string | 'btn btn-sm btn-secondary' | Cancel button CSS classes |
| `emptyText` | string | 'Click to edit' | Placeholder for empty fields |
| `loadingText` | string | 'Saving...' | Text shown during save |
| `errorClass` | string | 'is-invalid' | Class added on validation error |
| `editingClass` | string | 'editing' | Class added when editing |
| `onSave` | function | null | Callback when saving (required) |
| `onCancel` | function | null | Callback when canceling |
| `onEdit` | function | null | Callback when entering edit mode |
| `onValidate` | function | null | Custom validation function |
| `components` | object | {} | Configuration for integrated components |

### Field Data Attributes

All editable elements support these data attributes:

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-field-type` | string | Field type: text, textarea, wysiwyg, select, multiselect, file, masked |
| `data-field-name` | string | Field identifier (sent to onSave callback) |
| `data-value` | string | Initial value for the field |
| `data-placeholder` | string | Placeholder text for the input |
| `data-required` | boolean | Mark field as required |
| `data-min-length` | number | Minimum length validation |
| `data-max-length` | number | Maximum length validation |
| `data-pattern` | string | Regex pattern for validation |
| `data-save-on-blur` | boolean | Auto-save when field loses focus |

### Text Field

```html
<span class="editable"
	data-field-type="text"
	data-field-name="title"
	data-value="My Title"
	data-required="true"
	data-max-length="100">
	My Title
</span>
```

### Textarea Field

```html
<div class="editable"
	data-field-type="textarea"
	data-field-name="description"
	data-value="Long description here...">
	Long description here...
</div>
```

### WYSIWYG Field

```html
<div class="editable"
	data-field-type="wysiwyg"
	data-field-name="content"
	data-wysiwyg-toolbar='["bold","italic","underline","|","link"]'>
	<p>Rich text content here...</p>
</div>
```

**WYSIWYG-specific attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-wysiwyg-toolbar` | JSON | Toolbar buttons array |
| `data-wysiwyg-height` | number | Editor height in pixels |
| `data-wysiwyg-placeholder` | string | Editor placeholder text |

### Select Field

```html
<span class="editable"
	data-field-type="select"
	data-field-name="status"
	data-value="active"
	data-options='[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]'>
	Active
</span>
```

**Select-specific attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-options` | JSON | Array of {value, text} objects |
| `data-option-url` | string | URL to fetch options from (AJAX) |

### Multi-Select Field

```html
<span class="editable"
	data-field-type="multiselect"
	data-field-name="tags"
	data-value='["tag1","tag2"]'
	data-options='[{"value":"tag1","text":"Tag 1"},{"value":"tag2","text":"Tag 2"}]'
	data-multiselect-max="5">
	Tag 1, Tag 2
</span>
```

**MultiSelect-specific attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-options` | JSON | Array of {value, text} objects |
| `data-multiselect-max` | number | Maximum selections allowed |
| `data-multiselect-searchable` | boolean | Enable search functionality |
| `data-multiselect-placeholder` | string | Placeholder text |

### File Upload Field

```html
<div class="editable"
	data-field-type="file"
	data-field-name="avatar"
	data-file-accept="image/*"
	data-file-max-size="2048"
	data-file-preview="true">
	<img src="current-avatar.jpg" alt="Avatar">
</div>
```

**File-specific attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-file-accept` | string | Accepted file types (MIME types) |
| `data-file-max-size` | number | Max file size in KB |
| `data-file-multiple` | boolean | Allow multiple files |
| `data-file-preview` | boolean | Show file preview |
| `data-file-url` | string | Current file URL (for display) |

### Masked Input Field

```html
<span class="editable"
	data-field-type="masked"
	data-field-name="phone"
	data-value="555-123-4567"
	data-mask-pattern="(999) 999-9999"
	data-mask-placeholder="_">
	(555) 123-4567
</span>
```

**Masked-specific attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-mask-pattern` | string | Mask pattern (9=digit, a=letter, *=alphanumeric) |
| `data-mask-placeholder` | string | Placeholder character for mask |
| `data-mask-reverse` | boolean | Apply mask from right to left |

## Component Integration

### Integrating with External Components

```javascript
const editInPlace = new EditInPlace({
	selector: '.editable',
	components: {
		wysiwyg: {
			class: WYSIWYGEditor, // Your WYSIWYG class
			defaultOptions: {
				toolbar: ['bold', 'italic', 'link']
			}
		},
		multiselect: {
			class: MultiSelect, // Your MultiSelect class
			defaultOptions: {
				searchable: true
			}
		},
		fileupload: {
			class: FileUpload, // Your FileUpload class
			defaultOptions: {
				maxSize: 2048
			}
		},
		inputmask: {
			class: InputMask, // Your InputMask class
			defaultOptions: {}
		},
		autotextarea: {
			class: AutoTextarea, // Your AutoTextarea class
			defaultOptions: {
				minRows: 3
			}
		}
	},
	onSave: async (fieldName, value, element) => {
		// Save logic
		return true;
	}
});
```

## Advanced Usage

### Custom Validation

```javascript
const editInPlace = new EditInPlace({
	selector: '.editable',
	onValidate: (value, element) => {
		const fieldName = element.dataset.fieldName;

		if (fieldName === 'email' && !value.includes('@')) {
			return {
				valid: false,
				message: 'Please enter a valid email address'
			};
		}

		return { valid: true };
	},
	onSave: async (fieldName, value, element) => {
		return true;
	}
});
```

### AJAX Save with Error Handling

```javascript
const editInPlace = new EditInPlace({
	selector: '.editable',
	onSave: async (fieldName, value, element) => {
		try {
			const response = await fetch('/api/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					field: fieldName,
					value: value,
					id: element.dataset.recordId
				})
			});

			if (!response.ok) {
				throw new Error('Save failed');
			}

			const data = await response.json();
			return true; // Success
		} catch (error) {
			console.error('Save error:', error);
			return false; // Failure
		}
	}
});
```

### Lifecycle Events

```javascript
const editInPlace = new EditInPlace({
	selector: '.editable',
	onEdit: (element, field) => {
		console.log('Editing started:', element.dataset.fieldName);
	},
	onSave: async (fieldName, value, element) => {
		console.log('Saving:', fieldName, value);
		return true;
	},
	onCancel: (element, field) => {
		console.log('Editing canceled:', element.dataset.fieldName);
	}
});

// Listen to custom events
document.addEventListener('editinplace:save', (e) => {
	console.log('Field saved:', e.detail);
});

document.addEventListener('editinplace:error', (e) => {
	console.error('Save error:', e.detail);
});
```

## Public Methods

### `destroy()`
Destroys the EditInPlace instance and removes all event listeners.

```javascript
editInPlace.destroy();
```

### `refresh()`
Re-initializes the component, useful after adding new editable elements to the DOM.

```javascript
editInPlace.refresh();
```

### `getField(element)`
Returns the EditInPlaceField instance for a given element.

```javascript
const field = editInPlace.getField(document.querySelector('.editable'));
```

## Custom Events

| Event | Description | Detail |
|-------|-------------|--------|
| `editinplace:edit` | Fired when entering edit mode | `{ element, field }` |
| `editinplace:save` | Fired after successful save | `{ element, field, value }` |
| `editinplace:cancel` | Fired when editing is canceled | `{ element, field }` |
| `editinplace:error` | Fired on save error | `{ element, field, error }` |
| `editinplace:validate` | Fired during validation | `{ element, field, valid }` |

## Styling

The component uses Bootstrap 5.3 CSS variables and can be customized via SCSS:

```scss
$edit-in-place-hover-bg: rgba(var(--bs-primary-rgb), 0.1);
$edit-in-place-editing-border: var(--bs-primary);
$edit-in-place-empty-color: var(--bs-secondary);
$edit-in-place-button-spacing: 0.5rem;
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Dependencies

- Bootstrap 5.3.7
- Optional: WYSIWYG, MultiSelect, FileUpload, InputMask, AutoTextarea components

## License

MIT License