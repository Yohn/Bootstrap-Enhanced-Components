/**
 * WYSIWYG Command Manager
 * Handles command execution and custom command implementation
 *
 * @class WysiwygCommandManager
 * @version 1.0.0
 */
class WysiwygCommandManager {
	/**
	 * Create command manager instance
	 *
	 * @param {WysiwygEditor} editor - Parent editor instance
	 */
	constructor(editor) {
		this.editor = editor;
		this.customCommands = new Map();

		// Register custom commands
		this._registerCustomCommands();
	}

	/**
	 * Register custom commands
	 * @private
	 */
	_registerCustomCommands() {
		// Line height command
		this.registerCommand('lineHeight', (value) => {
			this._setLineHeight(value);
		});

		// Insert table commands
		this.registerCommand('insertTable', (params) => {
			this._insertTable(params);
		});

		// Table manipulation commands
		this.registerCommand('tableAddRow', (position) => {
			this._tableAddRow(position);
		});

		this.registerCommand('tableAddColumn', (position) => {
			this._tableAddColumn(position);
		});

		this.registerCommand('tableDeleteRow', () => {
			this._tableDeleteRow();
		});

		this.registerCommand('tableDeleteColumn', () => {
			this._tableDeleteColumn();
		});

		// Block quote command
		this.registerCommand('blockquote', () => {
			this._toggleBlockquote();
		});

		// Code block command
		this.registerCommand('codeBlock', () => {
			this._toggleCodeBlock();
		});

		// Clear formatting command
		this.registerCommand('clearFormatting', () => {
			this._clearFormatting();
		});

		// Save selection command
		this.registerCommand('saveSelection', () => {
			this._saveSelection();
		});

		// Restore selection command
		this.registerCommand('restoreSelection', () => {
			this._restoreSelection();
		});

		// Insert HTML at cursor
		this.registerCommand('insertHTML', (html) => {
			this._insertHTML(html);
		});

		// Format painter
		this.registerCommand('formatPainter', () => {
			this._toggleFormatPainter();
		});

		// Find and replace
		this.registerCommand('findReplace', (params) => {
			this._findAndReplace(params);
		});

		// Print
		this.registerCommand('print', () => {
			this._print();
		});

		// Word count
		this.registerCommand('wordCount', () => {
			return this._getWordCount();
		});
	}

	/**
	 * Register a custom command
	 * @public
	 * @param {string} name - Command name
	 * @param {Function} handler - Command handler function
	 */
	registerCommand(name, handler) {
		this.customCommands.set(name, handler);
	}

	/**
	 * Execute a command
	 * @public
	 * @param {string} command - Command name
	 * @param {*} value - Command value/parameters
	 * @returns {*} Command result
	 */
	execute(command, value = null) {
		// Check for custom command first
		if (this.customCommands.has(command)) {
			return this.customCommands.get(command).call(this, value);
		}

		// Try native command
		try {
			// Save selection before executing
			this._saveSelection();

			// Special handling for certain commands
			switch (command) {
				case 'formatBlock':
					return this._execFormatBlock(value);

				case 'fontSize':
					return this._execFontSize(value);

				case 'fontName':
					return this._execFontName(value);

				case 'createLink':
					return this._execCreateLink(value);

				case 'insertImage':
					return this._execInsertImage(value);

				case 'foreColor':
				case 'hiliteColor':
					return this._execColor(command, value);

				case 'insertHTML':
					return this._insertHTML(value);

				default:
					// Execute standard command
					return document.execCommand(command, false, value);
			}
		} catch (error) {
			console.error(`Command execution failed: ${command}`, error);
			return false;
		} finally {
			// Update editor state
			this.editor._syncContent();
			this.editor._updateToolbarState();
		}
	}

	/**
	 * Query command state
	 * @public
	 * @param {string} command - Command name
	 * @returns {boolean} Command state
	 */
	queryState(command) {
		try {
			return document.queryCommandState(command);
		} catch (e) {
			return false;
		}
	}

	/**
	 * Query command value
	 * @public
	 * @param {string} command - Command name
	 * @returns {string} Command value
	 */
	queryValue(command) {
		try {
			return document.queryCommandValue(command);
		} catch (e) {
			return '';
		}
	}

	/**
	 * Check if command is supported
	 * @public
	 * @param {string} command - Command name
	 * @returns {boolean} True if supported
	 */
	isSupported(command) {
		if (this.customCommands.has(command)) {
			return true;
		}

		try {
			return document.queryCommandSupported(command);
		} catch (e) {
			return false;
		}
	}

