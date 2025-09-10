/**
 * AutoTextarea - Automatically adjusts textarea height based on content
 * Bootstrap 5.3 Compatible Component
 *
 * @class AutoTextarea
 */
class AutoTextarea {
	/**
	 * Default configuration options
	 * @static
	 */
	static defaults = {
		minHeight: 60,
		maxHeight: 400,
		padding: 12,
		lineHeight: 1.5,
		borderWidth: 1,
		animationSpeed: 150,
		scrollThreshold: 0.9,
		enableAnimation: true,
		autoFocus: false,
		placeholder: null,
		maxLength: null,
		onResize: null,
		onMaxHeight: null
	};

	/**
	 * Create an AutoTextarea instance
	 * @param {string|Element} selector - CSS selector or DOM element
	 * @param {Object} options - Configuration options
	 */
	constructor(selector, options = {}) {
		this.element = typeof selector === 'string'
			? document.querySelector(selector)
			: selector;

		if (!this.element) {
			throw new Error('AutoTextarea: Element not found');
		}

		if (this.element.tagName.toLowerCase() !== 'textarea') {
			throw new Error('AutoTextarea: Element must be a textarea');
		}

		// Merge options with defaults
		this.options = { ...AutoTextarea.defaults, ...options };

		// Initialize properties
		this.isResizing = false;
		this.observer = null;
		this.lastHeight = 0;

		// Store original attributes
		this.originalHeight = this.element.style.height;
		this.originalOverflow = this.element.style.overflow;
		this.originalResize = this.element.style.resize;

		// Initialize component
		this._init();
	}

	/**
	 * Initialize the component
	 * @private
	 */
	_init() {
		this._setupElement();
		this._bindEvents();
		this._setupObserver();

		// Set initial configuration
		if (this.options.placeholder) {
			this.element.placeholder = this.options.placeholder;
		}

		if (this.options.maxLength) {
			this.element.maxLength = this.options.maxLength;
		}

		// Auto focus if requested
		if (this.options.autoFocus) {
			this.element.focus();
		}

		// Initial resize
		this.resize();

		// Add initialized class
		this.element.classList.add('autotextarea-initialized');

		// Dispatch initialized event
		this._dispatchEvent('autotextarea:initialized', { instance: this });
	}

	/**
	 * Setup textarea element styles and properties
	 * @private
	 */
	_setupElement() {
		// Set base styles
		this.element.style.resize = 'none';
		this.element.style.overflow = 'hidden';
		this.element.style.minHeight = `${this.options.minHeight}px`;

		if (this.options.enableAnimation) {
			this.element.style.transition = `height ${this.options.animationSpeed}ms ease-out`;
		}

		// Add CSS class for styling hooks
		this.element.classList.add('autotextarea');
	}

	/**
	 * Bind event listeners
	 * @private
	 */
	_bindEvents() {
		// Input events for content changes
		this.element.addEventListener('input', this._handleInput.bind(this));
		this.element.addEventListener('paste', this._handlePaste.bind(this));
		this.element.addEventListener('cut', this._handleCut.bind(this));

		// Focus events
		this.element.addEventListener('focus', this._handleFocus.bind(this));
		this.element.addEventListener('blur', this._handleBlur.bind(this));

		// Keyboard events
		this.element.addEventListener('keydown', this._handleKeydown.bind(this));
	}

	/**
	 * Setup ResizeObserver for external changes
	 * @private
	 */
	_setupObserver() {
		if (typeof ResizeObserver !== 'undefined') {
			this.observer = new ResizeObserver(entries => {
				if (!this.isResizing) {
					this.resize();
				}
			});
			this.observer.observe(this.element);
		}
	}

	/**
	 * Handle input events
	 * @private
	 */
	_handleInput() {
		this.resize();
	}

	/**
	 * Handle paste events with delay for content processing
	 * @private
	 */
	_handlePaste() {
		setTimeout(() => this.resize(), 10);
	}

	/**
	 * Handle cut events with delay for content processing
	 * @private
	 */
	_handleCut() {
		setTimeout(() => this.resize(), 10);
	}

	/**
	 * Handle focus events
	 * @private
	 */
	_handleFocus() {
		this.element.classList.add('autotextarea-focused');
		this.resize();
	}

	/**
	 * Handle blur events
	 * @private
	 */
	_handleBlur() {
		this.element.classList.remove('autotextarea-focused');
	}

	/**
	 * Handle keydown events for special keys
	 * @private
	 */
	_handleKeydown(event) {
		// Handle Enter key
		if (event.key === 'Enter' && !event.shiftKey) {
			setTimeout(() => this.resize(), 10);
		}

		// Handle Backspace and Delete
		if (event.key === 'Backspace' || event.key === 'Delete') {
			setTimeout(() => this.resize(), 10);
		}
	}

	/**
	 * Calculate the required height for current content
	 * @returns {number} Required height in pixels
	 * @private
	 */
	_calculateHeight() {
		// Create hidden clone for measurement
		const clone = this.element.cloneNode(true);
		clone.style.position = 'absolute';
		clone.style.visibility = 'hidden';
		clone.style.height = 'auto';
		clone.style.maxHeight = 'none';
		clone.style.overflow = 'hidden';
		clone.style.resize = 'none';

		// Insert clone into DOM
		this.element.parentNode.insertBefore(clone, this.element.nextSibling);

		// Get computed styles for accurate calculation
		const computedStyle = window.getComputedStyle(clone);
		const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
		const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
		const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
		const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;

		// Calculate content height
		const scrollHeight = clone.scrollHeight;
		const totalPadding = paddingTop + paddingBottom + borderTop + borderBottom;
		const contentHeight = scrollHeight;

		// Remove clone
		clone.remove();

		// Apply constraints
		let finalHeight = Math.max(contentHeight, this.options.minHeight);
		finalHeight = Math.min(finalHeight, this.options.maxHeight);

		return finalHeight;
	}

