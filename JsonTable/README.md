# BS5-DataTables-without-jQuery

A simple, lightweight datatables implementation for Bootstrap 5.3.* that includes searching, column-specific searching, column sorting, JSON data loading, automatic table building, pagination, row editing, and more - all in less than 600 lines of vanilla JavaScript!

## Features

- ✅ **Global Search** - Search across all columns simultaneously
- ✅ **Column-Specific Search** - Filter individual columns with text inputs or dropdowns
- ✅ **Column Sorting** - Click column headers to sort ascending/descending
- ✅ **Pagination** - Navigate through large datasets with customizable page sizes
- ✅ **Dynamic Rows Per Page** - Allow users to change how many rows are displayed
- ✅ **Row Editing** - Built-in modal for editing row data
- ✅ **Floating Labels** - Beautiful form inputs with floating labels
- ✅ **Toast Notifications** - Feedback for save operations
- ✅ **Vanilla JavaScript** - No jQuery or other dependencies required
- ✅ **Bootstrap 5.3.8** - Modern, responsive design
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
- Bootstrap 5.3.* (CSS and JS)
- Bootstrap Icons

## Quick Start

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
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

	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
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
| `searchType` | String/Boolean | `'text'` | Type of search input: `'text'`, `'select'`, or `false` to disable |
| `editFieldType` | String/Boolean | `'text'` | Input type for edit modal: `'text'`, `'number'`, `'email'`, `'date'`, `'textarea'`, `'select'`, `'bool'`, or `false` to hide/disable |
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

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- Bootstrap 5.3.8
- Bootstrap Icons 1.11.3
- [@tkrotoff/bootstrap-floating-label](https://github.com/tkrotoff/bootstrap-floating-label)

## Demo

- **[Github Pages Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/JsonTable/Example.html)**
- **[CodePen.io Demo](https://codepen.io/Yohn/pen/VwoJrOd)**

## License

MIT License - See [LICENSE](../LICENSE) file for details

## Author

Created by [Yohn](https://github.com/Yohn)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the [GitHub Issues](https://yohn.github.io/Bootstrap-Enhanced-Components/issues) page.