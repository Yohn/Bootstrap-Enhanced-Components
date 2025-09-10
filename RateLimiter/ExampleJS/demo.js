/**
 * Demo JavaScript for RateLimiter Component
 * Demonstrates all features and capabilities
 */
class RateLimiterDemo {
	constructor() {
		this.rateLimiter = null;
		this.requestHistory = [];
		this.isInitialized = false;

		this.init();
	}

	/**
	 * Initialize the demo
	 */
	init() {
		// Wait for DOM to be ready
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.setup());
		} else {
			this.setup();
		}
	}

	/**
	 * Setup the demo interface and rate limiter
	 */
	setup() {
		this.initializeRateLimiter();
		this.bindEvents();
		this.startMetricsUpdater();
		this.isInitialized = true;

		console.log('RateLimiter Demo initialized');
	}

	/**
	 * Initialize the rate limiter with default settings
	 */
	initializeRateLimiter() {
		this.rateLimiter = new RateLimiter({
			maxRequests: 5,
			windowSize: 10000, // 10 seconds
			queueRequests: true,
			storage: 'memory',
			showStatus: true,
			statusContainer: '#statusContainer',
			theme: 'primary',
			debug: true,
			priority: {
				high: 1,
				normal: 5,
				low: 10
			}
		});

		// Set up event listeners
		this.setupEventListeners();
	}

	/**
	 * Setup event listeners for rate limiter events
	 */
	setupEventListeners() {
		this.rateLimiter.on('requestProcessed', (data) => {
			this.addToHistory('processed', data);
		});

		this.rateLimiter.on('requestQueued', (data) => {
			this.addToHistory('queued', data);
		});

		this.rateLimiter.on('limitExceeded', (data) => {
			this.addToHistory('limitExceeded', data);
			this.showNotification('Rate limit exceeded!', 'warning');
		});

		this.rateLimiter.on('backoffTriggered', (data) => {
			this.addToHistory('backoff', data);
			this.showNotification(`Backoff triggered: ${data.delay}ms`, 'info');
		});

		this.rateLimiter.on('windowReset', (data) => {
			this.addToHistory('windowReset', data);
			this.showNotification('Rate limit window reset', 'success');
		});
	}

	/**
	 * Bind UI event handlers
	 */
	bindEvents() {
		// Request buttons
		document.getElementById('makeNormalRequest')?.addEventListener('click', () => {
			this.makeTestRequest('normal');
		});

		document.getElementById('makeHighPriorityRequest')?.addEventListener('click', () => {
			this.makeTestRequest('high');
		});

		document.getElementById('makeLowPriorityRequest')?.addEventListener('click', () => {
			this.makeTestRequest('low');
		});

		document.getElementById('makeBulkRequests')?.addEventListener('click', () => {
			this.makeBulkRequests(10);
		});

		// Control buttons
		document.getElementById('updateSettings')?.addEventListener('click', () => {
			this.updateSettings();
		});

		document.getElementById('resetLimiter')?.addEventListener('click', () => {
			this.resetLimiter();
		});

		document.getElementById('clearHistory')?.addEventListener('click', () => {
			this.clearHistory();
		});
	}

	/**
	 * Make a test request with specified priority
	 * @param {string} priority - Request priority
	 */
	async makeTestRequest(priority = 'normal') {
		const startTime = Date.now();

		try {
			const result = await this.rateLimiter.makeRequest(() => {
				// Simulate API call
				return this.simulateAPICall();
			}, { priority });

			console.log(`${priority} priority request completed:`, result);
		} catch (error) {
			console.error(`${priority} priority request failed:`, error.message);
		}
	}

	/**
	 * Make multiple requests at once
	 * @param {number} count - Number of requests to make
	 */
	async makeBulkRequests(count = 10) {
		const promises = [];

		for (let i = 0; i < count; i++) {
			const priority = i < 2 ? 'high' : i < 6 ? 'normal' : 'low';
			promises.push(this.makeTestRequest(priority));
		}

		try {
			await Promise.allSettled(promises);
			this.showNotification(`Bulk requests (${count}) completed`, 'info');
		} catch (error) {
			console.error('Bulk requests failed:', error);
		}
	}

	/**
	 * Simulate an API call with random delay and occasional failures
	 * @returns {Promise}
	 */
	simulateAPICall() {
		return new Promise((resolve, reject) => {
			// Random delay between 500ms and 2000ms
			const delay = Math.random() * 1500 + 500;

			setTimeout(() => {
				// 10% chance of failure
				if (Math.random() < 0.1) {
					reject(new Error('Simulated API error'));
				} else {
					resolve({
						data: `Response at ${new Date().toISOString()}`,
						delay: Math.round(delay),
						random: Math.random()
					});
				}
			}, delay);
		});
	}

	/**
	 * Update rate limiter settings from UI
	 */
	updateSettings() {
		const maxRequests = parseInt(document.getElementById('maxRequests')?.value) || 5;
		const windowSize = parseInt(document.getElementById('windowSize')?.value) * 1000 || 10000;
		const storageType = document.getElementById('storageType')?.value || 'memory';
		const backoffStrategy = document.getElementById('backoffStrategy')?.value || 'exponential';

		// Create new rate limiter with updated settings
		this.rateLimiter = new RateLimiter({
			maxRequests,
			windowSize,
			queueRequests: true,
			storage: storageType,
			backoffStrategy,
			showStatus: true,
			statusContainer: '#statusContainer',
			theme: 'primary',
			debug: true,
			priority: {
				high: 1,
				normal: 5,
				low: 10
			}
		});

		this.setupEventListeners();
		this.showNotification('Settings updated successfully', 'success');
	}

	/**
	 * Reset the rate limiter
	 */
	resetLimiter() {
		this.rateLimiter.reset();
		this.clearHistory();
		this.showNotification('Rate limiter reset', 'info');
	}

	/**
	 * Clear request history
	 */
	clearHistory() {
		this.requestHistory = [];
		this.updateHistoryDisplay();
	}

	/**
	 * Add entry to request history
	 * @param {string} type - Entry type
	 * @param {Object} data - Entry data
	 */
	addToHistory(type, data) {
		const entry = {
			id: Date.now() + Math.random(),
			type,
			data,
			timestamp: new Date().toISOString()
		};

		this.requestHistory.unshift(entry);

		// Keep only last 50 entries
		if (this.requestHistory.length > 50) {
			this.requestHistory = this.requestHistory.slice(0, 50);
		}

		this.updateHistoryDisplay();
	}

	/**
	 * Update the history display
	 */
	updateHistoryDisplay() {
		const historyContainer = document.getElementById('requestHistory');
		if (!historyContainer) return;

		if (this.requestHistory.length === 0) {
			historyContainer.innerHTML = '<p class="text-muted text-center">No requests yet...</p>';
			return;
		}

		const historyHTML = this.requestHistory.map(entry => {
			const time = new Date(entry.timestamp).toLocaleTimeString();
			let content = '';
			let className = '';

			switch (entry.type) {
				case 'processed':
					className = entry.data.success ? 'success' : 'failed';
					content = `
						<div>
							<strong>Request ${entry.data.success ? 'Completed' : 'Failed'}</strong>
							<div class="request-id">${entry.data.requestId}</div>
						</div>
						<div>
							<div class="request-time">${time}</div>
							<div class="text-muted small">Wait: ${entry.data.waitTime}ms</div>
						</div>
					`;
					break;

				case 'queued':
					className = 'queued';
					content = `
						<div>
							<strong>Request Queued</strong>
							<div class="request-id">${entry.data.requestId}</div>
						</div>
						<div>
							<div class="request-time">${time}</div>
							<span class="request-priority ${entry.data.priority}">${entry.data.priority}</span>
						</div>
					`;
					break;

				case 'limitExceeded':
					className = 'failed';
					content = `
						<div>
							<strong>Rate Limit Exceeded</strong>
							<div class="small">${entry.data.reason}</div>
						</div>
						<div>
							<div class="request-time">${time}</div>
						</div>
					`;
					break;

				case 'backoff':
					className = 'failed';
					content = `
						<div>
							<strong>Backoff Triggered</strong>
							<div class="small">${entry.data.reason}</div>
						</div>
						<div>
							<div class="request-time">${time}</div>
							<div class="text-warning small">${entry.data.delay}ms</div>
						</div>
					`;
					break;

				case 'windowReset':
					className = 'success';
					content = `
						<div>
							<strong>Window Reset</strong>
							<div class="small">Count: ${entry.data.resetCount}</div>
						</div>
						<div>
							<div class="request-time">${time}</div>
						</div>
					`;
					break;

				default:
					content = `
						<div>
							<strong>${entry.type}</strong>
						</div>
						<div>
							<div class="request-time">${time}</div>
						</div>
					`;
			}

			return `<div class="request-item ${className}">${content}</div>`;
		}).join('');

		historyContainer.innerHTML = historyHTML;
	}

	/**
	 * Start the metrics updater
	 */
	startMetricsUpdater() {
		setInterval(() => {
			this.updateMetrics();
		}, 1000);
	}

	/**
	 * Update metrics display
	 */
	updateMetrics() {
		if (!this.rateLimiter) return;

		const metrics = this.rateLimiter.getMetrics();

		// Update metric displays
		document.getElementById('totalRequests').textContent = metrics.totalRequests;
		document.getElementById('successfulRequests').textContent = metrics.successfulRequests;
		document.getElementById('rejectedRequests').textContent = metrics.rejectedRequests;
		document.getElementById('averageWaitTime').textContent = `${metrics.averageWaitTime}ms`;
	}

	/**
	 * Show a notification
	 * @param {string} message - Notification message
	 * @param {string} type - Notification type
	 */
	showNotification(message, type = 'info') {
		// Create notification element
		const notification = document.createElement('div');
		notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
		notification.style.cssText = `
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

		// Auto-remove after 5 seconds
		setTimeout(() => {
			if (notification.parentNode) {
				notification.parentNode.removeChild(notification);
			}
		}, 5000);
	}

	/**
	 * Export demo data
	 * @returns {Object}
	 */
	exportData() {
		return {
			settings: this.rateLimiter.options,
			status: this.rateLimiter.getStatus(),
			metrics: this.rateLimiter.getMetrics(),
			history: this.requestHistory
		};
	}

	/**
	 * Import demo data
	 * @param {Object} data - Data to import
	 */
	importData(data) {
		if (data.history) {
			this.requestHistory = data.history;
			this.updateHistoryDisplay();
		}
	}
}

// Initialize demo when page loads
const demo = new RateLimiterDemo();