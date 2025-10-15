# AjaxForm - Vanilla JavaScript AJAX Form Handler

A drop-in replacement for jQuery's `ajaxForm()` and `ajaxSubmit()` plugins, built with vanilla JavaScript. Supports both standard form submissions and file uploads (including multiple files) with upload progress tracking.

## Features

- ✅ **Drop-in replacement** for jQuery Form Plugin
- ✅ **File upload support** with multiple file handling
- ✅ **Upload progress tracking**
- ✅ **Before submit validation**
- ✅ **Success/Error/Complete callbacks**
- ✅ **Form reset and clear options**
- ✅ **Target element updates**
- ✅ **Promise-based API**
- ✅ **No dependencies** - pure vanilla JavaScript
- ✅ **OOP architecture** with customizable options
- ✅ **Bootstrap 5.3 compatible**

## Installation

Include the JavaScript files in your project:

```html
<script src="js/AjaxForm.js"></script>
<script src="js/AjaxSubmit.js"></script>
```

## Usage

### AjaxForm (Bind form for AJAX submission)

Binds a form to be submitted via AJAX. Automatically intercepts the form's submit event.

```javascript
// Basic usage
const ajaxForm = new AjaxForm('#myForm', {
	url: 'submit.php',
	success: function(response) {
		console.log('Form submitted successfully', response);
	}
});

// Alternative initialization
const ajaxForm = AjaxForm.init('#myForm', {
	url: 'submit.php',
	success: function(response) {
		console.log('Success!', response);
	}
});
```

### AjaxSubmit (Immediate submission)

Immediately submits a form via AJAX without binding event listeners.

```javascript
// Submit immediately
AjaxSubmit.submit('#myForm', {
	url: 'submit.php',
	success: function(response) {
		console.log('Form submitted', response);
	}
});

// Submit on button click
document.getElementById('submitBtn').addEventListener('click', function() {
	AjaxSubmit.submit('#myForm', {
		url: 'submit.php',
		success: function(response) {
			alert('Submitted!');
		}
	});
});
```

## Configuration Options

Both `AjaxForm` and `AjaxSubmit` accept the same configuration options:

### Basic Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | form action | Form submission URL |
| `type` | string | `'POST'` | HTTP method (`GET`, `POST`, `PUT`, `DELETE`, etc.) |
| `dataType` | string | `'json'` | Expected response type: `'json'`, `'html'`, `'xml'`, `'text'` |
| `timeout` | number | `0` | Request timeout in milliseconds (0 = no timeout) |

### Callback Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `beforeSerialize` | function | `null` | Called before form serialization. Receives `(form, options)`. Return `false` to cancel. |
| `beforeSubmit` | function | `null` | Called before submission. Receives `(formArray, form, options)`. Return `false` to cancel. |
| `success` | function | `null` | Called on successful submission. Receives `(responseData, statusText, xhr)` |
| `error` | function | `null` | Called on error. Receives `(xhr, statusText, errorThrown)` |
| `complete` | function | `null` | Always called after request completes. Receives `(xhr, statusText)` |
| `uploadProgress` | function | `null` | Called during file upload. Receives `(event, loaded, total, percentComplete)` |

### Form Manipulation Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `resetForm` | boolean | `false` | Reset form to default values after successful submission |
| `clearForm` | boolean | `false` | Clear all form values after successful submission |
| `extraData` | object | `{}` | Additional data to append to form submission |

### Response Handling Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | string/element | `null` | Element to update with response (selector or DOM element) |
| `replaceTarget` | boolean | `false` | Replace target element entirely (vs updating innerHTML) |

### Advanced Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `semantic` | boolean | `false` | Force semantic form data (reserved for future use) |
| `iframe` | boolean | `false` | Force iframe upload method (legacy support) |
| `forceSync` | boolean | `false` | Force synchronous submission (not recommended) |

## Examples

### Example 1: Simple Form Submission

```javascript
const form = new AjaxForm('#contactForm', {
	url: 'contact.php',
	dataType: 'json',
	success: function(data) {
		alert('Thank you for your message!');
	},
	error: function(xhr, status, error) {
		alert('Error: ' + error);
	},
	resetForm: true
});
```

### Example 2: File Upload with Progress

```javascript
const uploadForm = new AjaxForm('#uploadForm', {
	url: 'upload.php',
	dataType: 'json',
	uploadProgress: function(event, loaded, total, percent) {
		document.getElementById('progressBar').style.width = percent + '%';
		document.getElementById('progressText').textContent = Math.round(percent) + '%';
	},
	success: function(response) {
		console.log('Files uploaded:', response.files);
	},
	error: function(xhr) {
		alert('Upload failed!');
	}
});
```

### Example 3: Before Submit Validation

```javascript
const form = new AjaxForm('#registrationForm', {
	url: 'register.php',
	beforeSubmit: function(formArray, form, options) {
		// Validate form data
		const email = form.querySelector('[name="email"]').value;
		const password = form.querySelector('[name="password"]').value;

		if (!email || !password) {
			alert('Please fill in all required fields');
			return false; // Cancel submission
		}

		if (password.length < 8) {
			alert('Password must be at least 8 characters');
			return false;
		}

		return true; // Proceed with submission
	},
	success: function(data) {
		window.location.href = '/dashboard';
	}
});
```

