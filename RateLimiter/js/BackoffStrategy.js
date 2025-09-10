/**
 * BackoffStrategy - Configurable backoff strategies for rate limiting
 * Part of RateLimiter Component for Bootstrap 5.3
 */
class BackoffStrategy {
	/**
	 * Available backoff strategies
	 */
	static get STRATEGIES() {
		return {
			EXPONENTIAL: 'exponential',
			LINEAR: 'linear',
			FIXED: 'fixed',
			FIBONACCI: 'fibonacci',
			CUSTOM: 'custom'
		};
	}

	/**
	 * Constructor
	 * @param {Object} options - Backoff configuration options
	 */
	constructor(options = {}) {
		this.options = {
			backoffStrategy: 'exponential',
			baseBackoffDelay: 1000,
			maxBackoffDelay: 30000,
			backoffMultiplier: 2,
			linearIncrement: 1000,
			jitterEnabled: true,
			jitterRange: 0.1, // 10% jitter
			customBackoffFn: null,
			...options
		};

		// Validate strategy
		if (!Object.values(BackoffStrategy.STRATEGIES).includes(this.options.backoffStrategy)) {
			throw new Error(`Invalid backoff strategy: ${this.options.backoffStrategy}`);
		}

		// Pre-calculate fibonacci sequence for fibonacci strategy
		this.fibonacciSequence = this.generateFibonacci(20);
	}

	/**
	 * Get the backoff delay for a specific attempt
	 * @param {number} attempt - Attempt number (0-based)
	 * @returns {number} - Delay in milliseconds
	 */
	getDelay(attempt = 0) {
		let delay;

		switch (this.options.backoffStrategy) {
			case BackoffStrategy.STRATEGIES.EXPONENTIAL:
				delay = this.calculateExponentialDelay(attempt);
				break;

			case BackoffStrategy.STRATEGIES.LINEAR:
				delay = this.calculateLinearDelay(attempt);
				break;

			case BackoffStrategy.STRATEGIES.FIXED:
				delay = this.calculateFixedDelay(attempt);
				break;

			case BackoffStrategy.STRATEGIES.FIBONACCI:
				delay = this.calculateFibonacciDelay(attempt);
				break;

			case BackoffStrategy.STRATEGIES.CUSTOM:
				delay = this.calculateCustomDelay(attempt);
				break;

			default:
				delay = this.calculateExponentialDelay(attempt);
		}

		// Apply jitter if enabled
		if (this.options.jitterEnabled) {
			delay = this.applyJitter(delay);
		}

		// Ensure delay is within bounds
		return Math.min(Math.max(delay, 0), this.options.maxBackoffDelay);
	}

	/**
	 * Calculate exponential backoff delay
	 * @param {number} attempt - Attempt number
	 * @returns {number} - Delay in milliseconds
	 */
	calculateExponentialDelay(attempt) {
		return this.options.baseBackoffDelay * Math.pow(this.options.backoffMultiplier, attempt);
	}

	/**
	 * Calculate linear backoff delay
	 * @param {number} attempt - Attempt number
	 * @returns {number} - Delay in milliseconds
	 */
	calculateLinearDelay(attempt) {
		return this.options.baseBackoffDelay + (attempt * this.options.linearIncrement);
	}

	/**
	 * Calculate fixed backoff delay
	 * @param {number} attempt - Attempt number
	 * @returns {number} - Delay in milliseconds
	 */
	calculateFixedDelay(attempt) {
		return this.options.baseBackoffDelay;
	}

	/**
	 * Calculate fibonacci backoff delay
	 * @param {number} attempt - Attempt number
	 * @returns {number} - Delay in milliseconds
	 */
	calculateFibonacciDelay(attempt) {
		const fibIndex = Math.min(attempt, this.fibonacciSequence.length - 1);
		return this.options.baseBackoffDelay * this.fibonacciSequence[fibIndex];
	}

