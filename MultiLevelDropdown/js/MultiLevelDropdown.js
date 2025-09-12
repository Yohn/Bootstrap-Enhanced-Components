/**
 * MultiLevelDropdown - Bootstrap 5.3 compatible multi-level dropdown component
 *
 * @class MultiLevelDropdown
 * @version 1.0.0
 */
class MultiLevelDropdown {
	/**
	 * Default configuration options
	 * @type {Object}
	 */
	static DEFAULT_CONFIG = {
		selector: '.multilevel-dropdown',
		direction: 'auto', // 'auto', 'left', 'right'
		showOnHover: true,
		hideDelay: 300,
		columns: 1,
		columnBreakpoint: 'md',
		maxWidth: '300px',
		zIndexBase: 1050,
		animations: {
			enabled: true,
			duration: 200,
			easing: 'ease-out'
		},
		responsive: {
			enabled: true,
			collapseBreakpoint: 'lg'
		},
		accessibility: {
			enabled: true,
			announceChanges: true
		},
		callbacks: {
			onShow: null,
			onHide: null,
			onItemClick: null
		}
	};

	/**
	 * Bootstrap breakpoint values for calculations
	 * @type {Object}
	 */
	static BREAKPOINTS = {
		xs: 0,
		sm: 576,
		md: 768,
		lg: 992,
		xl: 1200,
		xxl: 1400
	};

