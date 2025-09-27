# Bootstrap Context Menu

A flexible, feature-rich right-click context menu component for Bootstrap 5.3 with support for submenus, dynamic content, and multiple trigger events.

## Features

- ✅ Right-click, click, and hover trigger events
- ✅ Nested submenu support
- ✅ Dynamic menu items (functions for names, classes, visibility)
- ✅ Conditional rendering (isShown, isEnabled)
- ✅ Font Awesome icon support
- ✅ Multiple positioning options
- ✅ Bootstrap 5.3 dark mode support
- ✅ Element-specific data fetching
- ✅ Dividers and headers

## Installation

Include the required files:

```html
<!-- Bootstrap 5.3 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Font Awesome (optional, for icons) -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

<!-- Context Menu CSS -->
<link href="scss/context-menu.css" rel="stylesheet">

<!-- Context Menu JS -->
<script src="js/ContextMenu.js"></script>
```

## Basic Usage

```javascript
const menu = new ContextMenu('#myElement', {
	menuItems: [
		{
			name: 'Action',
			onClick: function() {
				console.log('Action clicked!');
			}
		},
		{
			name: 'Another action',
			onClick: function() {
				console.log('Another action clicked!');
			}
		}
	]
});
```

## Configuration Options

### Initialization Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `menuSource` | string | `'mouse'` | Menu position source: `'mouse'` or `'element'` |
| `menuPosition` | string | `'belowLeft'` | Menu position: `'aboveLeft'`, `'aboveRight'`, `'belowLeft'`, `'belowRight'` |
| `menuEvent` | string | `'right-click'` | Trigger event: `'click'`, `'right-click'`, `'hover'` |
| `fetchElementData` | function | `null` | Function to fetch element-specific data |
| `menuItems` | array/object | `[]` | Array or object of menu items |

### Menu Item Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | string/function | Menu item text or function returning text |
| `title` | string/function | Title attribute text or function |
| `onClick` | function | Click handler function |
| `iconClass` | string | Font Awesome icon class (e.g., `'fa-pencil'`) |
| `classNames` | string/object/function | Additional CSS classes |
| `isShown` | function | Function to determine if item should be shown |
| `isEnabled` | function | Function to determine if item should be enabled |
| `subMenuItems` | array/object/function | Submenu items |
| `divider` | boolean | Render as divider |
| `header` | string | Render as header |

## Examples

### Basic Menu

```javascript
const menu = new ContextMenu('#demo1', {
	menuItems: [
		{
			name: 'Edit',
			iconClass: 'fa-pencil',
			onClick: function() {
				alert('Edit clicked!');
			}
		},
		{
			divider: true
		},
		{
			name: 'Delete',
			iconClass: 'fa-trash',
			onClick: function() {
				alert('Delete clicked!');
			}
		}
	]
});
```

### Menu with Submenu

```javascript
const menu = new ContextMenu('#demo2', {
	menuItems: [
		{
			name: 'File Operations',
			iconClass: 'fa-folder',
			subMenuItems: [
				{
					name: 'New',
					iconClass: 'fa-plus',
					onClick: function() {
						console.log('New file');
					}
				},
				{
					name: 'Open',
					iconClass: 'fa-folder-open',
					onClick: function() {
						console.log('Open file');
					}
				},
				{
					name: 'Save',
					iconClass: 'fa-save',
					onClick: function() {
						console.log('Save file');
					}
				}
			]
		},
		{
			divider: true
		},
		{
			name: 'Exit',
			iconClass: 'fa-times',
			onClick: function() {
				console.log('Exit');
			}
		}
	]
});
```

### Dynamic Menu with Element Data

```javascript
const rowData = {
	'1': { name: 'John Doe', editable: true, deletable: true },
	'2': { name: 'Jane Smith', editable: false, deletable: true },
	'3': { name: 'Bob Johnson', editable: true, deletable: false }
};

const menu = new ContextMenu('.table-row', {
	fetchElementData: function(element) {
		const rowId = element.dataset.rowId;
		return rowData[rowId];
	},
	menuItems: [
		{
			header: 'Actions'
		},
		{
			name: function(row) {
				return 'Edit ' + row.name;
			},
			iconClass: 'fa-pencil',
			isEnabled: function(row) {
				return row.editable;
			},
			onClick: function(row) {
				console.log('Editing', row.name);
			}
		},
		{
			divider: true
		},
		{
			name: function(row) {
				return 'Delete ' + row.name;
			},
			iconClass: 'fa-trash',
			classNames: 'text-danger',
			isEnabled: function(row) {
				return row.deletable;
			},
			onClick: function(row) {
				console.log('Deleting', row.name);
			}
		}
	]
});
```

### Custom Trigger Events

```javascript
// Click trigger
const clickMenu = new ContextMenu('#clickBtn', {
	menuEvent: 'click',
	menuSource: 'element',
	menuPosition: 'belowLeft',
	menuItems: [/* ... */]
});

// Hover trigger
const hoverMenu = new ContextMenu('#hoverBtn', {
	menuEvent: 'hover',
	menuSource: 'element',
	menuPosition: 'belowRight',
	menuItems: [/* ... */]
});
```