	// ============================================
	// Command Implementation Methods
	// ============================================

	/**
	 * Execute format block command
	 * @private
	 * @param {string} tag - HTML tag
	 * @returns {boolean} Success status
	 */
	_execFormatBlock(tag) {
		// Ensure tag format
		if (!tag.startsWith('<')) {
			tag = `<${tag}>`;
		}

		return document.execCommand('formatBlock', false, tag);
	}

	/**
	 * Execute font size command
	 * @private
	 * @param {string} size - Font size
	 * @returns {boolean} Success status
	 */
	_execFontSize(size) {
		// Convert pixel size to relative size (1-7)
		const sizeMap = {
			'8': '1',
			'10': '1',
			'12': '2',
			'14': '3',
			'16': '3',
			'18': '4',
			'20': '5',
			'24': '5',
			'28': '6',
			'32': '6',
			'36': '7',
			'48': '7',
			'64': '7'
		};

		const relativeSize = sizeMap[size] || '3';

		// Use CSS for more precise control
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const span = document.createElement('span');
			span.style.fontSize = `${size}px`;

			try {
				range.surroundContents(span);
			} catch (e) {
				// Fallback to execCommand
				return document.execCommand('fontSize', false, relativeSize);
			}

			return true;
		}

		return false;
	}

	/**
	 * Execute font name command
	 * @private
	 * @param {string} fontName - Font family name
	 * @returns {boolean} Success status
	 */
	_execFontName(fontName) {
		// Use CSS for better control
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const span = document.createElement('span');
			span.style.fontFamily = fontName;

			try {
				range.surroundContents(span);
			} catch (e) {
				// Fallback to execCommand
				return document.execCommand('fontName', false, fontName);
			}

			return true;
		}

		return false;
	}

	/**
	 * Execute create link command
	 * @private
	 * @param {Object|string} params - Link parameters or URL
	 * @returns {boolean} Success status
	 */
	_execCreateLink(params) {
		let url, target, rel;

		if (typeof params === 'string') {
			url = params;
		} else {
			url = params.url;
			target = params.target;
			rel = params.rel;
		}

		// Create link
		document.execCommand('createLink', false, url);

		// Add additional attributes if needed
		if (target || rel) {
			const selection = window.getSelection();
			if (selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				const link = range.commonAncestorContainer.nodeType === 1 ?
					range.commonAncestorContainer.querySelector('a[href="' + url + '"]') :
					range.commonAncestorContainer.parentElement.closest('a');

				if (link) {
					if (target) link.target = target;
					if (rel) link.rel = rel;
				}
			}
		}

		return true;
	}

	/**
	 * Execute insert image command
	 * @private
	 * @param {Object|string} params - Image parameters or URL
	 * @returns {boolean} Success status
	 */
	_execInsertImage(params) {
		let src, alt, width, height, className;

		if (typeof params === 'string') {
			src = params;
		} else {
			src = params.src;
			alt = params.alt;
			width = params.width;
			height = params.height;
			className = params.className;
		}

		// Create image element
		const img = document.createElement('img');
		img.src = src;
		if (alt) img.alt = alt;
		if (width) img.width = width;
		if (height) img.height = height;
		if (className) img.className = className;

		// Insert image
		this._insertNode(img);

		return true;
	}

	/**
	 * Execute color command
	 * @private
	 * @param {string} command - Color command (foreColor or hiliteColor)
	 * @param {string} color - Color value
	 * @returns {boolean} Success status
	 */
	_execColor(command, color) {
		// Handle transparent/inherit colors
		if (color === 'transparent' || color === 'inherit') {
			// Remove color styling
			const selection = window.getSelection();
			if (selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				const container = range.commonAncestorContainer;
				const element = container.nodeType === 1 ? container : container.parentElement;

				if (command === 'foreColor') {
					element.style.removeProperty('color');
				} else {
					element.style.removeProperty('background-color');
				}

				return true;
			}
		}

		return document.execCommand(command, false, color);
	}

	/**
	 * Set line height
	 * @private
	 * @param {string} value - Line height value
	 */
	_setLineHeight(value) {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const container = range.commonAncestorContainer;
			const block = this._getBlockElement(container);

			if (block) {
				block.style.lineHeight = value;
			}
		}
	}

	/**
	 * Insert table
	 * @private
	 * @param {Object} params - Table parameters
	 */
	_insertTable(params) {
		const { rows, cols, hasHeader, className } = params;

		const table = document.createElement('table');
		if (className) {
			table.className = className;
		} else {
			table.className = 'table table-bordered';
		}

		// Make table editable
		table.contentEditable = 'true';

		// Create header if needed
		if (hasHeader) {
			const thead = document.createElement('thead');
			const headerRow = document.createElement('tr');

			for (let i = 0; i < cols; i++) {
				const th = document.createElement('th');
				th.contentEditable = 'true';
				th.innerHTML = `Header ${i + 1}`;
				headerRow.appendChild(th);
			}

			thead.appendChild(headerRow);
			table.appendChild(thead);
		}

		// Create body
		const tbody = document.createElement('tbody');
		for (let r = 0; r < rows; r++) {
			const row = document.createElement('tr');

			for (let c = 0; c < cols; c++) {
				const cell = document.createElement('td');
				cell.contentEditable = 'true';
				cell.innerHTML = `&nbsp;`;
				row.appendChild(cell);
			}

			tbody.appendChild(row);
		}

		table.appendChild(tbody);

		// Insert table
		this._insertNode(table);

		// Focus first cell
		const firstCell = table.querySelector('td, th');
		if (firstCell) {
			firstCell.focus();
		}
	}

	/**
	 * Add row to table
	 * @private
	 * @param {string} position - 'above' or 'below'
	 */
	_tableAddRow(position) {
		const cell = this._getCurrentTableCell();
		if (!cell) return;

		const row = cell.parentElement;
		const table = row.closest('table');
		const rowIndex = Array.from(row.parentElement.children).indexOf(row);
		const colCount = row.children.length;

		const newRow = document.createElement('tr');
		for (let i = 0; i < colCount; i++) {
			const newCell = document.createElement(cell.tagName);
			newCell.innerHTML = '&nbsp;';
			newRow.appendChild(newCell);
		}

		if (position === 'above') {
			row.parentElement.insertBefore(newRow, row);
		} else {
			row.parentElement.insertBefore(newRow, row.nextSibling);
		}
	}

	/**
	 * Add column to table
	 * @private
	 * @param {string} position - 'left' or 'right'
	 */
	_tableAddColumn(position) {
		const cell = this._getCurrentTableCell();
		if (!cell) return;

		const cellIndex = Array.from(cell.parentElement.children).indexOf(cell);
		const table = cell.closest('table');
		const rows = table.querySelectorAll('tr');

		rows.forEach(row => {
			const cells = row.children;
			const newCell = document.createElement(cells[cellIndex].tagName);
			newCell.innerHTML = '&nbsp;';

			if (position === 'left') {
				cells[cellIndex].parentElement.insertBefore(newCell, cells[cellIndex]);
			} else {
				cells[cellIndex].parentElement.insertBefore(newCell, cells[cellIndex].nextSibling);
			}
		});
	}

	/**
	 * Delete table row
	 * @private
	 */
	_tableDeleteRow() {
		const cell = this._getCurrentTableCell();
		if (!cell) return;

		const row = cell.parentElement;
		const tbody = row.parentElement;

		// Don't delete last row
		if (tbody.children.length > 1) {
			row.remove();
		}
	}

	/**
	 * Delete table column
	 * @private
	 */
	_tableDeleteColumn() {
		const cell = this._getCurrentTableCell();
		if (!cell) return;

		const cellIndex = Array.from(cell.parentElement.children).indexOf(cell);
		const table = cell.closest('table');
		const rows = table.querySelectorAll('tr');

		// Don't delete last column
		if (cell.parentElement.children.length > 1) {
			rows.forEach(row => {
				row.children[cellIndex].remove();
			});
		}
	}

	/**
	 * Toggle blockquote
	 * @private
	 */
	_toggleBlockquote() {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const container = range.commonAncestorContainer;
			const blockquote = this._getParentElement(container, 'blockquote');

			if (blockquote) {
				// Remove blockquote
				this._unwrapElement(blockquote);
			} else {
				// Add blockquote
				document.execCommand('formatBlock', false, '<blockquote>');
			}
		}
	}

	/**
	 * Toggle code block
	 * @private
	 */
	_toggleCodeBlock() {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const container = range.commonAncestorContainer;
			const pre = this._getParentElement(container, 'pre');

			if (pre) {
				// Remove code block
				this._unwrapElement(pre);
			} else {
				// Add code block
				const preElement = document.createElement('pre');
				const codeElement = document.createElement('code');

				// Get selected content
				const content = range.extractContents();
				codeElement.appendChild(content);
				preElement.appendChild(codeElement);

				range.insertNode(preElement);
			}
		}
	}

	/**
	 * Clear all formatting
	 * @private
	 */
	_clearFormatting() {
		// Remove all inline styles
		document.execCommand('removeFormat', false, null);

		// Also remove any block formatting
		document.execCommand('formatBlock', false, 'p');

		// Clear any additional styles
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const container = range.commonAncestorContainer;
			const element = container.nodeType === 1 ? container : container.parentElement;

			// Remove all style attributes
			const styledElements = element.querySelectorAll('[style]');
			styledElements.forEach(el => {
				el.removeAttribute('style');
			});
		}
	}

	/**
	 * Insert HTML at cursor
	 * @private
	 * @param {string} html - HTML to insert
	 */
	_insertHTML(html) {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			range.deleteContents();

			// Create fragment from HTML
			const fragment = document.createRange().createContextualFragment(html);

			// Insert fragment
			range.insertNode(fragment);

			// Move cursor to end of inserted content
			range.collapse(false);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}

	/**
	 * Toggle format painter
	 * @private
	 */
	_toggleFormatPainter() {
		// This would implement a format painter feature
		// Store current formatting and apply to next selection
		console.log('Format painter - to be implemented');
	}

	/**
	 * Find and replace
	 * @private
	 * @param {Object} params - Find/replace parameters
	 */
	_findAndReplace(params) {
		const { find, replace, caseSensitive, wholeWord, replaceAll } = params;

		// This would implement find and replace functionality
		console.log('Find and replace - to be implemented', params);
	}

	/**
	 * Print editor content
	 * @private
	 */
	_print() {
		const content = this.editor.getContent();
		const printWindow = window.open('', '_blank');

		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>Print Preview</title>
				<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
				<style>
					body { padding: 20px; }
					@media print {
						body { padding: 0; }
					}
				</style>
			</head>
			<body>
				${content}
				<script>
					window.onload = function() {
						window.print();
						window.onafterprint = function() {
							window.close();
						};
					};
				</script>
			</body>
			</html>
		`);

		printWindow.document.close();
	}

	/**
	 * Get word count
	 * @private
	 * @returns {Object} Word and character count
	 */
	_getWordCount() {
		return {
			words: this.editor.getWordCount(),
			characters: this.editor.getCharCount()
		};
	}

	// ============================================
	// Utility Methods
	// ============================================

	/**
	 * Save current selection
	 * @private
	 */
	_saveSelection() {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			this.savedRange = selection.getRangeAt(0);
		}
	}

	/**
	 * Restore saved selection
	 * @private
	 */
	_restoreSelection() {
		if (this.savedRange) {
			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(this.savedRange);
		}
	}

	/**
	 * Insert node at cursor
	 * @private
	 * @param {Node} node - Node to insert
	 */
	_insertNode(node) {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			range.deleteContents();
			range.insertNode(node);

			// Move cursor after inserted node
			range.setStartAfter(node);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}

	/**
	 * Get parent element by tag name
	 * @private
	 * @param {Node} node - Starting node
	 * @param {string} tagName - Tag name to find
	 * @returns {Element|null} Parent element or null
	 */
	_getParentElement(node, tagName) {
		let element = node.nodeType === 1 ? node : node.parentElement;
		tagName = tagName.toUpperCase();

		while (element && element !== this.editor.editorElement) {
			if (element.tagName === tagName) {
				return element;
			}
			element = element.parentElement;
		}

		return null;
	}

	/**
	 * Get block level element
	 * @private
	 * @param {Node} node - Starting node
	 * @returns {Element|null} Block element or null
	 */
	_getBlockElement(node) {
		const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
			'BLOCKQUOTE', 'PRE', 'LI', 'TD', 'TH'];

		let element = node.nodeType === 1 ? node : node.parentElement;

		while (element && element !== this.editor.editorElement) {
			if (blockTags.includes(element.tagName)) {
				return element;
			}
			element = element.parentElement;
		}

		return null;
	}

	/**
	 * Get current table cell
	 * @private
	 * @returns {Element|null} Table cell or null
	 */
	_getCurrentTableCell() {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const container = range.commonAncestorContainer;

			return this._getParentElement(container, 'td') ||
				this._getParentElement(container, 'th');
		}

		return null;
	}

	/**
	 * Unwrap element
	 * @private
	 * @param {Element} element - Element to unwrap
	 */
	_unwrapElement(element) {
		const parent = element.parentElement;

		while (element.firstChild) {
			parent.insertBefore(element.firstChild, element);
		}

		element.remove();
	}

	/**
	 * Destroy command manager
	 * @public
	 */
	destroy() {
		this.customCommands.clear();
		this.savedRange = null;
	}
}