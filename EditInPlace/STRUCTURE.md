# EditInPlace Component - Directory Structure

## Complete File Structure

```
EditInPlace/
│
├── README.md                          # Main documentation with full API reference
├── USAGE_GUIDE.md                     # Comprehensive usage guide with examples
├── QUICK_REFERENCE.md                 # Quick reference card for developers
├── STRUCTURE.md                       # This file - directory structure guide
├── Example.html                       # Full-featured demo page
│
├── js/                                # Core JavaScript files
│   ├── EditInPlace.js                 # Main controller class (5.2 KB)
│   └── EditInPlaceField.js            # Individual field handler class (8.7 KB)
│
├── scss/                              # Stylesheets
│   └── edit-in-place.scss             # Component styles using BS5 variables (4.1 KB)
│
└── ExampleJS/                         # Example/Demo JavaScript
    ├── example.js                     # Example implementation & activity logger (6.3 KB)
    └── mock-wysiwyg.js                # Mock components for demonstration (12.5 KB)
                                       # Includes: MockWYSIWYG, MockMultiSelect,
                                       # MockInputMask, MockAutoTextarea
```

## File Descriptions

### Documentation Files

#### README.md
- **Purpose:** Primary documentation
- **Contains:**
	- Feature overview
	- Installation instructions
	- Complete API reference
	- All configuration options
	- Data attributes reference
	- Public methods documentation
	- Custom events
	- Browser support
	- License information

#### USAGE_GUIDE.md
- **Purpose:** Comprehensive usage guide
- **Contains:**
	- Quick start guide
	- Detailed field type explanations
	- Integration guide for custom components
	- Advanced features and patterns
	- Best practices
	- Troubleshooting section
	- Common use case examples
	- Security considerations

#### QUICK_REFERENCE.md
- **Purpose:** Quick lookup reference
- **Contains:**
	- Cheat sheets for all field types
	- Common data attributes table
	- Quick code examples
	- Options object template
	- Callback signatures
	- Public methods list
	- Keyboard shortcuts
	- Validation patterns
	- Mask patterns

#### STRUCTURE.md (This File)
- **Purpose:** Project organization guide
- **Contains:**
	- Complete directory structure
	- File descriptions
	- Dependencies
	- Integration notes
	- Deployment checklist

### Core Files

#### js/EditInPlace.js
**Main controller class that manages the entire edit-in-place system**

**Key Responsibilities:**
- Initialize all editable fields
- Manage field instances
- Handle document-level events
- Provide public API methods
- Coordinate component integrations

**Key Methods:**
- `constructor(options)` - Initialize with configuration
- `_initializeFields()` - Find and setup editable elements
- `_startEditing(field)` - Begin editing a field
- `refresh()` - Re-scan DOM for new fields
- `addField(element)` - Add single field
- `removeField(element)` - Remove single field
- `enable/disable()` - Toggle editing capability
- `getValues()` - Get all field values
- `setValue/getValue()` - Individual field value management
- `saveAll()` - Batch save operation
- `validateAll()` - Batch validation
- `destroy()` - Cleanup and remove listeners

**Dependencies:**
- EditInPlaceField class
- Bootstrap 5.3 (for styling)

#### js/EditInPlaceField.js
**Individual field handler that manages single editable element**

**Key Responsibilities:**
- Track field state (editing/display)
- Render appropriate input type
- Handle validation
- Manage save/cancel operations
- Integrate with external components
- Dispatch custom events

**Key Methods:**
- `constructor(element, options)` - Setup field
- `edit()` - Enter edit mode
- `save()` - Save changes
- `cancel()` - Cancel editing
- `_createInput()` - Generate input based on type
- `_validate()` - Run validation checks
- `_updateDisplay()` - Update display value
- `_formatDisplayValue()` - Format value for display
- `destroy()` - Cleanup field

**Supports Field Types:**
- text
- textarea
- wysiwyg
- select
- multiselect
- file
- masked

