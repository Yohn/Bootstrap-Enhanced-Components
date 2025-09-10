/**
 * MultiSelect - Enhanced Bootstrap 5.3 Multiple Select Component
 *
 * Features:
 * - Searchable dropdown with real-time filtering
 * - Multiple selections with tag display
 * - Option grouping by categories
 * - Customizable rendering and templates
 * - Bootstrap 5.3 integration with dark mode support
 *
 * @author Bootstrap Extensions
 * @version 1.0.0
 */

class MultiSelect {
	/**
	 * Default configuration options
	 * @static
	 */
	static get DEFAULTS() {
		return {
			searchable: true,
			maxSelections: 0,
			placeholder: 'Select items...',
			closeOnSelect: false,
			showTags: true,
			groupBy: null,
			customRenderer: null,
			sortSelected: false,
			allowClear: true,
			searchPlaceholder: 'Search...',
			noResultsText: 'No results found',
			maxTagsDisplay: 0,
			tagTemplate: null,
			optionTemplate: null,
			groupTemplate: null,
			disabled: false,
			required: false,
			size: 'default',
			dropdownClass: '',
			containerClass: '',
			animation: true,
			zIndex: 1050
		};
	}

	/**
	 * CSS class names used by the component
	 * @static
	 */
	static get CSS_CLASSES() {
		return {
			container: 'multiselect-container',
			selection: 'multiselect-selection',
			tag: 'multiselect-tag',
			dropdown: 'multiselect-dropdown',
			search: 'multiselect-search',
			option: 'multiselect-option',
			group: 'multiselect-group',
			noResults: 'multiselect-no-results',
			disabled: 'multiselect-disabled',
			open: 'multiselect-open',
			loading: 'multiselect-loading'
		};
	}

	/**
	 * Create a new MultiSelect instance
	 *
	 * @param {string|HTMLElement} selector - CSS selector or DOM element
	 * @param {Object} options - Configuration options
	 */
	constructor(selector, options = {}) {
		// Get the target element
		this.element = typeof selector === 'string' ?
			document.querySelector(selector) : selector;

		if (!this.element) {
			throw new Error(`MultiSelect: Element not found - ${selector}`);
		}

		if (this.element.tagName !== 'SELECT') {
			throw new Error('MultiSelect: Target element must be a <select> element');
		}

		// Merge options with defaults
		this.options = { ...MultiSelect.DEFAULTS, ...options };

		// Initialize state
		this.isOpen = false;
		this.isDisabled = this.options.disabled || this.element.disabled;
		this.selectedValues = new Set();
		this.filteredOptions = [];
		this.allOptions = [];

		// Initialize the component
		this._init();
	}

	/**
	 * Initialize the component
	 * @private
	 */
	_init() {
		// Store reference for event handlers
		this._boundHandlers = {};

		// Parse existing options
		this._parseOptions();

		// Create the component structure
		this._createStructure();

		// Bind event handlers
		this._bindEvents();

		// Set initial values
		this._setInitialValues();

		// Mark as initialized
		this.element.style.display = 'none';
		this.element.classList.add('multiselect-initialized');

		// Trigger initialized event
		this._trigger('multiselect:init', {});
	}