	/**
	 * Calculate custom backoff delay
	 * @param {number} attempt - Attempt number
	 * @returns {number} - Delay in milliseconds
	 */
	calculateCustomDelay(attempt) {
		if (typeof this.options.customBackoffFn === 'function') {
			return this.options.customBackoffFn(attempt, this.options);
		}

		// Fallback to exponential if custom function is not provided
		return this.calculateExponentialDelay(attempt);
	}

	/**
	 * Apply jitter to the delay
	 * @param {number} delay - Base delay
	 * @returns {number} - Delay with jitter applied
	 */
	applyJitter(delay) {
		const jitterAmount = delay * this.options.jitterRange;
		const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
		return Math.round(delay + jitter);
	}

	/**
	 * Generate fibonacci sequence
	 * @param {number} count - Number of fibonacci numbers to generate
	 * @returns {Array<number>} - Fibonacci sequence
	 */
	generateFibonacci(count) {
		const sequence = [1, 1];

		for (let i = 2; i < count; i++) {
			sequence[i] = sequence[i - 1] + sequence[i - 2];
		}

		return sequence;
	}

	/**
	 * Get delay sequence for multiple attempts
	 * @param {number} maxAttempts - Maximum number of attempts
	 * @returns {Array<number>} - Array of delays
	 */
	getDelaySequence(maxAttempts = 10) {
		const sequence = [];

		for (let i = 0; i < maxAttempts; i++) {
			sequence.push(this.getDelay(i));
		}

		return sequence;
	}

	/**
	 * Get total delay for all attempts
	 * @param {number} maxAttempts - Maximum number of attempts
	 * @returns {number} - Total delay in milliseconds
	 */
	getTotalDelay(maxAttempts = 10) {
		return this.getDelaySequence(maxAttempts).reduce((sum, delay) => sum + delay, 0);
	}

	/**
	 * Calculate the next delay based on previous delays
	 * @param {Array<number>} previousDelays - Array of previous delays
	 * @returns {number} - Next delay
	 */
	getNextDelay(previousDelays = []) {
		return this.getDelay(previousDelays.length);
	}

	/**
	 * Reset the backoff strategy (useful for custom strategies with state)
	 */
	reset() {
		// Override in subclasses if needed
		// For stateless strategies, this is a no-op
	}

	/**
	 * Update strategy options
	 * @param {Object} newOptions - New options to merge
	 */
	updateOptions(newOptions) {
		this.options = { ...this.options, ...newOptions };

		// Regenerate fibonacci sequence if needed
		if (newOptions.backoffStrategy === BackoffStrategy.STRATEGIES.FIBONACCI) {
			this.fibonacciSequence = this.generateFibonacci(20);
		}
	}

	/**
	 * Get strategy information
	 * @returns {Object} - Strategy information
	 */
	getInfo() {
		return {
			strategy: this.options.backoffStrategy,
			baseDelay: this.options.baseBackoffDelay,
			maxDelay: this.options.maxBackoffDelay,
			multiplier: this.options.backoffMultiplier,
			jitterEnabled: this.options.jitterEnabled,
			jitterRange: this.options.jitterRange
		};
	}

	/**
	 * Export strategy configuration
	 * @returns {string} - JSON configuration
	 */
	export() {
		return JSON.stringify(this.options, null, 2);
	}

	/**
	 * Create a copy of the strategy
	 * @returns {BackoffStrategy} - New strategy instance
	 */
	clone() {
		return new BackoffStrategy({ ...this.options });
	}

	/**
	 * Validate delay sequence for testing
	 * @param {number} maxAttempts - Number of attempts to test
	 * @returns {Object} - Validation results
	 */
	validateSequence(maxAttempts = 10) {
		const sequence = this.getDelaySequence(maxAttempts);

		return {
			sequence,
			isIncreasing: this.isSequenceIncreasing(sequence),
			exceedsMax: sequence.some(delay => delay > this.options.maxBackoffDelay),
			minDelay: Math.min(...sequence),
			maxDelay: Math.max(...sequence),
			averageDelay: sequence.reduce((sum, delay) => sum + delay, 0) / sequence.length,
			totalDelay: sequence.reduce((sum, delay) => sum + delay, 0)
		};
	}

