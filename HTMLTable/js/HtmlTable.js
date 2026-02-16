class HtmlTable {
	constructor(options) {
		this.container = document.querySelector(options.container || '#htmlTable');
		this.globalSearchInput = document.querySelector(options.globalSearch || '#globalSearch');
		this.paginationContainer = document.querySelector(options.pagination || '#pagination');
		this.rowsPerPageSelect = document.querySelector(options.rowsPerPageSelect || '#rowsPerPageSelect');
		this.columnVisibilityToggle = document.querySelector(options.columnVisibilityToggle || '#columnVisibilityToggle');
		this.foundEntriesContainer = options.foundEntriesContainer ? document.querySelector(options.foundEntriesContainer) : null;

		this.rowsPerPage = options.rowsPerPage || 10;
		this.rowsPerPageOptions = options.rowsPerPageOptions || [5, 10, 25, 50, 100];
		this.foundEntriesText = options.foundEntriesText || 'XX Entries Found';
		this.foundSearchedText = options.foundSearchedText || 'XX of XX Entries Found';

		this.data = [];
		this.filteredData = [];
		this.currentPage = 1;
		this.sortColumn = null;
		this.sortOrder = 'asc';
		this.filteredPages = 0;
		this.columns = [];
		this.hiddenColumns = new Set();
		this.columnFilters = {};

		this.init();
	}

	init() {
		this.parseTableStructure();
		this.parseTableData();
		this.setupRowsPerPageSelector();
		this.setupColumnVisibilityToggle();
		this.renderFooter();
		this.renderTable();
		this.addGlobalSearchListener();
	}

	parseTableStructure() {
		const thead = this.container.querySelector('thead');
		if (!thead) {
			console.error('Table must have a <thead> element');
			return;
		}

		const headerRow = thead.querySelector('tr');
		const headers = headerRow.querySelectorAll('th');

		headers.forEach((th, index) => {
			const columnConfig = {
				index: index,
				key: th.dataset.key || `col_${index}`,
				title: th.textContent.trim(),
				sortable: th.dataset.sortable !== 'false',
				sortType: th.dataset.sortType || 'string', // string, number, date
				searchType: th.dataset.searchType || 'text', // text, number, date, select, false
				visible: th.dataset.visible !== 'false'
			};

			this.columns.push(columnConfig);

			// Add sortable functionality
			if (columnConfig.sortable) {
				th.classList.add('sortable');
				th.dataset.column = columnConfig.key;

				// Create wrapper for title and sort icons
				const titleWrapper = document.createElement('span');
				titleWrapper.textContent = columnConfig.title;
				th.innerHTML = '';
				th.appendChild(titleWrapper);

				// Create sort icon container
				const sortIcon = document.createElement('span');
				sortIcon.className = 'sort-icon ms-1';
				sortIcon.innerHTML = '<i class="bi bi-arrow-down-up"></i>';
				th.appendChild(sortIcon);

				th.addEventListener('click', () => this.toggleSort(columnConfig.key, index));
			}

			// Initialize visibility
			if (!columnConfig.visible) {
				this.hiddenColumns.add(index);
			}
		});
	}

	parseTableData() {
		const tbody = this.container.querySelector('tbody');
		if (!tbody) {
			console.error('Table must have a <tbody> element');
			return;
		}

		const rows = tbody.querySelectorAll('tr');

		rows.forEach((row, rowIndex) => {
			const cells = row.querySelectorAll('td');
			const rowData = {
				_rowElement: row.cloneNode(true), // Store original HTML
				_originalIndex: rowIndex,
				_searchableText: [] // For global search
			};

			cells.forEach((cell, cellIndex) => {
				if (cellIndex < this.columns.length) {
					const column = this.columns[cellIndex];
					const cellData = this.extractCellValue(cell);

					rowData[column.key] = cellData;
					rowData._searchableText.push(cellData.searchText);
				}
			});

			this.data.push(rowData);
		});

		this.filteredData = [...this.data];
		this.updateFoundEntries();
		this.triggerEvent('load.yo.htmltable', { data: this.data });
	}

	extractCellValue(cell) {
		let value = '';
		let searchText = '';
		let sortValue = '';

		// Check for form elements
		const input = cell.querySelector('input[type="text"], input[type="number"], input[type="date"], input[type="datetime-local"]');
		const checkbox = cell.querySelector('input[type="checkbox"]');
		const select = cell.querySelector('select');
		const textarea = cell.querySelector('textarea');

		if (input) {
			value = input.value;
			searchText = input.value;
			sortValue = input.value;
		} else if (checkbox) {
			value = checkbox.checked;
			searchText = checkbox.checked ? 'checked' : 'unchecked';
			sortValue = checkbox.checked ? 1 : 0;
		} else if (select) {
			const selectedOption = select.options[select.selectedIndex];
			value = select.value;
			searchText = selectedOption ? selectedOption.textContent.trim() : '';
			sortValue = select.value;
		} else if (textarea) {
			value = textarea.value;
			searchText = textarea.value;
			sortValue = textarea.value;
		} else {
			// Extract visible text content
			value = cell.textContent.trim();
			searchText = cell.textContent.trim();
			sortValue = cell.textContent.trim();
		}

		return {
			value: value,
			searchText: searchText,
			sortValue: sortValue,
			html: cell.innerHTML
		};
	}

	triggerEvent(eventName, detail = {}) {
		const event = new CustomEvent(eventName, {
			detail,
			bubbles: true,
			cancelable: eventName.split('.')[0].match(/^(sort|filter|pagechange|rowsperpage|columnvisibility)$/) !== null
		});
		this.container.dispatchEvent(event);
		return event;
	}

	updateFoundEntries() {
		if (!this.foundEntriesContainer) {
			return;
		}

		const totalEntries = this.data.length;
		const filteredEntries = this.filteredData.length;

		let text = '';

		if (filteredEntries === totalEntries) {
			text = this.foundEntriesText.replace('XX', filteredEntries);
		} else {
			text = this.foundSearchedText
				.replace(/XX/, filteredEntries)
				.replace(/XX/, totalEntries);
		}

		this.foundEntriesContainer.textContent = text;
	}

	setupRowsPerPageSelector() {
		if (this.rowsPerPageSelect) {
			this.rowsPerPageSelect.innerHTML = '';

			this.rowsPerPageOptions.forEach(option => {
				const optionElement = document.createElement('option');
				optionElement.value = option;
				optionElement.textContent = option;
				if (option === this.rowsPerPage) {
					optionElement.selected = true;
				}
				this.rowsPerPageSelect.appendChild(optionElement);
			});

			this.rowsPerPageSelect.addEventListener('change', (e) => {
				const oldValue = this.rowsPerPage;
				const newValue = parseInt(e.target.value, 10);

				const event = this.triggerEvent('rowsperpage.yo.htmltable', {
					oldValue,
					newValue
				});

				if (event.defaultPrevented) {
					return;
				}

				this.rowsPerPage = newValue;
				this.currentPage = 1;
				this.renderTable('rows');

				this.triggerEvent('rowsperpagechanged.yo.htmltable', {
					oldValue,
					newValue
				});
			});
		}
	}

	setupColumnVisibilityToggle() {
		if (!this.columnVisibilityToggle) {
			return;
		}

		// Create dropdown menu
		const dropdown = document.createElement('div');
		dropdown.className = 'dropdown';

		const button = document.createElement('button');
		button.className = 'btn btn-outline-secondary btn-sm';
		button.type = 'button';
		button.dataset.bsToggle = 'dropdown';
		button.setAttribute('aria-expanded', 'false');
		button.innerHTML = '<i class="bi bi-eye"></i> Columns';

		const menu = document.createElement('ul');
		menu.className = 'dropdown-menu';

		this.columns.forEach((column, index) => {
			const li = document.createElement('li');
			const label = document.createElement('label');
			label.className = 'dropdown-item';
			label.style.cursor = 'pointer';

			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.className = 'form-check-input me-2';
			checkbox.checked = !this.hiddenColumns.has(index);
			checkbox.addEventListener('change', () => {
				this.toggleColumnVisibility(index);
			});

			label.appendChild(checkbox);
			label.appendChild(document.createTextNode(column.title));
			li.appendChild(label);
			menu.appendChild(li);
		});

		dropdown.appendChild(button);
		dropdown.appendChild(menu);
		this.columnVisibilityToggle.appendChild(dropdown);
	}

	toggleColumnVisibility(columnIndex) {
		const event = this.triggerEvent('columnvisibility.yo.htmltable', {
			columnIndex,
			hidden: !this.hiddenColumns.has(columnIndex)
		});

		if (event.defaultPrevented) {
			return;
		}

		if (this.hiddenColumns.has(columnIndex)) {
			this.hiddenColumns.delete(columnIndex);
		} else {
			this.hiddenColumns.add(columnIndex);
		}

		this.renderTable();

		this.triggerEvent('columnvisibilitychanged.yo.htmltable', {
			columnIndex,
			hidden: this.hiddenColumns.has(columnIndex)
		});
	}

	renderTable(which = 'all') {
		const event = this.triggerEvent('render.yo.htmltable', { which });

		if (event.defaultPrevented) {
			return;
		}

		if (which === 'all') {
			this.renderHeader();
			this.renderRows();
			this.renderFooter();
			this.renderPagination();
		} else {
			this.renderRows();
			this.renderPagination();
		}

		this.triggerEvent('rendered.yo.htmltable', { which });
	}

	renderHeader() {
		const thead = this.container.querySelector('thead');
		const headerRow = thead.querySelector('tr');
		const headers = headerRow.querySelectorAll('th');

		headers.forEach((th, index) => {
			if (this.hiddenColumns.has(index)) {
				th.style.display = 'none';
			} else {
				th.style.display = '';
			}
		});

		this.updateSortIcons();
	}

	renderFooter() {
		let tfoot = this.container.querySelector('tfoot');

		// Create tfoot if it doesn't exist
		if (!tfoot) {
			tfoot = document.createElement('tfoot');
			this.container.appendChild(tfoot);
		}

		// Clear existing footer
		tfoot.innerHTML = '<tr></tr>';
		const footerRow = tfoot.querySelector('tr');

		this.columns.forEach((column, index) => {
			const td = document.createElement('td');

			if (this.hiddenColumns.has(index)) {
				td.style.display = 'none';
			}

			if (column.searchType === 'select') {
				const select = document.createElement('select');
				select.className = 'form-control form-control-sm';
				select.innerHTML = `<option value="">All ${column.title}</option>`;

				// Get unique values from data
				const uniqueValues = new Set();
				this.data.forEach(row => {
					const cellData = row[column.key];
					if (cellData && cellData.searchText) {
						uniqueValues.add(cellData.searchText);
					}
				});

				Array.from(uniqueValues).sort().forEach(value => {
					const option = document.createElement('option');
					option.textContent = value;
					option.value = value;
					select.appendChild(option);
				});

				select.addEventListener('change', (e) => this.filterColumn(column.key, e.target.value, 'select'));
				td.appendChild(select);
			} else if (column.searchType === 'number') {
				const input = document.createElement('input');
				input.type = 'number';
				input.className = 'form-control form-control-sm';
				input.placeholder = `Search ${column.title}`;
				input.addEventListener('input', (e) => this.filterColumn(column.key, e.target.value, 'number'));
				td.appendChild(input);
			} else if (column.searchType === 'date') {
				const input = document.createElement('input');
				input.type = 'date';
				input.className = 'form-control form-control-sm';
				input.addEventListener('change', (e) => this.filterColumn(column.key, e.target.value, 'date'));
				td.appendChild(input);
			} else if (column.searchType === 'text') {
				const input = document.createElement('input');
				input.type = 'text';
				input.className = 'form-control form-control-sm';
				input.placeholder = `Search ${column.title}`;
				input.addEventListener('input', (e) => this.filterColumn(column.key, e.target.value, 'text'));
				td.appendChild(input);
			} else if (column.searchType === 'false' || column.searchType === false) {
				// No search input for this column
			}

			footerRow.appendChild(td);
		});
	}

	renderRows() {
		const tbody = this.container.querySelector('tbody');
		tbody.innerHTML = '';
		const start = (this.currentPage - 1) * this.rowsPerPage;
		const end = start + this.rowsPerPage;

		let rows = [...this.filteredData];

		// Sorting
		if (this.sortColumn !== null) {
			const columnIndex = this.columns.findIndex(col => col.key === this.sortColumn);
			const column = this.columns[columnIndex];

			rows.sort((a, b) => {
				let aVal = a[this.sortColumn]?.sortValue || '';
				let bVal = b[this.sortColumn]?.sortValue || '';

				// Type-specific sorting
				if (column.sortType === 'number') {
					aVal = parseFloat(aVal) || 0;
					bVal = parseFloat(bVal) || 0;
				} else if (column.sortType === 'date') {
					aVal = new Date(aVal).getTime() || 0;
					bVal = new Date(bVal).getTime() || 0;
				}

				if (this.sortOrder === 'asc') {
					return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
				} else {
					return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
				}
			});
		}

		// Paging
		const totalPages = Math.ceil(rows.length / this.rowsPerPage);
		this.filteredPages = totalPages;

		rows.slice(start, end).forEach((rowData, index) => {
			const tr = rowData._rowElement.cloneNode(true);
			const cells = tr.querySelectorAll('td');

			// Hide columns
			cells.forEach((cell, cellIndex) => {
				if (this.hiddenColumns.has(cellIndex)) {
					cell.style.display = 'none';
				}
			});

			// Trigger row render event
			this.triggerEvent('rowrender.yo.htmltable', {
				row: rowData,
				rowIndex: index,
				element: tr
			});

			// Preserve event listeners by re-attaching them
			this.preserveEventListeners(tr, rowData._rowElement);

			// Add click event listener to row
			tr.addEventListener('click', (e) => {
				this.triggerEvent('rowclick.yo.htmltable', {
					row: rowData,
					rowIndex: index,
					element: tr,
					originalEvent: e
				});
			});

			tbody.appendChild(tr);
		});
	}

	preserveEventListeners(newRow, originalRow) {
		// Get all elements with event listeners in original
		const interactiveElements = originalRow.querySelectorAll('button, a, input, select, textarea');
		const newInteractiveElements = newRow.querySelectorAll('button, a, input, select, textarea');

		interactiveElements.forEach((originalEl, index) => {
			const newEl = newInteractiveElements[index];
			if (newEl) {
				// Copy data attributes
				Array.from(originalEl.attributes).forEach(attr => {
					if (attr.name.startsWith('data-')) {
						newEl.setAttribute(attr.name, attr.value);
					}
				});

				// Note: Event listeners attached via addEventListener cannot be cloned
				// Users should attach events via event delegation or re-initialize after render
			}
		});
	}

	renderPagination() {
		this.paginationContainer.innerHTML = '';
		const totalPages = this.filteredPages;
		const currentPage = this.currentPage;
		const maxVisiblePages = 6;

		if (totalPages <= 1) {
			return;
		}

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				this.renderPageLink(i, currentPage);
			}
		} else {
			let pagesToShow = [];

			pagesToShow.push(1);
			if (totalPages > 1) pagesToShow.push(2);

			const leftRange = Math.max(currentPage - 2, 3);
			const rightRange = Math.min(currentPage + 2, totalPages - 2);

			for (let i = leftRange; i <= rightRange; i++) {
				pagesToShow.push(i);
			}

			if (totalPages > 2) pagesToShow.push(totalPages - 1);
			pagesToShow.push(totalPages);

			for (let i = 0; i < pagesToShow.length; i++) {
				const pageNumber = pagesToShow[i];
				if (i > 0 && pageNumber - pagesToShow[i - 1] > 1) {
					this.renderPaginationGap();
				}
				this.renderPageLink(pageNumber, currentPage);
			}
		}
	}

	renderPageLink(pageNumber, currentPage) {
		const li = document.createElement('li');
		li.className = 'page-item';
		if (pageNumber === currentPage) {
			li.classList.add('active');
		}

		const a = document.createElement('a');
		a.className = 'page-link';
		a.textContent = pageNumber;
		a.href = '#';
		a.addEventListener('click', (e) => {
			e.preventDefault();

			const event = this.triggerEvent('pagechange.yo.htmltable', {
				oldPage: this.currentPage,
				newPage: pageNumber
			});

			if (event.defaultPrevented) {
				return;
			}

			this.currentPage = pageNumber;
			this.renderRows();
			this.renderPagination();

			this.triggerEvent('pagechanged.yo.htmltable', {
				oldPage: currentPage,
				newPage: pageNumber
			});
		});

		li.appendChild(a);
		this.paginationContainer.appendChild(li);
	}

	renderPaginationGap() {
		const li = document.createElement('li');
		li.className = 'page-item disabled';
		const span = document.createElement('span');
		span.className = 'page-link';
		span.textContent = '...';
		li.appendChild(span);
		this.paginationContainer.appendChild(li);
	}

	addGlobalSearchListener() {
		if (this.globalSearchInput) {
			this.globalSearchInput.addEventListener('input', (e) => this.filterGlobal(e.target.value));
		}
	}

	filterGlobal(value) {
		const event = this.triggerEvent('filter.yo.htmltable', {
			filterType: 'global',
			value,
			oldData: this.filteredData
		});

		if (event.defaultPrevented) {
			return;
		}

		const lowerValue = value.toLowerCase();

		// Reset column filters when doing global search
		if (value) {
			this.filteredData = this.data.filter((row) => {
				return row._searchableText.some(text =>
					String(text).toLowerCase().includes(lowerValue)
				);
			});
		} else {
			// If no global search, reapply column filters
			this.applyColumnFilters();
		}

		this.currentPage = 1;
		this.updateFoundEntries();
		this.renderTable('rows');

		this.triggerEvent('filtered.yo.htmltable', {
			filterType: 'global',
			value,
			resultCount: this.filteredData.length
		});
	}

	filterColumn(key, value, type) {
		const event = this.triggerEvent('filter.yo.htmltable', {
			filterType: 'column',
			column: key,
			value,
			searchType: type,
			oldData: this.filteredData
		});

		if (event.defaultPrevented) {
			return;
		}

		// Store column filter
		if (value === '') {
			delete this.columnFilters[key];
		} else {
			this.columnFilters[key] = { value, type };
		}

		// Clear global search when using column filters
		if (this.globalSearchInput) {
			this.globalSearchInput.value = '';
		}

		this.applyColumnFilters();
		this.currentPage = 1;
		this.updateFoundEntries();
		this.renderTable('rows');

		this.triggerEvent('filtered.yo.htmltable', {
			filterType: 'column',
			column: key,
			value,
			resultCount: this.filteredData.length
		});
	}

	applyColumnFilters() {
		if (Object.keys(this.columnFilters).length === 0) {
			this.filteredData = [...this.data];
			return;
		}

		this.filteredData = this.data.filter(row => {
			return Object.entries(this.columnFilters).every(([key, filter]) => {
				const cellData = row[key];
				if (!cellData) return false;

				const searchValue = filter.value.toLowerCase();
				const cellText = String(cellData.searchText).toLowerCase();

				switch (filter.type) {
					case 'select':
						return cellText === searchValue;
					case 'number':
						return cellText.includes(searchValue);
					case 'date':
						return cellData.sortValue === filter.value;
					case 'text':
					default:
						return cellText.includes(searchValue);
				}
			});
		});
	}

	toggleSort(columnKey, columnIndex) {
		const oldColumn = this.sortColumn;
		const oldOrder = this.sortOrder;
		const newOrder = (this.sortColumn === columnKey)
			? (this.sortOrder === 'asc' ? 'desc' : 'asc')
			: 'asc';

		const event = this.triggerEvent('sort.yo.htmltable', {
			column: columnKey,
			columnIndex,
			oldColumn,
			oldOrder,
			newOrder
		});

		if (event.defaultPrevented) {
			return;
		}

		if (this.sortColumn === columnKey) {
			this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			this.sortColumn = columnKey;
			this.sortOrder = 'asc';
		}

		this.updateSortIcons();
		this.renderRows();

		this.triggerEvent('sorted.yo.htmltable', {
			column: this.sortColumn,
			columnIndex,
			order: this.sortOrder
		});
	}

	updateSortIcons() {
		this.container.querySelectorAll('th.sortable').forEach(th => {
			const columnKey = th.dataset.column;
			const sortIcon = th.querySelector('.sort-icon');

			if (sortIcon) {
				if (this.sortColumn === columnKey) {
					if (this.sortOrder === 'asc') {
						sortIcon.innerHTML = '<i class="bi bi-arrow-up"></i>';
					} else {
						sortIcon.innerHTML = '<i class="bi bi-arrow-down"></i>';
					}
				} else {
					sortIcon.innerHTML = '<i class="bi bi-arrow-down-up"></i>';
				}
			}
		});
	}

	// Public API methods
	addRow(rowElement) {
		const cells = rowElement.querySelectorAll('td');
		const rowData = {
			_rowElement: rowElement.cloneNode(true),
			_originalIndex: this.data.length,
			_searchableText: []
		};

		cells.forEach((cell, cellIndex) => {
			if (cellIndex < this.columns.length) {
				const column = this.columns[cellIndex];
				const cellData = this.extractCellValue(cell);
				rowData[column.key] = cellData;
				rowData._searchableText.push(cellData.searchText);
			}
		});

		this.data.push(rowData);
		this.applyColumnFilters();
		this.updateFoundEntries();
		this.renderTable('rows');

		this.triggerEvent('rowadded.yo.htmltable', { row: rowData });
	}

	removeRow(rowIndex) {
		const removedRow = this.data.splice(rowIndex, 1)[0];
		this.applyColumnFilters();
		this.updateFoundEntries();
		this.renderTable('rows');

		this.triggerEvent('rowremoved.yo.htmltable', { row: removedRow });
	}

	refresh() {
		this.parseTableData();
		this.renderTable();
		this.triggerEvent('refreshed.yo.htmltable');
	}
}