/**
 * RateLimiter - Client-side rate limiting for API calls
 * Part of Bootstrap 5.3 Components Collection
 */
class RateLimiter {
	/**
	 * Default configuration options
	 */
	static get DEFAULTS() {
		return {
			// Core rate limiting
			maxRequests: 10,
			windowSize: 60000, // 1 minute
			queueRequests: true,

			// Priority levels (lower number = higher priority)
			priority: {
				high: 1,
				normal: 5,
				low: 10
			},

			// Backoff configuration
			backoffStrategy: 'exponential', // 'exponential', 'linear', 'fixed'
			baseBackoffDelay: 1000,
			maxBackoffDelay: 30000,
			backoffMultiplier: 2,

			// Storage configuration
			storage: 'memory', // 'memory', 'localStorage', 'sessionStorage'
			identifier: 'default',

			// Queue settings
			maxQueueSize: 100,
			retryAttempts: 3,

			// UI options
			showStatus: true,
			showProgress: true,
			showQueue: true,
			statusContainer: null,
			theme: 'primary',

			// Advanced options
			enableMetrics: true,
			debug: false,

			// Event callbacks
			onLimitExceeded: null,
			onRequestQueued: null,
			onRequestProcessed: null,
			onBackoffTriggered: null,
			onWindowReset: null
		};
	}

	/**
	 * Constructor
	 * @param {Object} options - Configuration options
	 */
	constructor(options = {}) {
		// Merge options with defaults
		this.options = { ...RateLimiter.DEFAULTS, ...options };

		// Initialize components
		this.storageManager = new StorageManager(this.options.storage, this.options.identifier);
		this.requestQueue = new RequestQueue(this.options.maxQueueSize);
		this.backoffStrategy = new BackoffStrategy(this.options);

		// Initialize state
		this.requestCount = 0;
		this.windowStart = Date.now();
		this.isProcessing = false;
		this.currentBackoffDelay = 0;
		this.backoffActive = false;

		// Initialize metrics
		this.metrics = {
			totalRequests: 0,
			successfulRequests: 0,
			failedRequests: 0,
			rejectedRequests: 0,
			queuedRequests: 0,
			averageWaitTime: 0,
			maxWaitTime: 0,
			windowResets: 0,
			backoffTriggers: 0
		};

		// Event listeners
		this.eventListeners = new Map();

		// Load persisted state
		this.loadState();

		// Initialize UI
		if (this.options.showStatus && this.options.statusContainer) {
			this.initializeUI();
		}

		// Start processing queue
		this.startQueueProcessor();

		this.log('RateLimiter initialized', this.options);
	}

	/**
	 * Make a rate-limited request
	 * @param {Function} requestFn - Function that returns a Promise
	 * @param {Object} options - Request options
	 * @returns {Promise}
	 */
	async makeRequest(requestFn, options = {}) {
		const requestOptions = {
			priority: 'normal',
			retryAttempts: this.options.retryAttempts,
			timeout: null,
			...options
		};

		const request = {
			id: this.generateRequestId(),
			fn: requestFn,
			options: requestOptions,
			priority: this.getPriorityValue(requestOptions.priority),
			timestamp: Date.now(),
			attempts: 0,
			resolve: null,
			reject: null
		};

		// Create promise that will be resolved when request is processed
		const promise = new Promise((resolve, reject) => {
			request.resolve = resolve;
			request.reject = reject;
		});

		// Check if we can process immediately
		if (this.canMakeRequest() && !this.backoffActive) {
			this.processRequest(request);
		} else {
			// Queue the request
			if (this.options.queueRequests) {
				const queued = this.requestQueue.add(request);
				if (queued) {
					this.metrics.queuedRequests++;
					this.emit('requestQueued', {
						requestId: request.id,
						queueLength: this.requestQueue.size(),
						priority: requestOptions.priority
					});
					this.updateUI();
				} else {
					// Queue is full
					this.metrics.rejectedRequests++;
					request.reject(new Error('Request queue is full'));
					this.emit('limitExceeded', {
						reason: 'queueFull',
						queueSize: this.requestQueue.size()
					});
				}
			} else {
				// Not queuing, reject immediately
				this.metrics.rejectedRequests++;
				request.reject(new Error('Rate limit exceeded'));
				this.emit('limitExceeded', {
					reason: 'rateLimitExceeded',
					remainingRequests: this.getRemainingRequests(),
					windowReset: this.getWindowResetTime()
				});
			}
		}

		return promise;
	}

