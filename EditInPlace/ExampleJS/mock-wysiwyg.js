/**
 * Mock WYSIWYG Editor
 * Simple demonstration of how a WYSIWYG editor would integrate with EditInPlace
 * Replace this with your actual WYSIWYG component (e.g., TinyMCE, CKEditor, Quill, etc.)
 */
class MockWYSIWYG {
	constructor(element, options = {}) {
		this.element = element;
		this.options = {
			toolbar: ['bold', 'italic', 'underline', '|', 'link', 'unlink'],
			height: 200,
			placeholder: 'Enter text...',
			...options
		};

		this.editorContainer = null;
		this.toolbarContainer = null;
		this.contentArea = null;

		this._init();
	}

	/**
	 * Initialize the WYSIWYG editor
	 */
	_init() {
		// Hide the original textarea
		this.element.style.display = 'none';

		// Create editor container
		this.editorContainer = document.createElement('div');
		this.editorContainer.className = 'mock-wysiwyg-editor border rounded';

		// Create toolbar
		this.toolbarContainer = this._createToolbar();
		this.editorContainer.appendChild(this.toolbarContainer);

		// Create content area
		this.contentArea = document.createElement('div');
		this.contentArea.className = 'mock-wysiwyg-content';
		this.contentArea.contentEditable = true;
		this.contentArea.innerHTML = this.element.value || '';
		this.contentArea.style.minHeight = this.options.height + 'px';
		this.contentArea.style.padding = '0.75rem';
		this.contentArea.style.outline = 'none';

		if (this.options.placeholder) {
			this.contentArea.dataset.placeholder = this.options.placeholder;
		}

		this.editorContainer.appendChild(this.contentArea);

		// Insert editor after textarea
		this.element.parentNode.insertBefore(this.editorContainer, this.element.nextSibling);

		// Add event listeners
		this._setupEventListeners();

		// Focus content area
		setTimeout(() => this.contentArea.focus(), 0);
	}

	/**
	 * Create toolbar
	 */
	_createToolbar() {
		const toolbar = document.createElement('div');
		toolbar.className = 'mock-wysiwyg-toolbar border-bottom p-2 bg-light';
		toolbar.style.display = 'flex';
		toolbar.style.gap = '0.25rem';
		toolbar.style.flexWrap = 'wrap';

		this.options.toolbar.forEach(button => {
			if (button === '|') {
				const separator = document.createElement('div');
				separator.style.width = '1px';
				separator.style.height = '24px';
				separator.style.backgroundColor = 'var(--bs-border-color)';
				separator.style.margin = '0 0.25rem';
				toolbar.appendChild(separator);
			} else {
				const btn = this._createToolbarButton(button);
				toolbar.appendChild(btn);
			}
		});

		return toolbar;
	}

	/**
	 * Create toolbar button
	 */
	_createToolbarButton(command) {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'btn btn-sm btn-outline-secondary';
		btn.style.padding = '0.25rem 0.5rem';
		btn.dataset.command = command;

		// Button icons/text
		const labels = {
			bold: '<strong>B</strong>',
			italic: '<em>I</em>',
			underline: '<u>U</u>',
			link: '🔗',
			unlink: '🔗✕',
			h1: 'H1',
			h2: 'H2',
			ul: '• List',
			ol: '1. List'
		};

		btn.innerHTML = labels[command] || command;
		btn.title = command.charAt(0).toUpperCase() + command.slice(1);

		btn.addEventListener('click', (e) => {
			e.preventDefault();
			this._executeCommand(command);
			this.contentArea.focus();
		});

		return btn;
	}

