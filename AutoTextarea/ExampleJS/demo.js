/**
 * Demo JavaScript for AutoTextarea Example Page
 * Handles all interactive functionality for the demo
 */
class AutoTextareaDemo {
	constructor() {
		this.instances = new Map();
		this.currentTheme = 'dark';
		this.init();
	}

	/**
	 * Initialize all demo functionality
	 */
	init() {
		this.initializeTextareas();
		this.setupControls();
		this.setupThemeToggle();
		this.setupFormHandlers();
		this.setupEventListeners();
		console.log('AutoTextarea Demo initialized');
	}

	/**
	 * Initialize all textarea instances with different configurations
	 */
	initializeTextareas() {
		// Basic example
		const basicTextarea = new AutoTextarea('#basic-textarea', {
			minHeight: 80,
			maxHeight: 200,
			animationSpeed: 150,
			onResize: (height) => {
				console.log(`Basic textarea resized to: ${height}px`);
			}
		});
		this.instances.set('basic', basicTextarea);

		// Constrained height example
		const constrainedTextarea = new AutoTextarea('#constrained-textarea', {
			minHeight: 60,
			maxHeight: 150,
			animationSpeed: 200,
			scrollThreshold: 0.8,
			onMaxHeight: () => {
				this.showStatus('Height constraint reached - scrolling enabled', 'warning');
			}
		});
		this.instances.set('constrained', constrainedTextarea);

		// Fast animation example
		const fastTextarea = new AutoTextarea('#fast-textarea', {
			minHeight: 60,
			maxHeight: 250,
			animationSpeed: 50,
			onResize: (height) => {
				console.log(`Fast textarea: ${height}px`);
			}
		});
		this.instances.set('fast', fastTextarea);

		// Custom padding example
		const paddedTextarea = new AutoTextarea('#padded-textarea', {
			minHeight: 70,
			maxHeight: 200,
			padding: 20,
			animationSpeed: 180
		});
		this.instances.set('padded', paddedTextarea);

		// Line height example
		const lineHeightTextarea = new AutoTextarea('#lineheight-textarea', {
			minHeight: 80,
			maxHeight: 300,
			lineHeight: 2.0,
			animationSpeed: 120
		});
		this.instances.set('lineheight', lineHeightTextarea);

		// Form message textarea
		const messageTextarea = new AutoTextarea('#message-textarea', {
			minHeight: 80,
			maxHeight: 250,
			animationSpeed: 150,
			placeholder: 'Type your message here...',
			onResize: (height, oldHeight) => {
				console.log(`Message textarea: ${oldHeight}px → ${height}px`);
			}
		});
		this.instances.set('message', messageTextarea);

		// Control panel textarea
		const controlTextarea = new AutoTextarea('#control-textarea', {
			minHeight: 80,
			maxHeight: 300,
			animationSpeed: 150,
			onResize: (height) => {
				this.updateStatus(`Height: ${height}px`);
			},
			onMaxHeight: () => {
				this.showStatus('Maximum height reached!', 'info');
			}
		});
		this.instances.set('control', controlTextarea);
	}

	/**
	 * Setup interactive controls
	 */
	setupControls() {
		const minHeightControl = document.getElementById('min-height-control');
		const maxHeightControl = document.getElementById('max-height-control');
		const animationSpeedControl = document.getElementById('animation-speed-control');
		const applyButton = document.getElementById('apply-controls');

		const minHeightValue = document.getElementById('min-height-value');
		const maxHeightValue = document.getElementById('max-height-value');
		const animationSpeedValue = document.getElementById('animation-speed-value');

		// Update display values
		minHeightControl.addEventListener('input', (e) => {
			minHeightValue.textContent = e.target.value;
		});

		maxHeightControl.addEventListener('input', (e) => {
			maxHeightValue.textContent = e.target.value;
		});

		animationSpeedControl.addEventListener('input', (e) => {
			animationSpeedValue.textContent = e.target.value;
		});

		// Apply changes
		applyButton.addEventListener('click', () => {
			const controlInstance = this.instances.get('control');
			if (controlInstance) {
				controlInstance.updateOptions({
					minHeight: parseInt(minHeightControl.value),
					maxHeight: parseInt(maxHeightControl.value),
					animationSpeed: parseInt(animationSpeedControl.value)
				});
				this.showStatus('Settings applied successfully!', 'success');
			}
		});
	}

	/**
	 * Setup theme toggle functionality
	 */
	setupThemeToggle() {
		const themeToggle = document.getElementById('theme-toggle');
		const themeText = document.getElementById('theme-text');
		const htmlElement = document.documentElement;

		themeToggle.addEventListener('click', () => {
			if (this.currentTheme === 'dark') {
				htmlElement.setAttribute('data-bs-theme', 'light');
				themeText.textContent = 'Switch to Dark Mode';
				this.currentTheme = 'light';
				this.showStatus('Switched to light theme', 'info');
			} else {
				htmlElement.setAttribute('data-bs-theme', 'dark');
				themeText.textContent = 'Switch to Light Mode';
				this.currentTheme = 'dark';
				this.showStatus('Switched to dark theme', 'info');
			}
		});
	}

