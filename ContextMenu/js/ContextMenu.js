/**
 * ContextMenu - Bootstrap 5.3 Right Click Context Menu
 * @class
 */
class ContextMenu {
	/**
	 * @param {string} selector - CSS selector for elements to attach menu to
	 * @param {Object} options - Configuration options
	 */
	constructor(selector, options = {}) {
		this.selector = selector;
		this.options = this._mergeOptions(options);
		this.$menu = null;
		this.currentElement = null;
		this.currentData = null;
		this.boundHandlers = new Map(); // Store bound handlers for cleanup

		this._init();
	}

	/**
	 * Merge user options with defaults
	 * @private
	 */
	_mergeOptions(options) {
		const defaults = {
			menuSource: 'mouse',        // 'mouse' or 'element'
			menuPosition: 'belowLeft',  // 'aboveLeft', 'aboveRight', 'belowLeft', 'belowRight'
			menuEvent: 'right-click',   // 'click', 'right-click', 'hover'
			fetchElementData: null,     // function to fetch element-specific data
			menuItems: [],              // array or object of menu items
			actions: []                 // legacy support
		};

		return { ...defaults, ...options };
	}

	/**
	 * Initialize the context menu
	 * @private
	 */
	_init() {
		this._createMenu();
		this._attachEventListeners();
		this._attachGlobalClose();
	}

	/**
	 * Create the menu DOM structure
	 * @private
	 */
	_createMenu() {
		// Remove existing menu if present
		if (this.$menu) {
			this.$menu.remove();
		}

		const menu = document.createElement('div');
		menu.className = 'dropdown-menu context-menu';
		menu.setAttribute('role', 'menu');
		menu.style.position = 'absolute';
		menu.style.zIndex = '9999';

		document.body.appendChild(menu);
		this.$menu = menu;
	}

	/**
	 * Attach event listeners to target elements
	 * @private
	 */
	_attachEventListeners() {
		const elements = document.querySelectorAll(this.selector);

		elements.forEach(element => {
			// Create bound handler for this element
			const handler = (e) => this._handleTrigger(e, element);

			switch (this.options.menuEvent) {
				case 'click':
					element.addEventListener('click', handler);
					this.boundHandlers.set(element, { event: 'click', handler });
					break;
				case 'right-click':
					element.addEventListener('contextmenu', handler);
					this.boundHandlers.set(element, { event: 'contextmenu', handler });
					break;
				case 'hover':
					element.addEventListener('mouseenter', handler);
					this.boundHandlers.set(element, { event: 'mouseenter', handler });
					break;
			}
		});
	}

	/**
	 * Handle menu trigger event
	 * @private
	 */
	_handleTrigger(event, element) {
		if (this.options.menuEvent === 'right-click') {
			event.preventDefault();
			event.stopPropagation();
		}

		this.currentElement = element;

		// Fetch element-specific data if function provided
		if (typeof this.options.fetchElementData === 'function') {
			this.currentData = this.options.fetchElementData(element);
		}

		this._renderMenu();
		this._positionMenu(event, element);
		this._showMenu();
	}

	/**
	 * Render menu items
	 * @private
	 */
	_renderMenu() {
		this.$menu.innerHTML = '';

		// Support both menuItems and legacy actions
		const items = this.options.menuItems.length > 0
			? this.options.menuItems
			: this.options.actions;

		// Convert object to array if needed
		const itemsArray = Array.isArray(items) ? items : Object.entries(items).map(([id, item]) => ({ ...item, id }));

		itemsArray.forEach(item => {
			this._renderMenuItem(item);
		});
	}

