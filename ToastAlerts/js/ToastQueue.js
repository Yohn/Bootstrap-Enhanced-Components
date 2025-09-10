/**
 * ToastQueue - Queue management for ToastAlerts
 * Handles toast queueing, priority ordering, and capacity management
 */
class ToastQueue {
	constructor(maxVisible = 5) {
		this.maxVisible = maxVisible;
		this.queue = [];
		this.positionQueues = new Map();
	}

	/**
	 * Add a toast to the queue
	 * @param {Object} toastData - Toast data object
	 */
	add(toastData) {
		const position = toastData.options.position;

		// Initialize position queue if it doesn't exist
		if (!this.positionQueues.has(position)) {
			this.positionQueues.set(position, []);
		}

		const positionQueue = this.positionQueues.get(position);

		// Insert toast based on priority (higher priority first)
		const insertIndex = this._findInsertIndex(positionQueue, toastData.priority);
		positionQueue.splice(insertIndex, 0, toastData);

		// Update global queue for reference
		this._updateGlobalQueue();
	}

	/**
	 * Remove a toast from the queue
	 * @param {string} toastId - Toast ID to remove
	 * @returns {Object|null} Removed toast data or null if not found
	 */
	remove(toastId) {
		let removedToast = null;

		// Search through all position queues
		this.positionQueues.forEach((positionQueue, position) => {
			const index = positionQueue.findIndex(toast => toast.id === toastId);
			if (index !== -1) {
				removedToast = positionQueue.splice(index, 1)[0];
			}
		});

		// Update global queue
		this._updateGlobalQueue();

		return removedToast;
	}

	/**
	 * Get the next toast to show for any position
	 * @param {string} position - Optional position filter
	 * @returns {Object|null} Next toast data or null if queue is empty
	 */
	getNext(position = null) {
		if (position) {
			const positionQueue = this.positionQueues.get(position);
			return positionQueue && positionQueue.length > 0 ? positionQueue[0] : null;
		}

		// Find highest priority toast across all positions
		let highestPriorityToast = null;
		let highestPriority = -Infinity;

		this.positionQueues.forEach((positionQueue) => {
			if (positionQueue.length > 0) {
				const toast = positionQueue[0];
				if (toast.priority > highestPriority) {
					highestPriority = toast.priority;
					highestPriorityToast = toast;
				}
			}
		});

		return highestPriorityToast;
	}

	/**
	 * Get all queued toasts
	 * @param {string} position - Optional position filter
	 * @returns {Array} Array of queued toasts
	 */
	getAll(position = null) {
		if (position) {
			return this.positionQueues.get(position) || [];
		}

		return [...this.queue];
	}

	/**
	 * Get queue length
	 * @param {string} position - Optional position filter
	 * @returns {number} Queue length
	 */
	getLength(position = null) {
		if (position) {
			const positionQueue = this.positionQueues.get(position);
			return positionQueue ? positionQueue.length : 0;
		}

		return this.queue.length;
	}

	/**
	 * Clear queue
	 * @param {string} position - Optional position filter
	 */
	clear(position = null) {
		if (position) {
			this.positionQueues.set(position, []);
		} else {
			this.positionQueues.clear();
			this.queue = [];
		}

		this._updateGlobalQueue();
	}

	/**
	 * Check if queue is empty
	 * @param {string} position - Optional position filter
	 * @returns {boolean} Whether queue is empty
	 */
	isEmpty(position = null) {
		return this.getLength(position) === 0;
	}

	/**
	 * Check if queue is full for a position
	 * @param {string} position - Position to check
	 * @param {number} visibleCount - Current visible count for position
	 * @returns {boolean} Whether position queue is full
	 */
	isFull(position, visibleCount) {
		return visibleCount >= this.maxVisible;
	}

	/**
	 * Get queue statistics
	 * @returns {Object} Queue statistics
	 */
	getStats() {
		const stats = {
			total: this.queue.length,
			byPosition: {},
			byPriority: {},
			oldestTime: null,
			newestTime: null
		};

		// Position stats
		this.positionQueues.forEach((positionQueue, position) => {
			stats.byPosition[position] = positionQueue.length;
		});

		// Priority stats and time stats
		this.queue.forEach(toast => {
			const priority = toast.priority;
			stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

			if (!stats.oldestTime || toast.createdAt < stats.oldestTime) {
				stats.oldestTime = toast.createdAt;
			}

			if (!stats.newestTime || toast.createdAt > stats.newestTime) {
				stats.newestTime = toast.createdAt;
			}
		});

		return stats;
	}

	/**
	 * Reorder queue by priority
	 * @param {string} position - Optional position filter
	 */
	reorderByPriority(position = null) {
		if (position) {
			const positionQueue = this.positionQueues.get(position);
			if (positionQueue) {
				positionQueue.sort((a, b) => b.priority - a.priority);
			}
		} else {
			this.positionQueues.forEach((positionQueue) => {
				positionQueue.sort((a, b) => b.priority - a.priority);
			});
		}

		this._updateGlobalQueue();
	}

	/**
	 * Update priority of a queued toast
	 * @param {string} toastId - Toast ID
	 * @param {number} newPriority - New priority value
	 * @returns {boolean} Success status
	 */
	updatePriority(toastId, newPriority) {
		let updated = false;

		this.positionQueues.forEach((positionQueue) => {
			const toast = positionQueue.find(t => t.id === toastId);
			if (toast) {
				toast.priority = newPriority;
				updated = true;
			}
		});

		if (updated) {
			this.reorderByPriority();
		}

		return updated;
	}