	/**
	 * Constructor
	 * @param {Object} config - Configuration options
	 */
	constructor(config = {}) {
		this.config = this._mergeConfig(MultiLevelDropdown.DEFAULT_CONFIG, config);
		this.dropdowns = [];
		this.activeSubmenus = new Set();
		this.timeouts = new Map();
		this.isInitialized = false;

		// Bind methods to maintain context
		this._handleMouseEnter = this._handleMouseEnter.bind(this);
		this._handleMouseLeave = this._handleMouseLeave.bind(this);
		this._handleClick = this._handleClick.bind(this);
		this._handleKeydown = this._handleKeydown.bind(this);
		this._handleResize = this._handleResize.bind(this);
		this._handleBootstrapShow = this._handleBootstrapShow.bind(this);
		this._handleBootstrapHide = this._handleBootstrapHide.bind(this);

		// Auto-initialize
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.init());
		} else {
			this.init();
		}
	}

	/**
	 * Initialize the dropdown system
	 * @public
	 */
	init() {
		if (this.isInitialized) {
			return;
		}

		this._findDropdowns();
		this._attachEvents();
		this._setupAccessibility();
		this.isInitialized = true;

		this._dispatchEvent('multilevel.init', { instance: this });
	}

	/**
	 * Destroy the dropdown system
	 * @public
	 */
	destroy() {
		if (!this.isInitialized) {
			return;
		}

		this._detachEvents();
		this._clearTimeouts();
		this.activeSubmenus.clear();
		this.dropdowns = [];
		this.isInitialized = false;

		this._dispatchEvent('multilevel.destroy', { instance: this });
	}

	/**
	 * Update configuration
	 * @param {Object} newConfig - New configuration options
	 * @public
	 */
	updateConfig(newConfig) {
		const oldConfig = { ...this.config };
		this.config = this._mergeConfig(this.config, newConfig);

		// Re-initialize if necessary
		if (this._configRequiresReinit(oldConfig, this.config)) {
			this.destroy();
			this.init();
		}
	}

	/**
	 * Get current configuration
	 * @returns {Object} Current configuration
	 * @public
	 */
	getConfig() {
		return { ...this.config };
	}

	/**
	 * Show submenu programmatically
	 * @param {HTMLElement} submenuElement - Submenu to show
	 * @public
	 */
	showSubmenu(submenuElement) {
		if (!submenuElement || !submenuElement.classList.contains('dropdown-submenu')) {
			return;
		}

		this._showSubmenu(submenuElement);
	}

	/**
	 * Hide submenu programmatically
	 * @param {HTMLElement} submenuElement - Submenu to hide
	 * @public
	 */
	hideSubmenu(submenuElement) {
		if (!submenuElement) {
			return;
		}

		this._hideSubmenu(submenuElement);
	}

	/**
	 * Find all dropdown menus matching the selector
	 * @private
	 */
	_findDropdowns() {
		this.dropdowns = Array.from(document.querySelectorAll(this.config.selector));

		// Process each dropdown
		this.dropdowns.forEach(dropdown => {
			this._processDropdown(dropdown);
		});
	}

	/**
	 * Process individual dropdown menu
	 * @param {HTMLElement} dropdown - Dropdown menu element
	 * @private
	 */
	_processDropdown(dropdown) {
		// Add necessary classes and attributes
		if (!dropdown.classList.contains('multilevel-dropdown')) {
			dropdown.classList.add('multilevel-dropdown');
		}

		// Process submenus
		const submenus = dropdown.querySelectorAll('.dropdown-submenu');
		submenus.forEach(submenu => this._processSubmenu(submenu));
	}

	/**
	 * Process individual submenu
	 * @param {HTMLElement} submenu - Submenu element
	 * @private
	 */
	_processSubmenu(submenu) {
		const toggle = submenu.querySelector('.dropdown-toggle');
		const menu = submenu.querySelector('.dropdown-menu');

		if (!toggle || !menu) {
			return;
		}

		// Set up menu positioning and styling
		this._setupSubmenuStyling(submenu, menu);

		// Add accessibility attributes
		if (this.config.accessibility.enabled) {
			this._setupSubmenuAccessibility(submenu, toggle, menu);
		}
	}

	/**
	 * Setup submenu styling and positioning
	 * @param {HTMLElement} submenu - Submenu container
	 * @param {HTMLElement} menu - Dropdown menu
	 * @private
	 */
	_setupSubmenuStyling(submenu, menu) {
		// Apply column classes if specified
		const columnClasses = Array.from(submenu.classList).filter(cls =>
			cls.startsWith('dropdown-columns-')
		);

		if (columnClasses.length > 0) {
			columnClasses.forEach(cls => menu.classList.add(cls));
		}

		// Set maximum width
		if (this.config.maxWidth) {
			menu.style.setProperty('--multilevel-max-width', this.config.maxWidth);
		}

		// Setup positioning classes
		menu.style.position = 'absolute';
		menu.style.top = '0';
		menu.style.left = '100%';
		menu.style.zIndex = this.config.zIndexBase + this._getSubmenuDepth(submenu);
	}

	/**
	 * Setup accessibility attributes for submenu
	 * @param {HTMLElement} submenu - Submenu container
	 * @param {HTMLElement} toggle - Toggle element
	 * @param {HTMLElement} menu - Dropdown menu
	 * @private
	 */
	_setupSubmenuAccessibility(submenu, toggle, menu) {
		const menuId = this._generateId('multilevel-submenu');

		// Set ARIA attributes
		menu.id = menuId;
		menu.setAttribute('aria-labelledby', toggle.id || this._generateId('multilevel-toggle'));
		toggle.setAttribute('aria-haspopup', 'true');
		toggle.setAttribute('aria-expanded', 'false');
		toggle.setAttribute('aria-controls', menuId);

		// Set role if not already set
		if (!menu.getAttribute('role')) {
			menu.setAttribute('role', 'menu');
		}
	}

	/**
	 * Attach event listeners
	 * @private
	 */
	_attachEvents() {
		// Dropdown-level events
		this.dropdowns.forEach(dropdown => {
			if (this.config.showOnHover) {
				dropdown.addEventListener('mouseenter', this._handleMouseEnter);
				dropdown.addEventListener('mouseleave', this._handleMouseLeave);
			}

			dropdown.addEventListener('click', this._handleClick);
			dropdown.addEventListener('keydown', this._handleKeydown);

			// Bootstrap events
			const parentDropdown = dropdown.closest('.dropdown');
			if (parentDropdown) {
				parentDropdown.addEventListener('show.bs.dropdown', this._handleBootstrapShow);
				parentDropdown.addEventListener('hide.bs.dropdown', this._handleBootstrapHide);
			}
		});

		// Global events
		window.addEventListener('resize', this._handleResize);
		document.addEventListener('click', this._handleDocumentClick.bind(this));
	}

	/**
	 * Detach event listeners
	 * @private
	 */
	_detachEvents() {
		this.dropdowns.forEach(dropdown => {
			dropdown.removeEventListener('mouseenter', this._handleMouseEnter);
			dropdown.removeEventListener('mouseleave', this._handleMouseLeave);
			dropdown.removeEventListener('click', this._handleClick);
			dropdown.removeEventListener('keydown', this._handleKeydown);

			const parentDropdown = dropdown.closest('.dropdown');
			if (parentDropdown) {
				parentDropdown.removeEventListener('show.bs.dropdown', this._handleBootstrapShow);
				parentDropdown.removeEventListener('hide.bs.dropdown', this._handleBootstrapHide);
			}
		});

		window.removeEventListener('resize', this._handleResize);
	}

	/**
	 * Handle mouse enter events
	 * @param {Event} event - Mouse enter event
	 * @private
	 */
	_handleMouseEnter(event) {
		const submenu = event.target.closest('.dropdown-submenu');
		if (!submenu) {
			return;
		}

		// Clear any pending hide timeout
		this._clearTimeout(submenu);

		// Show submenu after a short delay
		const showTimeout = setTimeout(() => {
			this._showSubmenu(submenu);
		}, 50);

		this.timeouts.set(submenu, showTimeout);
	}

	/**
	 * Handle mouse leave events
	 * @param {Event} event - Mouse leave event
	 * @private
	 */
	_handleMouseLeave(event) {
		const submenu = event.target.closest('.dropdown-submenu');
		if (!submenu) {
			return;
		}

		// Clear any pending show timeout
		this._clearTimeout(submenu);

		// Hide submenu after delay
		const hideTimeout = setTimeout(() => {
			this._hideSubmenu(submenu);
		}, this.config.hideDelay);

		this.timeouts.set(submenu, hideTimeout);
	}

	/**
	 * Handle click events
	 * @param {Event} event - Click event
	 * @private
	 */
	_handleClick(event) {
		const toggle = event.target.closest('.dropdown-toggle');
		const submenu = event.target.closest('.dropdown-submenu');

		if (toggle && submenu) {
			event.preventDefault();
			event.stopPropagation();

			if (this.activeSubmenus.has(submenu)) {
				this._hideSubmenu(submenu);
			} else {
				this._showSubmenu(submenu);
			}

			// Execute callback
			this._executeCallback('onItemClick', {
				item: toggle,
				submenu: submenu,
				event: event
			});
		}
	}

	/**
	 * Handle keydown events for accessibility
	 * @param {Event} event - Keydown event
	 * @private
	 */
	_handleKeydown(event) {
		if (!this.config.accessibility.enabled) {
			return;
		}

		const { key } = event;
		const focusedElement = document.activeElement;
		const submenu = focusedElement.closest('.dropdown-submenu');

		switch (key) {
			case 'ArrowRight':
				if (submenu) {
					event.preventDefault();
					this._showSubmenu(submenu);
					this._focusFirstMenuItem(submenu);
				}
				break;

			case 'ArrowLeft':
				if (submenu && this.activeSubmenus.has(submenu)) {
					event.preventDefault();
					this._hideSubmenu(submenu);
					submenu.querySelector('.dropdown-toggle').focus();
				}
				break;

			case 'Escape':
				this._hideAllSubmenus();
				break;
		}
	}

	/**
	 * Handle window resize
	 * @private
	 */
	_handleResize() {
		// Debounce resize handling
		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(() => {
			this._repositionActiveSubmenus();
		}, 100);
	}

	/**
	 * Handle Bootstrap dropdown show event
	 * @param {Event} event - Bootstrap show event
	 * @private
	 */
	_handleBootstrapShow(event) {
		// Ensure our dropdowns are properly initialized
		const dropdown = event.target.querySelector(this.config.selector);
		if (dropdown && !this.dropdowns.includes(dropdown)) {
			this.dropdowns.push(dropdown);
			this._processDropdown(dropdown);
		}
	}

	/**
	 * Handle Bootstrap dropdown hide event
	 * @param {Event} event - Bootstrap hide event
	 * @private
	 */
	_handleBootstrapHide(event) {
		// Hide all active submenus when parent dropdown hides
		this._hideAllSubmenus();
	}

	/**
	 * Handle document click to close submenus
	 * @param {Event} event - Document click event
	 * @private
	 */
	_handleDocumentClick(event) {
		// Check if click is outside any dropdown
		const isInsideDropdown = event.target.closest('.dropdown-menu');
		if (!isInsideDropdown) {
			this._hideAllSubmenus();
		}
	}

	/**
	 * Show submenu with proper positioning
	 * @param {HTMLElement} submenu - Submenu to show
	 * @private
	 */
	_showSubmenu(submenu) {
		if (this.activeSubmenus.has(submenu)) {
			return;
		}

		const menu = submenu.querySelector('.dropdown-menu');
		if (!menu) {
			return;
		}

		// Hide sibling submenus
		this._hideSiblingSubmenus(submenu);

		// Position submenu
		this._positionSubmenu(submenu, menu);

		// Show with animation
		this._animateSubmenu(menu, 'show');

		// Update state
		this.activeSubmenus.add(submenu);
		submenu.classList.add('submenu-open');

		// Update accessibility
		if (this.config.accessibility.enabled) {
			const toggle = submenu.querySelector('.dropdown-toggle');
			if (toggle) {
				toggle.setAttribute('aria-expanded', 'true');
			}
		}

		// Execute callback
		this._executeCallback('onShow', {
			submenu: submenu,
			menu: menu
		});

		// Dispatch event
		this._dispatchEvent('multilevel.show', {
			submenu: submenu,
			menu: menu
		});
	}

	/**
	 * Hide submenu
	 * @param {HTMLElement} submenu - Submenu to hide
	 * @private
	 */
	_hideSubmenu(submenu) {
		if (!this.activeSubmenus.has(submenu)) {
			return;
		}

		const menu = submenu.querySelector('.dropdown-menu');
		if (!menu) {
			return;
		}

		// Hide child submenus first
		this._hideChildSubmenus(submenu);

		// Hide with animation
		this._animateSubmenu(menu, 'hide');

		// Update state
		this.activeSubmenus.delete(submenu);
		submenu.classList.remove('submenu-open');

		// Update accessibility
		if (this.config.accessibility.enabled) {
			const toggle = submenu.querySelector('.dropdown-toggle');
			if (toggle) {
				toggle.setAttribute('aria-expanded', 'false');
			}
		}

		// Execute callback
		this._executeCallback('onHide', {
			submenu: submenu,
			menu: menu
		});

		// Dispatch event
		this._dispatchEvent('multilevel.hide', {
			submenu: submenu,
			menu: menu
		});
	}

	/**
	 * Position submenu based on available space and configuration
	 * @param {HTMLElement} submenu - Submenu container
	 * @param {HTMLElement} menu - Dropdown menu
	 * @private
	 */
	_positionSubmenu(submenu, menu) {
		const rect = submenu.getBoundingClientRect();
		const menuRect = menu.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let direction = this.config.direction;

		// Auto-detect direction if needed
		if (direction === 'auto') {
			const spaceRight = viewportWidth - rect.right;
			const spaceLeft = rect.left;

			direction = spaceRight >= menuRect.width ? 'right' :
					   spaceLeft >= menuRect.width ? 'left' : 'right';
		}

		// Force direction based on CSS classes
		if (submenu.classList.contains('dropdown-left')) {
			direction = 'left';
		} else if (submenu.classList.contains('dropdown-right')) {
			direction = 'right';
		}

		// Apply positioning
		if (direction === 'left') {
			menu.style.left = '-100%';
			menu.style.right = 'auto';
			submenu.classList.add('submenu-left');
			submenu.classList.remove('submenu-right');
		} else {
			menu.style.left = '100%';
			menu.style.right = 'auto';
			submenu.classList.add('submenu-right');
			submenu.classList.remove('submenu-left');
		}

		// Adjust vertical position if needed
		const submenuRect = menu.getBoundingClientRect();
		if (submenuRect.bottom > viewportHeight) {
			const adjustment = submenuRect.bottom - viewportHeight + 10;
			menu.style.transform = `translateY(-${adjustment}px)`;
		}
	}

	/**
	 * Animate submenu show/hide
	 * @param {HTMLElement} menu - Menu to animate
	 * @param {string} action - 'show' or 'hide'
	 * @private
	 */
	_animateSubmenu(menu, action) {
		if (!this.config.animations.enabled) {
			menu.style.display = action === 'show' ? 'block' : 'none';
			return;
		}

		const { duration, easing } = this.config.animations;

		if (action === 'show') {
			menu.style.display = 'block';
			menu.style.opacity = '0';
			menu.style.transform = 'translateX(-10px)';
			menu.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;

			// Force reflow
			menu.offsetHeight;

			menu.style.opacity = '1';
			menu.style.transform = 'translateX(0)';
		} else {
			menu.style.transition = `opacity ${duration}ms ${easing}`;
			menu.style.opacity = '0';

			setTimeout(() => {
				menu.style.display = 'none';
				menu.style.transition = '';
				menu.style.transform = '';
			}, duration);
		}
	}

	/**
	 * Hide all active submenus
	 * @private
	 */
	_hideAllSubmenus() {
		Array.from(this.activeSubmenus).forEach(submenu => {
			this._hideSubmenu(submenu);
		});
	}

	/**
	 * Hide sibling submenus
	 * @param {HTMLElement} submenu - Current submenu
	 * @private
	 */
	_hideSiblingSubmenus(submenu) {
		const parent = submenu.parentElement;
		const siblings = parent.querySelectorAll(':scope > .dropdown-submenu');

		siblings.forEach(sibling => {
			if (sibling !== submenu && this.activeSubmenus.has(sibling)) {
				this._hideSubmenu(sibling);
			}
		});
	}

	/**
	 * Hide child submenus
	 * @param {HTMLElement} submenu - Parent submenu
	 * @private
	 */
	_hideChildSubmenus(submenu) {
		const childSubmenus = submenu.querySelectorAll('.dropdown-submenu');
		childSubmenus.forEach(child => {
			if (this.activeSubmenus.has(child)) {
				this._hideSubmenu(child);
			}
		});
	}

	/**
	 * Reposition active submenus (on resize)
	 * @private
	 */
	_repositionActiveSubmenus() {
		this.activeSubmenus.forEach(submenu => {
			const menu = submenu.querySelector('.dropdown-menu');
			if (menu) {
				this._positionSubmenu(submenu, menu);
			}
		});
	}

	/**
	 * Focus first menu item in submenu
	 * @param {HTMLElement} submenu - Submenu container
	 * @private
	 */
	_focusFirstMenuItem(submenu) {
		const firstItem = submenu.querySelector('.dropdown-menu .dropdown-item');
		if (firstItem) {
			firstItem.focus();
		}
	}

	/**
	 * Setup accessibility features
	 * @private
	 */
	_setupAccessibility() {
		if (!this.config.accessibility.enabled) {
			return;
		}

		// Add screen reader announcements
		if (this.config.accessibility.announceChanges) {
			this._createAriaLiveRegion();
		}
	}

	/**
	 * Create ARIA live region for announcements
	 * @private
	 */
	_createAriaLiveRegion() {
		if (document.getElementById('multilevel-announcements')) {
			return;
		}

		const liveRegion = document.createElement('div');
		liveRegion.id = 'multilevel-announcements';
		liveRegion.setAttribute('aria-live', 'polite');
		liveRegion.setAttribute('aria-atomic', 'true');
		liveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
		document.body.appendChild(liveRegion);
	}

	/**
	 * Clear timeout for submenu
	 * @param {HTMLElement} submenu - Submenu element
	 * @private
	 */
	_clearTimeout(submenu) {
		if (this.timeouts.has(submenu)) {
			clearTimeout(this.timeouts.get(submenu));
			this.timeouts.delete(submenu);
		}
	}

	/**
	 * Clear all timeouts
	 * @private
	 */
	_clearTimeouts() {
		this.timeouts.forEach(timeout => clearTimeout(timeout));
		this.timeouts.clear();
	}

	/**
	 * Get submenu depth level
	 * @param {HTMLElement} submenu - Submenu element
	 * @returns {number} Depth level
	 * @private
	 */
	_getSubmenuDepth(submenu) {
		let depth = 0;
		let current = submenu.parentElement;

		while (current && !current.classList.contains('multilevel-dropdown')) {
			if (current.classList.contains('dropdown-submenu')) {
				depth++;
			}
			current = current.parentElement;
		}

		return depth;
	}

	/**
	 * Generate unique ID
	 * @param {string} prefix - ID prefix
	 * @returns {string} Unique ID
	 * @private
	 */
	_generateId(prefix = 'multilevel') {
		return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Merge configuration objects
	 * @param {Object} target - Target configuration
	 * @param {Object} source - Source configuration
	 * @returns {Object} Merged configuration
	 * @private
	 */
	_mergeConfig(target, source) {
		const result = { ...target };

		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
					result[key] = this._mergeConfig(target[key] || {}, source[key]);
				} else {
					result[key] = source[key];
				}
			}
		}

		return result;
	}

	/**
	 * Check if configuration requires reinitialization
	 * @param {Object} oldConfig - Previous configuration
	 * @param {Object} newConfig - New configuration
	 * @returns {boolean} Whether reinit is required
	 * @private
	 */
	_configRequiresReinit(oldConfig, newConfig) {
		const criticalKeys = ['selector', 'accessibility.enabled'];

		return criticalKeys.some(key => {
			const oldValue = this._getNestedValue(oldConfig, key);
			const newValue = this._getNestedValue(newConfig, key);
			return oldValue !== newValue;
		});
	}

	/**
	 * Get nested object value by key path
	 * @param {Object} obj - Object to search
	 * @param {string} path - Dot-separated key path
	 * @returns {*} Value at path
	 * @private
	 */
	_getNestedValue(obj, path) {
		return path.split('.').reduce((current, key) => current && current[key], obj);
	}

	/**
	 * Execute callback function if defined
	 * @param {string} callbackName - Name of callback
	 * @param {*} data - Data to pass to callback
	 * @private
	 */
	_executeCallback(callbackName, data) {
		const callback = this.config.callbacks[callbackName];
		if (typeof callback === 'function') {
			try {
				callback.call(this, data);
			} catch (error) {
				console.error(`MultiLevelDropdown: Error in ${callbackName} callback:`, error);
			}
		}
	}

	/**
	 * Dispatch custom event
	 * @param {string} eventName - Event name
	 * @param {Object} detail - Event detail data
	 * @private
	 */
	_dispatchEvent(eventName, detail = {}) {
		const event = new CustomEvent(eventName, {
			detail: detail,
			bubbles: true,
			cancelable: true
		});

		document.dispatchEvent(event);
	}

	/**
	 * Get current breakpoint
	 * @returns {string} Current breakpoint name
	 * @private
	 */
	_getCurrentBreakpoint() {
		const width = window.innerWidth;
		const breakpoints = MultiLevelDropdown.BREAKPOINTS;

		for (const [name, value] of Object.entries(breakpoints).reverse()) {
			if (width >= value) {
				return name;
			}
		}

		return 'xs';
	}

	/**
	 * Check if current breakpoint is below specified breakpoint
	 * @param {string} breakpoint - Breakpoint to check against
	 * @returns {boolean} Whether current breakpoint is below specified
	 * @private
	 */
	_isBreakpointBelow(breakpoint) {
		const current = this._getCurrentBreakpoint();
		const currentValue = MultiLevelDropdown.BREAKPOINTS[current];
		const targetValue = MultiLevelDropdown.BREAKPOINTS[breakpoint];

		return currentValue < targetValue;
	}
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
	module.exports = MultiLevelDropdown;
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
	window.MultiLevelDropdown = MultiLevelDropdown;
}