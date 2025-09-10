/**
 * ToastAlerts - Advanced Toast Component for Bootstrap 5.3
 * Extends Bootstrap's native Toast functionality with dynamic creation,
 * positioning, queueing, and advanced interaction features.
 */
class ToastAlerts {
	static VERSION = '1.0.0';
	static NAME = 'toast-alerts';
	static DATA_KEY = 'bs.toast-alerts';
	static EVENT_KEY = `.${ToastAlerts.DATA_KEY}`;

	// Events
	static EVENT_BEFORE_SHOW = `beforeShow${ToastAlerts.EVENT_KEY}`;
	static EVENT_SHOWN = `shown${ToastAlerts.EVENT_KEY}`;
	static EVENT_BEFORE_HIDE = `beforeHide${ToastAlerts.EVENT_KEY}`;
	static EVENT_HIDDEN = `hidden${ToastAlerts.EVENT_KEY}`;
	static EVENT_PAUSED = `paused${ToastAlerts.EVENT_KEY}`;
	static EVENT_RESUMED = `resumed${ToastAlerts.EVENT_KEY}`;
	static EVENT_QUEUE_UPDATED = `queueUpdated${ToastAlerts.EVENT_KEY}`;

	// Default configuration
	static DEFAULT_OPTIONS = {
		position: 'top-right',
		duration: 5000,
		type: 'info',
		maxVisible: 5,
		animation: 'slide',
		animationDuration: 300,
		clickToClose: true,
		swipeToDismiss: true,
		progressBar: true,
		persistent: false,
		pauseOnHover: true,
		pauseOnFocus: true,
		showIcon: true,
		showCloseButton: true,
		zIndex: 1055,
		offset: { x: 20, y: 20 },
		customClass: '',
		ariaLive: 'polite',
		title: '',
		content: '',
		html: false,
		template: null,
		priority: 0,
		callbacks: {
			beforeShow: null,
			shown: null,
			beforeHide: null,
			hidden: null,
			paused: null,
			resumed: null
		}
	};

