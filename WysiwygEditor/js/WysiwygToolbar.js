/**
 * WYSIWYG Editor Toolbar Manager
 * Handles toolbar creation, button management, and state updates
 *
 * @class WysiwygToolbar
 * @version 1.0.0
 */
class WysiwygToolbar {
	/**
	 * Create toolbar instance
	 *
	 * @param {WysiwygEditor} editor - Parent editor instance
	 * @param {HTMLElement} container - Toolbar container element
	 * @param {Array} config - Toolbar button configuration
	 */
	constructor(editor, container, config) {
		this.editor = editor;
		this.container = container;
		this.config = config;
		this.buttons = new Map();
		this.dropdowns = new Map();
		this.isEnabled = true;

		// Button definitions
		this.buttonDefs = this._getButtonDefinitions();

		// Build toolbar
		this.build();
	}

	/**
	 * Get button definitions
	 * @private
	 * @returns {Object} Button definitions
	 */
	_getButtonDefinitions() {
		return {
			// Style buttons
			style: {
				icon: 'bi-paragraph',
				title: 'Paragraph Format',
				type: 'dropdown',
				width: '180px',
				items: [
					{ value: 'p', text: 'Paragraph', icon: 'bi-text-paragraph' },
					{ value: 'h1', text: 'Heading 1', icon: 'bi-type-h1' },
					{ value: 'h2', text: 'Heading 2', icon: 'bi-type-h2' },
					{ value: 'h3', text: 'Heading 3', icon: 'bi-type-h3' },
					{ value: 'h4', text: 'Heading 4', icon: 'bi-type' },
					{ value: 'h5', text: 'Heading 5', icon: 'bi-type' },
					{ value: 'h6', text: 'Heading 6', icon: 'bi-type' },
					{ value: 'blockquote', text: 'Quote', icon: 'bi-quote' },
					{ value: 'pre', text: 'Code Block', icon: 'bi-code-square' }
				],
				command: 'formatBlock'
			},

			// Font style buttons
			bold: {
				icon: 'bi-type-bold',
				title: 'Bold (Ctrl+B)',
				command: 'bold',
				active: true
			},
			italic: {
				icon: 'bi-type-italic',
				title: 'Italic (Ctrl+I)',
				command: 'italic',
				active: true
			},
			underline: {
				icon: 'bi-type-underline',
				title: 'Underline (Ctrl+U)',
				command: 'underline',
				active: true
			},
			strikethrough: {
				icon: 'bi-type-strikethrough',
				title: 'Strikethrough',
				command: 'strikeThrough',
				active: true
			},
			clear: {
				icon: 'bi-eraser',
				title: 'Clear Formatting',
				command: 'removeFormat'
			},

			// Font selection
			fontname: {
				title: 'Font Family',
				type: 'dropdown',
				width: '150px',
				items: [],  // Populated from config
				command: 'fontName',
				displayText: true
			},
			fontsize: {
				title: 'Font Size',
				type: 'dropdown',
				width: '100px',
				items: [],  // Populated from config
				command: 'fontSize',
				displayText: true
			},

			// Colors
			color: {
				icon: 'bi-palette',
				title: 'Text Color',
				type: 'color',
				command: 'foreColor'
			},
			bgcolor: {
				icon: 'bi-paint-bucket',
				title: 'Background Color',
				type: 'color',
				command: 'hiliteColor'
			},

			// Paragraph formatting
			ul: {
				icon: 'bi-list-ul',
				title: 'Unordered List',
				command: 'insertUnorderedList',
				active: true
			},
			ol: {
				icon: 'bi-list-ol',
				title: 'Ordered List',
				command: 'insertOrderedList',
				active: true
			},
			paragraph: {
				icon: 'bi-text-left',
				title: 'Paragraph Alignment',
				type: 'dropdown',
				items: [
					{ value: 'justifyLeft', text: 'Align Left', icon: 'bi-text-left' },
					{ value: 'justifyCenter', text: 'Align Center', icon: 'bi-text-center' },
					{ value: 'justifyRight', text: 'Align Right', icon: 'bi-text-right' },
					{ value: 'justifyFull', text: 'Justify', icon: 'bi-justify' }
				]
			},
			indent: {
				icon: 'bi-text-indent-left',
				title: 'Increase Indent',
				command: 'indent'
			},
			outdent: {
				icon: 'bi-text-indent-right',
				title: 'Decrease Indent',
				command: 'outdent'
			},

			// Line height
			height: {
				icon: 'bi-text-paragraph',
				title: 'Line Height',
				type: 'dropdown',
				items: [],  // Populated from config
				command: 'lineHeight'
			},

			// Tables
			table: {
				icon: 'bi-table',
				title: 'Insert Table',
				type: 'dropdown',
				items: [
					{ value: 'insert', text: 'Insert Table', icon: 'bi-table' },
					{ value: 'addRowAbove', text: 'Add Row Above', icon: 'bi-arrow-up' },
					{ value: 'addRowBelow', text: 'Add Row Below', icon: 'bi-arrow-down' },
					{ value: 'addColLeft', text: 'Add Column Left', icon: 'bi-arrow-left' },
					{ value: 'addColRight', text: 'Add Column Right', icon: 'bi-arrow-right' },
					{ value: 'deleteRow', text: 'Delete Row', icon: 'bi-trash' },
					{ value: 'deleteCol', text: 'Delete Column', icon: 'bi-trash' },
					{ value: 'deleteTable', text: 'Delete Table', icon: 'bi-x-square' }
				]
			},

			// Insert elements
			link: {
				icon: 'bi-link-45deg',
				title: 'Insert Link (Ctrl+K)',
				handler: 'showLinkDialog'
			},
			unlink: {
				icon: 'bi-link-45deg',
				title: 'Remove Link',
				command: 'unlink'
			},
			picture: {
				icon: 'bi-image',
				title: 'Insert Image',
				handler: 'showImageDialog'
			},
			video: {
				icon: 'bi-camera-video',
				title: 'Insert Video',
				handler: 'showVideoDialog'
			},
			hr: {
				icon: 'bi-hr',
				title: 'Insert Horizontal Rule',
				command: 'insertHorizontalRule'
			},

			// View options
			fullscreen: {
				icon: 'bi-arrows-fullscreen',
				title: 'Fullscreen',
				handler: 'toggleFullscreen',
				toggle: true
			},
			codeview: {
				icon: 'bi-code',
				title: 'Code View',
				handler: 'toggleCodeView',
				toggle: true
			},
			help: {
				icon: 'bi-question-circle',
				title: 'Help',
				handler: 'showHelp'
			},

			// History
			undo: {
				icon: 'bi-arrow-counterclockwise',
				title: 'Undo (Ctrl+Z)',
				handler: 'undo'
			},
			redo: {
				icon: 'bi-arrow-clockwise',
				title: 'Redo (Ctrl+Y)',
				handler: 'redo'
			},

			// Additional formatting
			superscript: {
				icon: 'bi-superscript',
				title: 'Superscript',
				command: 'superscript',
				active: true
			},
			subscript: {
				icon: 'bi-subscript',
				title: 'Subscript',
				command: 'subscript',
				active: true
			},
			code: {
				icon: 'bi-code-slash',
				title: 'Inline Code',
				handler: 'wrapCode'
			}
		};
	}

