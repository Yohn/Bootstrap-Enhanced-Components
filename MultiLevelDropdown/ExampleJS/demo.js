/**
 * Demo JavaScript for MultiLevel Dropdown Examples
 * Handles interactive demonstrations and showcases advanced features
 *
 * @class DemoController
 * @version 1.0.0
 */
class DemoController {
	/**
	 * Constructor
	 */
	constructor() {
		this.dropdown = null;
		this.demoConfigs = {
			basic: {
				showOnHover: true,
				hideDelay: 300,
				direction: 'auto'
			},
			advanced: {
				showOnHover: false,
				hideDelay: 500,
				direction: 'auto',
				animations: {
					enabled: true,
					duration: 300,
					easing: 'ease-in-out'
				}
			},
			touch: {
				showOnHover: false,
				hideDelay: 0,
				direction: 'auto'
			}
		};

		this.init();
	}

	/**
	 * Initialize demo controller
	 */
	init() {
		this._setupEventListeners();
		this._setupPerformanceMonitoring();
		this._setupKeyboardShortcuts();
		this._detectTouchDevice();
	}

	/**
	 * Setup event listeners for demo interactions
	 * @private
	 */
	_setupEventListeners() {
		// Demo configuration buttons
		document.addEventListener('click', (e) => {
			if (e.target.matches('[data-demo-config]')) {
				const configName = e.target.getAttribute('data-demo-config');
				this._applyDemoConfig(configName);
			}
		});

		// Performance test button
		const perfTestBtn = document.getElementById('performanceTest');
		if (perfTestBtn) {
			perfTestBtn.addEventListener('click', () => this._runPerformanceTest());
		}

		// Export configuration button
		const exportBtn = document.getElementById('exportConfig');
		if (exportBtn) {
			exportBtn.addEventListener('click', () => this._exportConfiguration());
		}

		// Import configuration button
		const importBtn = document.getElementById('importConfig');
		if (importBtn) {
			importBtn.addEventListener('click', () => this._importConfiguration());
		}

		// Reset to defaults button
		const resetBtn = document.getElementById('resetConfig');
		if (resetBtn) {
			resetBtn.addEventListener('click', () => this._resetToDefaults());
		}
	}

	/**
	 * Setup performance monitoring
	 * @private
	 */
	_setupPerformanceMonitoring() {
		// Monitor dropdown show/hide performance
		let showStartTime = 0;
		let hideStartTime = 0;

		document.addEventListener('multilevel.show', (e) => {
			showStartTime = performance.now();
		});

		document.addEventListener('multilevel.hide', (e) => {
			hideStartTime = performance.now();
		});

		// Log performance metrics
		this.performanceMetrics = {
			showTimes: [],
			hideTimes: [],
			memoryUsage: []
		};
	}