	/**
	 * Setup form handlers
	 */
	setupFormHandlers() {
		const clearButton = document.getElementById('clear-btn');
		const form = document.querySelector('form');

		clearButton.addEventListener('click', () => {
			form.reset();
			// Reset all textarea heights
			this.instances.forEach(instance => {
				instance.reset();
			});
			this.showStatus('Form cleared', 'info');
		});

		// Form submission handler
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			this.showStatus('Form submission prevented (demo only)', 'warning');
		});
	}

	/**
	 * Setup global event listeners for AutoTextarea events
	 */
	setupEventListeners() {
		// Listen for custom AutoTextarea events
		document.addEventListener('autotextarea:resize', (e) => {
			const { height, oldHeight, instance } = e.detail;
			console.log(`AutoTextarea resized: ${oldHeight}px → ${height}px`);
		});

		document.addEventListener('autotextarea:maxheight', (e) => {
			const { height } = e.detail;
			console.log(`AutoTextarea reached max height: ${height}px`);
		});

		document.addEventListener('autotextarea:minheight', (e) => {
			const { height } = e.detail;
			console.log(`AutoTextarea returned to min height: ${height}px`);
		});

		// Keyboard shortcuts
		document.addEventListener('keydown', (e) => {
			// Ctrl/Cmd + R to reset all textareas
			if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
				e.preventDefault();
				this.resetAllTextareas();
				this.showStatus('All textareas reset', 'info');
			}

			// Ctrl/Cmd + T to toggle theme
			if ((e.ctrlKey || e.metaKey) && e.key === 't') {
				e.preventDefault();
				document.getElementById('theme-toggle').click();
			}
		});

		// Window resize handler
		window.addEventListener('resize', this.debounce(() => {
			this.instances.forEach(instance => {
				instance.resize();
			});
		}, 250));
	}

	/**
	 * Reset all textarea instances
	 */
	resetAllTextareas() {
		this.instances.forEach(instance => {
			instance.reset();
		});
	}

	/**
	 * Update status display
	 */
	updateStatus(message) {
		const statusText = document.getElementById('status-text');
		if (statusText) {
			statusText.textContent = message;
		}
	}

	/**
	 * Show temporary status message
	 */
	showStatus(message, type = 'info') {
		const statusDisplay = document.getElementById('status-display');
		const statusText = document.getElementById('status-text');

		if (statusDisplay && statusText) {
			// Remove existing alert classes
			statusDisplay.className = 'alert';

			// Add appropriate alert class
			switch (type) {
				case 'success':
					statusDisplay.classList.add('alert-success');
					break;
				case 'warning':
					statusDisplay.classList.add('alert-warning');
					break;
				case 'danger':
					statusDisplay.classList.add('alert-danger');
					break;
				default:
					statusDisplay.classList.add('alert-info');
			}

			statusText.textContent = message;

			// Auto-hide after 3 seconds
			setTimeout(() => {
				if (statusText.textContent === message) {
					statusText.textContent = 'Ready';
					statusDisplay.className = 'alert alert-info';
				}
			}, 3000);
		}
	}

	/**
	 * Utility: Debounce function
	 */
	debounce(func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	/**
	 * Get instance by name for debugging
	 */
	getInstance(name) {
		return this.instances.get(name);
	}

	/**
	 * Get all instances
	 */
	getAllInstances() {
		return this.instances;
	}
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	// Initialize demo
	window.autoTextareaDemo = new AutoTextareaDemo();

	// Add demo methods to window for console debugging
	window.resetAllTextareas = () => window.autoTextareaDemo.resetAllTextareas();
	window.getAutoTextareaInstance = (name) => window.autoTextareaDemo.getInstance(name);

	// Demo helper functions
	window.demoHelpers = {
		createTextarea: (selector, options = {}) => {
			return new AutoTextarea(selector, options);
		},

		destroyTextarea: (instance) => {
			if (instance && typeof instance.destroy === 'function') {
				instance.destroy();
			}
		},

		logInstances: () => {
			console.table(Array.from(window.autoTextareaDemo.getAllInstances().entries()));
		},

		testResize: (instanceName = 'basic') => {
			const instance = window.autoTextareaDemo.getInstance(instanceName);
			if (instance) {
				const textarea = instance.element;
				textarea.value = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
				instance.resize();
				console.log(`Tested resize on ${instanceName} instance`);
			}
		}
	};

	console.log('AutoTextarea Demo ready!');
	console.log('Available helpers:', Object.keys(window.demoHelpers));
});