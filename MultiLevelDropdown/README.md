# MultiLevelDropdown

A Bootstrap 5.3 compatible multi-level dropdown component with advanced positioning and multi-column support.

## Features

- **Multi-level submenus** - Unlimited nesting levels
- **Smart positioning** - Auto-detects viewport boundaries
- **Multi-column layouts** - Configurable column counts
- **Responsive design** - Adapts to all screen sizes
- **Touch-friendly** - Works on mobile devices
- **Keyboard accessible** - Full ARIA support

## Installation

Include the required files after Bootstrap 5.3:

```html
<link href="scss/multilevel-dropdown.css" rel="stylesheet">
<script src="js/MultiLevelDropdown.js"></script>
```

## Basic Usage

```html
<div class="dropdown">
	<button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
		Multi-Level Menu
	</button>
	<ul class="dropdown-menu multilevel-dropdown">
		<li><a class="dropdown-item" href="#">Level 1 Item</a></li>
		<li class="dropdown-submenu">
			<a class="dropdown-item dropdown-toggle" href="#">Level 1 with Submenu</a>
			<ul class="dropdown-menu">
				<li><a class="dropdown-item" href="#">Level 2 Item</a></li>
				<li class="dropdown-submenu">
					<a class="dropdown-item dropdown-toggle" href="#">Level 2 with Submenu</a>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" href="#">Level 3 Item</a></li>
					</ul>
				</li>
			</ul>
		</li>
	</ul>
</div>
```

## Configuration Options

All options can be set via JSON object:

```javascript
const dropdown = new MultiLevelDropdown({
	selector: '.multilevel-dropdown',
	direction: 'auto', // 'auto', 'left', 'right'
	showOnHover: true,
	hideDelay: 300,
	columns: 1,
	columnBreakpoint: 'md',
	maxWidth: '300px',
	zIndexBase: 1050,
	animations: {
		enabled: true,
		duration: 200,
		easing: 'ease-out'
	},
	responsive: {
		enabled: true,
		collapseBreakpoint: 'lg'
	},
	accessibility: {
		enabled: true,
		announceChanges: true
	},
	callbacks: {
		onShow: null,
		onHide: null,
		onItemClick: null
	}
});
```

### Option Details

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `selector` | string | '.multilevel-dropdown' | CSS selector for dropdown menus |
| `direction` | string | 'auto' | Submenu direction: 'auto', 'left', 'right' |
| `showOnHover` | boolean | true | Show submenus on hover |
| `hideDelay` | number | 300 | Delay before hiding submenu (ms) |
| `columns` | number | 1 | Number of columns for submenu items |
| `columnBreakpoint` | string | 'md' | Bootstrap breakpoint for column layout |
| `maxWidth` | string | '300px' | Maximum width for dropdown menus |
| `zIndexBase` | number | 1050 | Base z-index for layered menus |
| `animations.enabled` | boolean | true | Enable/disable animations |
| `animations.duration` | number | 200 | Animation duration (ms) |
| `animations.easing` | string | 'ease-out' | CSS easing function |
| `responsive.enabled` | boolean | true | Enable responsive behavior |
| `responsive.collapseBreakpoint` | string | 'lg' | Breakpoint to collapse to mobile menu |
| `accessibility.enabled` | boolean | true | Enable accessibility features |
| `accessibility.announceChanges` | boolean | true | Announce submenu changes to screen readers |

## CSS Classes

### Positioning Classes
- `.dropdown-left` - Force submenu to open left
- `.dropdown-right` - Force submenu to open right

### Column Classes
- `.dropdown-columns-2` - 2-column layout
- `.dropdown-columns-3` - 3-column layout
- `.dropdown-columns-4` - 4-column layout

### State Classes (Applied automatically)
- `.submenu-open` - Applied to active submenu parent
- `.submenu-left` - Applied when submenu opens left
- `.submenu-right` - Applied when submenu opens right

## Examples

### Multi-Column Submenu
```html
<li class="dropdown-submenu">
	<a class="dropdown-item dropdown-toggle" href="#">Products</a>
	<ul class="dropdown-menu dropdown-columns-3">
		<li><a class="dropdown-item" href="#">Web Design</a></li>
		<li><a class="dropdown-item" href="#">Mobile Apps</a></li>
		<li><a class="dropdown-item" href="#">E-commerce</a></li>
		<li><a class="dropdown-item" href="#">SEO Services</a></li>
		<li><a class="dropdown-item" href="#">Hosting</a></li>
		<li><a class="dropdown-item" href="#">Support</a></li>
	</ul>
</li>
```

### Forced Left/Right Positioning
```html
<li class="dropdown-submenu dropdown-left">
	<a class="dropdown-item dropdown-toggle" href="#">Left Opening Menu</a>
	<ul class="dropdown-menu">
		<!-- submenu items -->
	</ul>
</li>
```

## Methods

### Public Methods

```javascript
// Initialize
dropdown.init();

// Destroy instance
dropdown.destroy();

// Show submenu programmatically
dropdown.showSubmenu(submenuElement);

// Hide submenu programmatically
dropdown.hideSubmenu(submenuElement);

// Update configuration
dropdown.updateConfig({
	columns: 2,
	showOnHover: false
});

// Get current configuration
const config = dropdown.getConfig();
```

## Events

Custom events are dispatched on the dropdown element:

```javascript
// Listen for submenu show
document.addEventListener('multilevel.show', function(e) {
	console.log('Submenu shown:', e.detail.submenu);
});

// Listen for submenu hide
document.addEventListener('multilevel.hide', function(e) {
	console.log('Submenu hidden:', e.detail.submenu);
});

// Listen for item clicks
document.addEventListener('multilevel.itemClick', function(e) {
	console.log('Item clicked:', e.detail.item);
});
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## Dependencies

- Bootstrap 5.3.x
- No additional JavaScript libraries required

## License

MIT License