	/**
	 * Process a request
	 * @param {Object} request - Request object
	 */
	async processRequest(request) {
		const startTime = Date.now();
		request.attempts++;
		this.requestCount++;
		this.metrics.totalRequests++;

		this.log(`Processing request ${request.id}`, request);

		try {
			// Add timeout if specified
			let requestPromise = request.fn();

			if (request.options.timeout) {
				requestPromise = this.addTimeout(requestPromise, request.options.timeout);
			}

			const result = await requestPromise;
			const waitTime = Date.now() - request.timestamp;

			// Update metrics
			this.metrics.successfulRequests++;
			this.updateWaitTimeMetrics(waitTime);

			// Resolve the original promise
			request.resolve(result);

			this.emit('requestProcessed', {
				requestId: request.id,
				success: true,
				waitTime,
				attempts: request.attempts
			});

			this.log(`Request ${request.id} completed successfully`);

		} catch (error) {
			const waitTime = Date.now() - request.timestamp;

			// Check if we should retry
			if (request.attempts < request.options.retryAttempts && this.shouldRetry(error)) {
				this.log(`Request ${request.id} failed, retrying (attempt ${request.attempts})`);

				// Add back to queue with delay
				setTimeout(() => {
					this.requestQueue.add(request);
				}, this.getRetryDelay(request.attempts));

			} else {
				// Final failure
				this.metrics.failedRequests++;
				this.updateWaitTimeMetrics(waitTime);
				request.reject(error);

				this.emit('requestProcessed', {
					requestId: request.id,
					success: false,
					error: error.message,
					waitTime,
					attempts: request.attempts
				});

				this.log(`Request ${request.id} failed permanently`, error);
			}
		}

		// Save state and update UI
		this.saveState();
		this.updateUI();
	}

	/**
	 * Check if a request can be made immediately
	 * @returns {boolean}
	 */
	canMakeRequest() {
		this.checkWindowReset();
		return this.requestCount < this.options.maxRequests;
	}

	/**
	 * Get remaining requests in current window
	 * @returns {number}
	 */
	getRemainingRequests() {
		this.checkWindowReset();
		return Math.max(0, this.options.maxRequests - this.requestCount);
	}

	/**
	 * Check if the time window should be reset
	 */
	checkWindowReset() {
		const now = Date.now();
		if (now - this.windowStart >= this.options.windowSize) {
			this.windowStart = now;
			this.requestCount = 0;
			this.metrics.windowResets++;

			this.emit('windowReset', {
				newWindowStart: this.windowStart,
				resetCount: this.metrics.windowResets
			});

			this.log('Rate limit window reset');
		}
	}

	/**
	 * Get time until window reset
	 * @returns {number} - Milliseconds until reset
	 */
	getWindowResetTime() {
		return this.options.windowSize - (Date.now() - this.windowStart);
	}

	/**
	 * Start the queue processor
	 */
	startQueueProcessor() {
		setInterval(() => {
			if (!this.isProcessing && this.requestQueue.size() > 0) {
				this.processQueue();
			}
		}, 100); // Check every 100ms
	}

	/**
	 * Process queued requests
	 */
	async processQueue() {
		if (this.isProcessing || this.backoffActive) {
			return;
		}

		this.isProcessing = true;

		while (this.requestQueue.size() > 0 && this.canMakeRequest() && !this.backoffActive) {
			const request = this.requestQueue.next();
			if (request) {
				await this.processRequest(request);

				// Small delay between requests to prevent overwhelming
				await this.delay(50);
			}
		}

		this.isProcessing = false;
	}

	/**
	 * Trigger backoff mechanism
	 * @param {string} reason - Reason for backoff
	 */
	triggerBackoff(reason = 'rateLimitExceeded') {
		if (this.backoffActive) {
			return; // Already in backoff
		}

		this.currentBackoffDelay = this.backoffStrategy.getDelay(this.metrics.backoffTriggers);
		this.backoffActive = true;
		this.metrics.backoffTriggers++;

		this.emit('backoffTriggered', {
			reason,
			delay: this.currentBackoffDelay,
			attempt: this.metrics.backoffTriggers
		});

		this.log(`Backoff triggered: ${this.currentBackoffDelay}ms delay`);

		setTimeout(() => {
			this.backoffActive = false;
			this.log('Backoff period ended');
		}, this.currentBackoffDelay);
	}

	/**
	 * Clear the request queue
	 */
	clearQueue() {
		const queueSize = this.requestQueue.size();
		this.requestQueue.clear();
		this.log(`Cleared ${queueSize} queued requests`);
		this.updateUI();
	}