#### scss/edit-in-place.scss
**Bootstrap 5.3 compatible styles**

**Features:**
- Uses Bootstrap CSS variables
- Dark mode support via `[data-bs-theme="dark"]`
- Responsive design with mobile breakpoints
- Hover and focus states
- Editing state styling
- Validation error styling
- Animation keyframes
- Print styles
- Accessibility enhancements

**CSS Variables Used:**
- `--bs-primary-rgb`
- `--bs-body-bg`
- `--bs-body-color`
- `--bs-border-color`
- `--bs-secondary`
- `--bs-danger`
- And more Bootstrap 5.3 variables

**Customizable SCSS Variables:**
```scss
$edit-in-place-hover-bg
$edit-in-place-editing-border
$edit-in-place-editing-shadow
$edit-in-place-empty-color
$edit-in-place-button-spacing
$edit-in-place-transition
```

### Example Files

#### Example.html
**Full-featured demonstration page**

**Sections:**
1. Hero section with component title
2. Control panel (Save All, Reset, Get Values)
3. User profile example
4. Statistics dashboard
5. WYSIWYG rich text editor
6. Editable table
7. Activity log

**Features Demonstrated:**
- All field types
- Data validation
- AJAX save simulation
- Error handling
- Theme toggle (dark/light)
- Activity logging
- Bootstrap 5.3 dark mode

**External Dependencies:**
- Bootstrap 5.3.7 CSS/JS
- Bootstrap Icons 1.11.3

#### ExampleJS/example.js
**Example implementation and utilities**

**Components:**
- `ActivityLogger` - Logs all edit operations to display
- EditInPlace configuration with all callbacks
- Control button handlers
- Event listeners for custom events
- Theme toggle functionality
- Demo functions for testing

**Key Features:**
- Simulated AJAX save with random failure
- Custom validation examples
- Batch operation examples
- Dynamic field management
- Activity logging with timestamps
- Console output for debugging

#### ExampleJS/mock-wysiwyg.js
**Mock component implementations for demonstration**

**Includes 4 Mock Classes:**

1. **MockWYSIWYG**
	- Simple WYSIWYG editor
	- Toolbar with formatting buttons
	- ContentEditable implementation
	- execCommand usage
	- Link insertion

2. **MockMultiSelect**
	- Multi-selection interface
	- Search functionality
	- Badge-based display
	- Checkbox options list
	- Max selection limit

3. **MockInputMask**
	- Input masking for patterns
	- Format enforcement
	- Digit-only support
	- Keydown filtering

4. **MockAutoTextarea**
	- Auto-resizing textarea
	- Min/max row configuration
	- Dynamic height calculation

**Note:** These are simplified implementations for demonstration. Replace with production components like TinyMCE, Select2, Cleave.js, etc.

## Dependencies

### Required

**Bootstrap 5.3.7**
- CSS: For styling and theme variables
- JS: For component functionality (optional, mainly for demos)

### Optional Component Integrations

The EditInPlace component can integrate with:
- **WYSIWYG Editors:** TinyMCE, CKEditor, Quill, Summernote
- **Multi-Select:** Select2, Choices.js, Tom Select
- **File Upload:** Dropzone, FilePond, Uppy
- **Input Mask:** Cleave.js, IMask, jquery.inputmask
- **Auto Textarea:** autosize, textarea-autosize

## Integration Steps

### 1. Basic Integration (No External Components)

```html
<!DOCTYPE html>
<html data-bs-theme="dark">
<head>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
	<link href="EditInPlace/scss/edit-in-place.css" rel="stylesheet">
</head>
<body>
	<span class="editable" data-field-type="text" data-field-name="test">Edit me</span>

	<script src="EditInPlace/js/EditInPlaceField.js"></script>
	<script src="EditInPlace/js/EditInPlace.js"></script>
	<script>
		new EditInPlace({
			onSave: async (name, val) => { return true; }
		});
	</script>
</body>
</html>
```

