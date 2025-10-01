# BS5-DataTables-without-jQuery

A simple, lightweight datatables implementation for Bootstrap 5.3.3 that includes searching, column-specific searching, column sorting, JSON data loading, automatic table building, pagination, row editing, and more - all in less than 600 lines of vanilla JavaScript!

## Features

- ✅ **Global Search** - Search across all columns simultaneously
- ✅ **Column-Specific Search** - Filter individual columns with text inputs or dropdowns
- ✅ **Column Sorting** - Click column headers to sort ascending/descending
- ✅ **Custom Sort Functions** - Define custom sorting for dates, currency, and other data types
- ✅ **Pagination** - Navigate through large datasets with customizable page sizes
- ✅ **Dynamic Rows Per Page** - Allow users to change how many rows are displayed
- ✅ **Row Editing** - Built-in modal for editing row data
- ✅ **Floating Labels** - Beautiful form inputs with floating labels
- ✅ **Toast Notifications** - Feedback for save operations
- ✅ **Event System** - Hook into all table actions with custom events
- ✅ **Vanilla JavaScript** - No jQuery or other dependencies required
- ✅ **Bootstrap 5.3.3** - Modern, responsive design
- ✅ **JSON Data Loading** - Fetch data from remote endpoints

## Installation

### Via NPM
```bash
npm i --save @skem9/bs5-datatables
```

### Manual Installation
Include the following files in your project:
- `JsonTable.js`
- `floating-labels.css`
- Bootstrap 5.3.3 (CSS and JS)
- Bootstrap Icons

## Quick Start

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
	<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
	<link href="floating-labels.css" rel="stylesheet">
</head>
<body>
	<table id="jsonTable" class="table">
		<thead></thead>
		<tbody></tbody>
		<tfoot></tfoot>
	</table>
	<ul id="pagination" class="pagination"></ul>

	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
	<script src="JsonTable.js"></script>
	<script>
		const table = new JsonTable({
			jsonUrl: 'data.json',
			container: '#jsonTable',
			pagination: '#pagination',
			columns: [
				{ key: 'id', title: 'ID' },
				{ key: 'name', title: 'Name' },
				{ key: 'email', title: 'Email' }
			]
		});
	</script>