	/**
	 * Execute editor command
	 */
	_executeCommand(command) {
		switch (command) {
			case 'bold':
				document.execCommand('bold', false, null);
				break;
			case 'italic':
				document.execCommand('italic', false, null);
				break;
			case 'underline':
				document.execCommand('underline', false, null);
				break;
			case 'link':
				const url = prompt('Enter URL:');
				if (url) {
					document.execCommand('createLink', false, url);
				}
				break;
			case 'unlink':
				document.execCommand('unlink', false, null);
				break;
			case 'h1':
				document.execCommand('formatBlock', false, '<h1>');
				break;
			case 'h2':
				document.execCommand('formatBlock', false, '<h2>');
				break;
			case 'ul':
				document.execCommand('insertUnorderedList', false, null);
				break;
			case 'ol':
				document.execCommand('insertOrderedList', false, null);
				break;
		}

		this._updateTextarea();
	}

	/**
	 * Setup event listeners
	 */
	_setupEventListeners() {
		// Update textarea on content change
		this.contentArea.addEventListener('input', () => {
			this._updateTextarea();
		});

		// Update toolbar button states
		this.contentArea.addEventListener('mouseup', () => {
			this._updateToolbarStates();
		});

		this.contentArea.addEventListener('keyup', () => {
			this._updateToolbarStates();
		});

		// Handle placeholder
		this.contentArea.addEventListener('focus', () => {
			if (this.contentArea.textContent.trim() === '') {
				this.contentArea.classList.add('has-focus');
			}
		});

		this.contentArea.addEventListener('blur', () => {
			this.contentArea.classList.remove('has-focus');
		});
	}

	/**
	 * Update hidden textarea value
	 */
	_updateTextarea() {
		this.element.value = this.contentArea.innerHTML;
	}

	/**
	 * Update toolbar button states
	 */
	_updateToolbarStates() {
		const buttons = this.toolbarContainer.querySelectorAll('button[data-command]');

		buttons.forEach(btn => {
			const command = btn.dataset.command;
			const isActive = document.queryCommandState(command);

			if (isActive) {
				btn.classList.remove('btn-outline-secondary');
				btn.classList.add('btn-secondary');
			} else {
				btn.classList.remove('btn-secondary');
				btn.classList.add('btn-outline-secondary');
			}
		});
	}

	/**
	 * Get editor content
	 */
	getContent() {
		return this.contentArea.innerHTML;
	}

	/**
	 * Set editor content
	 */
	setContent(html) {
		this.contentArea.innerHTML = html;
		this._updateTextarea();
	}

	/**
	 * Destroy editor
	 */
	destroy() {
		if (this.editorContainer && this.editorContainer.parentNode) {
			this.editorContainer.parentNode.removeChild(this.editorContainer);
		}

		this.element.style.display = '';
	}
}

/**
 * Mock MultiSelect Component
 * Demonstrates integration with EditInPlace for multi-select functionality
 */
class MockMultiSelect {
	constructor(element, options = {}) {
		this.element = element;
		this.options = {
			searchable: true,
			maxSelections: null,
			placeholder: 'Select options...',
			...options
		};

		this.container = null;
		this.selectedValues = [];

		this._init();
	}

	/**
	 * Initialize multi-select
	 */
	_init() {
		// Get initially selected options
		this.selectedValues = Array.from(this.element.selectedOptions).map(opt => opt.value);

		// Hide original select
		this.element.style.display = 'none';

		// Create container
		this.container = document.createElement('div');
		this.container.className = 'mock-multiselect border rounded p-2';
		this.container.style.backgroundColor = 'var(--bs-body-bg)';

		// Create selected items display
		this.selectedContainer = document.createElement('div');
		this.selectedContainer.className = 'mb-2';
		this.selectedContainer.style.display = 'flex';
		this.selectedContainer.style.flexWrap = 'wrap';
		this.selectedContainer.style.gap = '0.25rem';
		this.container.appendChild(this.selectedContainer);

		// Create search input if enabled
		if (this.options.searchable) {
			this.searchInput = document.createElement('input');
			this.searchInput.type = 'text';
			this.searchInput.className = 'form-control form-control-sm mb-2';
			this.searchInput.placeholder = 'Search...';
			this.searchInput.addEventListener('input', () => this._filterOptions());
			this.container.appendChild(this.searchInput);
		}

		// Create options list
		this.optionsList = document.createElement('div');
		this.optionsList.className = 'mock-multiselect-options';
		this.optionsList.style.maxHeight = '200px';
		this.optionsList.style.overflowY = 'auto';
		this.container.appendChild(this.optionsList);

		// Insert after select
		this.element.parentNode.insertBefore(this.container, this.element.nextSibling);

		// Render
		this._renderSelected();
		this._renderOptions();
	}

