/**
 * RequestQueue - Priority-based request queue management
 * Part of RateLimiter Component for Bootstrap 5.3
 */
class RequestQueue {
	/**
	 * Constructor
	 * @param {number} maxSize - Maximum queue size
	 */
	constructor(maxSize = 100) {
		this.maxSize = maxSize;
		this.queue = [];
		this.priorityMap = new Map(); // Track requests by priority level
	}

	/**
	 * Add a request to the queue
	 * @param {Object} request - Request object with priority
	 * @returns {boolean} - True if added, false if queue is full
	 */
	add(request) {
		if (this.queue.length >= this.maxSize) {
			return false;
		}

		// Insert request based on priority and timestamp
		const insertIndex = this.findInsertIndex(request);
		this.queue.splice(insertIndex, 0, request);

		// Update priority tracking
		this.updatePriorityMap(request.priority, 1);

		return true;
	}

	/**
	 * Get the next request from the queue (highest priority first)
	 * @returns {Object|null} - Next request or null if queue is empty
	 */
	next() {
		if (this.queue.length === 0) {
			return null;
		}

		const request = this.queue.shift();
		this.updatePriorityMap(request.priority, -1);

		return request;
	}

	/**
	 * Peek at the next request without removing it
	 * @returns {Object|null} - Next request or null if queue is empty
	 */
	peek() {
		return this.queue.length > 0 ? this.queue[0] : null;
	}

	/**
	 * Remove a specific request from the queue
	 * @param {string} requestId - ID of the request to remove
	 * @returns {Object|null} - Removed request or null if not found
	 */
	remove(requestId) {
		const index = this.queue.findIndex(req => req.id === requestId);
		if (index === -1) {
			return null;
		}

		const request = this.queue.splice(index, 1)[0];
		this.updatePriorityMap(request.priority, -1);

		return request;
	}

	/**
	 * Clear all requests from the queue
	 */
	clear() {
		// Reject all pending requests
		this.queue.forEach(request => {
			if (request.reject) {
				request.reject(new Error('Queue cleared'));
			}
		});

		this.queue = [];
		this.priorityMap.clear();
	}

	/**
	 * Get current queue size
	 * @returns {number}
	 */
	size() {
		return this.queue.length;
	}

	/**
	 * Check if queue is empty
	 * @returns {boolean}
	 */
	isEmpty() {
		return this.queue.length === 0;
	}

	/**
	 * Check if queue is full
	 * @returns {boolean}
	 */
	isFull() {
		return this.queue.length >= this.maxSize;
	}

	/**
	 * Get remaining capacity
	 * @returns {number}
	 */
	remainingCapacity() {
		return this.maxSize - this.queue.length;
	}

	/**
	 * Get queue statistics
	 * @returns {Object}
	 */
	getStats() {
		const stats = {
			size: this.queue.length,
			maxSize: this.maxSize,
			utilization: ((this.queue.length / this.maxSize) * 100).toFixed(1),
			byPriority: {},
			oldestRequest: null,
			newestRequest: null
		};

		// Calculate priority distribution
		this.priorityMap.forEach((count, priority) => {
			stats.byPriority[priority] = count;
		});

		// Find oldest and newest requests
		if (this.queue.length > 0) {
			stats.oldestRequest = {
				id: this.queue[0].id,
				age: Date.now() - this.queue[0].timestamp,
				priority: this.queue[0].priority
			};

			const newest = this.queue[this.queue.length - 1];
			stats.newestRequest = {
				id: newest.id,
				age: Date.now() - newest.timestamp,
				priority: newest.priority
			};
		}

		return stats;
	}

	/**
	 * Get all requests by priority
	 * @param {number} priority - Priority level
	 * @returns {Array}
	 */
	getByPriority(priority) {
		return this.queue.filter(request => request.priority === priority);
	}

	/**
	 * Get requests older than specified time
	 * @param {number} maxAge - Maximum age in milliseconds
	 * @returns {Array}
	 */
	getOldRequests(maxAge) {
		const cutoffTime = Date.now() - maxAge;
		return this.queue.filter(request => request.timestamp < cutoffTime);
	}

	/**
	 * Remove old requests from the queue
	 * @param {number} maxAge - Maximum age in milliseconds
	 * @returns {number} - Number of requests removed
	 */
	cleanupOldRequests(maxAge) {
		const cutoffTime = Date.now() - maxAge;
		let removedCount = 0;

		for (let i = this.queue.length - 1; i >= 0; i--) {
			const request = this.queue[i];
			if (request.timestamp < cutoffTime) {
				// Reject the old request
				if (request.reject) {
					request.reject(new Error('Request timeout in queue'));
				}

				this.queue.splice(i, 1);
				this.updatePriorityMap(request.priority, -1);
				removedCount++;
			}
		}

		return removedCount;
	}