</body>
</html>
```

## Configuration Options

### Constructor Options

All options are passed to the `JsonTable` constructor as an object:

```javascript
const table = new JsonTable({
	// Your options here
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `jsonUrl` | String | `''` | URL to fetch JSON data from |
| `rowsPerPage` | Number | `10` | Number of rows to display per page |
| `rowsPerPageOptions` | Array | `[5, 10, 25, 50, 100]` | Available options for rows per page dropdown |
| `container` | String | `'#jsonTable'` | CSS selector for the table element |
| `globalSearch` | String | `'#globalSearch'` | CSS selector for the global search input |
| `pagination` | String | `'#pagination'` | CSS selector for the pagination container |
| `rowsPerPageSelect` | String | `'#rowsPerPageSelect'` | CSS selector for rows per page dropdown |
| `foundEntriesContainer` | String | `null` | CSS selector for element to display entry count |
| `foundEntriesText` | String | `'XX Entries Found'` | Text template for total entries (XX is replaced with count) |
| `foundSearchedText` | String | `'XX of XX Entries Found'` | Text template for filtered entries (first XX = filtered, second XX = total) |
| `columns` | Array | `[]` | Array of column configuration objects (see below) |
| `allowEdit` | Boolean | `false` | Enable row editing functionality |
| `editPlacement` | String | `'start'` | Position of edit button column: `'start'` or `'end'` |
| `editSaveUrl` | String | `''` | URL endpoint for saving edited data (POST request) |
| `editSaveAdditionalData` | Object | `{}` | Additional data to include with save requests |
| `toastWrapper` | String | `''` | CSS selector for toast container (optional) |
| `toastBody` | String | `''` | CSS selector for toast body (optional) |

### Column Configuration

Each column in the `columns` array is an object with the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `key` | String | **Required** | The key name in your JSON data |
| `title` | String | **Required** | Display title for the column header |
| `sortable` | Boolean | `true` | Whether the column can be sorted (set to `false` to disable) |
| `sortValue` | Function | `null` | Function to transform values before sorting (e.g., for dates, currency) |
| `searchType` | String/Boolean | `'text'` | Type of search input: `'text'`, `'select'`, or `false` to disable |
| `editFieldType` | String/Boolean | `'text'` | Input type for edit modal: `'text'`, `'number'`, `'email'`, `'date'`, `'datetime-local'`, `'textarea'`, `'select'`, `'bool'`, or `false` to hide/disable |
| `columnIcon` | String | `null` | Bootstrap icon class for the edit modal input (e.g., `'bi bi-person'`) |
| `options` | Array | `null` | Required when `editFieldType` is `'select'` - array of option values |

### Column Configuration Examples

#### Basic Column
```javascript
{ key: 'id', title: 'ID' }
```

#### Non-Sortable Column
```javascript
{ key: 'actions', title: 'Actions', sortable: false }
```

#### Column with Dropdown Search
```javascript
{ key: 'status', title: 'Status', searchType: 'select' }
```

#### Column Without Search
```javascript
{ key: 'id', title: 'ID', searchType: false }
```

#### Column Not Editable
```javascript
{ key: 'id', title: 'ID', editFieldType: false }
```

#### Column with Icon in Edit Modal
```javascript
{
	key: 'email',
	title: 'Email',
	editFieldType: 'email',
	columnIcon: 'bi bi-envelope'
}
```

#### Select Field in Edit Modal
```javascript
{
	key: 'country',
	title: 'Country',
	editFieldType: 'select',
	options: ['USA', 'Canada', 'Mexico', 'UK'],
	columnIcon: 'bi bi-globe'
}
```

#### Checkbox Field in Edit Modal
```javascript
{
	key: 'active',
	title: 'Active',
	editFieldType: 'bool'
}
```

#### Textarea Field in Edit Modal
```javascript
{
	key: 'description',
	title: 'Description',
	editFieldType: 'textarea'
}
```

#### Date Column with Proper Sorting
```javascript
{
	key: 'createdDate',
	title: 'Created Date',
	searchType: 'text',
	editFieldType: 'date',
	sortValue: (value) => new Date(value).getTime(),
	columnIcon: 'bi bi-calendar'
}
```

#### DateTime Column with Proper Sorting
```javascript
{
	key: 'lastModified',
	title: 'Last Modified',
	searchType: false,
	editFieldType: 'datetime-local',
	sortValue: (value) => new Date(value).getTime(),
	columnIcon: 'bi bi-clock'
}
```

#### Currency Column with Proper Sorting
```javascript
{
	key: 'price',
	title: 'Price',
	searchType: 'text',
	editFieldType: 'number',
	sortValue: (value) => parseFloat(value.replace(/[$,]/g, '')),
	columnIcon: 'bi bi-currency-dollar'
}
```

## Complete Example

```javascript
const table = new JsonTable({
	jsonUrl: 'https://api.example.com/users',
	rowsPerPage: 10,
	rowsPerPageOptions: [5, 10, 25, 50, 100],
	container: '#jsonTable',
	globalSearch: '#globalSearch',
	pagination: '#pagination',
	rowsPerPageSelect: '#rowsPerPageSelect',
	foundEntriesContainer: '#recordCount',
	foundEntriesText: 'Total: XX entries',
	foundSearchedText: 'Showing XX of XX total entries',
	allowEdit: true,
	editPlacement: 'start',
	editSaveUrl: 'https://api.example.com/users/update',
	editSaveAdditionalData: {
		userId: 123,
		timestamp: Date.now()
	},
	columns: [
		{
			key: 'id',
			title: 'ID',
			searchType: false,
			editFieldType: false
		},
		{
			key: 'firstName',
			title: 'First Name',
			searchType: 'text',
			editFieldType: 'text',
			columnIcon: 'bi bi-person'
		},
		{
			key: 'lastName',
			title: 'Last Name',
			searchType: 'text',
			editFieldType: 'text',
			columnIcon: 'bi bi-person'
		},
		{
			key: 'email',
			title: 'Email',
			searchType: 'text',
			editFieldType: 'email',
			columnIcon: 'bi bi-envelope'
		},
		{
			key: 'age',
			title: 'Age',
			searchType: 'select',
			editFieldType: 'number',
			columnIcon: 'bi bi-cake2'
		},
		{
			key: 'country',
			title: 'Country',
			searchType: 'select',
			editFieldType: 'select',
			options: ['USA', 'Canada', 'Mexico', 'UK'],
			columnIcon: 'bi bi-globe'
		},
		{
			key: 'active',
			title: 'Active',
			searchType: false,
			editFieldType: 'bool'
		},
		{
			key: 'bio',
			title: 'Biography',
			searchType: 'text',
			editFieldType: 'textarea'
		}
	]
});
```

## Required HTML Structure

### Basic Table Structure
```html
<table id="jsonTable" class="table table-striped">
	<thead></thead>
	<tbody></tbody>
	<tfoot></tfoot>
</table>
```

### Pagination
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
	<option value="100">100</option>
</select>
```

### Found Entries Display (Optional)
```html
<span id="recordCount"></span>
```

This element will automatically display:
- `"XX Entries Found"` when no filters are applied
- `"XX of XX Entries Found"` when filters are active (filtered count of total count)

### Edit Modal (Required if allowEdit is true)
```html
<div class="modal fade" id="editModal" tabindex="-1">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">Edit Row</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
			</div>
			<div class="modal-body"></div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
				<button type="button" class="btn btn-primary save-edit">Save Changes</button>
			</div>
		</div>
	</div>
</div>
```

### Toast Container (Required if allowEdit is true)
```html
<div id="toastContainer" class="toast-container position-absolute top-50 start-50 translate-middle">
	<div class="toast fade" role="alert">
		<div class="toast-header">
			<strong class="me-auto">Notification</strong>
			<button type="button" class="btn-close" data-bs-dismiss="toast"></button>
		</div>
		<div class="toast-body"></div>
	</div>
</div>
```

## JSON Data Format

Your JSON endpoint should return an array of objects:

```json
[
	{
		"id": 1,
		"firstName": "John",
		"lastName": "Doe",
		"email": "john@example.com",
		"age": 30,
		"country": "USA",
		"active": true,
		"bio": "Software developer"
	},
	{
		"id": 2,
		"firstName": "Jane",
		"lastName": "Smith",
		"email": "jane@example.com",
		"age": 28,
		"country": "Canada",
		"active": true,
		"bio": "Designer"
	}
]
```

## Edit Save Response Format

When saving edited data, your server should respond with JSON:

### Success Response
```json
{
	"status": "success",
	"msg": "Data saved successfully"
}
```

### Error Response
```json
{
	"status": "error",
	"msg": "Failed to save data"
}
```

The `status` field determines the toast color (`success`, `error`, `warning`, `info`, `primary`, `danger`).

## Events

JsonTable emits custom events following Bootstrap's naming convention. All events are namespaced with `.yo.jsontable` and are fired on the table container element.

### Event Naming Pattern

Events follow Bootstrap's infinitive/past participle pattern:
- **Infinitive events** (e.g., `sort`) - Fire at the start of an action and support `preventDefault()`
- **Past participle events** (e.g., `sorted`) - Fire after the action completes

### Available Events

| Event Name | Cancelable | When Fired | Event Detail Properties |
|------------|------------|------------|------------------------|
| `load.yo.jsontable` | No | After JSON data is successfully loaded | `data` - Array of loaded data |
| `loaderror.yo.jsontable` | No | When JSON data fetch fails | `error` - Error object |
| `render.yo.jsontable` | Yes | Before table renders | `which` - 'all' or 'rows' |
| `rendered.yo.jsontable` | No | After table renders | `which` - 'all' or 'rows' |
| `rowrender.yo.jsontable` | No | When each row is rendered | `row` - Row data, `rowIndex` - Row index, `element` - TR element |
| `rowclick.yo.jsontable` | No | When a row is clicked | `row` - Row data, `rowIndex` - Row index, `element` - TR element, `originalEvent` - Click event |
| `sort.yo.jsontable` | Yes | Before sorting is applied | `column` - Column key, `oldColumn` - Previous column, `oldOrder` - Previous order, `newOrder` - New order |
| `sorted.yo.jsontable` | No | After sorting is complete | `column` - Column key, `order` - Sort order ('asc' or 'desc') |
| `filter.yo.jsontable` | Yes | Before filtering is applied | `filterType` - 'global' or 'column', `column` - Column key (if column filter), `value` - Filter value, `oldData` - Previous filtered data |
| `filtered.yo.jsontable` | No | After filtering is complete | `filterType` - 'global' or 'column', `column` - Column key (if column filter), `value` - Filter value, `resultCount` - Number of results |
| `pagechange.yo.jsontable` | Yes | Before page changes | `oldPage` - Current page, `newPage` - Target page |
| `pagechanged.yo.jsontable` | No | After page changes | `oldPage` - Previous page, `newPage` - Current page |
| `rowsperpage.yo.jsontable` | Yes | Before rows per page changes | `oldValue` - Current value, `newValue` - Target value |
| `rowsperpagechanged.yo.jsontable` | No | After rows per page changes | `oldValue` - Previous value, `newValue` - Current value |
| `edit.yo.jsontable` | Yes | Before edit modal opens | `rowData` - Row data, `rowIndex` - Row index |
| `edited.yo.jsontable` | No | After edit modal opens | `rowData` - Row data, `rowIndex` - Row index |
| `save.yo.jsontable` | Yes | Before save request is sent | `rowData` - Original row data, `rowIndex` - Row index, `formData` - Form data, `postData` - Data to be sent |
| `saved.yo.jsontable` | No | After successful save | `rowData` - Updated row data, `rowIndex` - Row index, `response` - Server response |
| `saveerror.yo.jsontable` | No | When save fails | `rowData` - Row data, `rowIndex` - Row index, `error` - Error object |

### Event Usage Examples

#### Basic Event Listener
```javascript
const tableElement = document.querySelector('#jsonTable');

tableElement.addEventListener('sorted.yo.jsontable', function(e) {
	console.log('Table sorted by:', e.detail.column, e.detail.order);
});
```

#### Preventing Actions with preventDefault()
```javascript
// Prevent sorting on a specific column
tableElement.addEventListener('sort.yo.jsontable', function(e) {
	if (e.detail.column === 'ID') {
		alert('Cannot sort by ID');
		e.preventDefault(); // Cancels the sort
	}
});

// Validate before saving
tableElement.addEventListener('save.yo.jsontable', function(e) {
	if (!e.detail.formData.email.includes('@')) {
		alert('Invalid email address');
		e.preventDefault(); // Cancels the save
	}
});
```

#### Tracking User Actions
```javascript
// Analytics tracking
tableElement.addEventListener('filtered.yo.jsontable', function(e) {
	analytics.track('Table Filtered', {
		filterType: e.detail.filterType,
		column: e.detail.column,
		resultCount: e.detail.resultCount
	});
});

tableElement.addEventListener('rowclick.yo.jsontable', function(e) {
	console.log('User clicked on:', e.detail.row);
	// Navigate to detail page, show popup, etc.
});
```

#### Modifying Behavior
```javascript
// Custom loading indicator
tableElement.addEventListener('render.yo.jsontable', function(e) {
	document.querySelector('#loadingSpinner').style.display = 'block';
});

tableElement.addEventListener('rendered.yo.jsontable', function(e) {
	document.querySelector('#loadingSpinner').style.display = 'none';
});

// Custom row rendering
tableElement.addEventListener('rowrender.yo.jsontable', function(e) {
	// Add custom classes based on data
	if (e.detail.row.Age > 65) {
		e.detail.element.classList.add('table-warning');
	}
});
```

#### Error Handling
```javascript
tableElement.addEventListener('loaderror.yo.jsontable', function(e) {
	console.error('Failed to load data:', e.detail.error);
	// Show user-friendly error message
});

tableElement.addEventListener('saveerror.yo.jsontable', function(e) {
	console.error('Save failed:', e.detail.error);
	// Retry logic, show error message, etc.
});
```

### Event Best Practices

1. **Use infinitive events for validation** - Cancel actions before they happen
2. **Use past participle events for side effects** - Update UI, send analytics, etc.
3. **Access data via `event.detail`** - All event data is in the detail property
4. **Call `preventDefault()` to cancel** - Only works on cancelable (infinitive) events
5. **Listen on the table container** - Events bubble up from the container element

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- Bootstrap 5.3.3
- Bootstrap Icons 1.11.3
- [@tkrotoff/bootstrap-floating-label](https://github.com/tkrotoff/bootstrap-floating-label)

## Demo

- **[Github Pages Demo](https://yohn.github.io/BS5-DataTables-without-jQuery/)**
- **[CodePen.io Demo](https://codepen.io/Yohn/pen/VwoJrOd)**

## License

MIT License - See [LICENSE](LICENSE) file for details

## Author

Created by [Yohn](https://github.com/Yohn)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/Yohn/BS5-DataTables-without-jQuery/issues) page.