	/**
	 * Render selected items
	 */
	_renderSelected() {
		this.selectedContainer.innerHTML = '';

		if (this.selectedValues.length === 0) {
			const placeholder = document.createElement('span');
			placeholder.className = 'text-muted small';
			placeholder.textContent = this.options.placeholder;
			this.selectedContainer.appendChild(placeholder);
			return;
		}

		this.selectedValues.forEach(value => {
			const option = Array.from(this.element.options).find(opt => opt.value === value);
			if (!option) return;

			const badge = document.createElement('span');
			badge.className = 'badge bg-primary';
			badge.style.display = 'flex';
			badge.style.alignItems = 'center';
			badge.style.gap = '0.25rem';
			badge.innerHTML = `
				${option.textContent}
				<button type="button" class="btn-close btn-close-white" style="width: 0.5em; height: 0.5em;" data-value="${value}"></button>
			`;

			badge.querySelector('.btn-close').addEventListener('click', (e) => {
				e.stopPropagation();
				this._removeValue(value);
			});

			this.selectedContainer.appendChild(badge);
		});
	}

	/**
	 * Render options list
	 */
	_renderOptions() {
		this.optionsList.innerHTML = '';

		const options = Array.from(this.element.options);

		options.forEach(option => {
			const isSelected = this.selectedValues.includes(option.value);

			const optionEl = document.createElement('div');
			optionEl.className = 'form-check';
			optionEl.innerHTML = `
				<input class="form-check-input" type="checkbox" value="${option.value}" id="opt_${option.value}" ${isSelected ? 'checked' : ''}>
				<label class="form-check-label" for="opt_${option.value}">
					${option.textContent}
				</label>
			`;

			const checkbox = optionEl.querySelector('input');
			checkbox.addEventListener('change', () => {
				if (checkbox.checked) {
					this._addValue(option.value);
				} else {
					this._removeValue(option.value);
				}
			});

			this.optionsList.appendChild(optionEl);
		});
	}

	/**
	 * Filter options by search
	 */
	_filterOptions() {
		const searchTerm = this.searchInput.value.toLowerCase();
		const options = this.optionsList.querySelectorAll('.form-check');

		options.forEach(option => {
			const label = option.querySelector('label').textContent.toLowerCase();
			option.style.display = label.includes(searchTerm) ? '' : 'none';
		});
	}

	/**
	 * Add value to selection
	 */
	_addValue(value) {
		if (this.selectedValues.includes(value)) return;

		if (this.options.maxSelections && this.selectedValues.length >= this.options.maxSelections) {
			alert(`Maximum ${this.options.maxSelections} selections allowed`);
			this._renderOptions();
			return;
		}

		this.selectedValues.push(value);
		this._updateSelect();
		this._renderSelected();
		this._renderOptions();
	}

	/**
	 * Remove value from selection
	 */
	_removeValue(value) {
		this.selectedValues = this.selectedValues.filter(v => v !== value);
		this._updateSelect();
		this._renderSelected();
		this._renderOptions();
	}

	/**
	 * Update original select element
	 */
	_updateSelect() {
		Array.from(this.element.options).forEach(opt => {
			opt.selected = this.selectedValues.includes(opt.value);
		});
	}

	/**
	 * Get selected values
	 */
	getValue() {
		return this.selectedValues;
	}