	/**
	 * Parse options from the original select element
	 * @private
	 */
	_parseOptions() {
		this.allOptions = [];
		const options = this.element.querySelectorAll('option');

		options.forEach(option => {
			if (option.value) {
				const optionData = {
					value: option.value,
					text: option.textContent.trim(),
					selected: option.selected,
					disabled: option.disabled,
					group: option.getAttribute('data-group') || null
				};

				// Add any data attributes
				Array.from(option.attributes).forEach(attr => {
					if (attr.name.startsWith('data-') && attr.name !== 'data-group') {
						const key = attr.name.replace('data-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
						optionData[key] = attr.value;
					}
				});

				this.allOptions.push(optionData);
			}
		});

		this.filteredOptions = [...this.allOptions];
	}

	/**
	 * Create the component DOM structure
	 * @private
	 */
	_createStructure() {
		const classes = MultiSelect.CSS_CLASSES;

		// Create main container
		this.container = document.createElement('div');
		this.container.className = `${classes.container} ${this.options.containerClass}`;

		if (this.isDisabled) {
			this.container.classList.add(classes.disabled);
		}

		// Create selection area
		this._createSelectionArea();

		// Create dropdown
		this._createDropdown();

		// Insert after original select
		this.element.parentNode.insertBefore(this.container, this.element.nextSibling);
	}

	/**
	 * Create the selection display area
	 * @private
	 */
	_createSelectionArea() {
		const classes = MultiSelect.CSS_CLASSES;

		this.selectionArea = document.createElement('div');
		this.selectionArea.className = `${classes.selection} form-select`;

		// Apply size class
		if (this.element.classList.contains('form-select-sm')) {
			this.selectionArea.classList.add('form-select-sm');
		} else if (this.element.classList.contains('form-select-lg')) {
			this.selectionArea.classList.add('form-select-lg');
		}

		// Create placeholder/tags container
		this.tagsContainer = document.createElement('div');
		this.tagsContainer.className = 'd-flex flex-wrap align-items-center gap-1';

		// Create placeholder
		this.placeholder = document.createElement('span');
		this.placeholder.className = 'text-muted';
		this.placeholder.textContent = this.options.placeholder;
		this.tagsContainer.appendChild(this.placeholder);

		// Create dropdown arrow
		const arrow = document.createElement('div');
		arrow.className = 'ms-auto';
		arrow.innerHTML = '<i class="bi bi-chevron-down"></i>';

		this.selectionArea.appendChild(this.tagsContainer);
		this.selectionArea.appendChild(arrow);
		this.container.appendChild(this.selectionArea);
	}

	/**
	 * Create the dropdown menu
	 * @private
	 */
	_createDropdown() {
		const classes = MultiSelect.CSS_CLASSES;

		this.dropdown = document.createElement('div');
		this.dropdown.className = `${classes.dropdown} dropdown-menu ${this.options.dropdownClass}`;
		this.dropdown.style.zIndex = this.options.zIndex;

		// Create search input if enabled
		if (this.options.searchable) {
			this._createSearchInput();
		}

		// Create options container
		this.optionsContainer = document.createElement('div');
		this.optionsContainer.className = 'multiselect-options';

		// Create clear all button if enabled
		if (this.options.allowClear) {
			this._createClearButton();
		}

		this.dropdown.appendChild(this.optionsContainer);
		this.container.appendChild(this.dropdown);

		// Render initial options
		this._renderOptions();
	}

	/**
	 * Create search input
	 * @private
	 */
	_createSearchInput() {
		const searchContainer = document.createElement('div');
		searchContainer.className = `${MultiSelect.CSS_CLASSES.search} p-2 border-bottom`;

		this.searchInput = document.createElement('input');
		this.searchInput.type = 'text';
		this.searchInput.className = 'form-control form-control-sm';
		this.searchInput.placeholder = this.options.searchPlaceholder;
		this.searchInput.autocomplete = 'off';

		searchContainer.appendChild(this.searchInput);
		this.dropdown.appendChild(searchContainer);
	}

	/**
	 * Create clear all button
	 * @private
	 */
	_createClearButton() {
		const clearContainer = document.createElement('div');
		clearContainer.className = 'p-2 border-bottom';

		this.clearButton = document.createElement('button');
		this.clearButton.type = 'button';
		this.clearButton.className = 'btn btn-sm btn-outline-secondary w-100';
		this.clearButton.innerHTML = '<i class="bi bi-x-circle me-1"></i> Clear All';

		clearContainer.appendChild(this.clearButton);
		this.dropdown.appendChild(clearContainer);
	}

	/**
	 * Render options in the dropdown
	 * @private
	 */
	_renderOptions() {
		this.optionsContainer.innerHTML = '';

		if (this.filteredOptions.length === 0) {
			this._renderNoResults();
			return;
		}

		if (this.options.groupBy) {
			this._renderGroupedOptions();
		} else {
			this._renderFlatOptions();
		}
	}

	/**
	 * Render no results message
	 * @private
	 */
	_renderNoResults() {
		const noResults = document.createElement('div');
		noResults.className = `${MultiSelect.CSS_CLASSES.noResults} p-3 text-center text-muted`;
		noResults.textContent = this.options.noResultsText;
		this.optionsContainer.appendChild(noResults);
	}

	/**
	 * Render flat options list
	 * @private
	 */
	_renderFlatOptions() {
		this.filteredOptions.forEach(option => {
			const optionElement = this._createOptionElement(option);
			this.optionsContainer.appendChild(optionElement);
		});
	}

	/**
	 * Render grouped options
	 * @private
	 */
	_renderGroupedOptions() {
		const groups = this._groupOptions(this.filteredOptions);

		Object.keys(groups).forEach(groupName => {
			// Create group header
			const groupHeader = this._createGroupHeader(groupName);
			this.optionsContainer.appendChild(groupHeader);

			// Create group options
			groups[groupName].forEach(option => {
				const optionElement = this._createOptionElement(option);
				optionElement.classList.add('ps-4'); // Indent group options
				this.optionsContainer.appendChild(optionElement);
			});
		});
	}

	/**
	 * Group options by the specified property
	 * @private
	 * @param {Array} options - Options to group
	 * @returns {Object} Grouped options
	 */
	_groupOptions(options) {
		const groups = {};

		options.forEach(option => {
			const groupKey = option[this.options.groupBy] || 'Other';
			if (!groups[groupKey]) {
				groups[groupKey] = [];
			}
			groups[groupKey].push(option);
		});

		return groups;
	}

	/**
	 * Create group header element
	 * @private
	 * @param {string} groupName - Name of the group
	 * @returns {HTMLElement} Group header element
	 */
	_createGroupHeader(groupName) {
		const header = document.createElement('div');
		header.className = `${MultiSelect.CSS_CLASSES.group} dropdown-header`;

		if (this.options.groupTemplate && typeof this.options.groupTemplate === 'function') {
			header.innerHTML = this.options.groupTemplate(groupName);
		} else {
			header.textContent = groupName;
		}

		return header;
	}

	/**
	 * Create option element
	 * @private
	 * @param {Object} option - Option data
	 * @returns {HTMLElement} Option element
	 */
	_createOptionElement(option) {
		const optionEl = document.createElement('div');
		optionEl.className = `${MultiSelect.CSS_CLASSES.option} dropdown-item`;
		optionEl.setAttribute('data-value', option.value);

		if (option.disabled) {
			optionEl.classList.add('disabled');
		}

		if (this.selectedValues.has(option.value)) {
			optionEl.classList.add('active');
		}

		// Use custom renderer if provided
		if (this.options.customRenderer && typeof this.options.customRenderer === 'function') {
			optionEl.innerHTML = this.options.customRenderer(option);
		} else if (this.options.optionTemplate && typeof this.options.optionTemplate === 'function') {
			optionEl.innerHTML = this.options.optionTemplate(option);
		} else {
			optionEl.innerHTML = `
				<div class="d-flex align-items-center">
					<input type="checkbox" class="form-check-input me-2" ${this.selectedValues.has(option.value) ? 'checked' : ''}>
					<span>${this._escapeHtml(option.text)}</span>
				</div>
			`;
		}

		return optionEl;
	}

	/**
	 * Bind event handlers
	 * @private
	 */
	_bindEvents() {
		// Selection area click
		this._boundHandlers.selectionClick = this._handleSelectionClick.bind(this);
		this.selectionArea.addEventListener('click', this._boundHandlers.selectionClick);

		// Option click
		this._boundHandlers.optionClick = this._handleOptionClick.bind(this);
		this.optionsContainer.addEventListener('click', this._boundHandlers.optionClick);

		// Search input
		if (this.searchInput) {
			this._boundHandlers.searchInput = this._handleSearchInput.bind(this);
			this.searchInput.addEventListener('input', this._boundHandlers.searchInput);

			this._boundHandlers.searchKeydown = this._handleSearchKeydown.bind(this);
			this.searchInput.addEventListener('keydown', this._boundHandlers.searchKeydown);
		}

		// Clear button
		if (this.clearButton) {
			this._boundHandlers.clearClick = this._handleClearClick.bind(this);
			this.clearButton.addEventListener('click', this._boundHandlers.clearClick);
		}

		// Tag removal
		this._boundHandlers.tagRemove = this._handleTagRemove.bind(this);
		this.tagsContainer.addEventListener('click', this._boundHandlers.tagRemove);

		// Outside click to close
		this._boundHandlers.documentClick = this._handleDocumentClick.bind(this);
		document.addEventListener('click', this._boundHandlers.documentClick);

		// Keyboard navigation
		this._boundHandlers.keydown = this._handleKeydown.bind(this);
		this.container.addEventListener('keydown', this._boundHandlers.keydown);

		// Window resize
		this._boundHandlers.windowResize = this._handleWindowResize.bind(this);
		window.addEventListener('resize', this._boundHandlers.windowResize);
	}

	/**
	 * Handle selection area click
	 * @private
	 * @param {Event} e - Click event
	 */
	_handleSelectionClick(e) {
		e.preventDefault();
		e.stopPropagation();

		if (this.isDisabled) return;

		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	}

	/**
	 * Handle option click
	 * @private
	 * @param {Event} e - Click event
	 */
	_handleOptionClick(e) {
		e.preventDefault();
		e.stopPropagation();

		const optionEl = e.target.closest(`.${MultiSelect.CSS_CLASSES.option}`);
		if (!optionEl || optionEl.classList.contains('disabled')) return;

		const value = optionEl.getAttribute('data-value');
		const option = this.allOptions.find(opt => opt.value === value);

		if (!option) return;

		if (this.selectedValues.has(value)) {
			this._deselectOption(option);
		} else {
			this._selectOption(option);
		}

		if (this.options.closeOnSelect) {
			this.close();
		}
	}

	/**
	 * Handle search input
	 * @private
	 * @param {Event} e - Input event
	 */
	_handleSearchInput(e) {
		const query = e.target.value.toLowerCase().trim();
		this._filterOptions(query);
		this._trigger('multiselect:search', { query });
	}

	/**
	 * Handle search keydown
	 * @private
	 * @param {Event} e - Keydown event
	 */
	_handleSearchKeydown(e) {
		if (e.key === 'Escape') {
			this.close();
		}
	}

	/**
	 * Handle clear button click
	 * @private
	 * @param {Event} e - Click event
	 */
	_handleClearClick(e) {
		e.preventDefault();
		e.stopPropagation();
		this.clear();
	}

	/**
	 * Handle tag removal
	 * @private
	 * @param {Event} e - Click event
	 */
	_handleTagRemove(e) {
		if (e.target.classList.contains('btn-close') || e.target.hasAttribute('data-remove')) {
			e.preventDefault();
			e.stopPropagation();

			const value = e.target.getAttribute('data-remove') ||
				e.target.closest('[data-remove]')?.getAttribute('data-remove');

			if (value) {
				const option = this.allOptions.find(opt => opt.value === value);
				if (option) {
					this._deselectOption(option);
				}
			}
		}
	}

	/**
	 * Handle document click (for closing dropdown)
	 * @private
	 * @param {Event} e - Click event
	 */
	_handleDocumentClick(e) {
		if (!this.container.contains(e.target)) {
			this.close();
		}
	}

	/**
	 * Handle keyboard navigation
	 * @private
	 * @param {Event} e - Keydown event
	 */
	_handleKeydown(e) {
		if (this.isDisabled) return;

		switch (e.key) {
			case 'Enter':
			case ' ':
				if (!this.isOpen) {
					e.preventDefault();
					this.open();
				}
				break;
			case 'Escape':
				if (this.isOpen) {
					e.preventDefault();
					this.close();
				}
				break;
			case 'ArrowDown':
			case 'ArrowUp':
				if (this.isOpen) {
					e.preventDefault();
					this._navigateOptions(e.key === 'ArrowDown' ? 1 : -1);
				}
				break;
		}
	}

	/**
	 * Handle window resize
	 * @private
	 */
	_handleWindowResize() {
		if (this.isOpen) {
			this._positionDropdown();
		}
	}

	/**
	 * Navigate through options with keyboard
	 * @private
	 * @param {number} direction - Direction (1 for down, -1 for up)
	 */
	_navigateOptions(direction) {
		const options = this.optionsContainer.querySelectorAll(`.${MultiSelect.CSS_CLASSES.option}:not(.disabled)`);
		const currentFocus = this.optionsContainer.querySelector('.focus');
		let nextIndex = 0;

		if (currentFocus) {
			const currentIndex = Array.from(options).indexOf(currentFocus);
			nextIndex = currentIndex + direction;
		}

		if (nextIndex < 0) nextIndex = options.length - 1;
		if (nextIndex >= options.length) nextIndex = 0;

		// Remove previous focus
		if (currentFocus) {
			currentFocus.classList.remove('focus');
		}

		// Add focus to new option
		if (options[nextIndex]) {
			options[nextIndex].classList.add('focus');
			options[nextIndex].scrollIntoView({ block: 'nearest' });
		}
	}

	/**
	 * Filter options based on search query
	 * @private
	 * @param {string} query - Search query
	 */
	_filterOptions(query) {
		if (!query) {
			this.filteredOptions = [...this.allOptions];
		} else {
			this.filteredOptions = this.allOptions.filter(option =>
				option.text.toLowerCase().includes(query) ||
				(option.group && option.group.toLowerCase().includes(query))
			);
		}

		this._renderOptions();
	}

	/**
	 * Select an option
	 * @private
	 * @param {Object} option - Option to select
	 */
	_selectOption(option) {
		// Check max selections limit
		if (this.options.maxSelections > 0 &&
			this.selectedValues.size >= this.options.maxSelections) {
			return;
		}

		this.selectedValues.add(option.value);

		// Update original select element
		const originalOption = this.element.querySelector(`option[value="${option.value}"]`);
		if (originalOption) {
			originalOption.selected = true;
		}

		// Update display
		this._updateDisplay();
		this._updateOptionStates();

		// Trigger events
		this._trigger('multiselect:select', { value: option.value, option });
		this._trigger('multiselect:change', {
			values: Array.from(this.selectedValues),
			selected: this.getSelected()
		});
	}

	/**
	 * Deselect an option
	 * @private
	 * @param {Object} option - Option to deselect
	 */
	_deselectOption(option) {
		this.selectedValues.delete(option.value);

		// Update original select element
		const originalOption = this.element.querySelector(`option[value="${option.value}"]`);
		if (originalOption) {
			originalOption.selected = false;
		}

		// Update display
		this._updateDisplay();
		this._updateOptionStates();

		// Trigger events
		this._trigger('multiselect:deselect', { value: option.value, option });
		this._trigger('multiselect:change', {
			values: Array.from(this.selectedValues),
			selected: this.getSelected()
		});
	}

	/**
	 * Update option states in dropdown
	 * @private
	 */
	_updateOptionStates() {
		const optionElements = this.optionsContainer.querySelectorAll(`.${MultiSelect.CSS_CLASSES.option}`);

		optionElements.forEach(optionEl => {
			const value = optionEl.getAttribute('data-value');
			const checkbox = optionEl.querySelector('input[type="checkbox"]');

			if (this.selectedValues.has(value)) {
				optionEl.classList.add('active');
				if (checkbox) checkbox.checked = true;
			} else {
				optionEl.classList.remove('active');
				if (checkbox) checkbox.checked = false;
			}
		});
	}

	/**
	 * Update the selection display
	 * @private
	 */
	_updateDisplay() {
		// Clear current display
		this.tagsContainer.innerHTML = '';

		if (this.selectedValues.size === 0) {
			// Show placeholder
			this.placeholder.textContent = this.options.placeholder;
			this.tagsContainer.appendChild(this.placeholder);
		} else {
			// Show selected tags
			const selectedOptions = this.getSelected();

			// Sort if enabled
			const optionsToShow = this.options.sortSelected ?
				selectedOptions.sort((a, b) => a.text.localeCompare(b.text)) :
				selectedOptions;

			// Limit displayed tags if specified
			const displayOptions = this.options.maxTagsDisplay > 0 ?
				optionsToShow.slice(0, this.options.maxTagsDisplay) :
				optionsToShow;

			displayOptions.forEach(option => {
				const tag = this._createTag(option);
				this.tagsContainer.appendChild(tag);
			});

			// Show "+X more" if there are hidden tags
			if (this.options.maxTagsDisplay > 0 &&
				selectedOptions.length > this.options.maxTagsDisplay) {
				const remaining = selectedOptions.length - this.options.maxTagsDisplay;
				const moreTag = document.createElement('span');
				moreTag.className = 'badge bg-secondary';
				moreTag.textContent = `+${remaining} more`;
				this.tagsContainer.appendChild(moreTag);
			}
		}
	}

	/**
	 * Create a tag element for selected option
	 * @private
	 * @param {Object} option - Selected option
	 * @returns {HTMLElement} Tag element
	 */
	_createTag(option) {
		const tag = document.createElement('span');
		tag.className = `${MultiSelect.CSS_CLASSES.tag} badge bg-primary`;
		tag.setAttribute('data-value', option.value);

		if (this.options.tagTemplate && typeof this.options.tagTemplate === 'function') {
			tag.innerHTML = this.options.tagTemplate(option);
		} else {
			tag.innerHTML = `
				${this._escapeHtml(option.text)}
				<button type="button" class="btn-close btn-close-white ms-1"
					data-remove="${option.value}" aria-label="Remove"></button>
			`;
		}

		return tag;
	}

	/**
	 * Set initial values from the original select element
	 * @private
	 */
	_setInitialValues() {
		const selectedOptions = this.element.querySelectorAll('option[selected]');
		selectedOptions.forEach(option => {
			if (option.value) {
				this.selectedValues.add(option.value);
			}
		});

		this._updateDisplay();
		this._updateOptionStates();
	}

	/**
	 * Position the dropdown
	 * @private
	 */
	_positionDropdown() {
		const rect = this.selectionArea.getBoundingClientRect();
		const dropdownRect = this.dropdown.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const spaceBelow = viewportHeight - rect.bottom;
		const spaceAbove = rect.top;

		// Reset positioning
		this.dropdown.style.top = '';
		this.dropdown.style.bottom = '';
		this.dropdown.classList.remove('dropup');

		// Determine if dropdown should open upward
		if (spaceBelow < dropdownRect.height && spaceAbove > spaceBelow) {
			this.dropdown.classList.add('dropup');
			this.dropdown.style.bottom = '100%';
		} else {
			this.dropdown.style.top = '100%';
		}
	}

	/**
	 * Trigger custom event
	 * @private
	 * @param {string} eventName - Name of the event
	 * @param {Object} detail - Event detail data
	 */
	_trigger(eventName, detail = {}) {
		const event = new CustomEvent(eventName, {
			detail,
			bubbles: true,
			cancelable: true
		});
		this.element.dispatchEvent(event);
	}

	/**
	 * Escape HTML characters
	 * @private
	 * @param {string} text - Text to escape
	 * @returns {string} Escaped text
	 */
	_escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	// Public API Methods

	/**
	 * Open the dropdown
	 */
	open() {
		if (this.isDisabled || this.isOpen) return;

		this.isOpen = true;
		this.container.classList.add(MultiSelect.CSS_CLASSES.open);
		this.dropdown.classList.add('show');

		// Position dropdown
		this._positionDropdown();

		// Focus search input if available
		if (this.searchInput) {
			setTimeout(() => this.searchInput.focus(), 0);
		}

		// Animation
		if (this.options.animation) {
			this.dropdown.style.opacity = '0';
			this.dropdown.style.transform = 'translateY(-10px)';

			requestAnimationFrame(() => {
				this.dropdown.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
				this.dropdown.style.opacity = '1';
				this.dropdown.style.transform = 'translateY(0)';
			});
		}

		this._trigger('multiselect:open', {});
	}

	/**
	 * Close the dropdown
	 */
	close() {
		if (!this.isOpen) return;

		this.isOpen = false;
		this.container.classList.remove(MultiSelect.CSS_CLASSES.open);

		if (this.options.animation) {
			this.dropdown.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
			this.dropdown.style.opacity = '0';
			this.dropdown.style.transform = 'translateY(-10px)';

			setTimeout(() => {
				this.dropdown.classList.remove('show');
				this.dropdown.style.transition = '';
				this.dropdown.style.transform = '';
			}, 150);
		} else {
			this.dropdown.classList.remove('show');
		}

		// Clear search
		if (this.searchInput) {
			this.searchInput.value = '';
			this._filterOptions('');
		}

		// Remove focus classes
		const focusedOption = this.optionsContainer.querySelector('.focus');
		if (focusedOption) {
			focusedOption.classList.remove('focus');
		}

		this._trigger('multiselect:close', {});
	}

	/**
	 * Set selected values
	 * @param {Array} values - Array of values to select
	 */
	setValue(values) {
		if (!Array.isArray(values)) {
			values = [values];
		}

		// Clear current selections
		this.selectedValues.clear();

		// Update original select
		const options = this.element.querySelectorAll('option');
		options.forEach(option => option.selected = false);

		// Set new selections
		values.forEach(value => {
			if (this.allOptions.find(opt => opt.value === value)) {
				this.selectedValues.add(value);

				const originalOption = this.element.querySelector(`option[value="${value}"]`);
				if (originalOption) {
					originalOption.selected = true;
				}
			}
		});

		this._updateDisplay();
		this._updateOptionStates();

		this._trigger('multiselect:change', {
			values: Array.from(this.selectedValues),
			selected: this.getSelected()
		});
	}

	/**
	 * Get selected values
	 * @returns {Array} Array of selected values
	 */
	getValue() {
		return Array.from(this.selectedValues);
	}

	/**
	 * Get selected option objects
	 * @returns {Array} Array of selected option objects
	 */
	getSelected() {
		return this.allOptions.filter(option => this.selectedValues.has(option.value));
	}

	/**
	 * Add a new option
	 * @param {Object} option - Option to add
	 */
	addOption(option) {
		if (!option.value || this.allOptions.find(opt => opt.value === option.value)) {
			return;
		}

		this.allOptions.push(option);

		// Add to original select
		const optionEl = document.createElement('option');
		optionEl.value = option.value;
		optionEl.textContent = option.text;
		if (option.group) {
			optionEl.setAttribute('data-group', option.group);
		}
		this.element.appendChild(optionEl);

		// Update filtered options and re-render
		this._filterOptions(this.searchInput ? this.searchInput.value : '');
	}

	/**
	 * Remove an option
	 * @param {string} value - Value of option to remove
	 */
	removeOption(value) {
		// Remove from selections if selected
		if (this.selectedValues.has(value)) {
			this.selectedValues.delete(value);
		}

		// Remove from options array
		this.allOptions = this.allOptions.filter(opt => opt.value !== value);

		// Remove from original select
		const originalOption = this.element.querySelector(`option[value="${value}"]`);
		if (originalOption) {
			originalOption.remove();
		}

		// Update display and options
		this._updateDisplay();
		this._filterOptions(this.searchInput ? this.searchInput.value : '');
	}

	/**
	 * Clear all selections
	 */
	clear() {
		this.selectedValues.clear();

		// Update original select
		const options = this.element.querySelectorAll('option');
		options.forEach(option => option.selected = false);

		this._updateDisplay();
		this._updateOptionStates();

		this._trigger('multiselect:clear', {});
		this._trigger('multiselect:change', {
			values: [],
			selected: []
		});
	}

	/**
	 * Enable the component
	 */
	enable() {
		this.isDisabled = false;
		this.element.disabled = false;
		this.container.classList.remove(MultiSelect.CSS_CLASSES.disabled);
		this.selectionArea.classList.remove('disabled');
	}

	/**
	 * Disable the component
	 */
	disable() {
		this.isDisabled = true;
		this.element.disabled = true;
		this.container.classList.add(MultiSelect.CSS_CLASSES.disabled);
		this.selectionArea.classList.add('disabled');
		this.close();
	}

	/**
	 * Refresh the component
	 */
	refresh() {
		this._parseOptions();
		this._filterOptions('');
		this._updateDisplay();
		this._updateOptionStates();
	}

	/**
	 * Destroy the component
	 */
	destroy() {
		// Remove event listeners
		Object.keys(this._boundHandlers).forEach(key => {
			const handler = this._boundHandlers[key];

			switch (key) {
				case 'selectionClick':
					this.selectionArea.removeEventListener('click', handler);
					break;
				case 'optionClick':
					this.optionsContainer.removeEventListener('click', handler);
					break;
				case 'searchInput':
					if (this.searchInput) this.searchInput.removeEventListener('input', handler);
					break;
				case 'searchKeydown':
					if (this.searchInput) this.searchInput.removeEventListener('keydown', handler);
					break;
				case 'clearClick':
					if (this.clearButton) this.clearButton.removeEventListener('click', handler);
					break;
				case 'tagRemove':
					this.tagsContainer.removeEventListener('click', handler);
					break;
				case 'documentClick':
					document.removeEventListener('click', handler);
					break;
				case 'keydown':
					this.container.removeEventListener('keydown', handler);
					break;
				case 'windowResize':
					window.removeEventListener('resize', handler);
					break;
			}
		});

		// Remove DOM elements
		if (this.container && this.container.parentNode) {
			this.container.parentNode.removeChild(this.container);
		}

		// Show original select
		this.element.style.display = '';
		this.element.classList.remove('multiselect-initialized');

		// Clear references
		this.container = null;
		this.selectionArea = null;
		this.dropdown = null;
		this.searchInput = null;
		this.clearButton = null;
		this.tagsContainer = null;
		this.optionsContainer = null;
		this._boundHandlers = {};

		this._trigger('multiselect:destroy', {});
	}
}