### Conditional Items with Custom Classes

```javascript
const menu = new ContextMenu('.item', {
	fetchElementData: function(element) {
		return {
			id: element.dataset.id,
			isActive: element.dataset.active === 'true'
		};
	},
	menuItems: [
		{
			name: function(data) {
				return data.isActive ? 'Deactivate' : 'Activate';
			},
			iconClass: function(data) {
				return data.isActive ? 'fa-toggle-off' : 'fa-toggle-on';
			},
			classNames: function(data) {
				return {
					'text-success': !data.isActive,
					'text-warning': data.isActive
				};
			},
			onClick: function(data) {
				console.log('Toggle activation for item', data.id);
			}
		},
		{
			divider: true
		},
		{
			name: 'Settings',
			iconClass: 'fa-cog',
			isShown: function(data) {
				// Only show for active items
				return data.isActive;
			},
			onClick: function(data) {
				console.log('Settings for item', data.id);
			}
		}
	]
});
```

## Methods

### destroy()

Remove the context menu instance:

```javascript
menu.destroy();
```

## Dependencies

- Bootstrap 5.3+
- Font Awesome 6+ (optional, for icons)

## Directory Structure

Complete file structure for the Bootstrap 5.3 Context Menu component.

```
ContextMenu/
├── README.md                   # Complete documentation
├── STRUCTURE.md               # This file - directory structure
├── Example.html               # Demo page with all examples
├── js/
│   └── ContextMenu.js        # Core context menu class
├── scss/
│   └── context-menu.scss     # SCSS styles using BS5 variables
├── css/
│   └── context-menu.css      # Compiled CSS (from SCSS)
└── ExampleJS/
    └── demo.js               # Example page scripts only
```

## File Descriptions

### Core Files

**README.md**
- Complete documentation
- All configuration options with descriptions
- Multiple usage examples
- API reference
- Browser compatibility information

**ContextMenu.js** (`js/`)
- Main JavaScript class
- OOP structure with private and public methods
- Handles menu creation, positioning, rendering
- Event management (click, right-click, hover)
- Submenu support
- Dynamic content generation
- Element data fetching

**context-menu.scss** (`scss/`)
- SCSS stylesheet using Bootstrap 5.3 CSS variables
- Submenu styles (Bootstrap 3 compatibility)
- Dark mode support
- Icon spacing
- Disabled item styles
- Configurable variables at top

### Example Files

**Example.html**
- Full demo page
- Bootstrap 5.3.3 dark mode enabled
- Font Awesome 6.5.1 icons
- Multiple demo sections:
  - Basic right-click menu
  - Submenu example
  - Dynamic menu with element data
  - Different trigger events
  - Conditional menu items
- Toast notifications
- Theme toggle functionality

**demo.js** (`ExampleJS/`)
- All JavaScript for example page only
- Toast helper function
- Theme toggle handler
- 5 complete demo implementations
- Shows all features in action

## Dependencies

### Required
- Bootstrap 5.3+ (CSS & JS)

### Optional
- Font Awesome 6+ (for icons)

## Usage Quick Start

1. Include Bootstrap 5.3:
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```

2. Include Font Awesome (optional):
```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
```

3. Include Context Menu:
```html
<link href="css/context-menu.css" rel="stylesheet">
<script src="js/ContextMenu.js"></script>
```

4. Initialize:
```javascript
const menu = new ContextMenu('#myElement', {
	menuItems: [
		{
			name: 'Action',
			onClick: function() {
				console.log('Clicked!');
			}
		}
	]
});
```

## Key Features

✅ **Tab Indented** - All code uses tab indentation
✅ **OOP Structure** - Class-based JavaScript
✅ **Vanilla JS** - No jQuery dependency
✅ **Bootstrap 5.3** - Uses BS5 CSS variables
✅ **Dark Mode** - Full dark mode support
✅ **Submenus** - Nested menu support
✅ **Dynamic Content** - Functions for names, classes, visibility
✅ **Multiple Triggers** - Click, right-click, hover
✅ **Element Data** - Context-aware menu items
✅ **Conditional Rendering** - isShown, isEnabled callbacks
✅ **Custom Styling** - Dynamic class application
✅ **Font Awesome** - Icon support
✅ **Positioning** - Multiple position options

## Customization

### SCSS Variables

Edit `scss/context-menu.scss`:

```scss
$context-menu-z-index: 9999 !default;
$submenu-icon-size: 5px !default;
```

### Class Customization

The component uses Bootstrap 5.3 CSS variables:
- `--bs-border-radius`
- `--bs-border-color`
- `--bs-secondary-bg`
- `--bs-dropdown-link-hover-color`
- `--bs-danger-rgb`
- etc.

Override these in your own CSS for global theming.

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Modern mobile browsers

## License

MIT License