	/**
	 * Remove old toasts from queue (cleanup)
	 * @param {number} maxAge - Maximum age in milliseconds
	 * @returns {Array} Removed toast IDs
	 */
	removeOldToasts(maxAge = 300000) { // 5 minutes default
		const now = Date.now();
		const removedIds = [];

		this.positionQueues.forEach((positionQueue, position) => {
			for (let i = positionQueue.length - 1; i >= 0; i--) {
				const toast = positionQueue[i];
				if (now - toast.createdAt > maxAge) {
					removedIds.push(toast.id);
					positionQueue.splice(i, 1);
				}
			}
		});

		this._updateGlobalQueue();

		return removedIds;
	}

	/**
	 * Get toasts by filter criteria
	 * @param {Object} criteria - Filter criteria
	 * @param {string} criteria.position - Position filter
	 * @param {string} criteria.type - Type filter
	 * @param {number} criteria.minPriority - Minimum priority
	 * @param {number} criteria.maxAge - Maximum age in milliseconds
	 * @returns {Array} Filtered toasts
	 */
	getFiltered(criteria = {}) {
		let filtered = [...this.queue];

		if (criteria.position) {
			filtered = filtered.filter(toast => toast.options.position === criteria.position);
		}

		if (criteria.type) {
			filtered = filtered.filter(toast => toast.options.type === criteria.type);
		}

		if (typeof criteria.minPriority === 'number') {
			filtered = filtered.filter(toast => toast.priority >= criteria.minPriority);
		}

		if (typeof criteria.maxAge === 'number') {
			const now = Date.now();
			filtered = filtered.filter(toast => now - toast.createdAt <= criteria.maxAge);
		}

		return filtered;
	}

	/**
	 * Set maximum visible toasts
	 * @param {number} maxVisible - New maximum visible count
	 */
	setMaxVisible(maxVisible) {
		this.maxVisible = Math.max(1, maxVisible);
	}

	/**
	 * Get maximum visible toasts
	 * @returns {number} Maximum visible count
	 */
	getMaxVisible() {
		return this.maxVisible;
	}

	/**
	 * Bulk operations
	 */

	/**
	 * Add multiple toasts to queue
	 * @param {Array} toastDataArray - Array of toast data objects
	 */
	addBulk(toastDataArray) {
		toastDataArray.forEach(toastData => {
			this.add(toastData);
		});
	}

	/**
	 * Remove multiple toasts from queue
	 * @param {Array} toastIds - Array of toast IDs to remove
	 * @returns {Array} Array of removed toast data objects
	 */
	removeBulk(toastIds) {
		const removed = [];

		toastIds.forEach(id => {
			const removedToast = this.remove(id);
			if (removedToast) {
				removed.push(removedToast);
			}
		});

		return removed;
	}

	/**
	 * Export queue state
	 * @returns {Object} Serializable queue state
	 */
	export() {
		const state = {
			maxVisible: this.maxVisible,
			positions: {}
		};

		this.positionQueues.forEach((positionQueue, position) => {
			state.positions[position] = positionQueue.map(toast => ({
				id: toast.id,
				options: toast.options,
				priority: toast.priority,
				createdAt: toast.createdAt
			}));
		});

		return state;
	}

	/**
	 * Import queue state
	 * @param {Object} state - Queue state to import
	 */
	import(state) {
		this.maxVisible = state.maxVisible || this.maxVisible;
		this.clear();

		Object.entries(state.positions || {}).forEach(([position, toasts]) => {
			toasts.forEach(toastData => {
				// Reconstruct toast object
				const toast = {
					id: toastData.id,
					options: toastData.options,
					element: null,
					timer: null,
					isVisible: false,
					isPaused: false,
					createdAt: toastData.createdAt,
					priority: toastData.priority
				};

				this.add(toast);
			});
		});
	}

	/**
	 * Find the correct insert index for a toast based on priority
	 * @param {Array} positionQueue - Position queue array
	 * @param {number} priority - Toast priority
	 * @returns {number} Insert index
	 * @private
	 */
	_findInsertIndex(positionQueue, priority) {
		// Binary search for optimal performance with large queues
		let left = 0;
		let right = positionQueue.length;

		while (left < right) {
			const mid = Math.floor((left + right) / 2);
			if (positionQueue[mid].priority >= priority) {
				left = mid + 1;
			} else {
				right = mid;
			}
		}

		return left;
	}

	/**
	 * Update the global queue array for reference
	 * @private
	 */
	_updateGlobalQueue() {
		this.queue = [];

		// Collect all toasts from position queues
		this.positionQueues.forEach((positionQueue) => {
			this.queue.push(...positionQueue);
		});

		// Sort by priority globally
		this.queue.sort((a, b) => b.priority - a.priority);
	}

	/**
	 * Validate toast data
	 * @param {Object} toastData - Toast data to validate
	 * @returns {boolean} Whether toast data is valid
	 * @private
	 */
	_validateToastData(toastData) {
		return toastData &&
			typeof toastData.id === 'string' &&
			toastData.options &&
			typeof toastData.options.position === 'string' &&
			typeof toastData.priority === 'number' &&
			typeof toastData.createdAt === 'number';
	}
}