	/**
	 * Set selected values
	 */
	setValue(values) {
		this.selectedValues = Array.isArray(values) ? values : [values];
		this._updateSelect();
		this._renderSelected();
		this._renderOptions();
	}

	/**
	 * Destroy component
	 */
	destroy() {
		if (this.container && this.container.parentNode) {
			this.container.parentNode.removeChild(this.container);
		}

		this.element.style.display = '';
	}
}

/**
 * Mock InputMask Component
 * Demonstrates input masking integration
 */
class MockInputMask {
	constructor(element, options = {}) {
		this.element = element;
		this.options = {
			pattern: '',
			placeholder: '_',
			reverse: false,
			...options
		};

		this._init();
	}

	/**
	 * Initialize input mask
	 */
	_init() {
		// Add event listeners
		this.element.addEventListener('input', (e) => this._applyMask(e));
		this.element.addEventListener('keydown', (e) => this._handleKeydown(e));

		// Apply initial mask if value exists
		if (this.element.value) {
			this._applyMask({ target: this.element });
		}
	}

	/**
	 * Apply mask to input
	 */
	_applyMask(e) {
		const input = e.target;
		const value = input.value.replace(/\D/g, ''); // Remove non-digits
		const pattern = this.options.pattern;

		if (!pattern) return;

		let masked = '';
		let valueIndex = 0;

		for (let i = 0; i < pattern.length; i++) {
			const patternChar = pattern[i];

			if (patternChar === '9') {
				// Digit placeholder
				if (valueIndex < value.length) {
					masked += value[valueIndex];
					valueIndex++;
				} else {
					break;
				}
			} else if (patternChar === 'a') {
				// Letter placeholder (not implemented in this mock)
				break;
			} else {
				// Literal character
				masked += patternChar;
			}
		}

		input.value = masked;
	}

	/**
	 * Handle keydown events
	 */
	_handleKeydown(e) {
		// Allow: backspace, delete, tab, escape, enter
		if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
			// Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
			(e.keyCode === 65 && e.ctrlKey === true) ||
			(e.keyCode === 67 && e.ctrlKey === true) ||
			(e.keyCode === 86 && e.ctrlKey === true) ||
			(e.keyCode === 88 && e.ctrlKey === true) ||
			// Allow: home, end, left, right
			(e.keyCode >= 35 && e.keyCode <= 39)) {
			return;
		}

		// Ensure that it is a number for pattern '9'
		if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	}

	/**
	 * Destroy component
	 */
	destroy() {
		// Remove event listeners
		this.element.removeEventListener('input', this._applyMask);
		this.element.removeEventListener('keydown', this._handleKeydown);
	}
}

/**
 * Mock AutoTextarea Component
 * Auto-resizing textarea
 */
class MockAutoTextarea {
	constructor(element, options = {}) {
		this.element = element;
		this.options = {
			minRows: 3,
			maxRows: 10,
			...options
		};

		this._init();
	}

	/**
	 * Initialize auto-resize
	 */
	_init() {
		this.element.style.resize = 'none';
		this.element.style.overflow = 'hidden';

		// Set initial height
		this._resize();

		// Add event listener
		this.element.addEventListener('input', () => this._resize());
	}

	/**
	 * Resize textarea
	 */
	_resize() {
		this.element.style.height = 'auto';

		const lineHeight = parseInt(window.getComputedStyle(this.element).lineHeight);
		const minHeight = lineHeight * this.options.minRows;
		const maxHeight = lineHeight * this.options.maxRows;

		let newHeight = this.element.scrollHeight;

		if (newHeight < minHeight) {
			newHeight = minHeight;
		} else if (newHeight > maxHeight) {
			newHeight = maxHeight;
			this.element.style.overflow = 'auto';
		} else {
			this.element.style.overflow = 'hidden';
		}

		this.element.style.height = newHeight + 'px';
	}

	/**
	 * Destroy component
	 */
	destroy() {
		this.element.style.resize = '';
		this.element.style.overflow = '';
		this.element.style.height = '';
	}
}