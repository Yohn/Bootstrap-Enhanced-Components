/**
 * WYSIWYG Event Manager
 * Handles event delegation and callback management
 *
 * @class WysiwygEventManager
 * @version 1.0.0
 */
class WysiwygEventManager {
	/**
	 * Create event manager instance
	 *
	 * @param {WysiwygEditor} editor - Parent editor instance
	 * @param {Object} callbacks - Initial callback configuration
	 */
	constructor(editor, callbacks = {}) {
		this.editor = editor;
		this.callbacks = new Map();
		this.listeners = new Map();
		this.debounceTimers = new Map();

		// Initialize callbacks
		this._initCallbacks(callbacks);

		// Setup global event listeners
		this._setupGlobalListeners();
	}

	/**
	 * Initialize callbacks from configuration
	 * @private
	 * @param {Object} callbacks - Callback configuration
	 */
	_initCallbacks(callbacks) {
		Object.entries(callbacks).forEach(([event, handler]) => {
			if (typeof handler === 'function') {
				this.on(event, handler);
			}
		});
	}

	/**
	 * Setup global event listeners
	 * @private
	 */
	_setupGlobalListeners() {
		// Window resize handler
		this._addGlobalListener('resize', window, () => {
			this._handleResize();
		}, 100); // Debounced

		// Keyboard shortcuts at document level
		this._addGlobalListener('keydown', document, (e) => {
			this._handleGlobalKeydown(e);
		});

		// Handle visibility change
		this._addGlobalListener('visibilitychange', document, () => {
			this._handleVisibilityChange();
		});

		// Handle before unload for unsaved changes
		this._addGlobalListener('beforeunload', window, (e) => {
			return this._handleBeforeUnload(e);
		});
	}

	/**
	 * Add global event listener
	 * @private
	 * @param {string} event - Event name
	 * @param {EventTarget} target - Event target
	 * @param {Function} handler - Event handler
	 * @param {number} debounce - Debounce delay in ms
	 */
	_addGlobalListener(event, target, handler, debounce = 0) {
		const wrappedHandler = debounce > 0 ?
			this._debounce(handler.bind(this), debounce) :
			handler.bind(this);

		target.addEventListener(event, wrappedHandler);

		// Store for cleanup
		if (!this.listeners.has(target)) {
			this.listeners.set(target, new Map());
		}
		this.listeners.get(target).set(event, wrappedHandler);
	}

	/**
	 * Register event callback
	 * @public
	 * @param {string} event - Event name
	 * @param {Function} callback - Callback function
	 * @param {Object} options - Options {once, priority}
	 */
	on(event, callback, options = {}) {
		if (!this.callbacks.has(event)) {
			this.callbacks.set(event, []);
		}

		const handler = {
			callback,
			once: options.once || false,
			priority: options.priority || 0
		};

		const handlers = this.callbacks.get(event);
		handlers.push(handler);

		// Sort by priority (higher first)
		handlers.sort((a, b) => b.priority - a.priority);
	}

	/**
	 * Register one-time event callback
	 * @public
	 * @param {string} event - Event name
	 * @param {Function} callback - Callback function
	 */
	once(event, callback) {
		this.on(event, callback, { once: true });
	}

	/**
	 * Unregister event callback
	 * @public
	 * @param {string} event - Event name
	 * @param {Function} callback - Callback function to remove
	 */
	off(event, callback) {
		if (!this.callbacks.has(event)) return;

		const handlers = this.callbacks.get(event);
		const index = handlers.findIndex(h => h.callback === callback);

		if (index !== -1) {
			handlers.splice(index, 1);
		}

		if (handlers.length === 0) {
			this.callbacks.delete(event);
		}
	}

	/**
	 * Trigger event
	 * @public
	 * @param {string} event - Event name
	 * @param {*} data - Event data
	 * @returns {*} Last non-undefined return value
	 */
	trigger(event, data) {
		if (!this.callbacks.has(event)) return;

		const handlers = this.callbacks.get(event).slice(); // Copy array
		let result;

		for (const handler of handlers) {
			const value = handler.callback.call(this.editor, data);

			// Store last non-undefined return value
			if (value !== undefined) {
				result = value;
			}

			// Remove if one-time handler
			if (handler.once) {
				this.off(event, handler.callback);
			}

			// Stop if handler returned false
			if (value === false) {
				break;
			}
		}

		return result;
	}

	/**
	 * Trigger async event
	 * @public
	 * @param {string} event - Event name
	 * @param {*} data - Event data
	 * @returns {Promise<*>} Promise resolving to results
	 */
	async triggerAsync(event, data) {
		if (!this.callbacks.has(event)) return;

		const handlers = this.callbacks.get(event).slice();
		const results = [];

		for (const handler of handlers) {
			const value = await handler.callback.call(this.editor, data);
			results.push(value);

			if (handler.once) {
				this.off(event, handler.callback);
			}

			if (value === false) {
				break;
			}
		}

		return results;
	}

