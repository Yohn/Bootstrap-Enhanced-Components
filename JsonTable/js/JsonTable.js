class JsonTable {
	constructor(options) {
		this.jsonUrl = options.jsonUrl || '';
		this.rowsPerPage = options.rowsPerPage || 10;
		this.rowsPerPageOptions = options.rowsPerPageOptions || [5, 10, 25, 50, 100];
		this.container = document.querySelector(options.container || '#jsonTable');
		this.globalSearchInput = document.querySelector(options.globalSearch || '#globalSearch');
		this.paginationContainer = document.querySelector(options.pagination || '#pagination');
		this.rowsPerPageSelect = document.querySelector(options.rowsPerPageSelect || '#rowsPerPageSelect');
		this.columns = options.columns || []; // Array of objects defining column settings
		this.allowEdit = options.allowEdit || false; // Whether to enable editing
		this.editPlacement = options.editPlacement || 'start'; // 'start' or 'end'
		this.editSaveUrl = options.editSaveUrl || ''; // Added editSaveUrl
		this.editSaveAdditionalData = options.editSaveAdditionalData || {}; // Added editSaveAdditionalData
		this.toastWrapper = options.toastWrapper || ''; // Added toastWrapper
		this.toastBody = options.toastBody || ''; // Added toastBody

		this.data = [];
		this.currentPage = 1;
		this.sortColumn = null;
		this.sortOrder = 'asc';
		this.filteredPages = 0;
		this.filteredData = [];

		this.init();
	}

	async init() {
		await this.fetchData();
		this.setupRowsPerPageSelector();
		this.renderTable();
		this.addGlobalSearchListener();
	}

	async fetchData() {
		try {
			const response = await fetch(this.jsonUrl);
			this.data = await response.json();
			this.filteredData = [...this.data];
			this.triggerEvent('load.yo.jsontable', { data: this.data });
		} catch (error) {
			console.error('Error fetching JSON data:', error);
			this.triggerEvent('loaderror.yo.jsontable', { error });
		}
	}

	triggerEvent(eventName, detail = {}) {
		const event = new CustomEvent(eventName, {
			detail,
			bubbles: true,
			cancelable: eventName.split('.')[0].match(/^(sort|filter|edit|save|pagechange|rowsperpage)$/) !== null
		});
		this.container.dispatchEvent(event);
		return event;
	}

	setupRowsPerPageSelector() {
		if (this.rowsPerPageSelect) {
			// Clear existing options
			this.rowsPerPageSelect.innerHTML = '';

			// Add options
			this.rowsPerPageOptions.forEach(option => {
				const optionElement = document.createElement('option');
				optionElement.value = option;
				optionElement.textContent = option;
				if (option === this.rowsPerPage) {
					optionElement.selected = true;
				}
				this.rowsPerPageSelect.appendChild(optionElement);
			});

			// Add event listener
			this.rowsPerPageSelect.addEventListener('change', (e) => {
				const oldValue = this.rowsPerPage;
				const newValue = parseInt(e.target.value, 10);

				const event = this.triggerEvent('rowsperpage.yo.jsontable', {
					oldValue,
					newValue
				});

				if (event.defaultPrevented) {
					return;
				}

				this.rowsPerPage = newValue;
				this.currentPage = 1; // Reset to first page
				this.renderTable('rows');

				this.triggerEvent('rowsperpagechanged.yo.jsontable', {
					oldValue,
					newValue
				});
			});
		}
	}

	renderTable(which = 'all') {
		const event = this.triggerEvent('render.yo.jsontable', { which });

		if (event.defaultPrevented) {
			return;
		}

		if (which == 'all') {
			this.renderHeader();
			this.renderRows();
			this.renderFooter();
			this.renderPagination();
		} else {
			this.renderRows();
			this.renderPagination();
		}

		this.triggerEvent('rendered.yo.jsontable', { which });
	}

	renderHeader() {
		const tableHeader = this.container.querySelector('thead');
		tableHeader.innerHTML = '<tr></tr>';
		const headerRow = tableHeader.querySelector('tr');

		// Add edit column if allowEdit is true
		if (this.allowEdit && this.editPlacement === 'start') {
			headerRow.insertAdjacentHTML('afterbegin', `<th>Edit</th>`);
		}

		this.columns.forEach((column) => {
			const th = document.createElement('th');
			th.textContent = column.title;

			if (column.sortable !== false) {
				th.classList.add('sortable');
				th.dataset.column = column.key;
				th.addEventListener('click', () => this.toggleSort(column.key));
			}

			headerRow.appendChild(th);
		});

		if (this.allowEdit && this.editPlacement === 'end') {
			headerRow.insertAdjacentHTML('beforeend', `<th>Edit</th>`);
		}
	}

	renderFooter() {
		const tableFooter = this.container.querySelector('tfoot');
		tableFooter.innerHTML = '<tr></tr>';
		const footerRow = tableFooter.querySelector('tr');

		// Add edit column if allowEdit is true
		if (this.allowEdit && this.editPlacement === 'start') {
			footerRow.insertAdjacentHTML('afterbegin', `<td></td>`);
		}

		this.columns.forEach((column) => {
			const td = document.createElement('td');
			if (column.searchType === 'select') {
				const select = document.createElement('select');
				select.className = 'form-control';
				select.innerHTML = `<option value="">All ${column.title}</option>`;
				const uniqueValues = [...new Set(this.data.map(row => row[column.key]))];
				uniqueValues.forEach(value => {
					const option = document.createElement('option');
					option.textContent = value;
					option.value = value;
					select.appendChild(option);
				});
				select.addEventListener('change', (e) => this.filterColumn(column.key, e.target.value));
				td.appendChild(select);
			} else if (column.searchType !== false) {
				const input = document.createElement('input');
				input.type = 'text';
				input.className = 'form-control';
				input.placeholder = `Search ${column.title}`;
				input.addEventListener('input', (e) => this.filterColumn(column.key, e.target.value));
				td.appendChild(input);
			}
			footerRow.appendChild(td);
		});

		// Add record count row
		const countRow = document.createElement('tr');
		const countCell = document.createElement('td');
		countCell.setAttribute('colspan', this.columns.length + (this.allowEdit ? 1 : 0));
		countCell.className = 'text-start';
		countCell.id = 'recordCount';
		this.updateRecordCount(countCell);
		countRow.appendChild(countCell);
		tableFooter.appendChild(countRow);
	}

	renderRows() {
		const tableBody = this.container.querySelector('tbody');
		tableBody.innerHTML = '';
		const start = (this.currentPage - 1) * this.rowsPerPage;
		const end = start + this.rowsPerPage;

		let rows = [...this.filteredData];

		// Sorting
		if (this.sortColumn) {
			const column = this.columns.find(col => col.key === this.sortColumn);
			const hasSortValue = column && typeof column.sortValue === 'function';

			rows.sort((a, b) => {
				let aVal = a[this.sortColumn];
				let bVal = b[this.sortColumn];

				// Use custom sortValue function if provided
				if (hasSortValue) {
					aVal = column.sortValue(aVal);
					bVal = column.sortValue(bVal);
				}

				if (this.sortOrder === 'asc') return aVal > bVal ? 1 : -1;
				return aVal < bVal ? 1 : -1;
			});
		}

		// Paging
		const totalPages = Math.ceil(rows.length / this.rowsPerPage);
		this.filteredPages = totalPages;

		rows.slice(start, end).forEach((row, rowIndex) => {
			const tr = document.createElement('tr');

			// Trigger row render event
			const rowEvent = this.triggerEvent('rowrender.yo.jsontable', {
				row,
				rowIndex,
				element: tr
			});

			// Add edit column if allowEdit is true
			if (this.allowEdit && this.editPlacement === 'start') {
				tr.insertAdjacentHTML('afterbegin', `<td><button class="btn btn-primary btn-sm edit-btn" data-row="${rowIndex}"><i class="bi bi-pencil-square"></i></button></td>`);
			}

			Object.keys(row).forEach((key) => {
				const td = document.createElement('td');
				td.textContent = row[key];
				tr.appendChild(td);
			});

			if (this.allowEdit && this.editPlacement === 'end') {
				tr.insertAdjacentHTML('beforeend', `<td><button class="btn btn-primary btn-sm edit-btn" data-row="${rowIndex}"><i class="bi bi-pencil-square"></i></button></td>`);
			}

			// Add click event listener to row
			tr.addEventListener('click', (e) => {
				// Don't trigger if clicking edit button
				if (!e.target.closest('.edit-btn')) {
					this.triggerEvent('rowclick.yo.jsontable', {
						row,
						rowIndex,
						element: tr,
						originalEvent: e
					});
				}
			});

			tableBody.appendChild(tr);
		});

		// Add event listeners for edit buttons
		if (this.allowEdit) {
			this.container.querySelectorAll('.edit-btn').forEach((btn) =>
				btn.addEventListener('click', (e) => this.showEditModal(parseInt(btn.dataset.row, 10)))
			);
		}

		// Update record count
		this.updateRecordCount();
	}

	renderPagination() {
		this.paginationContainer.innerHTML = '';
		const totalPages = this.filteredPages;
		const currentPage = this.currentPage;
		const maxVisiblePages = 6; // Adjust this number as needed

		if (totalPages <= maxVisiblePages) {
			// If total pages are less than or equal to maxVisiblePages, show all pages
			for (let i = 1; i <= totalPages; i++) {
				this.renderPageLink(i, currentPage);
			}
		} else {
			// Determine which pages to display based on current page
			let pagesToShow = [];

			// Always show first 2 pages
			pagesToShow.push(1);
			pagesToShow.push(2);

			// Calculate mid range around current page
			const leftRange = Math.max(currentPage - 2, 3); // Always show at least 2 pages before
			const rightRange = Math.min(currentPage + 2, totalPages - 2); // Always show at least 2 pages after

			// Show range of pages
			for (let i = leftRange; i <= rightRange; i++) {
				pagesToShow.push(i);
			}

			// Always show last 2 pages
			pagesToShow.push(totalPages - 1);
			pagesToShow.push(totalPages);

			// Render the pages with "..." as needed
			for (let i = 0; i < pagesToShow.length; i++) {
				const pageNumber = pagesToShow[i];
				if (i > 0 && pageNumber - pagesToShow[i - 1] > 1) {
					// There's a gap between pages, add "..."
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

			const event = this.triggerEvent('pagechange.yo.jsontable', {
				oldPage: this.currentPage,
				newPage: pageNumber
			});

			if (event.defaultPrevented) {
				return;
			}

			this.currentPage = pageNumber;
			this.renderRows();
			this.renderPagination();
			this.updateActivePage(pageNumber);

			this.triggerEvent('pagechanged.yo.jsontable', {
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

	updateActivePage(page) {
		const paginationItems = this.paginationContainer.querySelectorAll('.page-item');
		paginationItems.forEach(item => {
			item.classList.remove('active');
			const link = item.querySelector('.page-link');
			if (link.textContent === String(page)) {
				item.classList.add('active');
			}
		});
	}

	showEditModal(rowIndex) {
		const rowData = this.filteredData[rowIndex];
		const modal = document.querySelector('#editModal');
		const modalBody = modal.querySelector('.modal-body');

		const event = this.triggerEvent('edit.yo.jsontable', {
			rowData,
			rowIndex
		});

		if (event.defaultPrevented) {
			return;
		}

		modalBody.innerHTML = '';

		this.columns.forEach((column) => {
			const fieldType = column.editFieldType || 'text';
			const inputWrapper = document.createElement('div');
			let isFloating = false
			inputWrapper.classList.add('mb-3');


			if (column.editFieldType !== false) {
				const floating = document.createElement('div');
				const floatingLabel = document.createElement('label');
				if (column.columnIcon) {
					inputWrapper.classList.add('input-group')
					const iconSpan = document.createElement('span');
					iconSpan.className = 'input-group-text';
					const icon = document.createElement('i');
					icon.className = column.columnIcon;
					iconSpan.appendChild(icon);
					inputWrapper.appendChild(iconSpan);
					floating.className = 'floating-label'
					floatingLabel.textContent = column.title;
					isFloating = true
				} else {
					const label = document.createElement('label');
					label.className = 'form-label';
					label.textContent = column.title;
					inputWrapper.appendChild(label);
				}

				let input;

				switch (fieldType) {
					case 'bool':
						input = document.createElement('input');
						input.type = 'checkbox';
						input.checked = !!rowData[column.key];
						break;
					case 'select':
						input = document.createElement('select');
						input.className = 'form-control';
						column.options.forEach((opt) => {
							const option = document.createElement('option');
							option.value = opt;
							option.textContent = opt;
							option.selected = rowData[column.key] === opt;
							input.appendChild(option);
						});
						break;
					case 'textarea':
						input = document.createElement('textarea');
						input.className = 'form-control';
						input.textContent = rowData[column.key];
						input.placeholder = column.title;
						break;
					default:
						input = document.createElement('input');
						input.type = fieldType;
						input.className = 'form-control';
						input.value = rowData[column.key];
						input.placeholder = column.title;
						break;
				}

				input.dataset.key = column.key;
				if(isFloating == true){
					floating.appendChild(input);
					floating.appendChild(floatingLabel);
					inputWrapper.appendChild(floating);
				} else {
					inputWrapper.appendChild(input);
				}
				modalBody.appendChild(inputWrapper);
			} else {
				const input = document.createElement('input');
				input.type = 'hidden';
				input.value = rowData[column.key];
				input.dataset.key = column.key;
				modalBody.appendChild(input);
			}
		});

		const saveBtn = modal.querySelector('.save-edit');
		saveBtn.onclick = () => this.saveEdit(rowIndex, modal);

		const modalInstance = new bootstrap.Modal(modal);
		modalInstance.show();

		this.triggerEvent('edited.yo.jsontable', {
			rowData,
			rowIndex
		});
	}

	addGlobalSearchListener() {
		if (this.globalSearchInput) {
			this.globalSearchInput.addEventListener('input', (e) => this.filterGlobal(e.target.value));
		}
	}

	filterGlobal(value) {
		const event = this.triggerEvent('filter.yo.jsontable', {
			filterType: 'global',
			value,
			oldData: this.filteredData
		});

		if (event.defaultPrevented) {
			return;
		}

		const lowerValue = value.toLowerCase();
		this.filteredData = this.data.filter((row) =>
			Object.values(row).some((field) => String(field).toLowerCase().includes(lowerValue))
		);
		this.currentPage = 1;
		this.renderTable();

		this.triggerEvent('filtered.yo.jsontable', {
			filterType: 'global',
			value,
			resultCount: this.filteredData.length
		});
	}

	filterColumn(key, value) {
		// Filter data based on specific column key and input value
		const event = this.triggerEvent('filter.yo.jsontable', {
			filterType: 'column',
			column: key,
			value,
			oldData: this.filteredData
		});

		if (event.defaultPrevented) {
			return;
		}

		// Update filteredData based on current search criteria
		if (value === '') {
			// If search value is empty, reset to original data
			this.filteredData = [...this.data];
		} else {
			// Perform filtering based on the key and value
			const lowerCaseValue = value.toLowerCase();

			this.filteredData = this.data.filter((row) => {
				if (this.columns.find((col) => col.key === key && col.searchType === 'select')) {
					// For select dropdown filtering
					return row[key].toLowerCase() === lowerCaseValue;
				} else {
					// For text input filtering
					return row[key].toLowerCase().includes(lowerCaseValue);
				}
			});
		}

		// Re-render table rows and pagination after filtering
		this.currentPage = 1; // Reset to first page
		this.renderTable('rows');

		this.triggerEvent('filtered.yo.jsontable', {
			filterType: 'column',
			column: key,
			value,
			resultCount: this.filteredData.length
		});
	}

	adjustTfootSearchFields() {
		// Adjust tfoot search fields based on editPlacement
		const tfoot = this.container.querySelector('tfoot');
		if (this.allowEdit && this.editPlacement === 'start') {
			// If edit column is at the start, move tfoot search fields over by 1
			const th = document.createElement('th');
			th.textContent = ''; // Adjust as needed based on your table structure
			tfoot.insertBefore(th, tfoot.firstElementChild); // Adjust based on your specific structure
		}
	}

	toggleSort(column) {
		const oldColumn = this.sortColumn;
		const oldOrder = this.sortOrder;
		const newOrder = (this.sortColumn === column)
			? (this.sortOrder === 'asc' ? 'desc' : 'asc')
			: 'asc';

		const event = this.triggerEvent('sort.yo.jsontable', {
			column,
			oldColumn,
			oldOrder,
			newOrder
		});

		if (event.defaultPrevented) {
			return;
		}

		if (this.sortColumn === column) {
			this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			this.sortColumn = column;
			this.sortOrder = 'asc';
		}
		this.renderRows();

		this.triggerEvent('sorted.yo.jsontable', {
			column: this.sortColumn,
			order: this.sortOrder
		});
	}

	async saveEdit(rowIndex, modal) {
		const rowData = this.filteredData[rowIndex];
		const editSaveUrl = this.editSaveUrl || '';
		const editSaveAdditionalData = this.editSaveAdditionalData || {};

		const formData = {};
		const additionalData = {};

		const inputs = modal.querySelectorAll('[data-key]');
		inputs.forEach((input) => {
			const key = input.dataset.key;
			if (key && input.type !== 'button' && input.type !== 'submit' && input.type !== 'reset') {
				if (input.type === 'checkbox') {
					formData[key] = input.checked;
				} else {
					formData[key] = input.value;
				}
			}
		});

		for (let [key, value] of Object.entries(editSaveAdditionalData)) {
			additionalData[key] = value;
		}

		const postData = {
			...formData,
			...additionalData,
		};

		const saveEvent = this.triggerEvent('save.yo.jsontable', {
			rowData,
			rowIndex,
			formData,
			postData
		});

		if (saveEvent.defaultPrevented) {
			return;
		}

		try {
			let type = 'success';
			let msg = '';
			const response = await fetch(editSaveUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(postData),
			});

			if (!response.ok) {
				throw new Error('Failed to save data');
			}

			const responseData = await response.json();

			// Update the data in the table with the edited values
			Object.keys(formData).forEach((key) => {
				rowData[key] = formData[key];
			});

			// Rerender the table
			this.renderRows();

			if (responseData.msg) {
				msg = responseData.msg
			} else {
				msg = responseData
			}
			if (responseData?.status) {
				type = responseData.status
			}
			// Show success toast
			this.showToast(type, msg); //'Data saved successfully');

			this.triggerEvent('saved.yo.jsontable', {
				rowData,
				rowIndex,
				response: responseData
			});
		} catch (error) {
			console.error('Error saving data:', error);
			this.showToast('error', 'Failed to save data. Please try again.');

			this.triggerEvent('saveerror.yo.jsontable', {
				rowData,
				rowIndex,
				error
			});
		} finally {
			// Close the modal
			const modalInstance = bootstrap.Modal.getInstance(modal);
			modalInstance.hide();
		}
	}

	showToast(type, message) {
		const toastContainer = document.querySelector('#toastContainer .toast');
		const toastResponse = toastContainer.querySelector('.toast-body');
		if (!toastContainer) {
			console.error('Toast container not found');
			return;
		}
		toastResponse.textContent = message;
		toastContainer.classList.remove('text-bg-primary', 'text-bg-warning', 'text-bg-danger', 'text-bg-error', 'text-bg-info', 'text-bg-success');
		toastContainer.classList.add(`text-bg-${type}`, 'fade', 'show');
		setTimeout(function(){
			toastContainer.classList.remove('show')
		}, 7000)
	}

	updateRecordCount(element) {
		const countCell = element || this.container.querySelector('#recordCount');
		if (!countCell) return;

		const totalRecords = this.data.length;
		const filteredRecords = this.filteredData.length;

		if (filteredRecords === totalRecords) {
			countCell.textContent = `${totalRecords} Record${totalRecords !== 1 ? 's' : ''} Found`;
		} else {
			countCell.textContent = `${filteredRecords} of ${totalRecords} Record${totalRecords !== 1 ? 's' : ''} Matched`;
		}
	}
}