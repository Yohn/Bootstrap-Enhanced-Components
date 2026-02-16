# HTML Table Enhanced

A powerful, lightweight table enhancement library for Bootstrap 5.3.8 that works with pre-built HTML tables. Unlike traditional data table libraries that require JSON data, this library enhances existing HTML tables with sorting, filtering, pagination, and column visibility - all while preserving your carefully crafted HTML structure including form elements, buttons, links, and custom markup.

## Features

- ✅ **Works with Existing HTML** - No need to convert your tables to JSON
- ✅ **Preserves Nested Elements** - Form inputs, buttons, links, and custom HTML remain intact
- ✅ **Smart Value Extraction** - Automatically extracts values from inputs, selects, checkboxes, and text content
- ✅ **Column Sorting** - ASC/DESC sorting with support for strings, numbers, and dates
- ✅ **Global Search** - Search across all columns simultaneously
- ✅ **Column-Specific Filtering** - Text inputs, number inputs, date pickers, and select dropdowns
- ✅ **Pagination** - Navigate large datasets with customizable page sizes
- ✅ **Column Visibility Toggle** - Show/hide columns via dropdown menu
- ✅ **Dynamic Row Management** - Add and remove rows programmatically
- ✅ **Event System** - Hook into all table actions with custom events
- ✅ **Vanilla JavaScript** - No jQuery or other dependencies
- ✅ **Bootstrap 5.3.8** - Modern, responsive design

## Installation

### Via NPM (when published)
```bash
npm install html-table-enhanced
```

### Manual Installation
Include the following files in your project:
- `HtmlTable.js`
- Bootstrap 5.3.8 (CSS and JS)
- Bootstrap Icons

## Quick Start

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
	<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
</head>
<body>
	<input id="globalSearch" type="text" class="form-control" placeholder="Search...">
	<div id="columnVisibilityToggle"></div>

	<table id="htmlTable" class="table">
		<thead>
			<tr>
				<th data-key="id" data-sort-type="number" data-search-type="false">ID</th>
				<th data-key="name" data-sort-type="string" data-search-type="text">Name</th>
				<th data-key="email" data-sort-type="string" data-search-type="text">Email</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>001</td>
				<td>John Doe</td>
				<td><input type="text" value="john@example.com"></td>
			</tr>
			<!-- More rows... -->
		</tbody>
	</table>

	<ul id="pagination" class="pagination"></ul>

	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
	<script src="HtmlTable.js"></script>
	<script>
		const table = new HtmlTable({
			container: '#htmlTable',
			globalSearch: '#globalSearch',
			pagination: '#pagination',
			columnVisibilityToggle: '#columnVisibilityToggle'
		});
	</script>
