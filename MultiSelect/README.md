# MultiSelect Component

Enhanced select component for Bootstrap 5.3 with search, tags, and grouping capabilities.

## Features

- **Searchable dropdown** with real-time filtering
- **Multiple selections** with tag display
- **Option grouping** by categories
- **Customizable rendering** for options and tags
- **Selection limits** and sorting
- **Bootstrap 5.3 integration** with dark mode support

## Options

### Configuration Object

```javascript
const options = {
	searchable: true,           // Enable search functionality
	maxSelections: 0,           // Maximum selections (0 = unlimited)
	placeholder: 'Select items...', // Placeholder text
	closeOnSelect: false,       // Close dropdown after each selection
	showTags: true,             // Display selected items as tags
	groupBy: null,              // Property to group options by
	customRenderer: null,       // Custom option display function
	sortSelected: false,        // Sort selected items alphabetically
	allowClear: true,           // Show clear all button
	searchPlaceholder: 'Search...', // Search input placeholder
	noResultsText: 'No results found', // Text when no search results
	maxTagsDisplay: 0,          // Max tags to show (0 = show all)
	tagTemplate: null,          // Custom tag HTML template
	optionTemplate: null,       // Custom option HTML template
	groupTemplate: null,        // Custom group header template
	disabled: false,            // Disable the component
	required: false,            // Mark as required field
	size: 'default',            // Size: 'sm', 'default', 'lg'
	dropdownClass: '',          // Additional CSS classes for dropdown
	containerClass: '',         // Additional CSS classes for container
	animation: true,            // Enable animations
	zIndex: 1050               // Z-index for dropdown
};
```

### Option Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `searchable` | boolean | `true` | Enable search functionality |
| `maxSelections` | number | `0` | Maximum number of selections (0 = unlimited) |
| `placeholder` | string | `'Select items...'` | Placeholder text for the component |
| `closeOnSelect` | boolean | `false` | Close dropdown after each selection |
| `showTags` | boolean | `true` | Display selected items as removable tags |
| `groupBy` | string\|null | `null` | Property name to group options by |
| `customRenderer` | function\|null | `null` | Custom function to render options |
| `sortSelected` | boolean | `false` | Sort selected items alphabetically |
| `allowClear` | boolean | `true` | Show clear all selections button |
| `searchPlaceholder` | string | `'Search...'` | Placeholder for search input |
| `noResultsText` | string | `'No results found'` | Message when search has no results |
| `maxTagsDisplay` | number | `0` | Maximum tags to display (0 = show all) |
| `tagTemplate` | function\|null | `null` | Custom HTML template for tags |
| `optionTemplate` | function\|null | `null` | Custom HTML template for options |
| `groupTemplate` | function\|null | `null` | Custom HTML template for group headers |
| `disabled` | boolean | `false` | Disable the entire component |
| `required` | boolean | `false` | Mark field as required for validation |
| `size` | string | `'default'` | Component size: 'sm', 'default', 'lg' |
| `dropdownClass` | string | `''` | Additional CSS classes for dropdown |
| `containerClass` | string | `''` | Additional CSS classes for main container |
| `animation` | boolean | `true` | Enable show/hide animations |
| `zIndex` | number | `1050` | Z-index value for dropdown positioning |

## Data Format

### Basic Options Array

```javascript
const data = [
	{ value: '1', text: 'Option 1' },
	{ value: '2', text: 'Option 2' },
	{ value: '3', text: 'Option 3' }
];
```

### Grouped Options

```javascript
const data = [
	{ value: '1', text: 'Apple', group: 'Fruits' },
	{ value: '2', text: 'Banana', group: 'Fruits' },
	{ value: '3', text: 'Carrot', group: 'Vegetables' },
	{ value: '4', text: 'Broccoli', group: 'Vegetables' }
];
```

### Rich Options with Custom Properties

```javascript
const data = [
	{
		value: '1',
		text: 'John Doe',
		email: 'john@example.com',
		avatar: 'path/to/avatar.jpg',
		group: 'Developers'
	}
];
```

## Usage Examples

### Basic Usage

```javascript
const multiSelect = new MultiSelect('#my-select', {
	searchable: true,
	placeholder: 'Choose options...'
});
```

### Advanced Configuration

```javascript
const multiSelect = new MultiSelect('#advanced-select', {
	searchable: true,
	maxSelections: 5,
	showTags: true,
	groupBy: 'category',
	sortSelected: true,
	customRenderer: (option) => {
		return `<div class="d-flex align-items-center">
			<img src="${option.avatar}" class="me-2" width="20" height="20">
			<span>${option.text}</span>
		</div>`;
	}
});
```

### With Custom Templates

```javascript
const multiSelect = new MultiSelect('#templated-select', {
	tagTemplate: (option) => {
		return `<span class="badge bg-primary me-1">
			${option.text} <button type="button" class="btn-close btn-close-white ms-1" data-remove="${option.value}"></button>
		</span>`;
	},
	optionTemplate: (option) => {
		return `<div class="dropdown-item-custom">
			<i class="bi bi-${option.icon}"></i>
			<strong>${option.text}</strong>
			<small class="text-muted">${option.description}</small>
		</div>`;
	}
});
```

## Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `setValue(values)` | `Array` | Set selected values programmatically |
| `getValue()` | - | Get array of currently selected values |
| `getSelected()` | - | Get array of selected option objects |
| `addOption(option)` | `Object` | Add new option to the list |
| `removeOption(value)` | `String` | Remove option by value |
| `clear()` | - | Clear all selections |
| `enable()` | - | Enable the component |
| `disable()` | - | Disable the component |
| `refresh()` | - | Refresh the component display |
| `destroy()` | - | Remove component and cleanup |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `multiselect:change` | `{values, selected}` | Fired when selection changes |
| `multiselect:select` | `{value, option}` | Fired when item is selected |
| `multiselect:deselect` | `{value, option}` | Fired when item is deselected |
| `multiselect:clear` | `{}` | Fired when all selections are cleared |
| `multiselect:search` | `{query}` | Fired when search query changes |
| `multiselect:open` | `{}` | Fired when dropdown opens |
| `multiselect:close` | `{}` | Fired when dropdown closes |

## CSS Classes

The component uses the following CSS classes that can be styled:

- `.multiselect-container` - Main container
- `.multiselect-selection` - Selection area with tags
- `.multiselect-tag` - Individual selected tag
- `.multiselect-dropdown` - Dropdown menu
- `.multiselect-search` - Search input container
- `.multiselect-option` - Individual option
- `.multiselect-group` - Option group header
- `.multiselect-no-results` - No results message

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Dependencies

- Bootstrap 5.3+ (CSS framework)
- No additional JavaScript dependencies