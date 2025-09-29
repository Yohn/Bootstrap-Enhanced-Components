# Bootstrap 5.3 WYSIWYG Editor

A fully-featured, customizable WYSIWYG editor built with vanilla JavaScript and Bootstrap 5.3. Features a modular OOP architecture with comprehensive configuration options.

## Features

### Core Functionality
- **Rich Text Editing** - Full contenteditable implementation with formatting preservation
- **Textarea Integration** - Seamlessly transforms textarea elements with automatic sync
- **Bootstrap 5.3 Native** - Built-in dark mode support and Bootstrap component integration
- **Modular Architecture** - Separate classes for editor, toolbar, commands, events, storage, and sanitization

### Text Formatting
- **Basic Formatting** - Bold, italic, underline, strikethrough
- **Headers** - H1-H6 support with dropdown selector
- **Font Management** - Customizable font families and sizes
- **Colors** - Text and background color pickers with palettes
- **Alignment** - Left, center, right, justify
- **Lists** - Ordered and unordered lists with nesting
- **Special Characters** - Superscript, subscript, inline code
- **Clear Formatting** - Remove all styling with one click

### Advanced Features
- **Tables** - Full table support with cell editing, row/column management
- **Media** - Image insertion with drag-drop, video embedding (YouTube/Vimeo)
- **Links** - Link creation with target options
- **Code View** - Toggle between WYSIWYG and HTML source
- **Fullscreen Mode** - Distraction-free editing
- **History** - Undo/redo with configurable stack size

### Storage & Recovery
- **Autosave** - Configurable interval with local/session storage
- **Version Control** - Keep multiple versions with timestamps
- **Draft Recovery** - Automatic draft detection and restore
- **Cross-Tab Sync** - Storage events for multi-tab coordination

### Security
- **XSS Prevention** - Built-in HTML sanitization
- **Tag Whitelisting** - Configurable allowed tags and attributes
- **URL Validation** - Protocol and domain checking
- **Safe Paste** - Clean pasted content with configurable modes

## Installation

```html
<!-- Bootstrap 5.3 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">

<!-- Bootstrap 5.3 JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<!-- WYSIWYG Editor -->
<script src="js/WysiwygEditor.js"></script>
<script src="js/WysiwygToolbar.js"></script>
<script src="js/WysiwygCommandManager.js"></script>
<script src="js/WysiwygEventManager.js"></script>
<script src="js/WysiwygStorageManager.js"></script>
<script src="js/WysiwygSanitizer.js"></script>
```

## Basic Usage

```javascript
const editor = new WysiwygEditor(document.getElementById('myTextarea'), {
    height: { default: 300 },
    placeholder: 'Start typing...'
});
```

## Configuration Options

### Toolbar Configuration

```javascript
toolbar: [
    ['style', ['style']],                    // Paragraph formats
    ['font', ['bold', 'italic', 'underline', 'strikethrough']],
    ['fontname', ['fontname']],              // Font family dropdown
    ['fontsize', ['fontsize']],              // Font size dropdown
    ['color', ['color', 'bgcolor']],         // Color pickers
    ['para', ['ul', 'ol', 'paragraph']],     // Paragraph tools
    ['table', ['table']],                    // Table operations
    ['insert', ['link', 'picture', 'video', 'hr']],
    ['view', ['fullscreen', 'codeview', 'help']],
    ['history', ['undo', 'redo']]
],

// Toolbar alignment (Bootstrap justify-content-* classes)
toolbarAlignment: 'start'  // Options: 'evenly', 'between', 'around', 'end', 'start', 'center'
```

### Height Settings

```javascript
height: {
    min: 150,      // Minimum height in pixels
    max: 600,      // Maximum height in pixels
    default: 300   // Default height
}
```

### Callbacks

```javascript
callbacks: {
    onChange: function(content) { },      // Content changed
    onFocus: function(event) { },         // Editor focused
    onBlur: function(event) { },          // Editor blurred
    onInit: function(editor) { },         // Editor initialized
    onDestroy: function(editor) { },      // Before destruction
    onPaste: function(data) { },          // Content pasted
    onKeydown: function(event) { },       // Key pressed
    onKeyup: function(event) { },         // Key released
    onMouseup: function(event) { },       // Mouse released
    onImageUpload: function(file) { }     // Image uploaded
}
```

### Autosave Configuration