</body>
</html>
```

## Configuration Options

All options are passed to the `HtmlTable` constructor as an object:

```javascript
const table = new HtmlTable({
	// Your options here
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | String | `'#htmlTable'` | CSS selector for the table element |
| `globalSearch` | String | `'#globalSearch'` | CSS selector for the global search input |
| `pagination` | String | `'#pagination'` | CSS selector for the pagination container |
| `rowsPerPageSelect` | String | `'#rowsPerPageSelect'` | CSS selector for rows per page dropdown |
| `columnVisibilityToggle` | String | `'#columnVisibilityToggle'` | CSS selector for column visibility toggle container |
| `foundEntriesContainer` | String | `null` | CSS selector for element to display entry count |
| `rowsPerPage` | Number | `10` | Number of rows to display per page |
| `rowsPerPageOptions` | Array | `[5, 10, 25, 50, 100]` | Available options for rows per page dropdown |
| `foundEntriesText` | String | `'XX Entries Found'` | Text template for total entries (XX is replaced with count) |
| `foundSearchedText` | String | `'XX of XX Entries Found'` | Text template for filtered entries (first XX = filtered, second XX = total) |

## HTML Table Structure

### Basic Table Structure
```html
<table id="htmlTable" class="table">
	<thead>
		<tr>
			<th data-key="column1" data-sort-type="string" data-search-type="text">Column 1</th>
			<th data-key="column2" data-sort-type="number" data-search-type="number">Column 2</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Value 1</td>
			<td>123</td>
		</tr>
	</tbody>
</table>
```

### Column Configuration via Data Attributes

Each `<th>` element in the `<thead>` can have the following data attributes:

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-key` | String | `col_{index}` | Unique identifier for the column |
| `data-sortable` | `'true'` / `'false'` | `'true'` | Whether the column can be sorted |
| `data-sort-type` | `'string'` / `'number'` / `'date'` | `'string'` | Type of sorting to apply |
| `data-search-type` | `'text'` / `'number'` / `'date'` / `'select'` / `'false'` | `'text'` | Type of search input in footer |
| `data-visible` | `'true'` / `'false'` | `'true'` | Initial visibility of the column |

### Examples

#### String Column (Default)
```html
<th data-key="name" data-sort-type="string" data-search-type="text">Name</th>
```

#### Number Column
```html
<th data-key="age" data-sort-type="number" data-search-type="number">Age</th>
```

#### Date Column
```html
<th data-key="joinDate" data-sort-type="date" data-search-type="date">Join Date</th>
```

#### Select Dropdown Filter
```html
<th data-key="status" data-sort-type="string" data-search-type="select">Status</th>
```
*Note: The select options are automatically populated from unique values in the column*

#### Non-Sortable, Non-Searchable Column
```html
<th data-key="actions" data-sortable="false" data-search-type="false">Actions</th>
```

#### Hidden by Default Column
```html
<th data-key="internalId" data-visible="false">Internal ID</th>
```

## Working with Form Elements

The library automatically extracts values from form elements in table cells:

### Text Inputs
```html
<td>
	<input type="text" class="form-control" value="john@example.com">
</td>
```
- **Search Value**: Input's current value
- **Sort Value**: Input's current value

### Checkboxes
```html
<td>
	<input type="checkbox" class="form-check-input" checked>
</td>
```
- **Search Value**: "checked" or "unchecked"
- **Sort Value**: 1 (checked) or 0 (unchecked)

### Select Dropdowns
```html
<td>
	<select class="form-select">
		<option value="active" selected>Active</option>
		<option value="pending">Pending</option>
		<option value="inactive">Inactive</option>
	</select>
</td>
```
- **Search Value**: Selected option's text content ("Active")
- **Sort Value**: Selected option's value ("active")

### Number Inputs
```html
<td>
	<input type="number" class="form-control" value="25">
</td>
```
- **Search Value**: Input's current value
- **Sort Value**: Input's current value (numeric)

### Date Inputs
```html
<td>
	<input type="date" class="form-control" value="2023-01-15">
</td>
```
- **Search Value**: Input's current value
- **Sort Value**: Input's current value

### Textareas
```html
<td>
	<textarea class="form-control">Some long text...</textarea>
</td>
```
- **Search Value**: Textarea's current value
- **Sort Value**: Textarea's current value

### Plain Text
```html
<td>Plain text content</td>
```
- **Search Value**: Text content
- **Sort Value**: Text content

### Nested HTML
```html
<td>
	<a href="#">Click here</a>
	<span class="badge">New</span>
</td>
```
- **Search Value**: Combined text content ("Click here New")
- **Sort Value**: Combined text content

## Required HTML Elements

### Pagination Container
```html
<ul id="pagination" class="pagination"></ul>
```

### Global Search Input
```html
<input id="globalSearch" type="text" class="form-control" placeholder="Search...">
```

### Rows Per Page Select
```html
<select id="rowsPerPageSelect" class="form-select">
	<option value="5">5</option>
	<option value="10">10</option>
	<option value="25">25</option>
	<option value="50">50</option>
</select>
```

### Column Visibility Toggle Container
```html
<div id="columnVisibilityToggle"></div>
```
*The dropdown menu is automatically generated by the library*

### Found Entries Display (Optional)
```html
<span id="recordCount"></span>
```
This element will automatically display:
- `"XX Entries Found"` when no filters are applied
- `"XX of XX Entries Found"` when filters are active

## Public API Methods

### `addRow(rowElement)`
Add a new row to the table dynamically.

```javascript
const newRow = document.createElement('tr');
newRow.innerHTML = `
	<td>013</td>
	<td>New User</td>
	<td><input type="text" value="new@example.com"></td>
`;
table.addRow(newRow);
```

### `removeRow(rowIndex)`
Remove a row by its index in the data array.

```javascript
table.removeRow(5); // Remove the 6th row (0-indexed)
```

### `refresh()`
Re-parse the table structure and data from the DOM.

```javascript
table.refresh();
```

This is useful if you've manually modified the table HTML outside of the library's control.

## Events

HtmlTable emits custom events following Bootstrap's naming convention. All events are namespaced with `.yo.htmltable` and are fired on the table container element.

### Event Naming Pattern

Events follow Bootstrap's infinitive/past participle pattern:
- **Infinitive events** (e.g., `sort`) - Fire at the start of an action and support `preventDefault()`
- **Past participle events** (e.g., `sorted`) - Fire after the action completes

### Available Events

| Event Name | Cancelable | When Fired | Event Detail Properties |
|------------|------------|------------|------------------------|
| `load.yo.htmltable` | No | After table data is parsed | `data` - Array of parsed data |
| `render.yo.htmltable` | Yes | Before table renders | `which` - 'all' or 'rows' |
| `rendered.yo.htmltable` | No | After table renders | `which` - 'all' or 'rows' |
| `rowrender.yo.htmltable` | No | When each row is rendered | `row` - Row data, `rowIndex` - Row index, `element` - TR element |
| `rowclick.yo.htmltable` | No | When a row is clicked | `row` - Row data, `rowIndex` - Row index, `element` - TR element, `originalEvent` - Click event |
| `sort.yo.htmltable` | Yes | Before sorting is applied | `column` - Column key, `columnIndex` - Column index, `oldColumn` - Previous column, `oldOrder` - Previous order, `newOrder` - New order |
| `sorted.yo.htmltable` | No | After sorting is complete | `column` - Column key, `columnIndex` - Column index, `order` - Sort order ('asc' or 'desc') |
| `filter.yo.htmltable` | Yes | Before filtering is applied | `filterType` - 'global' or 'column', `column` - Column key (if column filter), `value` - Filter value, `searchType` - Search type, `oldData` - Previous filtered data |
| `filtered.yo.htmltable` | No | After filtering is complete | `filterType` - 'global' or 'column', `column` - Column key (if column filter), `value` - Filter value, `resultCount` - Number of results |
| `pagechange.yo.htmltable` | Yes | Before page changes | `oldPage` - Current page, `newPage` - Target page |
| `pagechanged.yo.htmltable` | No | After page changes | `oldPage` - Previous page, `newPage` - Current page |
| `rowsperpage.yo.htmltable` | Yes | Before rows per page changes | `oldValue` - Current value, `newValue` - Target value |
| `rowsperpagechanged.yo.htmltable` | No | After rows per page changes | `oldValue` - Previous value, `newValue` - Current value |
| `columnvisibility.yo.htmltable` | Yes | Before column visibility changes | `columnIndex` - Column index, `hidden` - Will be hidden (boolean) |
| `columnvisibilitychanged.yo.htmltable` | No | After column visibility changes | `columnIndex` - Column index, `hidden` - Is hidden (boolean) |
| `rowadded.yo.htmltable` | No | After a row is added | `row` - Added row data |
| `rowremoved.yo.htmltable` | No | After a row is removed | `row` - Removed row data |
| `refreshed.yo.htmltable` | No | After table is refreshed | None |

### Event Usage Examples

#### Basic Event Listener
```javascript
const tableElement = document.querySelector('#htmlTable');

tableElement.addEventListener('sorted.yo.htmltable', function(e) {
	console.log('Table sorted by:', e.detail.column, e.detail.order);
});
```

#### Preventing Actions with preventDefault()
```javascript
// Prevent sorting on a specific column
tableElement.addEventListener('sort.yo.htmltable', function(e) {
	if (e.detail.column === 'id') {
		alert('Cannot sort by ID');
		e.preventDefault(); // Cancels the sort
	}
});
```

#### Tracking User Actions
```javascript
tableElement.addEventListener('filtered.yo.htmltable', function(e) {
	console.log('Filter applied:', e.detail.filterType, 'Results:', e.detail.resultCount);
});

tableElement.addEventListener('rowclick.yo.htmltable', function(e) {
	console.log('User clicked on:', e.detail.row);
});
```

#### Custom Row Rendering
```javascript
tableElement.addEventListener('rowrender.yo.htmltable', function(e) {
	// Add custom classes based on data
	const status = e.detail.row.status?.value;
	if (status === 'inactive') {
		e.detail.element.classList.add('table-danger');
	}
});
```

## Styling

### Required Styles

Add these styles to your CSS for proper sort icon functionality:

```css
th.sortable {
	cursor: pointer;
	user-select: none;
	white-space: nowrap;
}

th.sortable:hover {
	background-color: rgba(var(--bs-emphasis-color-rgb), 0.05);
}

th.sortable .sort-icon {
	opacity: 0.5;
	font-size: 0.85em;
	display: inline-block;
}

th.sortable:hover .sort-icon {
	opacity: 1;
}

th.sortable .sort-icon i.bi-arrow-up,
th.sortable .sort-icon i.bi-arrow-down {
	opacity: 1;
	color: var(--bs-primary);
}
```

### Optional Styles

```css
/* Vertically center table cells */
.table td {
	vertical-align: middle;
}

/* Smaller form controls in table */
.table .form-control-sm,
.table .form-select-sm {
	font-size: 0.875rem;
	padding: 0.25rem 0.5rem;
}
```

## Complete Example

See `Example.html` for a fully working example demonstrating:
- All column types (string, number, date)
- All search types (text, number, date, select)
- Form elements (inputs, selects, checkboxes)
- Action buttons with event handlers
- Dynamic row addition
- Event listeners
- Column visibility toggle

## Event Listener Preservation

**Important**: Event listeners attached via `addEventListener` cannot be automatically preserved when rows are re-rendered. There are two recommended approaches:

### 1. Event Delegation (Recommended)
Attach event listeners to the table container instead of individual elements:

```javascript
document.querySelector('#htmlTable').addEventListener('click', function(e) {
	if (e.target.matches('.btn-primary')) {
		const row = e.target.closest('tr');
		// Handle edit button click
	}
});
```

### 2. Re-attach After Render
Listen for the `rowrender` event and re-attach listeners:

```javascript
tableElement.addEventListener('rowrender.yo.htmltable', function(e) {
	const editBtn = e.detail.element.querySelector('.btn-primary');
	if (editBtn) {
		editBtn.addEventListener('click', function() {
			// Handle edit
		});
	}
});
```

### 3. Inline Handlers (Works Automatically)
Inline `onclick` attributes are preserved:

```html
<button onclick="editUser(123)">Edit</button>
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- Bootstrap 5.3.8
- Bootstrap Icons 1.11.3

## License

MIT License - See LICENSE file for details

## Author

Created based on the BS5-DataTables-without-jQuery project

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the GitHub Issues page.