	/**
	 * Reset the rate limiter state
	 */
	reset() {
		this.requestCount = 0;
		this.windowStart = Date.now();
		this.currentBackoffDelay = 0;
		this.backoffActive = false;
		this.clearQueue();

		// Reset metrics
		Object.keys(this.metrics).forEach(key => {
			this.metrics[key] = 0;
		});

		this.storageManager.clear();
		this.log('RateLimiter reset');
		this.updateUI();

		this.emit('windowReset', {
			newWindowStart: this.windowStart,
			resetCount: this.metrics.windowResets
		});
	}

	/**
	 * Get current status
	 * @returns {Object}
	 */
	getStatus() {
		return {
			requestCount: this.requestCount,
			remainingRequests: this.getRemainingRequests(),
			queueLength: this.requestQueue.size(),
			windowResetTime: this.getWindowResetTime(),
			backoffActive: this.backoffActive,
			backoffDelay: this.currentBackoffDelay,
			metrics: { ...this.metrics }
		};
	}

	/**
	 * Get performance metrics
	 * @returns {Object}
	 */
	getMetrics() {
		return {
			...this.metrics,
			requestsPerSecond: this.calculateRequestsPerSecond(),
			successRate: this.calculateSuccessRate(),
			queueUtilization: this.calculateQueueUtilization()
		};
	}

	/**
	 * Export metrics as JSON
	 * @returns {string}
	 */
	exportMetrics() {
		return JSON.stringify(this.getMetrics(), null, 2);
	}

	/**
	 * Clear metrics data
	 */
	clearMetrics() {
		Object.keys(this.metrics).forEach(key => {
			this.metrics[key] = 0;
		});
		this.updateUI();
	}

