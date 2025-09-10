/**
 * ToastAnimations - Animation management for ToastAlerts
 * Handles entrance, exit, and transition animations with accessibility support
 */
class ToastAnimations {
	static ANIMATION_TYPES = {
		slide: 'slide',
		fade: 'fade',
		bounce: 'bounce',
		zoom: 'zoom',
		flip: 'flip',
		none: 'none'
	};

	static EASING_FUNCTIONS = {
		ease: 'ease',
		easeIn: 'ease-in',
		easeOut: 'ease-out',
		easeInOut: 'ease-in-out',
		linear: 'linear',
		bounceOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
		backOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
	};

	constructor(defaultDuration = 300) {
		this.defaultDuration = defaultDuration;
		this.defaultEasing = ToastAnimations.EASING_FUNCTIONS.easeOut;
		this.animationQueue = new Map();
		this.prefersReducedMotion = this._checkReducedMotion();

		this._initializeAnimations();
		this._bindMediaQueryListener();
	}

	/**
	 * Play entrance animation
	 * @param {HTMLElement} element - Element to animate
	 * @param {string} animationType - Type of animation
	 * @param {Function} callback - Callback function when animation completes
	 * @param {Object} options - Animation options
	 */
	enter(element, animationType = 'slide', callback = null, options = {}) {
		const config = {
			duration: options.duration || this.defaultDuration,
			easing: options.easing || this.defaultEasing,
			delay: options.delay || 0,
			...options
		};

		// Handle reduced motion preference
		if (this.prefersReducedMotion) {
			animationType = 'fade';
			config.duration = Math.min(config.duration, 150);
		}

		// Set initial state
		this._setInitialState(element, animationType, true);

		// Force reflow
		element.offsetHeight;

		// Start animation
		this._playAnimation(element, animationType, 'enter', config, callback);
	}

	/**
	 * Play exit animation
	 * @param {HTMLElement} element - Element to animate
	 * @param {string} animationType - Type of animation
	 * @param {Function} callback - Callback function when animation completes
	 * @param {Object} options - Animation options
	 */
	exit(element, animationType = 'slide', callback = null, options = {}) {
		const config = {
			duration: options.duration || this.defaultDuration,
			easing: options.easing || this.defaultEasing,
			delay: options.delay || 0,
			...options
		};

		// Handle reduced motion preference
		if (this.prefersReducedMotion) {
			animationType = 'fade';
			config.duration = Math.min(config.duration, 150);
		}

		// Start exit animation
		this._playAnimation(element, animationType, 'exit', config, callback);
	}

	/**
	 * Play staggered animations for multiple elements
	 * @param {HTMLElement[]} elements - Elements to animate
	 * @param {string} animationType - Type of animation
	 * @param {string} direction - 'enter' or 'exit'
	 * @param {Object} options - Animation options
	 */
	staggered(elements, animationType = 'slide', direction = 'enter', options = {}) {
		const config = {
			duration: options.duration || this.defaultDuration,
			easing: options.easing || this.defaultEasing,
			staggerDelay: options.staggerDelay || 100,
			...options
		};

		elements.forEach((element, index) => {
			const delay = config.staggerDelay * index;
			const elementConfig = { ...config, delay };

			if (direction === 'enter') {
				this.enter(element, animationType, options.callback, elementConfig);
			} else {
				this.exit(element, animationType, options.callback, elementConfig);
			}
		});
	}

	/**
	 * Stop animation on element
	 * @param {HTMLElement} element - Element to stop animation on
	 */
	stop(element) {
		const animationId = element.dataset.toastAnimationId;
		if (animationId && this.animationQueue.has(animationId)) {
			const animationData = this.animationQueue.get(animationId);

			// Clear timeout if exists
			if (animationData.timeout) {
				clearTimeout(animationData.timeout);
			}

			// Remove transition
			element.style.transition = '';

			// Clean up
			this.animationQueue.delete(animationId);
			delete element.dataset.toastAnimationId;
		}
	}

	/**
	 * Check if element is currently animating
	 * @param {HTMLElement} element - Element to check
	 * @returns {boolean} Whether element is animating
	 */
	isAnimating(element) {
		const animationId = element.dataset.toastAnimationId;
		return animationId && this.animationQueue.has(animationId);
	}