	/**
	 * Build the toolbar
	 * @public
	 */
	build() {
		// Clear existing toolbar
		this.container.innerHTML = '';
		this.buttons.clear();
		this.dropdowns.clear();

		// Add alignment class if specified
		if (this.editor.config.toolbarAlignment) {
			const validAlignments = ['evenly', 'between', 'around', 'end', 'start', 'center'];
			if (validAlignments.includes(this.editor.config.toolbarAlignment)) {
				this.container.classList.add(`justify-content-${this.editor.config.toolbarAlignment}`);
			}
		}

		// Process button groups
		this.config.forEach((group, groupIndex) => {
			const [groupName, buttons] = group;
			const buttonGroup = this._createButtonGroup(groupName, buttons, groupIndex);
			if (buttonGroup) {
				this.container.appendChild(buttonGroup);
			}
		});

		// Add custom CSS if not exists
		this._addCustomStyles();

		// Initialize Bootstrap tooltips
		this._initializeTooltips();
	}

	/**
	 * Initialize Bootstrap tooltips
	 * @private
	 */
	_initializeTooltips() {
		// Find all elements with title attribute in the toolbar
		const tooltipTriggerList = this.container.querySelectorAll('[title]');

		// Initialize tooltips with Bootstrap
		this.tooltips = [...tooltipTriggerList].map(tooltipTriggerEl => {
			// Store the title and remove it to prevent browser tooltip
			const title = tooltipTriggerEl.getAttribute('title');
			tooltipTriggerEl.setAttribute('data-bs-toggle', 'tooltip');
			tooltipTriggerEl.setAttribute('data-bs-placement', 'top');
			tooltipTriggerEl.setAttribute('data-bs-title', title);
			tooltipTriggerEl.removeAttribute('title');

			// Create Bootstrap tooltip
			return new bootstrap.Tooltip(tooltipTriggerEl, {
				container: 'body',
				trigger: 'hover',
				delay: { show: 500, hide: 100 }
			});
		});
	}

	/**
	 * Rebuild toolbar with new configuration
	 * @public
	 * @param {Array} newConfig - New toolbar configuration
	 */
	rebuild(newConfig) {
		this.config = newConfig;
		this.build();
	}

	/**
	 * Create a button group
	 * @private
	 * @param {string} groupName - Group name
	 * @param {Array} buttons - Button names
	 * @param {number} groupIndex - Group index
	 * @returns {HTMLElement} Button group element
	 */
	_createButtonGroup(groupName, buttons, groupIndex) {
		const group = document.createElement('div');
		group.className = 'btn-group btn-group-sm mb-1'; // Add mb-1 for spacing
		group.setAttribute('role', 'group');
		group.setAttribute('aria-label', `${groupName} formatting`);

		buttons.forEach(buttonName => {
			const buttonDef = this.buttonDefs[buttonName];
			if (!buttonDef) {
				console.warn(`WysiwygToolbar: Unknown button "${buttonName}"`);
				return;
			}

			// Dropdowns need special handling in button groups
			if (buttonDef.type === 'dropdown' || buttonDef.type === 'color') {
				const dropdownGroup = document.createElement('div');
				dropdownGroup.className = 'btn-group';
				dropdownGroup.setAttribute('role', 'group');

				const button = this._createButton(buttonName, buttonDef);
				if (button) {
					// Move dropdown contents to the nested group
					while (button.firstChild) {
						dropdownGroup.appendChild(button.firstChild);
					}
					group.appendChild(dropdownGroup);
				}
			} else {
				const button = this._createButton(buttonName, buttonDef);
				if (button) {
					group.appendChild(button);
				}
			}
		});

		return group.children.length > 0 ? group : null;
	}