```javascript
autosave: {
    enabled: true,           // Enable/disable autosave
    interval: 30000,         // Save interval in milliseconds
    key: 'my_editor',        // Storage key prefix
    storage: 'local',        // 'local' or 'session'
    maxVersions: 5,          // Number of versions to keep
    onSave: function(data) { },    // After save callback
    onRestore: function(data) { }  // After restore callback
}
```

### HTML Sanitization

```javascript
allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'img', 'video', 'table', 'tr', 'td', 'th'
],

allowedAttributes: {
    '*': ['class', 'id', 'style'],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height']
}
```

### Paste Handling

```javascript
paste: {
    mode: 'auto',         // 'plain', 'formatted', 'auto'
    autoClean: true,      // Clean HTML automatically
    stripStyles: false,   // Remove inline styles
    stripClasses: false,  // Remove classes
    stripIds: true        // Remove IDs
}
```

### Additional Options

```javascript
{
    placeholder: 'Enter text here...',
    theme: 'dark',              // 'light', 'dark', 'auto'
    spellcheck: true,
    resizable: true,
    focus: false,               // Auto-focus on init
    tabSize: 4,
    direction: 'ltr',           // 'ltr' or 'rtl'
    lineHeights: ['1.0', '1.5', '2.0'],
    shortcuts: true,            // Enable keyboard shortcuts
    disableDragAndDrop: false,
    maximumImageSize: 5242880,  // 5MB
    fonts: ['Arial', 'Times New Roman', 'Courier New'],
    fontSizes: ['8', '10', '12', '14', '16', '18', '20', '24'],
    colors: {
        text: [ /* color arrays */ ],
        background: [ /* color arrays */ ]
    }
}
```

## API Methods

### Content Methods
```javascript
editor.getContent()           // Get HTML content
editor.setContent(html)       // Set HTML content
editor.getText()              // Get plain text
editor.clear()                // Clear all content
editor.export('html')         // Export as HTML/text/markdown
```

### Formatting Methods
```javascript
editor.execCommand(cmd, value)     // Execute command
editor.formatBlock(tag)            // Format as block element
editor.setFontName(font)           // Set font family
editor.setFontSize(size)           // Set font size
editor.setTextColor(color)         // Set text color
editor.setBackgroundColor(color)   // Set background color
editor.createList(type)            // Create list
editor.setAlignment(align)         // Set text alignment
editor.removeFormat()              // Clear formatting
```

### Insert Methods
```javascript
editor.insertHTML(html)            // Insert HTML at cursor
editor.insertText(text)            // Insert plain text
editor.insertImage(src, alt)       // Insert image
editor.insertLink(url, text)       // Insert link
editor.insertHorizontalRule()      // Insert HR
```

### State Methods
```javascript
editor.focus()                 // Focus editor
editor.blur()                  // Blur editor
editor.hasFocus()              // Check focus state
editor.enable()                // Enable editing
editor.disable()               // Disable editing
editor.isEnabled()             // Check enabled state
editor.isDirtyCheck()          // Check for unsaved changes
editor.markClean()             // Mark as saved
```

### History Methods
```javascript
editor.undo()                  // Undo last action
editor.redo()                  // Redo last undo
editor.canUndo()               // Check if can undo
editor.canRedo()               // Check if can redo
```

### Utility Methods
```javascript
editor.getWordCount()          // Get word count
editor.getCharCount()          // Get character count
editor.getSelectedText()       // Get selected text
editor.toggleFullscreen()      // Toggle fullscreen
editor.updateConfig(config)    // Update configuration
editor.destroy()               // Destroy editor instance
```

## Keyboard Shortcuts

| Shortcut       | Action        |
| -------------- | ------------- |
| Ctrl/Cmd + B   | Bold          |
| Ctrl/Cmd + I   | Italic        |
| Ctrl/Cmd + U   | Underline     |
| Ctrl/Cmd + Z   | Undo          |
| Ctrl/Cmd + Y   | Redo          |
| Ctrl/Cmd + K   | Insert Link   |
| Ctrl/Cmd + L   | Align Left    |
| Ctrl/Cmd + E   | Center        |
| Ctrl/Cmd + R   | Align Right   |
| Ctrl/Cmd + J   | Justify       |
| Tab (in table) | Next cell     |
| Shift + Tab    | Previous cell |

## Table Editing

Tables support:
- Click to edit any cell
- Tab/Shift+Tab for cell navigation
- Arrow keys for row navigation
- Auto-create new row with Tab at last cell
- Add/remove rows and columns via dropdown
- Delete entire table

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License

## Contributing

Contributions welcome! Please follow the existing code style:
- Tab indentation
- OOP principles
- JSDoc comments
- Bootstrap 5.3 integration