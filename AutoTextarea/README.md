# AutoTextarea

Automatically adjusts textarea height based on content for Bootstrap 5.3.

## Features

- Automatic height adjustment as user types
- Smooth animation transitions
- Configurable min/max height constraints
- Bootstrap 5.3 integration
- Dark mode support
- Customizable padding and line height
- Scroll threshold management

## Configuration Options

All options can be set via JSON object passed to the constructor:

```javascript
const autoTextarea = new AutoTextarea('.my-textarea', {
	minHeight: 100,
	maxHeight: 300,
	padding: 12,
	lineHeight: 1.5,
	borderWidth: 1,
	animationSpeed: 200,
	scrollThreshold: 0.8
});
```

### Option Keys and Values

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minHeight` | Number | `60` | Minimum height in pixels |
| `maxHeight` | Number | `400` | Maximum height before scrolling appears |
| `padding` | Number | `12` | Custom padding adjustments in pixels |
| `lineHeight` | Number | `1.5` | Line height multiplier |
| `borderWidth` | Number | `1` | Border thickness consideration in pixels |
| `animationSpeed` | Number | `150` | Resize animation duration in milliseconds |
| `scrollThreshold` | Number | `0.9` | Ratio (0-1) when to show scrollbar vs expand |
| `enableAnimation` | Boolean | `true` | Enable/disable height animation |
| `autoFocus` | Boolean | `false` | Auto focus textarea on initialization |
| `placeholder` | String | `null` | Override placeholder text |
| `maxLength` | Number | `null` | Maximum character length |
| `onResize` | Function | `null` | Callback function on height change |
| `onMaxHeight` | Function | `null` | Callback when max height reached |

## Usage

### Basic Usage
```javascript
// Initialize with default options
const autoTextarea = new AutoTextarea('#my-textarea');
```

### Advanced Configuration
```javascript
const autoTextarea = new AutoTextarea('.auto-textarea', {
	minHeight: 80,
	maxHeight: 250,
	padding: 16,
	lineHeight: 1.6,
	animationSpeed: 200,
	scrollThreshold: 0.85,
	onResize: (height) => console.log(`New height: ${height}px`),
	onMaxHeight: () => console.log('Maximum height reached')
});
```

### Multiple Textareas
```javascript
// Initialize all textareas with class 'auto-resize'
document.querySelectorAll('.auto-resize').forEach(textarea => {
	new AutoTextarea(textarea, {
		minHeight: 60,
		maxHeight: 300
	});
});
```

## Methods

- `resize()` - Manually trigger resize calculation
- `setMinHeight(height)` - Update minimum height
- `setMaxHeight(height)` - Update maximum height
- `destroy()` - Remove event listeners and restore original state
- `getHeight()` - Get current calculated height
- `reset()` - Reset to minimum height and clear content

## Events

The component triggers custom events:

- `autotextarea:resize` - Fired when height changes
- `autotextarea:maxheight` - Fired when max height is reached
- `autotextarea:minheight` - Fired when content returns to min height

## Browser Support

- Modern browsers supporting ES6 classes
- CSS custom properties (CSS variables)
- ResizeObserver API (with fallback)