	// ============================================
	// Event Handlers
	// ============================================

	/**
	 * Handle window resize
	 * @private
	 */
	_handleResize() {
		this.trigger('resize', {
			width: window.innerWidth,
			height: window.innerHeight
		});

		// Adjust editor if in fullscreen
		if (this.editor.isFullscreen && this.editor.isFullscreen()) {
			this._adjustFullscreenSize();
		}
	}

	/**
	 * Handle global keydown
	 * @private
	 * @param {KeyboardEvent} event - Keyboard event
	 */
	_handleGlobalKeydown(event) {
		// Check if editor has focus
		if (!this.editor.hasFocus()) return;

		// Trigger global shortcut event
		this.trigger('globalKeydown', event);
	}

	/**
	 * Handle visibility change
	 * @private
	 */
	_handleVisibilityChange() {
		if (document.hidden) {
			this.trigger('blur');
			// Trigger autosave if enabled
			if (this.editor.storageManager) {
				this.editor.storageManager.save();
			}
		} else {
			this.trigger('focus');
		}
	}

	/**
	 * Handle before unload
	 * @private
	 * @param {Event} event - Before unload event
	 * @returns {string|undefined} Warning message if dirty
	 */
	_handleBeforeUnload(event) {
		if (this.editor.isDirtyCheck && this.editor.isDirtyCheck()) {
			const message = 'You have unsaved changes. Are you sure you want to leave?';
			event.returnValue = message;
			return message;
		}
	}

	/**
	 * Adjust fullscreen size
	 * @private
	 */
	_adjustFullscreenSize() {
		if (!this.editor.editorElement) return;

		const toolbar = this.editor.toolbarElement;
		const statusBar = this.editor.statusBar;

		const toolbarHeight = toolbar ? toolbar.offsetHeight : 0;
		const statusHeight = statusBar ? statusBar.offsetHeight : 0;
		const availableHeight = window.innerHeight - toolbarHeight - statusHeight;

		this.editor.editorElement.style.height = `${availableHeight}px`;
	}

	// ============================================
	// Utility Methods
	// ============================================

	/**
	 * Debounce function
	 * @private
	 * @param {Function} func - Function to debounce
	 * @param {number} wait - Wait time in ms
	 * @returns {Function} Debounced function
	 */
	_debounce(func, wait) {
		let timeout;

		return function debounced(...args) {
			const context = this;

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				func.apply(context, args);
			}, wait);
		};
	}

	/**
	 * Throttle function
	 * @private
	 * @param {Function} func - Function to throttle
	 * @param {number} limit - Limit time in ms
	 * @returns {Function} Throttled function
	 */
	_throttle(func, limit) {
		let inThrottle;

		return function throttled(...args) {
			const context = this;

			if (!inThrottle) {
				func.apply(context, args);
				inThrottle = true;

				setTimeout(() => {
					inThrottle = false;
				}, limit);
			}
		};
	}

	/**
	 * Clear all event listeners
	 * @public
	 */
	clear() {
		this.callbacks.clear();
	}

	/**
	 * Get all callbacks for an event
	 * @public
	 * @param {string} event - Event name
	 * @returns {Array} Array of callbacks
	 */
	getCallbacks(event) {
		return this.callbacks.has(event) ?
			this.callbacks.get(event).map(h => h.callback) : [];
	}

	/**
	 * Check if event has listeners
	 * @public
	 * @param {string} event - Event name
	 * @returns {boolean} True if has listeners
	 */
	hasListeners(event) {
		return this.callbacks.has(event) && this.callbacks.get(event).length > 0;
	}

	/**
	 * Create custom event
	 * @public
	 * @param {string} name - Event name
	 * @param {Object} detail - Event detail
	 * @returns {CustomEvent} Custom event
	 */
	createCustomEvent(name, detail = {}) {
		return new CustomEvent(`wysiwyg:${name}`, {
			detail: {
				editor: this.editor,
				...detail
			},
			bubbles: true,
			cancelable: true
		});
	}

	/**
	 * Dispatch custom event
	 * @public
	 * @param {string} name - Event name
	 * @param {Object} detail - Event detail
	 * @returns {boolean} False if prevented
	 */
	dispatchCustomEvent(name, detail = {}) {
		const event = this.createCustomEvent(name, detail);
		return this.editor.container.dispatchEvent(event);
	}

	/**
	 * Destroy event manager
	 * @public
	 */
	destroy() {
		// Remove global listeners
		this.listeners.forEach((events, target) => {
			events.forEach((handler, event) => {
				target.removeEventListener(event, handler);
			});
		});

		// Clear all callbacks
		this.callbacks.clear();
		this.listeners.clear();
		this.debounceTimers.clear();
	}
}