	/**
	 * Render a single menu item
	 * @private
	 */
	_renderMenuItem(item) {
		// Handle divider
		if (item.divider) {
			const divider = document.createElement('hr');
			divider.className = 'dropdown-divider';
			this.$menu.appendChild(divider);
			return;
		}

		// Handle header
		if (item.header) {
			const header = document.createElement('h6');
			header.className = 'dropdown-header';
			header.textContent = item.header;
			this.$menu.appendChild(header);
			return;
		}

		// Check if item should be shown
		if (typeof item.isShown === 'function' && !item.isShown(this.currentData)) {
			return;
		}

		// Handle submenu
		if (item.subMenuItems) {
			this._renderSubmenu(item);
			return;
		}

		// Regular menu item
		const li = document.createElement('li');
		const link = document.createElement('a');
		link.className = 'dropdown-item';
		link.setAttribute('role', 'menuitem');
		link.href = '#';

		// Apply custom classes
		if (item.classNames) {
			const classes = this._resolveClassNames(item.classNames);
			link.className += ' ' + classes;
		}

		// Check if enabled
		const isEnabled = typeof item.isEnabled === 'function'
			? item.isEnabled(this.currentData)
			: true;

		if (!isEnabled) {
			link.classList.add('disabled');
			link.setAttribute('aria-disabled', 'true');
		}

		// Add icon if specified
		if (item.iconClass) {
			const icon = document.createElement('i');
			icon.className = `fa ${item.iconClass} me-2`;
			link.appendChild(icon);
		}

		// Add name
		const name = typeof item.name === 'function'
			? item.name(this.currentData)
			: item.name;

		const nameSpan = document.createElement('span');
		nameSpan.innerHTML = name;
		link.appendChild(nameSpan);

		// Add title attribute
		if (item.title) {
			const title = typeof item.title === 'function'
				? item.title(this.currentData)
				: item.title;
			link.setAttribute('title', title);
		}

		// Attach click handler
		if (item.onClick && isEnabled) {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				item.onClick(this.currentData);
				this._hideMenu();
			});
		}

		li.appendChild(link);
		this.$menu.appendChild(li);
	}

	/**
	 * Render submenu
	 * @private
	 */
	_renderSubmenu(item) {
		const li = document.createElement('li');
		li.className = 'dropdown-submenu';

		const link = document.createElement('a');
		link.className = 'dropdown-item';
		link.href = '#';

		// Add icon if specified
		if (item.iconClass) {
			const icon = document.createElement('i');
			icon.className = `fa ${item.iconClass} me-2`;
			link.appendChild(icon);
		}

		// Add name
		const name = typeof item.name === 'function'
			? item.name(this.currentData)
			: item.name;
		link.appendChild(document.createTextNode(name));

		li.appendChild(link);

		// Create submenu
		const submenu = document.createElement('ul');
		submenu.className = 'dropdown-menu';

		const subItems = typeof item.subMenuItems === 'function'
			? item.subMenuItems(this.currentData)
			: item.subMenuItems;

		const subItemsArray = Array.isArray(subItems) ? subItems : Object.values(subItems);

		subItemsArray.forEach(subItem => {
			this._renderSubMenuItem(submenu, subItem);
		});

		li.appendChild(submenu);
		this.$menu.appendChild(li);
	}

	/**
	 * Render submenu item
	 * @private
	 */
	_renderSubMenuItem(submenu, item) {
		const li = document.createElement('li');
		const link = document.createElement('a');
		link.className = 'dropdown-item';
		link.href = '#';

		// Check if enabled
		const isEnabled = typeof item.isEnabled === 'function'
			? item.isEnabled(this.currentData)
			: true;

		if (!isEnabled) {
			link.classList.add('disabled');
		}

		// Add icon if specified
		if (item.iconClass) {
			const icon = document.createElement('i');
			icon.className = `fa ${item.iconClass} me-2`;
			link.appendChild(icon);
		}

		// Add name
		const name = typeof item.name === 'function'
			? item.name(this.currentData)
			: item.name;
		link.appendChild(document.createTextNode(name));

		// Add title
		if (item.title) {
			const title = typeof item.title === 'function'
				? item.title(this.currentData)
				: item.title;
			link.setAttribute('title', title);
		}

		// Attach click handler
		if (item.onClick && isEnabled) {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				item.onClick(this.currentData);
				this._hideMenu();
			});
		}

		li.appendChild(link);
		submenu.appendChild(li);
	}

	/**
	 * Resolve class names from string, object, or function
	 * @private
	 */
	_resolveClassNames(classNames) {
		if (typeof classNames === 'function') {
			classNames = classNames(this.currentData);
		}

		if (typeof classNames === 'string') {
			return classNames;
		}

		if (typeof classNames === 'object') {
			return Object.entries(classNames)
				.filter(([key, value]) => value)
				.map(([key]) => key)
				.join(' ');
		}

		return '';
	}

	/**
	 * Position the menu
	 * @private
	 */
	_positionMenu(event, element) {
		let x, y;

		if (this.options.menuSource === 'mouse') {
			x = event.pageX;
			y = event.pageY;
		} else {
			const rect = element.getBoundingClientRect();
			x = rect.left + window.scrollX;
			y = rect.top + window.scrollY;
		}

		// Get menu dimensions
		this.$menu.style.display = 'block';
		const menuWidth = this.$menu.offsetWidth;
		const menuHeight = this.$menu.offsetHeight;
		this.$menu.style.display = 'none';

		// Calculate position based on menuPosition option
		switch (this.options.menuPosition) {
			case 'aboveLeft':
				y -= menuHeight;
				break;
			case 'aboveRight':
				x -= menuWidth;
				y -= menuHeight;
				break;
			case 'belowRight':
				x -= menuWidth;
				if (this.options.menuSource === 'element') {
					y += element.offsetHeight;
				}
				break;
			case 'belowLeft':
			default:
				if (this.options.menuSource === 'element') {
					y += element.offsetHeight;
				}
				break;
		}

		// Ensure menu stays within viewport
		const viewportWidth = window.innerWidth + window.scrollX;
		const viewportHeight = window.innerHeight + window.scrollY;

		if (x + menuWidth > viewportWidth) {
			x = viewportWidth - menuWidth - 10;
		}
		if (y + menuHeight > viewportHeight) {
			y = viewportHeight - menuHeight - 10;
		}

		x = Math.max(10, x);
		y = Math.max(10, y);

		this.$menu.style.left = x + 'px';
		this.$menu.style.top = y + 'px';
	}

	/**
	 * Show the menu
	 * @private
	 */
	_showMenu() {
		this.$menu.classList.add('show');
		this.$menu.style.display = 'block';
	}

	/**
	 * Hide the menu
	 * @private
	 */
	_hideMenu() {
		this.$menu.classList.remove('show');
		this.$menu.style.display = 'none';
	}

	/**
	 * Attach global click handler to close menu
	 * @private
	 */
	_attachGlobalClose() {
		document.addEventListener('click', (e) => {
			if (!this.$menu.contains(e.target)) {
				this._hideMenu();
			}
		});

		document.addEventListener('contextmenu', (e) => {
			// Only hide if right-clicking outside and using right-click menu
			if (!this.$menu.contains(e.target) && this.options.menuEvent === 'right-click') {
				this._hideMenu();
			}
		});
	}

	/**
	 * Destroy the context menu instance
	 * @public
	 */
	destroy() {
		// Remove event listeners
		this.boundHandlers.forEach(({ event, handler }, element) => {
			element.removeEventListener(event, handler);
		});
		this.boundHandlers.clear();

		// Remove menu element
		if (this.$menu) {
			this.$menu.remove();
		}
	}
}