### 2. With Component Integration

```html
<head>
	<!-- Bootstrap -->
	<link href="bootstrap.min.css" rel="stylesheet">

	<!-- TinyMCE -->
	<script src="tinymce/tinymce.min.js"></script>

	<!-- Select2 -->
	<link href="select2.min.css" rel="stylesheet">
	<script src="select2.min.js"></script>

	<!-- EditInPlace -->
	<link href="EditInPlace/scss/edit-in-place.css" rel="stylesheet">
</head>
<body>
	<!-- Your content -->

	<script src="EditInPlace/js/EditInPlaceField.js"></script>
	<script src="EditInPlace/js/EditInPlace.js"></script>
	<script src="your-component-wrappers.js"></script>
	<script>
		new EditInPlace({
			components: {
				wysiwyg: { class: TinyMCEWrapper, defaultOptions: {} },
				multiselect: { class: Select2Wrapper, defaultOptions: {} }
			},
			onSave: async (name, val) => { return true; }
		});
	</script>
</body>
</html>
```

## Deployment Checklist

### Pre-Deployment

- [ ] Test all field types
- [ ] Test validation rules
- [ ] Test save functionality
- [ ] Check responsive design
- [ ] Test dark/light modes
- [ ] Verify accessibility
- [ ] Check browser compatibility
- [ ] Review error handling
- [ ] Test with real API endpoints
- [ ] Minify CSS/JS for production

### Files to Deploy

**Required:**
- [ ] js/EditInPlaceField.js
- [ ] js/EditInPlace.js
- [ ] scss/edit-in-place.css (or compiled version)

**Optional:**
- [ ] Component integration scripts
- [ ] Custom styling overrides

**Not Required:**
- Example.html (demo only)
- ExampleJS/* (demo only)
- Documentation files (unless hosting docs)

### Production Optimization

```bash
# Minify JavaScript
uglifyjs js/EditInPlaceField.js js/EditInPlace.js -c -m -o edit-in-place.min.js

# Minify CSS
cleancss scss/edit-in-place.css -o edit-in-place.min.css

# Gzip for server
gzip -k edit-in-place.min.js
gzip -k edit-in-place.min.css
```

## Version Control

### Recommended .gitignore

```
# Development
node_modules/
.sass-cache/
*.map

# Build
dist/
build/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
```

### Semantic Versioning

Follow SemVer (MAJOR.MINOR.PATCH):
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

## File Sizes

| File | Size (Unminified) | Size (Minified) | Gzipped |
|------|-------------------|-----------------|---------|
| EditInPlace.js | ~14 KB | ~7 KB | ~2.5 KB |
| EditInPlaceField.js | ~22 KB | ~11 KB | ~3.5 KB |
| edit-in-place.scss | ~6 KB | ~4 KB | ~1.5 KB |
| **Total Core** | **~42 KB** | **~22 KB** | **~7.5 KB** |

## Browser Bundle

For modern bundlers (Webpack, Rollup, Vite):

```javascript
// src/index.js
export { EditInPlace } from './js/EditInPlace.js';
export { EditInPlaceField } from './js/EditInPlaceField.js';

// Usage in your app
import { EditInPlace } from 'edit-in-place';

const editor = new EditInPlace({
	onSave: async (name, val) => { return true; }
});
```

## CDN Hosting (Future)

When hosting on CDN:

```html
<!-- CSS -->
<link href="https://cdn.example.com/edit-in-place/1.0.0/edit-in-place.min.css" rel="stylesheet">

<!-- JavaScript -->
<script src="https://cdn.example.com/edit-in-place/1.0.0/edit-in-place.min.js"></script>
```

## Support and Contributions

- **Issues:** Report bugs and feature requests
- **Pull Requests:** Contributions welcome
- **Documentation:** Help improve docs
- **Examples:** Share your implementations

---

*Component Version: 1.0.0*
*Bootstrap Version: 5.3.7*
*Last Updated: October 2025*