	/**
	 * Setup keyboard shortcuts for demo
	 * @private
	 */
	_setupKeyboardShortcuts() {
		document.addEventListener('keydown', (e) => {
			// Ctrl/Cmd + D for demo mode toggle
			if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
				e.preventDefault();
				this._toggleDemoMode();
			}

			// Ctrl/Cmd + R for reset configuration
			if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
				e.preventDefault();
				this._resetToDefaults();
			}

			// Ctrl/Cmd + P for performance test
			if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
				e.preventDefault();
				this._runPerformanceTest();
			}
		});
	}

	/**
	 * Detect if device supports touch
	 * @private
	 */
	_detectTouchDevice() {
		const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

		if (isTouchDevice) {
			document.body.classList.add('touch-device');
			this._optimizeForTouch();
		}
	}

	/**
	 * Apply demo configuration
	 * @param {string} configName - Configuration name
	 * @private
	 */
	_applyDemoConfig(configName) {
		if (!this.demoConfigs[configName]) {
			console.warn(`Demo configuration '${configName}' not found`);
			return;
		}

		const config = this.demoConfigs[configName];

		// Update dropdown if it exists
		if (window.multiLevelDropdown) {
			window.multiLevelDropdown.updateConfig(config);
		}

		// Update UI controls to reflect new config
		this._updateUIControls(config);

		// Show notification
		this._showNotification(`Applied ${configName} configuration`, 'success');
	}

	/**
	 * Update UI controls to reflect configuration
	 * @param {Object} config - Configuration object
	 * @private
	 */
	_updateUIControls(config) {
		// Update hover checkbox
		const hoverCheckbox = document.getElementById('showOnHover');
		if (hoverCheckbox) {
			hoverCheckbox.checked = config.showOnHover;
		}

		// Update delay slider
		const delaySlider = document.getElementById('hideDelay');
		const delayValue = document.getElementById('hideDelayValue');
		if (delaySlider && delayValue) {
			delaySlider.value = config.hideDelay;
			delayValue.textContent = config.hideDelay;
		}

		// Update direction select
		const directionSelect = document.getElementById('direction');
		if (directionSelect) {
			directionSelect.value = config.direction;
		}
	}

	/**
	 * Optimize for touch devices
	 * @private
	 */
	_optimizeForTouch() {
		// Apply touch-optimized configuration
		if (window.multiLevelDropdown) {
			window.multiLevelDropdown.updateConfig({
				showOnHover: false,
				hideDelay: 0,
				animations: {
					duration: 150
				}
			});
		}

		// Add touch-specific styles
		const style = document.createElement('style');
		style.textContent = `
			.touch-device .dropdown-item {
				padding: 0.75rem 1rem;
				font-size: 1.1rem;
			}

			.touch-device .dropdown-toggle::after {
				border-width: 0.4em 0 0.4em 0.4em;
			}
		`;
		document.head.appendChild(style);
	}

	/**
	 * Run performance test
	 * @private
	 */
	_runPerformanceTest() {
		if (!window.multiLevelDropdown) {
			this._showNotification('MultiLevel Dropdown not initialized', 'error');
			return;
		}

		const testResults = {
			startTime: performance.now(),
			iterations: 100,
			averageShowTime: 0,
			averageHideTime: 0,
			memoryBefore: 0,
			memoryAfter: 0
		};

		// Measure memory before test
		if (performance.memory) {
			testResults.memoryBefore = performance.memory.usedJSHeapSize;
		}

		// Find test submenu
		const testSubmenu = document.querySelector('.dropdown-submenu');
		if (!testSubmenu) {
			this._showNotification('No submenu found for testing', 'error');
			return;
		}

		let showTimes = [];
		let hideTimes = [];
		let iteration = 0;

		const runIteration = () => {
			if (iteration >= testResults.iterations) {
				// Calculate results
				testResults.averageShowTime = showTimes.reduce((a, b) => a + b, 0) / showTimes.length;
				testResults.averageHideTime = hideTimes.reduce((a, b) => a + b, 0) / hideTimes.length;
				testResults.endTime = performance.now();
				testResults.totalTime = testResults.endTime - testResults.startTime;

				if (performance.memory) {
					testResults.memoryAfter = performance.memory.usedJSHeapSize;
					testResults.memoryDelta = testResults.memoryAfter - testResults.memoryBefore;
				}

				this._displayTestResults(testResults);
				return;
			}

			// Show submenu
			const showStart = performance.now();
			window.multiLevelDropdown.showSubmenu(testSubmenu);

			setTimeout(() => {
				const showEnd = performance.now();
				showTimes.push(showEnd - showStart);

				// Hide submenu
				const hideStart = performance.now();
				window.multiLevelDropdown.hideSubmenu(testSubmenu);

				setTimeout(() => {
					const hideEnd = performance.now();
					hideTimes.push(hideEnd - hideStart);

					iteration++;
					setTimeout(runIteration, 10);
				}, 50);
			}, 50);
		};

		this._showNotification('Running performance test...', 'info');
		runIteration();
	}

	/**
	 * Display test results
	 * @param {Object} results - Test results
	 * @private
	 */
	_displayTestResults(results) {
		const resultsHtml = `
			<div class="performance-results">
				<h5>Performance Test Results</h5>
				<div class="row">
					<div class="col-md-6">
						<strong>Timing Results:</strong>
						<ul class="list-unstyled ms-3">
							<li>Average Show Time: ${results.averageShowTime.toFixed(2)}ms</li>
							<li>Average Hide Time: ${results.averageHideTime.toFixed(2)}ms</li>
							<li>Total Test Time: ${results.totalTime.toFixed(2)}ms</li>
							<li>Iterations: ${results.iterations}</li>
						</ul>
					</div>
					<div class="col-md-6">
						<strong>Memory Usage:</strong>
						<ul class="list-unstyled ms-3">
							<li>Before: ${this._formatBytes(results.memoryBefore)}</li>
							<li>After: ${this._formatBytes(results.memoryAfter)}</li>
							<li>Delta: ${this._formatBytes(results.memoryDelta)}</li>
						</ul>
					</div>
				</div>
			</div>
		`;

		// Show results in modal or alert
		this._showModal('Performance Test Results', resultsHtml);
	}

	/**
	 * Export current configuration
	 * @private
	 */
	_exportConfiguration() {
		if (!window.multiLevelDropdown) {
			this._showNotification('MultiLevel Dropdown not initialized', 'error');
			return;
		}

		const config = window.multiLevelDropdown.getConfig();
		const configJson = JSON.stringify(config, null, 2);

		// Create download link
		const blob = new Blob([configJson], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'multilevel-dropdown-config.json';
		link.click();

		URL.revokeObjectURL(url);
		this._showNotification('Configuration exported', 'success');
	}

	/**
	 * Import configuration from file
	 * @private
	 */
	_importConfiguration() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';

		input.addEventListener('change', (e) => {
			const file = e.target.files[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const config = JSON.parse(event.target.result);

					if (window.multiLevelDropdown) {
						window.multiLevelDropdown.updateConfig(config);
						this._updateUIControls(config);
						this._showNotification('Configuration imported successfully', 'success');
					}
				} catch (error) {
					this._showNotification('Invalid configuration file', 'error');
				}
			};
			reader.readAsText(file);
		});

		input.click();
	}

	/**
	 * Reset to default configuration
	 * @private
	 */
	_resetToDefaults() {
		if (!window.multiLevelDropdown) {
			this._showNotification('MultiLevel Dropdown not initialized', 'error');
			return;
		}

		const defaultConfig = window.MultiLevelDropdown.DEFAULT_CONFIG;
		window.multiLevelDropdown.updateConfig(defaultConfig);
		this._updateUIControls(defaultConfig);
		this._showNotification('Reset to default configuration', 'success');
	}

	/**
	 * Toggle demo mode
	 * @private
	 */
	_toggleDemoMode() {
		document.body.classList.toggle('demo-mode');
		const isDemoMode = document.body.classList.contains('demo-mode');

		if (isDemoMode) {
			this._enableDemoMode();
		} else {
			this._disableDemoMode();
		}
	}

	/**
	 * Enable demo mode with highlights
	 * @private
	 */
	_enableDemoMode() {
		// Add demo mode styles
		const style = document.createElement('style');
		style.id = 'demo-mode-styles';
		style.textContent = `
			.demo-mode .dropdown-submenu {
				position: relative;
			}

			.demo-mode .dropdown-submenu::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: rgba(0, 123, 255, 0.1);
				border: 2px dashed rgba(0, 123, 255, 0.3);
				pointer-events: none;
				z-index: 10000;
			}

			.demo-mode .submenu-open::before {
				background: rgba(40, 167, 69, 0.1);
				border-color: rgba(40, 167, 69, 0.3);
			}
		`;
		document.head.appendChild(style);

		this._showNotification('Demo mode enabled', 'info');
	}

	/**
	 * Disable demo mode
	 * @private
	 */
	_disableDemoMode() {
		const demoStyles = document.getElementById('demo-mode-styles');
		if (demoStyles) {
			demoStyles.remove();
		}

		this._showNotification('Demo mode disabled', 'info');
	}

	/**
	 * Show notification message
	 * @param {string} message - Message to show
	 * @param {string} type - Notification type (success, error, info, warning)
	 * @private
	 */
	_showNotification(message, type = 'info') {
		// Create notification element
		const notification = document.createElement('div');
		notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
		notification.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			z-index: 9999;
			min-width: 300px;
		`;

		notification.innerHTML = `
			${message}
			<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
		`;

		document.body.appendChild(notification);

		// Auto-remove after 3 seconds
		setTimeout(() => {
			if (notification.parentNode) {
				notification.remove();
			}
		}, 3000);
	}

	/**
	 * Show modal dialog
	 * @param {string} title - Modal title
	 * @param {string} content - Modal content HTML
	 * @private
	 */
	_showModal(title, content) {
		// Create modal element
		const modalHtml = `
			<div class="modal fade" id="demoModal" tabindex="-1">
				<div class="modal-dialog modal-lg">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">${title}</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div class="modal-body">
							${content}
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
		`;

		// Remove existing modal
		const existingModal = document.getElementById('demoModal');
		if (existingModal) {
			existingModal.remove();
		}

		// Add new modal
		document.body.insertAdjacentHTML('beforeend', modalHtml);

		// Show modal
		const modal = new bootstrap.Modal(document.getElementById('demoModal'));
		modal.show();

		// Clean up when modal is hidden
		document.getElementById('demoModal').addEventListener('hidden.bs.modal', () => {
			document.getElementById('demoModal').remove();
		});
	}

	/**
	 * Format bytes for display
	 * @param {number} bytes - Bytes to format
	 * @returns {string} Formatted string
	 * @private
	 */
	_formatBytes(bytes) {
		if (bytes === 0) return '0 Bytes';

		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	/**
	 * Generate test data for performance testing
	 * @param {number} count - Number of items to generate
	 * @returns {Array} Test data array
	 * @private
	 */
	_generateTestData(count = 100) {
		const testData = [];

		for (let i = 0; i < count; i++) {
			testData.push({
				id: i,
				name: `Test Item ${i}`,
				category: `Category ${Math.floor(i / 10)}`,
				hasSubmenu: Math.random() > 0.7,
				depth: Math.floor(Math.random() * 4)
			});
		}

		return testData;
	}

	/**
	 * Create dynamic test menu
	 * @param {Array} data - Test data
	 * @param {HTMLElement} container - Container element
	 * @private
	 */
	_createDynamicTestMenu(data, container) {
		const menuHtml = data.map(item => {
			if (item.hasSubmenu) {
				return `
					<li class="dropdown-submenu">
						<a class="dropdown-item dropdown-toggle" href="#" data-item-id="${item.id}">
							${item.name}
						</a>
						<ul class="dropdown-menu">
							${this._generateSubItems(item.id, 5)}
						</ul>
					</li>
				`;
			} else {
				return `<li><a class="dropdown-item" href="#" data-item-id="${item.id}">${item.name}</a></li>`;
			}
		}).join('');

		container.innerHTML = menuHtml;
	}

	/**
	 * Generate sub-items for dynamic menu
	 * @param {number} parentId - Parent item ID
	 * @param {number} count - Number of sub-items
	 * @returns {string} HTML string
	 * @private
	 */
	_generateSubItems(parentId, count) {
		let html = '';

		for (let i = 0; i < count; i++) {
			html += `<li><a class="dropdown-item" href="#" data-parent-id="${parentId}">Sub Item ${i + 1}</a></li>`;
		}

		return html;
	}

	/**
	 * Validate dropdown structure
	 * @param {HTMLElement} dropdown - Dropdown element to validate
	 * @returns {Object} Validation results
	 * @private
	 */
	_validateDropdownStructure(dropdown) {
		const results = {
			isValid: true,
			errors: [],
			warnings: [],
			statistics: {
				totalSubmenus: 0,
				maxDepth: 0,
				totalItems: 0
			}
		};

		// Check if dropdown has proper classes
		if (!dropdown.classList.contains('multilevel-dropdown')) {
			results.warnings.push('Dropdown missing "multilevel-dropdown" class');
		}

		// Count submenus and validate structure
		const submenus = dropdown.querySelectorAll('.dropdown-submenu');
		results.statistics.totalSubmenus = submenus.length;

		submenus.forEach((submenu, index) => {
			const toggle = submenu.querySelector('.dropdown-toggle');
			const menu = submenu.querySelector('.dropdown-menu');

			if (!toggle) {
				results.errors.push(`Submenu ${index} missing dropdown-toggle`);
				results.isValid = false;
			}

			if (!menu) {
				results.errors.push(`Submenu ${index} missing dropdown-menu`);
				results.isValid = false;
			}

			// Calculate depth
			const depth = this._calculateSubmenuDepth(submenu);
			if (depth > results.statistics.maxDepth) {
				results.statistics.maxDepth = depth;
			}
		});

		// Count total items
		results.statistics.totalItems = dropdown.querySelectorAll('.dropdown-item').length;

		// Check for accessibility attributes
		const togglesWithoutAria = dropdown.querySelectorAll('.dropdown-toggle:not([aria-haspopup])');
		if (togglesWithoutAria.length > 0) {
			results.warnings.push(`${togglesWithoutAria.length} toggles missing aria-haspopup attribute`);
		}

		return results;
	}

	/**
	 * Calculate submenu depth
	 * @param {HTMLElement} submenu - Submenu element
	 * @returns {number} Depth level
	 * @private
	 */
	_calculateSubmenuDepth(submenu) {
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
	 * Run accessibility audit
	 * @param {HTMLElement} dropdown - Dropdown to audit
	 * @returns {Object} Audit results
	 * @private
	 */
	_runAccessibilityAudit(dropdown) {
		const results = {
			score: 100,
			issues: [],
			suggestions: []
		};

		// Check for ARIA attributes
		const toggles = dropdown.querySelectorAll('.dropdown-toggle');
		toggles.forEach((toggle, index) => {
			if (!toggle.hasAttribute('aria-haspopup')) {
				results.issues.push(`Toggle ${index} missing aria-haspopup`);
				results.score -= 10;
			}

			if (!toggle.hasAttribute('aria-expanded')) {
				results.issues.push(`Toggle ${index} missing aria-expanded`);
				results.score -= 10;
			}
		});

		// Check for keyboard navigation support
		if (!dropdown.hasAttribute('role') && !dropdown.closest('[role]')) {
			results.suggestions.push('Consider adding role="menu" to dropdown');
		}

		// Check color contrast (simplified check)
		const items = dropdown.querySelectorAll('.dropdown-item');
		items.forEach((item, index) => {
			const styles = getComputedStyle(item);
			const bgColor = styles.backgroundColor;
			const textColor = styles.color;

			// This is a simplified contrast check
			if (bgColor === textColor) {
				results.issues.push(`Item ${index} may have contrast issues`);
				results.score -= 5;
			}
		});

		return results;
	}

	/**
	 * Generate usage statistics
	 * @returns {Object} Usage statistics
	 * @private
	 */
	_generateUsageStatistics() {
		if (!window.multiLevelDropdown) {
			return null;
		}

		const dropdowns = document.querySelectorAll('.multilevel-dropdown');
		const stats = {
			totalDropdowns: dropdowns.length,
			totalSubmenus: 0,
			averageDepth: 0,
			totalItems: 0,
			configuredOptions: Object.keys(window.multiLevelDropdown.getConfig()).length,
			browserInfo: {
				userAgent: navigator.userAgent,
				viewport: `${window.innerWidth}x${window.innerHeight}`,
				devicePixelRatio: window.devicePixelRatio
			},
			performance: this.performanceMetrics
		};

		dropdowns.forEach(dropdown => {
			const validation = this._validateDropdownStructure(dropdown);
			stats.totalSubmenus += validation.statistics.totalSubmenus;
			stats.totalItems += validation.statistics.totalItems;
			stats.averageDepth += validation.statistics.maxDepth;
		});

		if (stats.totalDropdowns > 0) {
			stats.averageDepth = stats.averageDepth / stats.totalDropdowns;
		}

		return stats;
	}

	/**
	 * Export usage report
	 * @private
	 */
	_exportUsageReport() {
		const stats = this._generateUsageStatistics();

		if (!stats) {
			this._showNotification('No usage data available', 'warning');
			return;
		}

		const report = {
			generatedAt: new Date().toISOString(),
			version: '1.0.0',
			statistics: stats,
			configuration: window.multiLevelDropdown ? window.multiLevelDropdown.getConfig() : null
		};

		const reportJson = JSON.stringify(report, null, 2);
		const blob = new Blob([reportJson], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `multilevel-dropdown-report-${Date.now()}.json`;
		link.click();

		URL.revokeObjectURL(url);
		this._showNotification('Usage report exported', 'success');
	}
}

// Initialize demo controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	window.demoController = new DemoController();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
	module.exports = DemoController;
}

// Make available globally
if (typeof window !== 'undefined') {
	window.DemoController = DemoController;
}