	/**
	 * Reorder queue by priority and timestamp
	 */
	reorder() {
		this.queue.sort(this.compareRequests.bind(this));
	}

	/**
	 * Find the correct insertion index for a request based on priority
	 * @param {Object} request - Request to insert
	 * @returns {number} - Insertion index
	 */
	findInsertIndex(request) {
		// Binary search for insertion point
		let left = 0;
		let right = this.queue.length;

		while (left < right) {
			const mid = Math.floor((left + right) / 2);
			if (this.compareRequests(request, this.queue[mid]) < 0) {
				right = mid;
			} else {
				left = mid + 1;
			}
		}

		return left;
	}

	/**
	 * Compare two requests for sorting
	 * @param {Object} a - First request
	 * @param {Object} b - Second request
	 * @returns {number} - Comparison result
	 */
	compareRequests(a, b) {
		// First compare by priority (lower number = higher priority)
		if (a.priority !== b.priority) {
			return a.priority - b.priority;
		}

		// If same priority, compare by timestamp (older first)
		return a.timestamp - b.timestamp;
	}

	/**
	 * Update priority tracking map
	 * @param {number} priority - Priority level
	 * @param {number} delta - Change in count (+1 or -1)
	 */
	updatePriorityMap(priority, delta) {
		const currentCount = this.priorityMap.get(priority) || 0;
		const newCount = currentCount + delta;

		if (newCount <= 0) {
			this.priorityMap.delete(priority);
		} else {
			this.priorityMap.set(priority, newCount);
		}
	}

	/**
	 * Convert queue to array (for debugging/inspection)
	 * @returns {Array}
	 */
	toArray() {
		return [...this.queue];
	}

	/**
	 * Export queue state as JSON
	 * @returns {string}
	 */
	export() {
		return JSON.stringify({
			maxSize: this.maxSize,
			currentSize: this.queue.length,
			requests: this.queue.map(req => ({
				id: req.id,
				priority: req.priority,
				timestamp: req.timestamp,
				attempts: req.attempts,
				options: req.options
			})),
			stats: this.getStats()
		}, null, 2);
	}

	/**
	 * Create a copy of the queue
	 * @returns {RequestQueue}
	 */
	clone() {
		const newQueue = new RequestQueue(this.maxSize);

		// Deep copy requests (without functions)
		this.queue.forEach(request => {
			const requestCopy = {
				...request,
				fn: null, // Don't copy the function
				resolve: null, // Don't copy promise handlers
				reject: null
			};
			newQueue.queue.push(requestCopy);
		});

		// Copy priority map
		this.priorityMap.forEach((count, priority) => {
			newQueue.priorityMap.set(priority, count);
		});

		return newQueue;
	}

	/**
	 * Merge another queue into this one
	 * @param {RequestQueue} otherQueue - Queue to merge
	 * @returns {number} - Number of requests merged
	 */
	merge(otherQueue) {
		let mergedCount = 0;

		while (!otherQueue.isEmpty() && !this.isFull()) {
			const request = otherQueue.next();
			if (this.add(request)) {
				mergedCount++;
			}
		}

		return mergedCount;
	}

	/**
	 * Split queue into multiple queues by priority
	 * @returns {Map} - Map of priority -> RequestQueue
	 */
	splitByPriority() {
		const queues = new Map();

		this.queue.forEach(request => {
			if (!queues.has(request.priority)) {
				queues.set(request.priority, new RequestQueue(this.maxSize));
			}

			// Create a copy without promise handlers for the split
			const requestCopy = {
				...request,
				resolve: null,
				reject: null
			};

			queues.get(request.priority).add(requestCopy);
		});

		return queues;
	}

	/**
	 * Get average wait time for requests in queue
	 * @returns {number} - Average wait time in milliseconds
	 */
	getAverageWaitTime() {
		if (this.queue.length === 0) {
			return 0;
		}

		const now = Date.now();
		const totalWaitTime = this.queue.reduce((sum, request) => {
			return sum + (now - request.timestamp);
		}, 0);

		return Math.round(totalWaitTime / this.queue.length);
	}

	/**
	 * Estimate processing time for all queued requests
	 * @param {number} avgProcessingTime - Average time per request in ms
	 * @returns {number} - Estimated total processing time in ms
	 */
	estimateProcessingTime(avgProcessingTime = 1000) {
		return this.queue.length * avgProcessingTime;
	}
}