	/**
	 * Perform resize operation
	 */
	resize() {
		if (this.isResizing) return;

		this.isResizing = true;

		const newHeight = this._calculateHeight();
		const currentHeight = this.element.offsetHeight;

		// Only resize if height actually changed
		if (newHeight !== currentHeight) {
			const oldHeight = currentHeight;

			// Apply new height
			this.element.style.height = `${newHeight}px`;

			// Handle scrolling when max height is reached
			if (newHeight >= this.options.maxHeight) {
				const scrollThreshold = this.options.maxHeight * this.options.scrollThreshold;

				if (this.element.scrollHeight > scrollThreshold) {
					this.element.style.overflow = 'auto';
				}

				// Trigger max height callback
				if (this.options.onMaxHeight && typeof this.options.onMaxHeight === 'function') {
					this.options.onMaxHeight.call(this, newHeight);
				}

				this._dispatchEvent('autotextarea:maxheight', {
					height: newHeight,
					oldHeight: oldHeight
				});
			} else {
				this.element.style.overflow = 'hidden';
			}

			// Check if back to minimum height
			if (newHeight === this.options.minHeight && oldHeight > this.options.minHeight) {
				this._dispatchEvent('autotextarea:minheight', {
					height: newHeight,
					oldHeight: oldHeight
				});
			}

			// Trigger resize callback
			if (this.options.onResize && typeof this.options.onResize === 'function') {
				this.options.onResize.call(this, newHeight, oldHeight);
			}

			// Dispatch resize event
			this._dispatchEvent('autotextarea:resize', {
				height: newHeight,
				oldHeight: oldHeight
			});

			this.lastHeight = newHeight;
		}

		this.isResizing = false;
	}

	/**
	 * Set minimum height
	 * @param {number} height - New minimum height in pixels
	 */
	setMinHeight(height) {
		this.options.minHeight = Math.max(0, parseInt(height));
		this.element.style.minHeight = `${this.options.minHeight}px`;
		this.resize();
	}

	/**
	 * Set maximum height
	 * @param {number} height - New maximum height in pixels
	 */
	setMaxHeight(height) {
		this.options.maxHeight = Math.max(this.options.minHeight, parseInt(height));
		this.resize();
	}

	/**
	 * Get current calculated height
	 * @returns {number} Current height in pixels
	 */
	getHeight() {
		return this.element.offsetHeight;
	}

	/**
	 * Reset textarea to minimum height and clear content
	 */
	reset() {
		this.element.value = '';
		this.element.style.height = `${this.options.minHeight}px`;
		this.element.style.overflow = 'hidden';
		this.lastHeight = this.options.minHeight;
	}

	/**
	 * Update configuration options
	 * @param {Object} newOptions - New options to merge
	 */
	updateOptions(newOptions) {
		this.options = { ...this.options, ...newOptions };

		// Re-apply relevant styles
		this.element.style.minHeight = `${this.options.minHeight}px`;

		if (this.options.enableAnimation) {
			this.element.style.transition = `height ${this.options.animationSpeed}ms ease-out`;
		} else {
			this.element.style.transition = 'none';
		}

		this.resize();
	}

	/**
	 * Dispatch custom events
	 * @private
	 */
	_dispatchEvent(eventName, detail) {
		const event = new CustomEvent(eventName, {
			detail: { ...detail, instance: this },
			bubbles: true,
			cancelable: true
		});
		this.element.dispatchEvent(event);
	}

	/**
	 * Destroy the component and cleanup
	 */
	destroy() {
		// Remove event listeners
		this.element.removeEventListener('input', this._handleInput.bind(this));
		this.element.removeEventListener('paste', this._handlePaste.bind(this));
		this.element.removeEventListener('cut', this._handleCut.bind(this));
		this.element.removeEventListener('focus', this._handleFocus.bind(this));
		this.element.removeEventListener('blur', this._handleBlur.bind(this));
		this.element.removeEventListener('keydown', this._handleKeydown.bind(this));

		// Cleanup observer
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}

		// Restore original styles
		this.element.style.height = this.originalHeight;
		this.element.style.overflow = this.originalOverflow;
		this.element.style.resize = this.originalResize;
		this.element.style.transition = '';
		this.element.style.minHeight = '';

		// Remove classes
		this.element.classList.remove('autotextarea', 'autotextarea-initialized', 'autotextarea-focused');

		// Dispatch destroyed event
		this._dispatchEvent('autotextarea:destroyed', { instance: this });
	}

	/**
	 * Static method to initialize multiple textareas
	 * @param {string} selector - CSS selector for textareas
	 * @param {Object} options - Configuration options
	 * @returns {Array} Array of AutoTextarea instances
	 */
	static initializeAll(selector, options = {}) {
		const elements = document.querySelectorAll(selector);
		return Array.from(elements).map(element => new AutoTextarea(element, options));
	}

	/**
	 * Get version information
	 * @static
	 */
	static get version() {
		return '1.0.0';
	}
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
	module.exports = AutoTextarea;
}

// AMD support
if (typeof define === 'function' && define.amd) {
	define(function() {
		return AutoTextarea;
	});
}

// Global registration
if (typeof window !== 'undefined') {
	window.AutoTextarea = AutoTextarea;
}