	/**
	 * Check if sequence is generally increasing
	 * @param {Array<number>} sequence - Delay sequence
	 * @returns {boolean} - True if generally increasing
	 */
	isSequenceIncreasing(sequence) {
		let increasingCount = 0;

		for (let i = 1; i < sequence.length; i++) {
			if (sequence[i] >= sequence[i - 1]) {
				increasingCount++;
			}
		}

		// Allow for some jitter, so we consider it increasing if 80% of steps increase
		return (increasingCount / (sequence.length - 1)) >= 0.8;
	}

	// Static factory methods for common strategies

	/**
	 * Create exponential backoff strategy
	 * @param {number} baseDelay - Base delay in ms
	 * @param {number} multiplier - Exponential multiplier
	 * @param {number} maxDelay - Maximum delay in ms
	 * @returns {BackoffStrategy}
	 */
	static createExponential(baseDelay = 1000, multiplier = 2, maxDelay = 30000) {
		return new BackoffStrategy({
			backoffStrategy: BackoffStrategy.STRATEGIES.EXPONENTIAL,
			baseBackoffDelay: baseDelay,
			backoffMultiplier: multiplier,
			maxBackoffDelay: maxDelay
		});
	}

	/**
	 * Create linear backoff strategy
	 * @param {number} baseDelay - Base delay in ms
	 * @param {number} increment - Linear increment in ms
	 * @param {number} maxDelay - Maximum delay in ms
	 * @returns {BackoffStrategy}
	 */
	static createLinear(baseDelay = 1000, increment = 1000, maxDelay = 30000) {
		return new BackoffStrategy({
			backoffStrategy: BackoffStrategy.STRATEGIES.LINEAR,
			baseBackoffDelay: baseDelay,
			linearIncrement: increment,
			maxBackoffDelay: maxDelay
		});
	}

	/**
	 * Create fixed backoff strategy
	 * @param {number} delay - Fixed delay in ms
	 * @returns {BackoffStrategy}
	 */
	static createFixed(delay = 5000) {
		return new BackoffStrategy({
			backoffStrategy: BackoffStrategy.STRATEGIES.FIXED,
			baseBackoffDelay: delay,
			maxBackoffDelay: delay
		});
	}

	/**
	 * Create fibonacci backoff strategy
	 * @param {number} baseDelay - Base delay in ms
	 * @param {number} maxDelay - Maximum delay in ms
	 * @returns {BackoffStrategy}
	 */
	static createFibonacci(baseDelay = 1000, maxDelay = 30000) {
		return new BackoffStrategy({
			backoffStrategy: BackoffStrategy.STRATEGIES.FIBONACCI,
			baseBackoffDelay: baseDelay,
			maxBackoffDelay: maxDelay
		});
	}

	/**
	 * Create custom backoff strategy
	 * @param {Function} customFn - Custom backoff function
	 * @param {Object} options - Additional options
	 * @returns {BackoffStrategy}
	 */
	static createCustom(customFn, options = {}) {
		return new BackoffStrategy({
			backoffStrategy: BackoffStrategy.STRATEGIES.CUSTOM,
			customBackoffFn: customFn,
			...options
		});
	}

	/**
	 * Create aggressive backoff for high-frequency APIs
	 * @returns {BackoffStrategy}
	 */
	static createAggressive() {
		return new BackoffStrategy({
			backoffStrategy: BackoffStrategy.STRATEGIES.EXPONENTIAL,
			baseBackoffDelay: 500,
			backoffMultiplier: 3,
			maxBackoffDelay: 60000,
			jitterEnabled: true,
			jitterRange: 0.2
		});
	}

	/**
	 * Create gentle backoff for user-facing operations
	 * @returns {BackoffStrategy}
	 */
	static createGentle() {
		return new BackoffStrategy({
			backoffStrategy: BackoffStrategy.STRATEGIES.LINEAR,
			baseBackoffDelay: 2000,
			linearIncrement: 1000,
			maxBackoffDelay: 15000,
			jitterEnabled: true,
			jitterRange: 0.1
		});
	}
}