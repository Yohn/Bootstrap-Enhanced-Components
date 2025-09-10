/**
 * Example Demo JavaScript for ToastAlerts
 * Demonstrates all features and provides interactive controls
 */
class ToastAlertsDemo {
	constructor() {
		this.toastAlerts = null;
		this.demoSettings = {
			position: 'top-right',
			type: 'info',
			animation: 'slide',
			duration: 5000,
			maxVisible: 5,
			title: 'Demo Toast',
			content: 'This is a demonstration of the ToastAlerts component.',
			showIcon: true,
			showCloseButton: true,
			progressBar: true,
			persistent: false,
			pauseOnHover: true,
			clickToClose: true,
			swipeToDismiss: true
		};

		this.init();
	}

	/**
	 * Initialize the demo
	 */
	init() {
		// Wait for DOM to be ready
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.setupDemo());
		} else {
			this.setupDemo();
		}
	}

	/**
	 * Setup demo controls and ToastAlerts instance
	 */
	setupDemo() {
		// Initialize ToastAlerts
		this.toastAlerts = new ToastAlerts(this.demoSettings);

		// Setup demo controls
		this.setupControls();
		this.setupPresetButtons();
		this.setupTestScenarios();
		this.setupEventListeners();
		this.setupKeyboardShortcuts();
		this.setupAccessibilityDemo();

		// Show welcome toast
		this.showWelcomeToast();
	}

	/**
	 * Setup demo control panel
	 */
	setupControls() {
		// Position selector
		const positionSelect = document.getElementById('position-select');
		if (positionSelect) {
			positionSelect.value = this.demoSettings.position;
			positionSelect.addEventListener('change', (e) => {
				this.demoSettings.position = e.target.value;
				this.updateSettings();
			});
		}

		// Type selector
		const typeSelect = document.getElementById('type-select');
		if (typeSelect) {
			typeSelect.value = this.demoSettings.type;
			typeSelect.addEventListener('change', (e) => {
				this.demoSettings.type = e.target.value;
				this.updateSettings();
			});
		}

		// Animation selector
		const animationSelect = document.getElementById('animation-select');
		if (animationSelect) {
			animationSelect.value = this.demoSettings.animation;
			animationSelect.addEventListener('change', (e) => {
				this.demoSettings.animation = e.target.value;
				this.updateSettings();
			});
		}

		// Duration slider
		const durationSlider = document.getElementById('duration-slider');
		const durationValue = document.getElementById('duration-value');
		if (durationSlider && durationValue) {
			durationSlider.value = this.demoSettings.duration;
			durationValue.textContent = `${this.demoSettings.duration}ms`;
			durationSlider.addEventListener('input', (e) => {
				this.demoSettings.duration = parseInt(e.target.value);
				durationValue.textContent = `${this.demoSettings.duration}ms`;
				this.updateSettings();
			});
		}

		// Max visible slider
		const maxVisibleSlider = document.getElementById('maxVisible-slider');
		const maxVisibleValue = document.getElementById('maxVisible-value');
		if (maxVisibleSlider && maxVisibleValue) {
			maxVisibleSlider.value = this.demoSettings.maxVisible;
			maxVisibleValue.textContent = this.demoSettings.maxVisible;
			maxVisibleSlider.addEventListener('input', (e) => {
				this.demoSettings.maxVisible = parseInt(e.target.value);
				maxVisibleValue.textContent = this.demoSettings.maxVisible;
				this.updateSettings();
			});
		}

		// Title input
		const titleInput = document.getElementById('title-input');
		if (titleInput) {
			titleInput.value = this.demoSettings.title;
			titleInput.addEventListener('input', (e) => {
				this.demoSettings.title = e.target.value;
			});
		}

		// Content textarea
		const contentTextarea = document.getElementById('content-textarea');
		if (contentTextarea) {
			contentTextarea.value = this.demoSettings.content;
			contentTextarea.addEventListener('input', (e) => {
				this.demoSettings.content = e.target.value;
			});
		}

		// Feature toggles
		this.setupToggle('showIcon', 'show-icon-toggle');
		this.setupToggle('showCloseButton', 'show-close-toggle');
		this.setupToggle('progressBar', 'progress-bar-toggle');
		this.setupToggle('persistent', 'persistent-toggle');
		this.setupToggle('pauseOnHover', 'pause-hover-toggle');
		this.setupToggle('clickToClose', 'click-close-toggle');
		this.setupToggle('swipeToDismiss', 'swipe-dismiss-toggle');
	}

	/**
	 * Setup toggle switches
	 */
	setupToggle(settingKey, elementId) {
		const toggle = document.getElementById(elementId);
		if (toggle) {
			toggle.checked = this.demoSettings[settingKey];
			toggle.addEventListener('change', (e) => {
				this.demoSettings[settingKey] = e.target.checked;
				this.updateSettings();
			});
		}
	}

	/**
	 * Setup preset demo buttons
	 */
	setupPresetButtons() {
		// Show demo toast button
		const showDemoBtn = document.getElementById('show-demo-toast');
		if (showDemoBtn) {
			showDemoBtn.addEventListener('click', () => {
				this.showDemoToast();
			});
		}

		// Quick action buttons
		const quickButtons = [
			{ id: 'show-success', type: 'success', content: 'Operation completed successfully!' },
			{ id: 'show-error', type: 'error', content: 'An error occurred while processing your request.' },
			{ id: 'show-warning', type: 'warning', content: 'Please review your input before proceeding.' },
			{ id: 'show-info', type: 'info', content: 'New updates are available for download.' }
		];

		quickButtons.forEach(btn => {
			const element = document.getElementById(btn.id);
			if (element) {
				element.addEventListener('click', () => {
					this.toastAlerts.show(btn.content, { type: btn.type });
				});
			}
		});

		// Hide all button
		const hideAllBtn = document.getElementById('hide-all-toasts');
		if (hideAllBtn) {
			hideAllBtn.addEventListener('click', () => {
				this.toastAlerts.hideAll();
			});
		}

		// Clear queue button
		const clearQueueBtn = document.getElementById('clear-queue');
		if (clearQueueBtn) {
			clearQueueBtn.addEventListener('click', () => {
				this.toastAlerts.queue.clear();
				this.updateStats();
			});
		}
	}

	/**
	 * Setup test scenarios
	 */
	setupTestScenarios() {
		// Stress test
		const stressTestBtn = document.getElementById('stress-test');
		if (stressTestBtn) {
			stressTestBtn.addEventListener('click', () => {
				this.runStressTest();
			});
		}

		// Animation showcase
		const animationShowcaseBtn = document.getElementById('animation-showcase');
		if (animationShowcaseBtn) {
			animationShowcaseBtn.addEventListener('click', () => {
				this.runAnimationShowcase();
			});
		}

		// Position test
		const positionTestBtn = document.getElementById('position-test');
		if (positionTestBtn) {
			positionTestBtn.addEventListener('click', () => {
				this.runPositionTest();
			});
		}

		// Interactive demo
		const interactiveBtn = document.getElementById('interactive-demo');
		if (interactiveBtn) {
			interactiveBtn.addEventListener('click', () => {
				this.runInteractiveDemo();
			});
		}
	}

	/**
	 * Setup event listeners for stats and debugging
	 */
	setupEventListeners() {
		// Listen to ToastAlerts events
		document.addEventListener('shown.toast-alerts', (e) => {
			console.log('Toast shown:', e.detail);
			this.updateStats();
		});

		document.addEventListener('hidden.toast-alerts', (e) => {
			console.log('Toast hidden:', e.detail);
			this.updateStats();
		});

		document.addEventListener('queueUpdated.toast-alerts', (e) => {
			console.log('Queue updated:', e.detail);
			this.updateStats();
		});

		// Update stats periodically
		setInterval(() => this.updateStats(), 1000);
	}

	/**
	 * Setup keyboard shortcuts
	 */
	setupKeyboardShortcuts() {
		document.addEventListener('keydown', (e) => {
			// Only if not in an input field
			if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

			switch (e.code) {
				case 'KeyS':
					if (e.ctrlKey || e.metaKey) {
						e.preventDefault();
						this.showDemoToast();
					}
					break;
				case 'KeyH':
					if (e.ctrlKey || e.metaKey) {
						e.preventDefault();
						this.toastAlerts.hideAll();
					}
					break;
				case 'Digit1':
					this.toastAlerts.show('Success toast!', { type: 'success' });
					break;
				case 'Digit2':
					this.toastAlerts.show('Error toast!', { type: 'error' });
					break;
				case 'Digit3':
					this.toastAlerts.show('Warning toast!', { type: 'warning' });
					break;
				case 'Digit4':
					this.toastAlerts.show('Info toast!', { type: 'info' });
					break;
			}
		});

		// Show keyboard shortcuts help
		const helpBtn = document.getElementById('show-shortcuts');
		if (helpBtn) {
			helpBtn.addEventListener('click', () => {
				this.showKeyboardShortcuts();
			});
		}
	}

	/**
	 * Setup accessibility demonstration
	 */
	setupAccessibilityDemo() {
		const accessibilityBtn = document.getElementById('accessibility-demo');
		if (accessibilityBtn) {
			accessibilityBtn.addEventListener('click', () => {
				this.runAccessibilityDemo();
			});
		}
	}

	/**
	 * Update ToastAlerts settings
	 */
	updateSettings() {
		this.toastAlerts.setGlobalDefaults(this.demoSettings);
	}

	/**
	 * Show demo toast with current settings
	 */
	showDemoToast() {
		this.toastAlerts.show(this.demoSettings.content, {
			...this.demoSettings,
			title: this.demoSettings.title || undefined
		});
	}

	/**
	 * Show welcome toast
	 */
	showWelcomeToast() {
		this.toastAlerts.show('Welcome to ToastAlerts Demo!', {
			type: 'info',
			title: 'Welcome',
			position: 'top-center',
			duration: 3000,
			animation: 'bounce'
		});
	}

	/**
	 * Run stress test
	 */
	runStressTest() {
		const types = ['success', 'error', 'warning', 'info'];
		const messages = [
			'Processing batch item',
			'Updating database records',
			'Validating user input',
			'Sending notifications',
			'Generating reports'
		];

		for (let i = 0; i < 20; i++) {
			setTimeout(() => {
				const type = types[Math.floor(Math.random() * types.length)];
				const message = messages[Math.floor(Math.random() * messages.length)];

				this.toastAlerts.show(`${message} ${i + 1}`, {
					type,
					duration: 2000 + Math.random() * 3000,
					priority: Math.floor(Math.random() * 10)
				});
			}, i * 100);
		}
	}

	/**
	 * Run animation showcase
	 */
	runAnimationShowcase() {
		const animations = ['slide', 'fade', 'bounce', 'zoom', 'flip'];
		const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

		animations.forEach((animation, index) => {
			setTimeout(() => {
				const position = positions[index % positions.length];
				this.toastAlerts.show(`${animation.toUpperCase()} Animation`, {
					type: 'info',
					animation,
					position,
					duration: 4000
				});
			}, index * 800);
		});
	}

	/**
	 * Run position test
	 */
	runPositionTest() {
		const positions = [
			'top-left', 'top-center', 'top-right',
			'center',
			'bottom-left', 'bottom-center', 'bottom-right'
		];

		positions.forEach((position, index) => {
			setTimeout(() => {
				this.toastAlerts.show(`Toast at ${position.replace('-', ' ')}`, {
					type: 'info',
					position,
					duration: 3000
				});
			}, index * 500);
		});
	}

	/**
	 * Run interactive demo
	 */
	runInteractiveDemo() {
		// Show a toast with action buttons
		const actionToastId = this.toastAlerts.show('Do you want to continue?', {
			type: 'warning',
			title: 'Confirmation Required',
			template: 'action',
			persistent: true,
			actions: [
				{ label: 'Yes', action: 'confirm', style: 'primary' },
				{ label: 'No', action: 'cancel', style: 'secondary' }
			],
			callbacks: {
				action: (action, options) => {
					this.toastAlerts.hide(actionToastId);

					if (action === 'confirm') {
						this.toastAlerts.show('Action confirmed!', { type: 'success' });
					} else {
						this.toastAlerts.show('Action cancelled.', { type: 'info' });
					}
				}
			}
		});

		// Show progress toast
		let progress = 0;
		const progressToastId = this.toastAlerts.show('Processing...', {
			type: 'info',
			title: 'Please wait',
			template: 'progress',
			persistent: true,
			progress: 0
		});

		const progressInterval = setInterval(() => {
			progress += 10;
			this.toastAlerts.update(progressToastId, {
				content: `Processing... ${progress}%`,
				progress: progress
			});

			if (progress >= 100) {
				clearInterval(progressInterval);
				setTimeout(() => {
					this.toastAlerts.hide(progressToastId);
					this.toastAlerts.show('Processing complete!', { type: 'success' });
				}, 500);
			}
		}, 200);
	}

	/**
	 * Run accessibility demonstration
	 */
	runAccessibilityDemo() {
		this.toastAlerts.show('This toast demonstrates accessibility features', {
			type: 'info',
			title: 'Accessibility Demo',
			ariaLive: 'assertive',
			duration: 8000,
			callbacks: {
				shown: () => {
					console.log('Toast announced to screen readers');
				}
			}
		});

		// Show keyboard navigation hint
		setTimeout(() => {
			this.toastAlerts.show('Press Tab to focus, Enter/Space to interact, Escape to close', {
				type: 'info',
				title: 'Keyboard Navigation',
				duration: 6000
			});
		}, 1000);
	}

	/**
	 * Show keyboard shortcuts
	 */
	showKeyboardShortcuts() {
		const shortcuts = [
			'Ctrl/Cmd + S: Show demo toast',
			'Ctrl/Cmd + H: Hide all toasts',
			'1-4: Quick toast types',
			'Escape: Close focused toast'
		];

		this.toastAlerts.show(shortcuts.join('<br>'), {
			type: 'info',
			title: 'Keyboard Shortcuts',
			html: true,
			duration: 8000,
			position: 'center'
		});
	}

	/**
	 * Update statistics display
	 */
	updateStats() {
		const visible = this.toastAlerts.getVisible();
		const queue = this.toastAlerts.getQueue();

		// Update visible count
		const visibleCountEl = document.getElementById('visible-count');
		if (visibleCountEl) {
			visibleCountEl.textContent = visible.length;
		}

		// Update queue count
		const queueCountEl = document.getElementById('queue-count');
		if (queueCountEl) {
			queueCountEl.textContent = queue.length;
		}

		// Update queue stats
		const queueStatsEl = document.getElementById('queue-stats');
		if (queueStatsEl && this.toastAlerts.queue) {
			const stats = this.toastAlerts.queue.getStats();
			queueStatsEl.innerHTML = `
				<small class="text-muted">
					Total: ${stats.total} |
					By Position: ${Object.entries(stats.byPosition).map(([pos, count]) => `${pos}: ${count}`).join(', ')}
				</small>
			`;
		}
	}

	/**
	 * Toggle dark mode
	 */
	toggleDarkMode() {
		const currentTheme = document.documentElement.getAttribute('data-bs-theme');
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-bs-theme', newTheme);

		// Update button text
		const toggleBtn = document.getElementById('theme-toggle');
		if (toggleBtn) {
			toggleBtn.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
		}

		// Show confirmation toast
		this.toastAlerts.show(`Switched to ${newTheme} mode`, {
			type: 'info',
			duration: 2000
		});
	}

	/**
	 * Export demo configuration
	 */
	exportConfig() {
		const config = {
			settings: this.demoSettings,
			toastAlerts: this.toastAlerts.export ? this.toastAlerts.export() : null
		};

		const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'toast-alerts-config.json';
		a.click();

		URL.revokeObjectURL(url);

		this.toastAlerts.show('Configuration exported!', { type: 'success' });
	}

	/**
	 * Reset demo to defaults
	 */
	resetDemo() {
		// Reset settings
		this.demoSettings = {
			position: 'top-right',
			type: 'info',
			animation: 'slide',
			duration: 5000,
			maxVisible: 5,
			title: 'Demo Toast',
			content: 'This is a demonstration of the ToastAlerts component.',
			showIcon: true,
			showCloseButton: true,
			progressBar: true,
			persistent: false,
			pauseOnHover: true,
			clickToClose: true,
			swipeToDismiss: true
		};

		// Clear all toasts
		this.toastAlerts.hideAll();
		this.toastAlerts.queue.clear();

		// Reset controls
		this.setupControls();
		this.updateSettings();

		this.toastAlerts.show('Demo reset to defaults', { type: 'info' });
	}
}

// Initialize demo when DOM is ready
let demo;
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		demo = new ToastAlertsDemo();
	});
} else {
	demo = new ToastAlertsDemo();
}

// Make demo available globally for console testing
window.toastAlertsDemo = demo;