	// Predefined positions
	static POSITIONS = {
		'top-left': { top: 0, left: 0, transform: 'translateY(0)' },
		'top-center': { top: 0, left: '50%', transform: 'translateX(-50%)' },
		'top-right': { top: 0, right: 0, transform: 'translateY(0)' },
		'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
		'bottom-left': { bottom: 0, left: 0, transform: 'translateY(0)' },
		'bottom-center': { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
		'bottom-right': { bottom: 0, right: 0, transform: 'translateY(0)' }
	};

	// Toast types with their styling
	static TOAST_TYPES = {
		success: { icon: 'bi-check-circle-fill', bgClass: 'text-bg-success' },
		error: { icon: 'bi-x-circle-fill', bgClass: 'text-bg-danger' },
		warning: { icon: 'bi-exclamation-triangle-fill', bgClass: 'text-bg-warning' },
		info: { icon: 'bi-info-circle-fill', bgClass: 'text-bg-info' },
		default: { icon: 'bi-bell-fill', bgClass: 'text-bg-light' }
	};

	constructor(options = {}) {
		this.options = { ...ToastAlerts.DEFAULT_OPTIONS, ...options };
		this.toasts = new Map();
		this.containers = new Map();
		this.queue = null;
		this.animations = null;
		this.templates = null;
		this.globalId = 0;

		this._init();
	}

	/**
	 * Initialize the ToastAlerts component
	 * @private
	 */
	_init() {
		// Initialize sub-components
		this.queue = new ToastQueue(this.options.maxVisible);
		this.animations = new ToastAnimations(this.options.animationDuration);
		this.templates = new ToastTemplates();

		// Bind events
		this._bindGlobalEvents();

		// Create ARIA live region
		this._createAriaLiveRegion();
	}

	/**
	 * Show a new toast
	 * @param {string|Object} content - Toast content or options object
	 * @param {Object} options - Configuration options
	 * @returns {string} Toast ID
	 */
	show(content, options = {}) {
		// Handle different parameter patterns
		let toastOptions;
		if (typeof content === 'object' && content !== null && !content.nodeType) {
			toastOptions = { ...this.options, ...content };
		} else {
			toastOptions = { ...this.options, ...options, content };
		}

		// Generate unique ID
		const toastId = this._generateId();

		// Create toast data object
		const toastData = {
			id: toastId,
			options: toastOptions,
			element: null,
			timer: null,
			isVisible: false,
			isPaused: false,
			createdAt: Date.now(),
			priority: toastOptions.priority || 0
		};

		// Fire beforeShow event
		if (!this._fireEvent(ToastAlerts.EVENT_BEFORE_SHOW, toastData)) {
			return null;
		}

		// Check if we can show immediately or need to queue
		if (this._canShowToast(toastOptions.position)) {
			this._showToast(toastData);
		} else {
			this.queue.add(toastData);
			this._fireEvent(ToastAlerts.EVENT_QUEUE_UPDATED, { queue: this.queue.getAll() });
		}

		return toastId;
	}

	/**
	 * Hide a specific toast
	 * @param {string} toastId - Toast ID to hide
	 * @returns {boolean} Success status
	 */
	hide(toastId) {
		const toast = this.toasts.get(toastId);
		if (!toast) {
			return false;
		}

		return this._hideToast(toast);
	}

	/**
	 * Hide all visible toasts
	 * @returns {number} Number of toasts hidden
	 */
	hideAll() {
		let hiddenCount = 0;

		this.toasts.forEach(toast => {
			if (toast.isVisible && this._hideToast(toast)) {
				hiddenCount++;
			}
		});

		return hiddenCount;
	}

	/**
	 * Update an existing toast
	 * @param {string} toastId - Toast ID to update
	 * @param {string|Object} content - New content
	 * @param {Object} options - New options
	 * @returns {boolean} Success status
	 */
	update(toastId, content, options = {}) {
		const toast = this.toasts.get(toastId);
		if (!toast) {
			return false;
		}

		// Update options
		if (typeof content === 'object' && content !== null && !content.nodeType) {
			toast.options = { ...toast.options, ...content };
		} else {
			toast.options = { ...toast.options, ...options, content };
		}

		// Update the toast element
		if (toast.element) {
			this._updateToastContent(toast);
		}

		return true;
	}

	/**
	 * Get all visible toasts
	 * @returns {Array} Array of visible toast objects
	 */
	getVisible() {
		return Array.from(this.toasts.values()).filter(toast => toast.isVisible);
	}

	/**
	 * Get all queued toasts
	 * @returns {Array} Array of queued toast objects
	 */
	getQueue() {
		return this.queue ? this.queue.getAll() : [];
	}

	/**
	 * Set global default options
	 * @param {Object} options - Default options to set
	 */
	setGlobalDefaults(options) {
		this.options = { ...this.options, ...options };
	}

	/**
	 * Destroy the ToastAlerts instance
	 */
	destroy() {
		// Hide all toasts
		this.hideAll();

		// Clear timers
		this.toasts.forEach(toast => {
			if (toast.timer) {
				clearTimeout(toast.timer);
			}
		});

		// Remove containers
		this.containers.forEach(container => {
			if (container.parentNode) {
				container.parentNode.removeChild(container);
			}
		});

		// Unbind events
		this._unbindGlobalEvents();

		// Clear references
		this.toasts.clear();
		this.containers.clear();
		this.queue = null;
		this.animations = null;
		this.templates = null;
	}

	/**
	 * Check if a toast can be shown immediately
	 * @param {string} position - Toast position
	 * @returns {boolean} Whether toast can be shown
	 * @private
	 */
	_canShowToast(position) {
		const visibleToasts = this.getVisible().filter(toast =>
			toast.options.position === position
		);
		return visibleToasts.length < this.options.maxVisible;
	}

	/**
	 * Show a toast
	 * @param {Object} toastData - Toast data object
	 * @private
	 */
	_showToast(toastData) {
		// Create toast element
		toastData.element = this._createToastElement(toastData);

		// Get or create container
		const container = this._getContainer(toastData.options.position);

		// Add to container
		container.appendChild(toastData.element);

		// Store toast reference
		this.toasts.set(toastData.id, toastData);

		// Apply entrance animation
		this.animations.enter(toastData.element, toastData.options.animation, () => {
			toastData.isVisible = true;
			this._fireEvent(ToastAlerts.EVENT_SHOWN, toastData);

			// Start auto-hide timer if not persistent
			if (!toastData.options.persistent) {
				this._startTimer(toastData);
			}

			// Process queue
			this._processQueue();
		});

		// Announce to screen readers
		this._announceToScreenReader(toastData);
	}

	/**
	 * Hide a toast
	 * @param {Object} toast - Toast object to hide
	 * @returns {boolean} Success status
	 * @private
	 */
	_hideToast(toast) {
		if (!toast.isVisible) {
			return false;
		}

		// Fire beforeHide event
		if (!this._fireEvent(ToastAlerts.EVENT_BEFORE_HIDE, toast)) {
			return false;
		}

		// Clear timer
		this._clearTimer(toast);

		// Apply exit animation
		this.animations.exit(toast.element, toast.options.animation, () => {
			// Remove from DOM
			if (toast.element && toast.element.parentNode) {
				toast.element.parentNode.removeChild(toast.element);
			}

			// Update state
			toast.isVisible = false;

			// Fire hidden event
			this._fireEvent(ToastAlerts.EVENT_HIDDEN, toast);

			// Remove from toasts map
			this.toasts.delete(toast.id);

			// Process queue
			this._processQueue();
		});

		return true;
	}

	/**
	 * Create toast element
	 * @param {Object} toastData - Toast data object
	 * @returns {HTMLElement} Toast element
	 * @private
	 */
	_createToastElement(toastData) {
		const template = toastData.options.template ||
			this.templates.getDefault(toastData.options.type);

		const element = this.templates.render(template, toastData.options);

		// Add event listeners
		this._bindToastEvents(element, toastData);

		return element;
	}

	/**
	 * Update toast content
	 * @param {Object} toast - Toast object
	 * @private
	 */
	_updateToastContent(toast) {
		const newElement = this._createToastElement(toast);

		if (toast.element && toast.element.parentNode) {
			toast.element.parentNode.replaceChild(newElement, toast.element);
			toast.element = newElement;
		}
	}

	/**
	 * Get or create container for position
	 * @param {string} position - Toast position
	 * @returns {HTMLElement} Container element
	 * @private
	 */
	_getContainer(position) {
		if (this.containers.has(position)) {
			return this.containers.get(position);
		}

		const container = document.createElement('div');
		container.className = `toast-alerts-container toast-alerts-${position}`;
		container.setAttribute('aria-live', this.options.ariaLive);
		container.setAttribute('aria-atomic', 'false');

		// Apply positioning styles
		this._applyContainerStyles(container, position);

		// Add to DOM
		document.body.appendChild(container);

		// Store reference
		this.containers.set(position, container);

		return container;
	}

	/**
	 * Apply positioning styles to container
	 * @param {HTMLElement} container - Container element
	 * @param {string} position - Position key
	 * @private
	 */
	_applyContainerStyles(container, position) {
		const styles = {
			position: 'fixed',
			zIndex: this.options.zIndex,
			pointerEvents: 'none',
			display: 'flex',
			flexDirection: 'column',
			gap: '0.5rem',
			maxWidth: '400px'
		};

		// Apply predefined position styles
		if (ToastAlerts.POSITIONS[position]) {
			Object.assign(styles, ToastAlerts.POSITIONS[position]);
		}

		// Apply offset
		if (styles.top === 0) styles.top = `${this.options.offset.y}px`;
		if (styles.bottom === 0) styles.bottom = `${this.options.offset.y}px`;
		if (styles.left === 0) styles.left = `${this.options.offset.x}px`;
		if (styles.right === 0) styles.right = `${this.options.offset.x}px`;

		// Apply styles
		Object.assign(container.style, styles);
	}

	/**
	 * Bind toast-specific events
	 * @param {HTMLElement} element - Toast element
	 * @param {Object} toastData - Toast data object
	 * @private
	 */
	_bindToastEvents(element, toastData) {
		// Click to close
		if (toastData.options.clickToClose) {
			element.addEventListener('click', (e) => {
				if (e.target.closest('.toast-alerts-close')) {
					this._hideToast(toastData);
				}
			});
		}

		// Pause on hover/focus
		if (toastData.options.pauseOnHover) {
			element.addEventListener('mouseenter', () => this._pauseTimer(toastData));
			element.addEventListener('mouseleave', () => this._resumeTimer(toastData));
		}

		if (toastData.options.pauseOnFocus) {
			element.addEventListener('focusin', () => this._pauseTimer(toastData));
			element.addEventListener('focusout', () => this._resumeTimer(toastData));
		}

		// Swipe to dismiss
		if (toastData.options.swipeToDismiss) {
			this._bindSwipeEvents(element, toastData);
		}

		// Keyboard events
		element.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				this._hideToast(toastData);
			}
		});

		// Make focusable for accessibility
		element.setAttribute('tabindex', '0');
		element.style.pointerEvents = 'auto';
	}

	/**
	 * Bind swipe events for touch devices
	 * @param {HTMLElement} element - Toast element
	 * @param {Object} toastData - Toast data object
	 * @private
	 */
	_bindSwipeEvents(element, toastData) {
		let startX = 0;
		let startY = 0;
		let isDragging = false;

		element.addEventListener('touchstart', (e) => {
			startX = e.touches[0].clientX;
			startY = e.touches[0].clientY;
			isDragging = true;
		});

		element.addEventListener('touchmove', (e) => {
			if (!isDragging) return;

			const currentX = e.touches[0].clientX;
			const currentY = e.touches[0].clientY;
			const deltaX = currentX - startX;
			const deltaY = currentY - startY;

			// Check for horizontal swipe
			if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
				element.style.transform = `translateX(${deltaX}px)`;
				element.style.opacity = 1 - Math.abs(deltaX) / 200;
			}
		});

		element.addEventListener('touchend', (e) => {
			if (!isDragging) return;
			isDragging = false;

			const endX = e.changedTouches[0].clientX;
			const deltaX = endX - startX;

			if (Math.abs(deltaX) > 100) {
				this._hideToast(toastData);
			} else {
				// Reset position
				element.style.transform = '';
				element.style.opacity = '';
			}
		});
	}

	/**
	 * Start auto-hide timer
	 * @param {Object} toastData - Toast data object
	 * @private
	 */
	_startTimer(toastData) {
		if (toastData.options.duration <= 0) return;

		toastData.timer = setTimeout(() => {
			this._hideToast(toastData);
		}, toastData.options.duration);
	}

	/**
	 * Clear timer
	 * @param {Object} toast - Toast object
	 * @private
	 */
	_clearTimer(toast) {
		if (toast.timer) {
			clearTimeout(toast.timer);
			toast.timer = null;
		}
	}

	/**
	 * Pause timer
	 * @param {Object} toastData - Toast data object
	 * @private
	 */
	_pauseTimer(toastData) {
		if (toastData.isPaused || !toastData.timer) return;

		this._clearTimer(toastData);
		toastData.isPaused = true;
		this._fireEvent(ToastAlerts.EVENT_PAUSED, toastData);
	}

	/**
	 * Resume timer
	 * @param {Object} toastData - Toast data object
	 * @private
	 */
	_resumeTimer(toastData) {
		if (!toastData.isPaused || toastData.options.persistent) return;

		toastData.isPaused = false;
		this._startTimer(toastData);
		this._fireEvent(ToastAlerts.EVENT_RESUMED, toastData);
	}

	/**
	 * Process toast queue
	 * @private
	 */
	_processQueue() {
		const nextToast = this.queue.getNext();
		if (nextToast && this._canShowToast(nextToast.options.position)) {
			this.queue.remove(nextToast.id);
			this._showToast(nextToast);
			this._fireEvent(ToastAlerts.EVENT_QUEUE_UPDATED, { queue: this.queue.getAll() });
		}
	}

	/**
	 * Generate unique ID
	 * @returns {string} Unique ID
	 * @private
	 */
	_generateId() {
		return `toast-${++this.globalId}-${Date.now()}`;
	}

	/**
	 * Fire custom event
	 * @param {string} eventType - Event type
	 * @param {Object} detail - Event detail
	 * @returns {boolean} Whether event was not cancelled
	 * @private
	 */
	_fireEvent(eventType, detail) {
		const event = new CustomEvent(eventType, {
			detail,
			cancelable: true,
			bubbles: true
		});

		document.dispatchEvent(event);

		// Call callback if exists
		const callbackName = eventType.split('.')[0].replace('toast-alerts', '');
		const callback = detail.options?.callbacks?.[callbackName];
		if (typeof callback === 'function') {
			callback(detail);
		}

		return !event.defaultPrevented;
	}

	/**
	 * Create ARIA live region for screen reader announcements
	 * @private
	 */
	_createAriaLiveRegion() {
		const liveRegion = document.createElement('div');
		liveRegion.setAttribute('aria-live', 'polite');
		liveRegion.setAttribute('aria-atomic', 'true');
		liveRegion.style.position = 'absolute';
		liveRegion.style.left = '-10000px';
		liveRegion.style.width = '1px';
		liveRegion.style.height = '1px';
		liveRegion.style.overflow = 'hidden';

		document.body.appendChild(liveRegion);
		this.ariaLiveRegion = liveRegion;
	}

	/**
	 * Announce toast to screen readers
	 * @param {Object} toastData - Toast data object
	 * @private
	 */
	_announceToScreenReader(toastData) {
		if (!this.ariaLiveRegion) return;

		const message = `${toastData.options.type} notification: ${toastData.options.title || ''} ${toastData.options.content || ''}`.trim();
		this.ariaLiveRegion.textContent = message;

		// Clear after announcement
		setTimeout(() => {
			this.ariaLiveRegion.textContent = '';
		}, 1000);
	}

	/**
	 * Bind global events
	 * @private
	 */
	_bindGlobalEvents() {
		// Keyboard shortcuts
		this.globalKeyHandler = (e) => {
			if (e.key === 'Escape' && e.ctrlKey) {
				this.hideAll();
			}
		};
		document.addEventListener('keydown', this.globalKeyHandler);

		// Handle reduced motion preference
		this.mediaQueryHandler = (e) => {
			if (e.matches) {
				this.options.animation = 'fade';
				this.options.animationDuration = 150;
			}
		};

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		mediaQuery.addEventListener('change', this.mediaQueryHandler);
		this.mediaQueryHandler(mediaQuery);
	}

	/**
	 * Unbind global events
	 * @private
	 */
	_unbindGlobalEvents() {
		if (this.globalKeyHandler) {
			document.removeEventListener('keydown', this.globalKeyHandler);
		}
	}

	/**
	 * Static factory method
	 * @param {Object} options - Configuration options
	 * @returns {ToastAlerts} New instance
	 */
	static getInstance(options = {}) {
		return new ToastAlerts(options);
	}
}