	/**
	 * Set default animation duration
	 * @param {number} duration - Duration in milliseconds
	 */
	setDefaultDuration(duration) {
		this.defaultDuration = Math.max(0, duration);
	}

	/**
	 * Set default easing function
	 * @param {string} easing - Easing function
	 */
	setDefaultEasing(easing) {
		this.defaultEasing = easing;
	}

	/**
	 * Get available animation types
	 * @returns {Object} Available animation types
	 */
	getAnimationTypes() {
		return { ...ToastAnimations.ANIMATION_TYPES };
	}

	/**
	 * Get available easing functions
	 * @returns {Object} Available easing functions
	 */
	getEasingFunctions() {
		return { ...ToastAnimations.EASING_FUNCTIONS };
	}

	/**
	 * Initialize animation definitions
	 * @private
	 */
	_initializeAnimations() {
		this.animations = {
			slide: {
				enter: {
					from: { transform: 'translateX(100%)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' }
				},
				exit: {
					from: { transform: 'translateX(0)', opacity: '1' },
					to: { transform: 'translateX(100%)', opacity: '0' }
				}
			},
			fade: {
				enter: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				exit: {
					from: { opacity: '1' },
					to: { opacity: '0' }
				}
			},
			bounce: {
				enter: {
					from: {
						transform: 'scale(0.3) translateX(100%)',
						opacity: '0',
						animation: 'toast-bounce-in 0.6s ease-out forwards'
					},
					to: {
						transform: 'scale(1) translateX(0)',
						opacity: '1'
					}
				},
				exit: {
					from: {
						transform: 'scale(1) translateX(0)',
						opacity: '1'
					},
					to: {
						transform: 'scale(0.8) translateX(100%)',
						opacity: '0'
					}
				}
			},
			zoom: {
				enter: {
					from: {
						transform: 'scale(0) translateX(50%)',
						opacity: '0'
					},
					to: {
						transform: 'scale(1) translateX(0)',
						opacity: '1'
					}
				},
				exit: {
					from: {
						transform: 'scale(1) translateX(0)',
						opacity: '1'
					},
					to: {
						transform: 'scale(0) translateX(50%)',
						opacity: '0'
					}
				}
			},
			flip: {
				enter: {
					from: {
						transform: 'rotateY(-90deg) translateX(100%)',
						opacity: '0',
						transformOrigin: 'center'
					},
					to: {
						transform: 'rotateY(0deg) translateX(0)',
						opacity: '1'
					}
				},
				exit: {
					from: {
						transform: 'rotateY(0deg) translateX(0)',
						opacity: '1'
					},
					to: {
						transform: 'rotateY(90deg) translateX(100%)',
						opacity: '0'
					}
				}
			},
			none: {
				enter: {
					from: { opacity: '1' },
					to: { opacity: '1' }
				},
				exit: {
					from: { opacity: '1' },
					to: { opacity: '0' }
				}
			}
		};
	}

	/**
	 * Set initial state for animation
	 * @param {HTMLElement} element - Element to set state on
	 * @param {string} animationType - Type of animation
	 * @param {boolean} isEnter - Whether this is an enter animation
	 * @private
	 */
	_setInitialState(element, animationType, isEnter) {
		const animation = this.animations[animationType];
		if (!animation) return;

		const state = isEnter ? animation.enter.from : animation.exit.from;

		// Apply initial styles
		Object.assign(element.style, state);

		// Ensure element is visible
		element.style.display = 'block';
		element.style.visibility = 'visible';
	}