### Example 4: Multiple File Upload

```html
<form id="multiFileForm" enctype="multipart/form-data">
	<input type="file" name="photos[]" multiple accept="image/*">
	<button type="submit">Upload Photos</button>
</form>

<script>
const form = new AjaxForm('#multiFileForm', {
	url: 'upload-photos.php',
	uploadProgress: function(event, loaded, total, percent) {
		console.log('Upload progress: ' + percent + '%');
	},
	success: function(response) {
		console.log('Uploaded ' + response.count + ' photos');
		response.files.forEach(file => {
			console.log('File: ' + file.name);
		});
	}
});
</script>
```

### Example 5: Update Target Element

```javascript
AjaxSubmit.submit('#searchForm', {
	url: 'search.php',
	dataType: 'html',
	target: '#searchResults',
	success: function(html) {
		console.log('Results loaded');
	}
});
```

### Example 6: Extra Data

```javascript
const form = new AjaxForm('#commentForm', {
	url: 'post-comment.php',
	extraData: {
		postId: 123,
		userId: 456,
		timestamp: Date.now()
	},
	success: function(data) {
		console.log('Comment posted');
	}
});
```

### Example 7: Manual Submit with AjaxForm

```javascript
// Bind form but don't auto-submit on form submit event
const form = new AjaxForm('#myForm', {
	url: 'submit.php',
	success: function(data) {
		console.log('Submitted');
	}
});

// Manually trigger submission later
document.getElementById('customSubmitBtn').addEventListener('click', function() {
	form.submit({
		// Override options for this submission
		extraData: { action: 'custom' }
	});
});
```

### Example 8: Form Array Inspection

```javascript
const form = new AjaxForm('#myForm', {
	beforeSubmit: function(formArray, form, options) {
		console.log('Form data array:', formArray);
		// formArray is an array of objects:
		// [
		//   { name: 'username', value: 'john', type: 'text' },
		//   { name: 'password', value: '****', type: 'password' },
		//   { name: 'remember', value: 'on', type: 'checkbox' }
		// ]
		return true;
	}
});
```

### Example 9: Clear Form After Success

```javascript
const form = new AjaxForm('#feedbackForm', {
	url: 'feedback.php',
	clearForm: true,  // Clear all values
	success: function(data) {
		alert('Feedback submitted! Form has been cleared.');
	}
});
```

### Example 10: Immediate Submit (AjaxSubmit)

```javascript
// Submit without binding
document.getElementById('quickSubmit').addEventListener('click', function() {
	AjaxSubmit.submit('#quickForm', {
		url: 'quick-save.php',
		dataType: 'json',
		success: function(response) {
			if (response.saved) {
				alert('Saved successfully!');
			}
		}
	});
});
```

## Destroy AjaxForm Instance

To remove event listeners and destroy an AjaxForm instance:

```javascript
const form = new AjaxForm('#myForm', options);

// Later, destroy the instance
form.destroy();
```

## Browser Compatibility

- Chrome/Edge (modern)
- Firefox (modern)
- Safari (modern)
- Any browser supporting:
  - `XMLHttpRequest`
  - `FormData`
  - `URLSearchParams`
  - ES6 Classes
  - Promises

## Migration from jQuery Form Plugin

### Before (jQuery):

```javascript
$('#myForm').ajaxForm({
	url: 'submit.php',
	success: function(response) {
		console.log(response);
	}
});

$('#otherForm').ajaxSubmit({
	url: 'submit.php',
	success: function(response) {
		console.log(response);
	}
});
```

### After (Vanilla JS):

```javascript
new AjaxForm('#myForm', {
	url: 'submit.php',
	success: function(response) {
		console.log(response);
	}
});

AjaxSubmit.submit('#otherForm', {
	url: 'submit.php',
	success: function(response) {
		console.log(response);
	}
});
```

## Complete Option Reference

```javascript
{
	// Request Configuration
	url: null,                    // Submission URL (defaults to form action)
	type: 'POST',                 // HTTP method
	dataType: 'json',             // Response type: 'json', 'html', 'xml', 'text'
	timeout: 0,                   // Timeout in milliseconds (0 = none)

	// Additional Data
	extraData: {},                // Extra data to append

	// Callbacks
	beforeSerialize: null,        // function(form, options) - return false to cancel
	beforeSubmit: null,           // function(formArray, form, options) - return false to cancel
	success: null,                // function(responseData, statusText, xhr)
	error: null,                  // function(xhr, statusText, errorThrown)
	complete: null,               // function(xhr, statusText)
	uploadProgress: null,         // function(event, loaded, total, percentComplete)

	// Form Manipulation
	resetForm: false,             // Reset form after success
	clearForm: false,             // Clear form after success

	// Response Handling
	target: null,                 // Element to update with response
	replaceTarget: false,         // Replace target vs update innerHTML

	// Advanced
	semantic: false,              // Reserved for future use
	iframe: false,                // Force iframe upload
	forceSync: false              // Force synchronous (not recommended)
}
```

## Examples

The `Example.html` file includes 8 working examples. The examples use a simple mock server (for demo purposes only) that stores data in sessionStorage.

**Note:** In production, replace the mock endpoints with your actual server URLs.

## License

MIT License - Free to use in personal and commercial projects.

## Support

For issues, questions, or contributions, please refer to the project documentation.