	// Utility methods
	generateRequestId() {
		return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	getPriorityValue(priority) {
		return this.options.priority[priority] || this.options.priority.normal;
	}

	shouldRetry(error) {
		// Define retry conditions based on error type
		if (error.name === 'TimeoutError') return true;
		if (error.message && error.message.includes('network')) return true;
		if (error.status >= 500) return true; // Server errors
		return false;
	}

	getRetryDelay(attempt) {
		return this.backoffStrategy.getDelay(attempt - 1);
	}

	addTimeout(promise, timeout) {
		return Promise.race([
			promise,
			new Promise((_, reject) => {
				setTimeout(() => {
					reject(new Error('TimeoutError'));
				}, timeout);
			})
		]);
	}

	delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	calculateRequestsPerSecond() {
		const totalTime = Date.now() - this.windowStart;
		return totalTime > 0 ? (this.metrics.totalRequests / (totalTime / 1000)).toFixed(2) : 0;
	}

	calculateSuccessRate() {
		const total = this.metrics.successfulRequests + this.metrics.failedRequests;
		return total > 0 ? ((this.metrics.successfulRequests / total) * 100).toFixed(1) : 100;
	}

	calculateQueueUtilization() {
		return ((this.requestQueue.size() / this.options.maxQueueSize) * 100).toFixed(1);
	}

	updateWaitTimeMetrics(waitTime) {
		if (waitTime > this.metrics.maxWaitTime) {
			this.metrics.maxWaitTime = waitTime;
		}

		// Calculate rolling average
		const totalRequests = this.metrics.successfulRequests + this.metrics.failedRequests;
		this.metrics.averageWaitTime = Math.round(
			(this.metrics.averageWaitTime * (totalRequests - 1) + waitTime) / totalRequests
		);
	}

	// Storage methods
	saveState() {
		if (this.options.storage === 'memory') return;

		const state = {
			requestCount: this.requestCount,
			windowStart: this.windowStart,
			metrics: this.metrics
		};

		this.storageManager.set('state', state);
	}

	loadState() {
		if (this.options.storage === 'memory') return;

		const state = this.storageManager.get('state');
		if (state) {
			this.requestCount = state.requestCount || 0;
			this.windowStart = state.windowStart || Date.now();
			this.metrics = { ...this.metrics, ...state.metrics };

			// Check if window should be reset after loading
			this.checkWindowReset();
		}
	}

	// Event system
	on(event, callback) {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, []);
		}
		this.eventListeners.get(event).push(callback);
	}

	off(event, callback) {
		if (this.eventListeners.has(event)) {
			const listeners = this.eventListeners.get(event);
			const index = listeners.indexOf(callback);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		}
	}

	emit(event, data) {
		// Call configured callback if exists
		const callbackName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
		if (this.options[callbackName] && typeof this.options[callbackName] === 'function') {
			this.options[callbackName](data);
		}

		// Call registered event listeners
		if (this.eventListeners.has(event)) {
			this.eventListeners.get(event).forEach(callback => {
				try {
					callback(data);
				} catch (error) {
					this.log(`Error in event listener for ${event}:`, error);
				}
			});
		}
	}

	// UI methods
	initializeUI() {
		const container = document.querySelector(this.options.statusContainer);
		if (!container) return;

		container.innerHTML = this.generateStatusHTML();
		this.updateUI();
	}

	generateStatusHTML() {
		return `
			<div class="rate-limiter-status">
				<div class="row g-3">
					<div class="col-md-6">
						<div class="d-flex justify-content-between align-items-center mb-2">
							<span class="fw-bold">Requests</span>
							<span class="rate-limiter-requests badge bg-${this.options.theme}">
								<span id="currentRequests">0</span>/<span id="maxRequests">${this.options.maxRequests}</span>
							</span>
						</div>
						<div class="progress mb-2" style="height: 8px;">
							<div id="requestProgress" class="progress-bar bg-${this.options.theme}"
								 role="progressbar" style="width: 0%"></div>
						</div>
						<small class="text-muted">
							Window resets in <span id="windowReset">0</span>s
						</small>
					</div>

					<div class="col-md-6">
						<div class="d-flex justify-content-between align-items-center mb-2">
							<span class="fw-bold">Queue</span>
							<span class="rate-limiter-queue badge bg-info">
								<span id="queueLength">0</span>/<span id="maxQueue">${this.options.maxQueueSize}</span>
							</span>
						</div>
						<div class="progress mb-2" style="height: 8px;">
							<div id="queueProgress" class="progress-bar bg-info"
								 role="progressbar" style="width: 0%"></div>
						</div>
						<small class="text-muted">
							<span id="backoffStatus">Ready</span>
						</small>
					</div>
				</div>
			</div>
		`;
	}

	updateUI() {
		if (!this.options.showStatus || !this.options.statusContainer) return;

		const container = document.querySelector(this.options.statusContainer);
		if (!container) return;

		// Update request count and progress
		const currentRequestsEl = container.querySelector('#currentRequests');
		const requestProgressEl = container.querySelector('#requestProgress');
		if (currentRequestsEl && requestProgressEl) {
			currentRequestsEl.textContent = this.requestCount;
			const requestPercent = (this.requestCount / this.options.maxRequests) * 100;
			requestProgressEl.style.width = `${Math.min(requestPercent, 100)}%`;

			// Change color based on usage
			requestProgressEl.className = `progress-bar ${
				requestPercent > 80 ? 'bg-danger' :
				requestPercent > 60 ? 'bg-warning' :
				`bg-${this.options.theme}`
			}`;
		}

		// Update queue length and progress
		const queueLengthEl = container.querySelector('#queueLength');
		const queueProgressEl = container.querySelector('#queueProgress');
		if (queueLengthEl && queueProgressEl) {
			queueLengthEl.textContent = this.requestQueue.size();
			const queuePercent = (this.requestQueue.size() / this.options.maxQueueSize) * 100;
			queueProgressEl.style.width = `${queuePercent}%`;
		}

		// Update window reset timer
		const windowResetEl = container.querySelector('#windowReset');
		if (windowResetEl) {
			const resetTime = Math.ceil(this.getWindowResetTime() / 1000);
			windowResetEl.textContent = Math.max(0, resetTime);
		}

		// Update backoff status
		const backoffStatusEl = container.querySelector('#backoffStatus');
		if (backoffStatusEl) {
			if (this.backoffActive) {
				const remainingTime = Math.ceil(this.currentBackoffDelay / 1000);
				backoffStatusEl.textContent = `Backoff: ${remainingTime}s`;
				backoffStatusEl.className = 'text-warning';
			} else {
				backoffStatusEl.textContent = 'Ready';
				backoffStatusEl.className = 'text-success';
			}
		}
	}

	// Debug logging
	log(message, ...args) {
		if (this.options.debug) {
			console.log(`[RateLimiter:${this.options.identifier}] ${message}`, ...args);
		}
	}

	// Static factory methods
	static createAPILimiter(maxRequests = 100, windowMinutes = 60) {
		return new RateLimiter({
			maxRequests,
			windowSize: windowMinutes * 60 * 1000,
			storage: 'localStorage',
			identifier: 'api',
			queueRequests: true
		});
	}

	static createBurstLimiter(maxRequests = 10, windowSeconds = 10) {
		return new RateLimiter({
			maxRequests,
			windowSize: windowSeconds * 1000,
			storage: 'memory',
			queueRequests: false,
			backoffStrategy: 'exponential'
		});
	}

	static createBackgroundLimiter(maxRequests = 5, windowMinutes = 1) {
		return new RateLimiter({
			maxRequests,
			windowSize: windowMinutes * 60 * 1000,
			storage: 'sessionStorage',
			identifier: 'background',
			priority: {
				high: 1,
				normal: 5,
				low: 10,
				background: 15
			}
		});
	}
}