	/**
	 * Play animation
	 * @param {HTMLElement} element - Element to animate
	 * @param {string} animationType - Type of animation
	 * @param {string} direction - 'enter' or 'exit'
	 * @param {Object} config - Animation configuration
	 * @param {Function} callback - Completion callback
	 * @private
	 */
	_playAnimation(element, animationType, direction, config, callback) {
		const animation = this.animations[animationType];
		if (!animation) {
			if (callback) callback();
			return;
		}

		const animationId = this._generateAnimationId();
		element.dataset.toastAnimationId = animationId;

		// Get animation states
		const fromState = animation[direction].from;
		const toState = animation[direction].to;

		// Set initial state if not already set
		if (direction === 'exit') {
			Object.assign(element.style, fromState);
		}

		// Setup transition
		const transitionProperties = Object.keys(toState).filter(prop => prop !== 'animation');
		element.style.transition = transitionProperties
			.map(prop => `${this._kebabCase(prop)} ${config.duration}ms ${config.easing}`)
			.join(', ');

		// Setup animation completion handling
		const complete = () => {
			this._cleanupAnimation(element, animationId);
			if (callback) callback();
		};

		// Handle animation with delay
		const startAnimation = () => {
			// Apply final state
			Object.assign(element.style, toState);

			// Set timeout for completion
			const timeout = setTimeout(complete, config.duration + 50);

			// Store animation data
			this.animationQueue.set(animationId, {
				element,
				timeout,
				config,
				callback
			});
		};

		if (config.delay > 0) {
			setTimeout(startAnimation, config.delay);
		} else {
			// Use requestAnimationFrame for smooth animation start
			requestAnimationFrame(startAnimation);
		}

		// Listen for transition end as backup
		const transitionEndHandler = (e) => {
			if (e.target === element) {
				element.removeEventListener('transitionend', transitionEndHandler);
				complete();
			}
		};

		element.addEventListener('transitionend', transitionEndHandler);
	}

	/**
	 * Clean up animation
	 * @param {HTMLElement} element - Element to clean up
	 * @param {string} animationId - Animation ID
	 * @private
	 */
	_cleanupAnimation(element, animationId) {
		// Remove animation data
		if (this.animationQueue.has(animationId)) {
			const animationData = this.animationQueue.get(animationId);
			if (animationData.timeout) {
				clearTimeout(animationData.timeout);
			}
			this.animationQueue.delete(animationId);
		}

		// Clean up element
		if (element) {
			delete element.dataset.toastAnimationId;
			// Keep final styles, remove transition
			element.style.transition = '';
		}
	}

	/**
	 * Generate unique animation ID
	 * @returns {string} Unique animation ID
	 * @private
	 */
	_generateAnimationId() {
		return `toast-anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Convert camelCase to kebab-case
	 * @param {string} str - String to convert
	 * @returns {string} Kebab-case string
	 * @private
	 */
	_kebabCase(str) {
		return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
	}

	/**
	 * Check for reduced motion preference
	 * @returns {boolean} Whether reduced motion is preferred
	 * @private
	 */
	_checkReducedMotion() {
		return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	/**
	 * Bind media query listener for reduced motion
	 * @private
	 */
	_bindMediaQueryListener() {
		if (window.matchMedia) {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			const handler = (e) => {
				this.prefersReducedMotion = e.matches;
			};

			// Modern browsers
			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener('change', handler);
			} else {
				// Legacy browsers
				mediaQuery.addListener(handler);
			}
		}
	}

	/**
	 * Create CSS keyframes for complex animations
	 * @private
	 */
	_createKeyframes() {
		const keyframes = `
			@keyframes toast-bounce-in {
				0% {
					transform: scale(0.3) translateX(100%);
					opacity: 0;
				}
				50% {
					transform: scale(1.05) translateX(-10%);
					opacity: 0.8;
				}
				70% {
					transform: scale(0.9) translateX(5%);
					opacity: 0.9;
				}
				100% {
					transform: scale(1) translateX(0);
					opacity: 1;
				}
			}

			@keyframes toast-flip-in {
				0% {
					transform: perspective(400px) rotateY(-90deg);
					opacity: 0;
				}
				40% {
					transform: perspective(400px) rotateY(-10deg);
					opacity: 0.8;
				}
				70% {
					transform: perspective(400px) rotateY(10deg);
					opacity: 0.9;
				}
				100% {
					transform: perspective(400px) rotateY(0deg);
					opacity: 1;
				}
			}

			@keyframes toast-zoom-in {
				0% {
					transform: scale(0) translateX(50%);
					opacity: 0;
				}
				60% {
					transform: scale(1.1) translateX(-5%);
					opacity: 0.8;
				}
				100% {
					transform: scale(1) translateX(0);
					opacity: 1;
				}
			}
		`;

		// Inject keyframes into document
		if (!document.getElementById('toast-animations-keyframes')) {
			const style = document.createElement('style');
			style.id = 'toast-animations-keyframes';
			style.textContent = keyframes;
			document.head.appendChild(style);
		}
	}

	/**
	 * Initialize on first use
	 */
	static {
		// Create keyframes when class is first loaded
		if (typeof document !== 'undefined') {
			const instance = new ToastAnimations();
			instance._createKeyframes();
		}
	}
}