	/**
	 * Create a toolbar button
	 * @private
	 * @param {string} name - Button name
	 * @param {Object} definition - Button definition
	 * @returns {HTMLElement} Button element
	 */
	_createButton(name, definition) {
		let element;

		switch (definition.type) {
			case 'dropdown':
				element = this._createDropdown(name, definition);
				break;
			case 'color':
				element = this._createColorPicker(name, definition);
				break;
			default:
				element = this._createSimpleButton(name, definition);
		}

		if (element) {
			this.buttons.set(name, element);
		}

		return element;
	}

	/**
	 * Create a simple button
	 * @private
	 * @param {string} name - Button name
	 * @param {Object} definition - Button definition
	 * @returns {HTMLButtonElement} Button element
	 */
	_createSimpleButton(name, definition) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'btn btn-outline-secondary';
		button.title = definition.title;
		button.setAttribute('data-command', name);

		if (definition.icon) {
			const icon = document.createElement('i');
			icon.className = definition.icon;
			button.appendChild(icon);
		} else {
			button.textContent = definition.text || name;
		}

		// Add click handler
		button.addEventListener('click', (e) => {
			e.preventDefault();
			this._handleButtonClick(name, definition);
		});

		return button;
	}

	/**
	 * Create a dropdown button
	 * @private
	 * @param {string} name - Button name
	 * @param {Object} definition - Button definition
	 * @returns {HTMLElement} Dropdown container
	 */
	_createDropdown(name, definition) {
		// For button groups, we return the elements directly
		// The container will be created by _createButtonGroup if needed

		// Create dropdown toggle button
		const button = document.createElement('button');
		button.className = 'btn btn-outline-secondary dropdown-toggle';
		button.type = 'button';
		button.setAttribute('data-bs-toggle', 'dropdown');
		button.setAttribute('aria-expanded', 'false');

		// Set button content
		if (definition.displayText) {
			// For text buttons, wrap text in span for tooltip
			const textSpan = document.createElement('span');
			textSpan.textContent = definition.title;
			textSpan.title = definition.title;
			button.appendChild(textSpan);
			if (definition.width) {
				button.style.width = definition.width;
			}
		} else if (definition.icon) {
			// For icon buttons, put tooltip on the icon
			const icon = document.createElement('i');
			icon.className = definition.icon;
			icon.title = definition.title;
			button.appendChild(icon);
		} else {
			const textSpan = document.createElement('span');
			textSpan.textContent = definition.text || name;
			textSpan.title = definition.title;
			button.appendChild(textSpan);
		}

		// Create dropdown menu
		const menu = document.createElement('ul');
		menu.className = 'dropdown-menu';

		// Populate dropdown items
		let items = definition.items;

		// Special handling for font and size dropdowns
		if (name === 'fontname') {
			items = this.editor.config.fonts.map(font => ({
				value: font,
				text: font,
				style: `font-family: ${font}`
			}));
		} else if (name === 'fontsize') {
			items = this.editor.config.fontSizes.map(size => ({
				value: size,
				text: `${size}px`
			}));
		} else if (name === 'height') {
			items = this.editor.config.lineHeights.map(height => ({
				value: height,
				text: height
			}));
		}

		// Create menu items
		items.forEach(item => {
			const li = document.createElement('li');
			const link = document.createElement('a');
			link.className = 'dropdown-item';
			link.href = '#';

			if (item.icon) {
				const icon = document.createElement('i');
				icon.className = `${item.icon} me-2`;
				link.appendChild(icon);
			}

			const text = document.createTextNode(item.text);
			link.appendChild(text);

			if (item.style) {
				link.style.cssText = item.style;
			}

			link.addEventListener('click', (e) => {
				e.preventDefault();
				this._handleDropdownSelect(name, item.value, definition);

				// Update button text if displayText is true
				if (definition.displayText) {
					const textSpan = button.querySelector('span');
					if (textSpan) {
						textSpan.textContent = item.text;
					}
				}
			});

			li.appendChild(link);
			menu.appendChild(li);
		});

		// Create a container div that will hold both button and menu
		const container = document.createElement('div');
		container.appendChild(button);
		container.appendChild(menu);

		this.dropdowns.set(name, { button, menu });

		// Return the container with both elements
		return container;
	}

	/**
	 * Create a color picker
	 * @private
	 * @param {string} name - Button name
	 * @param {Object} definition - Button definition
	 * @returns {HTMLElement} Color picker container
	 */
	_createColorPicker(name, definition) {
		// Create color button
		const button = document.createElement('button');
		button.className = 'btn btn-outline-secondary dropdown-toggle';
		button.type = 'button';
		button.setAttribute('data-bs-toggle', 'dropdown');
		button.setAttribute('aria-expanded', 'false');

		// Add icon with color indicator - tooltip on icon only
		const iconWrapper = document.createElement('span');
		iconWrapper.className = 'color-button-wrapper';
		iconWrapper.title = definition.title;

		const icon = document.createElement('i');
		icon.className = definition.icon;
		iconWrapper.appendChild(icon);

		const colorIndicator = document.createElement('span');
		colorIndicator.className = 'color-indicator';
		colorIndicator.style.backgroundColor = '#000000';
		iconWrapper.appendChild(colorIndicator);

		button.appendChild(iconWrapper);

		// Create color palette dropdown
		const menu = document.createElement('div');
		menu.className = 'dropdown-menu color-palette-menu p-2';

		// Add custom color input
		const customColorWrapper = document.createElement('div');
		customColorWrapper.className = 'mb-2';

		const customColorInput = document.createElement('input');
		customColorInput.type = 'color';
		customColorInput.className = 'form-control form-control-sm';
		customColorInput.value = '#000000';

		customColorInput.addEventListener('change', (e) => {
			const color = e.target.value;
			this._applyColor(name, color, definition.command);
			colorIndicator.style.backgroundColor = color;
		});

		customColorWrapper.appendChild(customColorInput);
		menu.appendChild(customColorWrapper);

		// Add preset colors
		const colors = name === 'bgcolor' ?
			this.editor.config.colors.background :
			this.editor.config.colors.text;

		const paletteContainer = document.createElement('div');
		paletteContainer.className = 'color-palette-grid';

		colors.forEach(row => {
			const rowDiv = document.createElement('div');
			rowDiv.className = 'color-palette-row';

			row.forEach(color => {
				const colorButton = document.createElement('button');
				colorButton.className = 'color-palette-button';
				colorButton.style.backgroundColor = color;
				colorButton.title = color;
				colorButton.setAttribute('data-color', color);

				colorButton.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					this._applyColor(name, color, definition.command);
					colorIndicator.style.backgroundColor = color;
					customColorInput.value = color;
				});

				rowDiv.appendChild(colorButton);
			});

			paletteContainer.appendChild(rowDiv);
		});

		menu.appendChild(paletteContainer);

		// Add clear color option
		const clearButton = document.createElement('button');
		clearButton.className = 'btn btn-sm btn-outline-secondary w-100 mt-2';
		clearButton.textContent = 'Clear Color';
		clearButton.addEventListener('click', (e) => {
			e.preventDefault();
			this._applyColor(name, 'inherit', definition.command);
			colorIndicator.style.backgroundColor = 'transparent';
		});

		menu.appendChild(clearButton);

		// Create container with both elements
		const container = document.createElement('div');
		container.appendChild(button);
		container.appendChild(menu);

		return container;
	}

	/**
	 * Handle button click
	 * @private
	 * @param {string} name - Button name
	 * @param {Object} definition - Button definition
	 */
	_handleButtonClick(name, definition) {
		this.editor.focus();

		// Special handling for certain buttons
		if (name === 'indent') {
			this.editor.indent();
		} else if (name === 'outdent') {
			this.editor.outdent();
		} else if (definition.command) {
			// Execute command
			this.editor.execCommand(definition.command);
		} else if (definition.handler) {
			// Call handler method
			this[definition.handler]();
		}

		// Update button states
		setTimeout(() => this.updateButtonStates(), 10);
	}

	/**
	 * Handle dropdown selection
	 * @private
	 * @param {string} name - Dropdown name
	 * @param {*} value - Selected value
	 * @param {Object} definition - Dropdown definition
	 */
	_handleDropdownSelect(name, value, definition) {
		this.editor.focus();

		if (definition.command) {
			this.editor.execCommand(definition.command, value);
		} else if (name === 'table') {
			this._handleTableCommand(value);
		} else if (name === 'paragraph') {
			this.editor.execCommand(value);
		} else if (name === 'style') {
			this.editor.formatBlock(value);
		}

		// Update button states
		setTimeout(() => this.updateButtonStates(), 10);
	}

	/**
	 * Apply color to selection
	 * @private
	 * @param {string} type - Color type (color or bgcolor)
	 * @param {string} color - Color value
	 * @param {string} command - Command to execute
	 */
	_applyColor(type, color, command) {
		this.editor.focus();
		this.editor.execCommand(command, color);
		setTimeout(() => this.updateButtonStates(), 10);
	}

	/**
	 * Handle table commands
	 * @private
	 * @param {string} command - Table command
	 */
	_handleTableCommand(command) {
		switch (command) {
			case 'insert':
				this.showTableDialog();
				break;
			case 'addRowAbove':
				this._insertTableRow(true);
				break;
			case 'addRowBelow':
				this._insertTableRow(false);
				break;
			case 'addColLeft':
				this._insertTableColumn(true);
				break;
			case 'addColRight':
				this._insertTableColumn(false);
				break;
			case 'deleteRow':
				this._deleteTableRow();
				break;
			case 'deleteCol':
				this._deleteTableColumn();
				break;
			case 'deleteTable':
				this._deleteTable();
				break;
		}
	}

	/**
	 * Insert table row
	 * @private
	 * @param {boolean} above - Insert above current row
	 */
	_insertTableRow(above) {
		const selection = window.getSelection();
		const cell = selection.anchorNode.nodeType === 1 ?
			selection.anchorNode : selection.anchorNode.parentElement;

		const row = cell.closest('tr');
		if (!row) return;

		const newRow = row.cloneNode(false);
		const cellCount = row.cells.length;

		for (let i = 0; i < cellCount; i++) {
			const newCell = document.createElement(row.cells[i].tagName.toLowerCase());
			newCell.contentEditable = 'true';
			newCell.innerHTML = '&nbsp;';
			newRow.appendChild(newCell);
		}

		if (above) {
			row.parentNode.insertBefore(newRow, row);
		} else {
			row.parentNode.insertBefore(newRow, row.nextSibling);
		}
	}

	/**
	 * Insert table column
	 * @private
	 * @param {boolean} left - Insert to the left
	 */
	_insertTableColumn(left) {
		const selection = window.getSelection();
		const cell = selection.anchorNode.nodeType === 1 ?
			selection.anchorNode : selection.anchorNode.parentElement;

		const td = cell.closest('td, th');
		if (!td) return;

		const cellIndex = Array.from(td.parentElement.cells).indexOf(td);
		const table = td.closest('table');
		const rows = table.querySelectorAll('tr');

		rows.forEach(row => {
			const newCell = document.createElement(row.cells[cellIndex].tagName.toLowerCase());
			newCell.contentEditable = 'true';
			newCell.innerHTML = '&nbsp;';

			if (left) {
				row.cells[cellIndex].parentNode.insertBefore(newCell, row.cells[cellIndex]);
			} else {
				row.cells[cellIndex].parentNode.insertBefore(newCell, row.cells[cellIndex].nextSibling);
			}
		});
	}

	/**
	 * Delete table row
	 * @private
	 */
	_deleteTableRow() {
		const selection = window.getSelection();
		const cell = selection.anchorNode.nodeType === 1 ?
			selection.anchorNode : selection.anchorNode.parentElement;

		const row = cell.closest('tr');
		if (!row) return;

		const tbody = row.parentNode;
		if (tbody.children.length > 1) {
			row.remove();
		} else {
			alert('Cannot delete the last row');
		}
	}

	/**
	 * Delete table column
	 * @private
	 */
	_deleteTableColumn() {
		const selection = window.getSelection();
		const cell = selection.anchorNode.nodeType === 1 ?
			selection.anchorNode : selection.anchorNode.parentElement;

		const td = cell.closest('td, th');
		if (!td) return;

		const cellIndex = Array.from(td.parentElement.cells).indexOf(td);
		const table = td.closest('table');
		const rows = table.querySelectorAll('tr');

		// Check if last column
		if (rows[0].cells.length > 1) {
			rows.forEach(row => {
				row.cells[cellIndex].remove();
			});
		} else {
			alert('Cannot delete the last column');
		}
	}

	/**
	 * Delete entire table
	 * @private
	 */
	_deleteTable() {
		const selection = window.getSelection();
		const cell = selection.anchorNode.nodeType === 1 ?
			selection.anchorNode : selection.anchorNode.parentElement;

		const table = cell.closest('table');
		if (table && confirm('Delete this table?')) {
			table.remove();
		}
	}

	/**
	 * Update button states based on current selection
	 * @public
	 */
	updateButtonStates() {
		if (!this.isEnabled) return;

		this.buttons.forEach((button, name) => {
			const definition = this.buttonDefs[name];
			if (!definition || !definition.active) return;

			try {
				const isActive = document.queryCommandState(definition.command);
				button.classList.toggle('active', isActive);
			} catch (e) {
				// Command not supported
			}
		});

		// Update history buttons
		const undoButton = this.buttons.get('undo');
		const redoButton = this.buttons.get('redo');

		if (undoButton) {
			undoButton.disabled = !this.editor.canUndo();
		}
		if (redoButton) {
			redoButton.disabled = !this.editor.canRedo();
		}
	}

	/**
	 * Enable toolbar
	 * @public
	 */
	enable() {
		this.isEnabled = true;
		this.buttons.forEach(button => {
			button.disabled = false;
		});
		this.container.classList.remove('disabled');
	}

	/**
	 * Disable toolbar
	 * @public
	 */
	disable() {
		this.isEnabled = false;
		this.buttons.forEach(button => {
			button.disabled = true;
		});
		this.container.classList.add('disabled');
	}

	// ============================================
	// Dialog Methods
	// ============================================

	/**
	 * Show link dialog
	 * @private
	 */
	showLinkDialog() {
		const selection = this.editor.getSelectedText();
		const modal = this._createModal('Insert Link', `
			<div class="mb-3">
				<label class="form-label">URL</label>
				<input type="url" class="form-control" id="linkUrl" placeholder="https://example.com" required>
			</div>
			<div class="mb-3">
				<label class="form-label">Text</label>
				<input type="text" class="form-control" id="linkText" value="${selection}" placeholder="Link text">
			</div>
			<div class="form-check">
				<input type="checkbox" class="form-check-input" id="linkNewWindow">
				<label class="form-check-label" for="linkNewWindow">
					Open in new window
				</label>
			</div>
		`);

		modal.onConfirm = () => {
			const url = document.getElementById('linkUrl').value;
			const text = document.getElementById('linkText').value || url;
			const newWindow = document.getElementById('linkNewWindow').checked;

			if (url) {
				this.editor.insertLink(url, text, newWindow);
			}
		};

		modal.show();
	}

	/**
	 * Show image dialog
	 * @private
	 */
	showImageDialog() {
		const modal = this._createModal('Insert Image', `
			<div class="mb-3">
				<label class="form-label">Image URL</label>
				<input type="url" class="form-control" id="imageUrl" placeholder="https://example.com/image.jpg">
			</div>
			<div class="mb-3">
				<label class="form-label">Or Upload Image</label>
				<input type="file" class="form-control" id="imageFile" accept="image/*">
			</div>
			<div class="mb-3">
				<label class="form-label">Alt Text</label>
				<input type="text" class="form-control" id="imageAlt" placeholder="Image description">
			</div>
			<div class="row">
				<div class="col">
					<label class="form-label">Width</label>
					<input type="number" class="form-control" id="imageWidth" placeholder="Auto">
				</div>
				<div class="col">
					<label class="form-label">Height</label>
					<input type="number" class="form-control" id="imageHeight" placeholder="Auto">
				</div>
			</div>
		`);

		// Handle file selection
		document.getElementById('imageFile').addEventListener('change', (e) => {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					document.getElementById('imageUrl').value = e.target.result;
				};
				reader.readAsDataURL(file);
			}
		});

		modal.onConfirm = () => {
			const url = document.getElementById('imageUrl').value;
			const alt = document.getElementById('imageAlt').value;
			const width = document.getElementById('imageWidth').value;
			const height = document.getElementById('imageHeight').value;

			if (url) {
				const attrs = {};
				if (width) attrs.width = width;
				if (height) attrs.height = height;

				this.editor.insertImage(url, alt, attrs);
			}
		};

		modal.show();
	}

	/**
	 * Show video dialog
	 * @private
	 */
	showVideoDialog() {
		const modal = this._createModal('Insert Video', `
			<div class="mb-3">
				<label class="form-label">Video URL or Embed Code</label>
				<textarea class="form-control" id="videoCode" rows="3" placeholder="YouTube/Vimeo URL or embed code"></textarea>
			</div>
			<div class="mb-3">
				<label class="form-label">Width</label>
				<input type="number" class="form-control" id="videoWidth" value="560">
			</div>
			<div class="mb-3">
				<label class="form-label">Height</label>
				<input type="number" class="form-control" id="videoHeight" value="315">
			</div>
		`);

		modal.onConfirm = () => {
			const code = document.getElementById('videoCode').value;
			const width = document.getElementById('videoWidth').value;
			const height = document.getElementById('videoHeight').value;

			if (code) {
				let embedCode = code;

				// Convert YouTube URL to embed
				if (code.includes('youtube.com/watch')) {
					const videoId = code.match(/v=([^&]+)/)[1];
					embedCode = `<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
				}
				// Convert Vimeo URL to embed
				else if (code.includes('vimeo.com')) {
					const videoId = code.match(/vimeo\.com\/(\d+)/)[1];
					embedCode = `<iframe width="${width}" height="${height}" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
				}

				this.editor.insertHTML(embedCode);
			}
		};

		modal.show();
	}

	/**
	 * Show table dialog
	 * @private
	 */
	showTableDialog() {
		const modal = this._createModal('Insert Table', `
			<div class="row mb-3">
				<div class="col">
					<label class="form-label">Rows</label>
					<input type="number" class="form-control" id="tableRows" value="3" min="1" max="20">
				</div>
				<div class="col">
					<label class="form-label">Columns</label>
					<input type="number" class="form-control" id="tableCols" value="3" min="1" max="20">
				</div>
			</div>
			<div class="form-check">
				<input type="checkbox" class="form-check-input" id="tableHeader" checked>
				<label class="form-check-label" for="tableHeader">
					Include header row
				</label>
			</div>
			<div class="form-check">
				<input type="checkbox" class="form-check-input" id="tableBordered" checked>
				<label class="form-check-label" for="tableBordered">
					Bordered table
				</label>
			</div>
		`);

		modal.onConfirm = () => {
			const rows = parseInt(document.getElementById('tableRows').value);
			const cols = parseInt(document.getElementById('tableCols').value);
			const hasHeader = document.getElementById('tableHeader').checked;
			const bordered = document.getElementById('tableBordered').checked;

			const table = this._createTable(rows, cols, hasHeader, bordered);
			this.editor.insertHTML(table);
		};

		modal.show();
	}

	/**
	 * Create table HTML
	 * @private
	 * @param {number} rows - Number of rows
	 * @param {number} cols - Number of columns
	 * @param {boolean} hasHeader - Include header row
	 * @param {boolean} bordered - Add borders
	 * @returns {string} Table HTML
	 */
	_createTable(rows, cols, hasHeader, bordered) {
		const classes = ['table'];
		if (bordered) classes.push('table-bordered');

		let html = `<table class="${classes.join(' ')}" contenteditable="true">`;

		if (hasHeader) {
			html += '<thead><tr>';
			for (let i = 0; i < cols; i++) {
				html += `<th contenteditable="true">Header ${i + 1}</th>`;
			}
			html += '</tr></thead>';
		}

		html += '<tbody>';
		for (let r = 0; r < rows; r++) {
			html += '<tr>';
			for (let c = 0; c < cols; c++) {
				html += `<td contenteditable="true">&nbsp;</td>`;
			}
			html += '</tr>';
		}
		html += '</tbody></table>';

		return html;
	}

	// ============================================
	// Handler Methods
	// ============================================

	/**
	 * Toggle fullscreen mode
	 * @private
	 */
	toggleFullscreen() {
		this.editor.toggleFullscreen();
		const button = this.buttons.get('fullscreen');
		if (button) {
			button.classList.toggle('active');
			const icon = button.querySelector('i');
			if (icon) {
				icon.className = this.editor.isFullscreen() ?
					'bi-arrows-angle-contract' : 'bi-arrows-fullscreen';
			}
		}
	}

	/**
	 * Toggle code view
	 * @private
	 */
	toggleCodeView() {
		if (!this.codeViewActive) {
			// Switch to code view
			this.codeViewActive = true;

			// Store current content
			const content = this.editor.getContent();

			// Create code view textarea if not exists
			if (!this.codeViewTextarea) {
				this.codeViewTextarea = document.createElement('textarea');
				this.codeViewTextarea.className = 'form-control font-monospace';
				this.codeViewTextarea.style.width = '100%';
				this.codeViewTextarea.style.height = this.editor.editorElement.style.height;
				this.codeViewTextarea.style.border = 'none';
				this.codeViewTextarea.style.resize = 'none';
			}

			// Set content and show
			this.codeViewTextarea.value = this._formatHTML(content);
			this.codeViewTextarea.style.minHeight = this.editor.editorElement.style.minHeight;
			this.codeViewTextarea.style.maxHeight = this.editor.editorElement.style.maxHeight;

			// Hide editor and show code view
			this.editor.editorElement.style.display = 'none';
			this.editor.editorElement.parentNode.appendChild(this.codeViewTextarea);

			// Disable formatting buttons
			this._disableFormattingButtons();

			// Update button state
			const button = this.buttons.get('codeview');
			if (button) {
				button.classList.add('active');
			}

			// Focus code view
			this.codeViewTextarea.focus();

		} else {
			// Switch back to WYSIWYG view
			this.codeViewActive = false;

			// Get code content
			const code = this.codeViewTextarea.value;

			// Set content back to editor
			this.editor.setContent(code);

			// Show editor and hide code view
			this.editor.editorElement.style.display = '';
			if (this.codeViewTextarea.parentNode) {
				this.codeViewTextarea.parentNode.removeChild(this.codeViewTextarea);
			}

			// Enable formatting buttons
			this._enableFormattingButtons();

			// Update button state
			const button = this.buttons.get('codeview');
			if (button) {
				button.classList.remove('active');
			}

			// Focus editor
			this.editor.focus();
		}
	}

	/**
	 * Format HTML for display
	 * @private
	 * @param {string} html - HTML to format
	 * @returns {string} Formatted HTML
	 */
	_formatHTML(html) {
		// Basic HTML formatting
		let formatted = html;

		// Add newlines after block tags
		formatted = formatted.replace(/(<\/?(p|div|h[1-6]|ul|ol|li|blockquote|pre|table|tr|td|th|thead|tbody)[^>]*>)/gi, '\n$1');
		formatted = formatted.replace(/<br\s*\/?>/gi, '<br>\n');

		// Indent nested tags
		const lines = formatted.split('\n');
		let indentLevel = 0;
		const formattedLines = [];

		lines.forEach(line => {
			const trimmed = line.trim();
			if (!trimmed) return;

			// Decrease indent for closing tags
			if (trimmed.match(/^<\/(div|ul|ol|table|thead|tbody|tr|blockquote)>/i)) {
				indentLevel = Math.max(0, indentLevel - 1);
			}

			// Add indented line
			formattedLines.push('\t'.repeat(indentLevel) + trimmed);

			// Increase indent for opening tags
			if (trimmed.match(/^<(div|ul|ol|table|thead|tbody|tr|blockquote)(?:\s|>)/i) && !trimmed.match(/\/>/)) {
				indentLevel++;
			}
		});

		return formattedLines.join('\n');
	}

	/**
	 * Disable formatting buttons during code view
	 * @private
	 */
	_disableFormattingButtons() {
		const excludeButtons = ['codeview', 'fullscreen', 'help'];

		this.buttons.forEach((button, name) => {
			if (!excludeButtons.includes(name)) {
				button.disabled = true;
			}
		});

		this.dropdowns.forEach(dropdown => {
			dropdown.button.disabled = true;
		});
	}

	/**
	 * Enable formatting buttons after code view
	 * @private
	 */
	_enableFormattingButtons() {
		this.buttons.forEach(button => {
			button.disabled = false;
		});

		this.dropdowns.forEach(dropdown => {
			dropdown.button.disabled = false;
		});
	}

	/**
	 * Show help dialog
	 * @private
	 */
	showHelp() {
		const modal = this._createModal('Editor Help', `
			<h6>Keyboard Shortcuts</h6>
			<table class="table table-sm">
				<tr><td><kbd>Ctrl+B</kbd></td><td>Bold</td></tr>
				<tr><td><kbd>Ctrl+I</kbd></td><td>Italic</td></tr>
				<tr><td><kbd>Ctrl+U</kbd></td><td>Underline</td></tr>
				<tr><td><kbd>Ctrl+Z</kbd></td><td>Undo</td></tr>
				<tr><td><kbd>Ctrl+Y</kbd></td><td>Redo</td></tr>
				<tr><td><kbd>Ctrl+K</kbd></td><td>Insert Link</td></tr>
				<tr><td><kbd>Ctrl+L</kbd></td><td>Align Left</td></tr>
				<tr><td><kbd>Ctrl+E</kbd></td><td>Align Center</td></tr>
				<tr><td><kbd>Ctrl+R</kbd></td><td>Align Right</td></tr>
				<tr><td><kbd>Ctrl+J</kbd></td><td>Justify</td></tr>
			</table>
		`, false);

		modal.show();
	}

	/**
	 * Handle undo
	 * @private
	 */
	undo() {
		this.editor.undo();
	}

	/**
	 * Handle redo
	 * @private
	 */
	redo() {
		this.editor.redo();
	}

	/**
	 * Wrap selection in code tags
	 * @private
	 */
	wrapCode() {
		const selection = this.editor.getSelectedText();
		if (selection) {
			this.editor.insertHTML(`<code>${selection}</code>`);
		}
	}

	// ============================================
	// Utility Methods
	// ============================================

	/**
	 * Create modal dialog
	 * @private
	 * @param {string} title - Modal title
	 * @param {string} body - Modal body HTML
	 * @param {boolean} showConfirm - Show confirm button
	 * @returns {Object} Modal object
	 */
	_createModal(title, body, showConfirm = true) {
		// Remove existing modal if any
		const existing = document.getElementById('wysiwygModal');
		if (existing) {
			existing.remove();
		}

		// Check if in fullscreen mode and adjust z-index
		const isFullscreen = this.editor.container.classList.contains('fullscreen');
		const zIndexStyle = isFullscreen ? 'style="z-index: 10000;"' : '';

		const modalHtml = `
			<div class="modal fade" id="wysiwygModal" tabindex="-1" ${zIndexStyle}>
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">${title}</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div class="modal-body">
							${body}
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
							${showConfirm ? '<button type="button" class="btn btn-primary" id="modalConfirm">Confirm</button>' : ''}
						</div>
					</div>
				</div>
			</div>
		`;

		document.body.insertAdjacentHTML('beforeend', modalHtml);

		const modalEl = document.getElementById('wysiwygModal');
		const modal = new bootstrap.Modal(modalEl);

		// Ensure backdrop also has high z-index in fullscreen
		if (isFullscreen) {
			modalEl.addEventListener('shown.bs.modal', () => {
				const backdrop = document.querySelector('.modal-backdrop');
				if (backdrop) {
					backdrop.style.zIndex = '9999';
				}
			});
		}

		const modalObj = {
			element: modalEl,
			bootstrap: modal,
			onConfirm: null,
			show: () => modal.show(),
			hide: () => modal.hide()
		};

		if (showConfirm) {
			document.getElementById('modalConfirm').addEventListener('click', () => {
				if (modalObj.onConfirm) {
					modalObj.onConfirm();
				}
				modal.hide();
			});
		}

		// Cleanup on hide
		modalEl.addEventListener('hidden.bs.modal', () => {
			modalEl.remove();
		});

		return modalObj;
	}

	/**
	 * Add custom styles for toolbar
	 * @private
	 */
	_addCustomStyles() {
		if (document.getElementById('wysiwyg-toolbar-styles')) return;

		const style = document.createElement('style');
		style.id = 'wysiwyg-toolbar-styles';
		style.textContent = `
			.wysiwyg-toolbar {
				padding: 0.5rem;
				border-bottom: 1px solid var(--bs-border-color);
				background: var(--bs-body-bg);
				display: flex;
				flex-wrap: wrap;
				gap: 0.25rem;
			}

			.wysiwyg-toolbar > .btn-group {
				margin-right: 0.5rem !important;
			}

			.wysiwyg-toolbar.disabled {
				opacity: 0.5;
				pointer-events: none;
			}

			/* Dropdown widths */
			.wysiwyg-toolbar .dropdown-menu {
				min-width: 150px;
			}

			.wysiwyg-toolbar .dropdown-menu.show {
				max-height: 400px;
				overflow-y: auto;
			}

			/* Color picker styles */
			.color-button-wrapper {
				position: relative;
				display: inline-block;
			}

			.color-indicator {
				position: absolute;
				bottom: -2px;
				left: 0;
				right: 0;
				height: 3px;
				border: 1px solid rgba(0,0,0,0.2);
			}

			.color-palette-menu {
				min-width: 250px;
			}

			.color-palette-grid {
				display: flex;
				flex-direction: column;
				gap: 2px;
			}

			.color-palette-row {
				display: flex;
				gap: 2px;
			}

			.color-palette-button {
				width: 25px;
				height: 25px;
				border: 1px solid #dee2e6;
				cursor: pointer;
				transition: transform 0.1s;
			}

			.color-palette-button:hover {
				transform: scale(1.2);
				border-color: #000;
				z-index: 1;
			}

			/* Fullscreen mode specific */
			.wysiwyg-editor-container.fullscreen {
				z-index: 9998;
			}

			.wysiwyg-editor-container.fullscreen .wysiwyg-editor-content {
				max-height: none !important;
			}

			/* Code view textarea */
			.wysiwyg-editor-wrapper textarea.form-control {
				background: var(--bs-body-bg);
				color: var(--bs-body-color);
				border: none;
				padding: 1rem;
			}
		`;
		document.head.appendChild(style);
	}

	/**
	 * Destroy toolbar
	 * @public
	 */
	destroy() {
		// Destroy tooltips
		if (this.tooltips && this.tooltips.length > 0) {
			this.tooltips.forEach(tooltip => {
				tooltip.dispose();
			});
			this.tooltips = [];
		}

		// Clear buttons and dropdowns
		this.buttons.clear();
		this.dropdowns.clear();
		this.container.innerHTML = '';
	}
}