/**
 * BehaviorTracker - Advanced user behavior analysis for bot detection
 * Tracks mouse, touch, keyboard, and timing patterns to distinguish between humans and bots
 */
class BehaviorTracker {
	constructor(options = {}) {
		// Default configuration
		this.config = {
			// Tracking intervals (milliseconds)
			mouseTrackingInterval: 50,
			touchTrackingInterval: 50,

			// Analysis thresholds
			minMouseMovements: 5,
			minInteractionTime: 2000,
			suspiciousLinearityThreshold: 0.95,

			// Scoring weights
			mouseWeight: 0.25,
			touchWeight: 0.20,
			clickWeight: 0.20,
			keyboardWeight: 0.20,
			timingWeight: 0.15,

			// Bot detection thresholds
			botScoreThreshold: 0.3,
			humanScoreThreshold: 0.7,

			// Event callbacks
			onScoreUpdate: null,
			onBotDetected: null,
			onHumanDetected: null,

			// Debug options
			debug: false,
			logEvents: false,

			...options
		};

		// Initialize tracking data
		this.reset();

		// Bind event handlers
		this._bindEvents();
	}

	/**
	 * Reset all tracking data
	 */
	reset() {
		this.startTime = Date.now();
		this.isTracking = false;

		// Mouse tracking data
		this.mouseData = {
			positions: [],
			clicks: [],
			velocities: [],
			accelerations: [],
			totalMovement: 0,
			avgVelocity: 0,
			maxVelocity: 0,
			linearityScore: 0
		};

		// Touch tracking data
		this.touchData = {
			touches: [],
			swipes: [],
			pressures: [],
			multiTouch: false,
			avgSwipeVelocity: 0,
			touchPatterns: []
		};

		// Click tracking data
		this.clickData = {
			clicks: [],
			intervals: [],
			patterns: [],
			avgInterval: 0,
			consistency: 0
		};

		// Keyboard tracking data
		this.keyboardData = {
			keyPresses: [],
			intervals: [],
			typingRhythm: [],
			avgInterval: 0,
			naturalPauses: 0
		};

		// Timing analysis
		this.timingData = {
			pageLoadTime: Date.now(),
			firstInteraction: null,
			interactionDelays: [],
			consistencyScore: 0
		};

		// Current analysis scores
		this.scores = {
			mouse: 0.5,
			touch: 0.5,
			click: 0.5,
			keyboard: 0.5,
			timing: 0.5,
			overall: 0.5
		};

		this._log('BehaviorTracker initialized and reset');
	}

	/**
	 * Start behavior tracking
	 */
	start() {
		if (this.isTracking) return;

		this.isTracking = true;
		this.startTime = Date.now();
		this.timingData.pageLoadTime = this.startTime;

		// Start mouse tracking interval
		this.mouseInterval = setInterval(() => {
			if (this.mouseData.positions.length > 1) {
				this._analyzeMouseBehavior();
			}
		}, this.config.mouseTrackingInterval);

		// Start periodic analysis
		this.analysisInterval = setInterval(() => {
			this._updateScores();
		}, 1000);

		this._log('Behavior tracking started');
	}

	/**
	 * Stop behavior tracking
	 */
	stop() {
		this.isTracking = false;

		if (this.mouseInterval) {
			clearInterval(this.mouseInterval);
		}

		if (this.analysisInterval) {
			clearInterval(this.analysisInterval);
		}

		this._log('Behavior tracking stopped');
	}

	/**
	 * Bind event listeners for tracking
	 */
	_bindEvents() {
		// Mouse events
		document.addEventListener('mousemove', (e) => this._trackMouseMove(e));
		document.addEventListener('click', (e) => this._trackClick(e));
		document.addEventListener('mousedown', (e) => this._trackMouseDown(e));

		// Touch events
		document.addEventListener('touchstart', (e) => this._trackTouchStart(e));
		document.addEventListener('touchmove', (e) => this._trackTouchMove(e));
		document.addEventListener('touchend', (e) => this._trackTouchEnd(e));

		// Keyboard events
		document.addEventListener('keydown', (e) => this._trackKeyDown(e));
		document.addEventListener('keyup', (e) => this._trackKeyUp(e));

		// Window events
		window.addEventListener('focus', () => this._trackFocus());
		window.addEventListener('blur', () => this._trackBlur());
	}

	/**
	 * Track mouse movement
	 */
	_trackMouseMove(event) {
		if (!this.isTracking) return;

		const now = Date.now();
		const position = {
			x: event.clientX,
			y: event.clientY,
			timestamp: now
		};

		this.mouseData.positions.push(position);

		// Calculate velocity and acceleration
		if (this.mouseData.positions.length > 1) {
			const prev = this.mouseData.positions[this.mouseData.positions.length - 2];
			const distance = Math.sqrt(
				Math.pow(position.x - prev.x, 2) +
				Math.pow(position.y - prev.y, 2)
			);
			const time = (now - prev.timestamp) / 1000;
			const velocity = distance / time;

			this.mouseData.velocities.push(velocity);
			this.mouseData.totalMovement += distance;

			if (velocity > this.mouseData.maxVelocity) {
				this.mouseData.maxVelocity = velocity;
			}

			// Calculate acceleration
			if (this.mouseData.velocities.length > 1) {
				const prevVelocity = this.mouseData.velocities[this.mouseData.velocities.length - 2];
				const acceleration = (velocity - prevVelocity) / time;
				this.mouseData.accelerations.push(acceleration);
			}
		}

		this._setFirstInteraction(now);
		this._logEvent('Mouse move', position);

		// Keep data manageable
		if (this.mouseData.positions.length > 1000) {
			this.mouseData.positions.shift();
			this.mouseData.velocities.shift();
		}
	}

	/**
	 * Track mouse clicks
	 */
	_trackClick(event) {
		if (!this.isTracking) return;

		const now = Date.now();
		const click = {
			x: event.clientX,
			y: event.clientY,
			timestamp: now,
			button: event.button
		};

		this.clickData.clicks.push(click);

		// Calculate intervals between clicks
		if (this.clickData.clicks.length > 1) {
			const prevClick = this.clickData.clicks[this.clickData.clicks.length - 2];
			const interval = now - prevClick.timestamp;
			this.clickData.intervals.push(interval);
		}

		this._setFirstInteraction(now);
		this._logEvent('Click', click);
	}

	/**
	 * Track mouse down events
	 */
	_trackMouseDown(event) {
		if (!this.isTracking) return;
		this._setFirstInteraction(Date.now());
	}

	/**
	 * Track touch start
	 */
	_trackTouchStart(event) {
		if (!this.isTracking) return;

		const now = Date.now();
		const touches = Array.from(event.touches).map(touch => ({
			id: touch.identifier,
			x: touch.clientX,
			y: touch.clientY,
			pressure: touch.force || 1,
			timestamp: now
		}));

		this.touchData.touches.push({
			type: 'start',
			touches: touches,
			timestamp: now
		});

		if (event.touches.length > 1) {
			this.touchData.multiTouch = true;
		}

		this._setFirstInteraction(now);
		this._logEvent('Touch start', touches);
	}

	/**
	 * Track touch movement
	 */
	_trackTouchMove(event) {
		if (!this.isTracking) return;

		const now = Date.now();
		const touches = Array.from(event.touches).map(touch => ({
			id: touch.identifier,
			x: touch.clientX,
			y: touch.clientY,
			pressure: touch.force || 1,
			timestamp: now
		}));

		this.touchData.touches.push({
			type: 'move',
			touches: touches,
			timestamp: now
		});

		// Analyze swipe patterns
		this._analyzeSwipePattern();
		this._logEvent('Touch move', touches);
	}

	/**
	 * Track touch end
	 */
	_trackTouchEnd(event) {
		if (!this.isTracking) return;

		const now = Date.now();
		this.touchData.touches.push({
			type: 'end',
			touches: [],
			timestamp: now
		});

		this._logEvent('Touch end', { timestamp: now });
	}

	/**
	 * Track key down events
	 */
	_trackKeyDown(event) {
		if (!this.isTracking) return;

		const now = Date.now();
		const keyData = {
			key: event.key,
			code: event.code,
			timestamp: now,
			type: 'down'
		};

		this.keyboardData.keyPresses.push(keyData);

		// Calculate intervals between key presses
		if (this.keyboardData.keyPresses.length > 1) {
			const prevKey = this.keyboardData.keyPresses[this.keyboardData.keyPresses.length - 2];
			if (prevKey.type === 'up') {
				const interval = now - prevKey.timestamp;
				this.keyboardData.intervals.push(interval);
			}
		}

		this._setFirstInteraction(now);
		this._logEvent('Key down', keyData);
	}

	/**
	 * Track key up events
	 */
	_trackKeyUp(event) {
		if (!this.isTracking) return;

		const now = Date.now();
		const keyData = {
			key: event.key,
			code: event.code,
			timestamp: now,
			type: 'up'
		};

		this.keyboardData.keyPresses.push(keyData);
		this._logEvent('Key up', keyData);
	}

	/**
	 * Track window focus
	 */
	_trackFocus() {
		if (!this.isTracking) return;
		this._logEvent('Window focus', { timestamp: Date.now() });
	}

	/**
	 * Track window blur
	 */
	_trackBlur() {
		if (!this.isTracking) return;
		this._logEvent('Window blur', { timestamp: Date.now() });
	}

	/**
	 * Set first interaction time
	 */
	_setFirstInteraction(timestamp) {
		if (!this.timingData.firstInteraction) {
			this.timingData.firstInteraction = timestamp;
			const delay = timestamp - this.timingData.pageLoadTime;
			this.timingData.interactionDelays.push(delay);
		}
	}

	/**
	 * Analyze mouse behavior patterns
	 */
	_analyzeMouseBehavior() {
		if (this.mouseData.positions.length < this.config.minMouseMovements) return;

		// Calculate average velocity
		if (this.mouseData.velocities.length > 0) {
			this.mouseData.avgVelocity = this.mouseData.velocities.reduce((a, b) => a + b, 0) / this.mouseData.velocities.length;
		}

		// Calculate movement linearity (higher = more linear/robotic)
		this.mouseData.linearityScore = this._calculateLinearity();
	}

	/**
	 * Calculate movement linearity score
	 */
	_calculateLinearity() {
		if (this.mouseData.positions.length < 3) return 0;

		let totalDeviation = 0;
		let totalDistance = 0;

		for (let i = 2; i < this.mouseData.positions.length; i++) {
			const p1 = this.mouseData.positions[i - 2];
			const p2 = this.mouseData.positions[i - 1];
			const p3 = this.mouseData.positions[i];

			// Calculate angle deviation
			const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
			const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
			const deviation = Math.abs(angle2 - angle1);

			totalDeviation += deviation;
			totalDistance += Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
		}

		return totalDistance > 0 ? 1 - (totalDeviation / totalDistance) : 0;
	}

	/**
	 * Analyze swipe patterns
	 */
	_analyzeSwipePattern() {
		const touchMoves = this.touchData.touches.filter(t => t.type === 'move');
		if (touchMoves.length < 2) return;

		const recent = touchMoves.slice(-2);
		const [prev, curr] = recent;

		if (prev.touches.length > 0 && curr.touches.length > 0) {
			const prevTouch = prev.touches[0];
			const currTouch = curr.touches[0];

			const distance = Math.sqrt(
				Math.pow(currTouch.x - prevTouch.x, 2) +
				Math.pow(currTouch.y - prevTouch.y, 2)
			);

			const time = (curr.timestamp - prev.timestamp) / 1000;
			const velocity = distance / time;

			this.touchData.swipes.push({
				distance,
				velocity,
				timestamp: curr.timestamp
			});
		}
	}

	/**
	 * Update all behavioral scores
	 */
	_updateScores() {
		this.scores.mouse = this._calculateMouseScore();
		this.scores.touch = this._calculateTouchScore();
		this.scores.click = this._calculateClickScore();
		this.scores.keyboard = this._calculateKeyboardScore();
		this.scores.timing = this._calculateTimingScore();

		// Calculate overall score (weighted average)
		this.scores.overall = (
			this.scores.mouse * this.config.mouseWeight +
			this.scores.touch * this.config.touchWeight +
			this.scores.click * this.config.clickWeight +
			this.scores.keyboard * this.config.keyboardWeight +
			this.scores.timing * this.config.timingWeight
		);

		// Trigger callbacks
		if (this.config.onScoreUpdate) {
			this.config.onScoreUpdate(this.scores.overall);
		}

		// Check for bot/human detection
		if (this.scores.overall <= this.config.botScoreThreshold && this.config.onBotDetected) {
			this.config.onBotDetected(this.getAnalysis());
		} else if (this.scores.overall >= this.config.humanScoreThreshold && this.config.onHumanDetected) {
			this.config.onHumanDetected(this.getAnalysis());
		}

		this._log('Scores updated:', this.scores);
	}

	/**
	 * Calculate mouse behavior score (0 = bot-like, 1 = human-like)
	 */
	_calculateMouseScore() {
		if (this.mouseData.positions.length < this.config.minMouseMovements) {
			return 0.1; // No mouse movement is suspicious
		}

		let score = 0.5;

		// Penalize highly linear movements
		if (this.mouseData.linearityScore > this.config.suspiciousLinearityThreshold) {
			score -= 0.4;
		}

		// Reward velocity variations
		if (this.mouseData.velocities.length > 0) {
			const velocityVariance = this._calculateVariance(this.mouseData.velocities);
			score += Math.min(velocityVariance / 1000, 0.3);
		}

		// Reward acceleration changes
		if (this.mouseData.accelerations.length > 0) {
			const accelVariance = this._calculateVariance(this.mouseData.accelerations);
			score += Math.min(accelVariance / 10000, 0.2);
		}

		return Math.max(0, Math.min(1, score));
	}

	/**
	 * Calculate touch behavior score
	 */
	_calculateTouchScore() {
		// If no touch events, neutral score
		if (this.touchData.touches.length === 0) return 0.5;

		let score = 0.5;

		// Reward multi-touch capability
		if (this.touchData.multiTouch) {
			score += 0.2;
		}

		// Reward varied swipe velocities
		if (this.touchData.swipes.length > 0) {
			const velocities = this.touchData.swipes.map(s => s.velocity);
			const variance = this._calculateVariance(velocities);
			score += Math.min(variance / 1000, 0.3);
		}

		return Math.max(0, Math.min(1, score));
	}

	/**
	 * Calculate click pattern score
	 */
	_calculateClickScore() {
		if (this.clickData.intervals.length === 0) return 0.5;

		let score = 0.5;

		// Calculate interval variance (humans have irregular timing)
		const variance = this._calculateVariance(this.clickData.intervals);
		score += Math.min(variance / 100000, 0.4);

		// Penalize perfectly consistent intervals
		const avgInterval = this.clickData.intervals.reduce((a, b) => a + b, 0) / this.clickData.intervals.length;
		const consistency = this.clickData.intervals.filter(i => Math.abs(i - avgInterval) < 10).length / this.clickData.intervals.length;

		if (consistency > 0.8) {
			score -= 0.3;
		}

		return Math.max(0, Math.min(1, score));
	}

	/**
	 * Calculate keyboard behavior score
	 */
	_calculateKeyboardScore() {
		if (this.keyboardData.intervals.length === 0) return 0.5;

		let score = 0.5;

		// Reward natural typing rhythm variations
		const variance = this._calculateVariance(this.keyboardData.intervals);
		score += Math.min(variance / 10000, 0.4);

		// Count natural pauses (longer intervals)
		const naturalPauses = this.keyboardData.intervals.filter(i => i > 500).length;
		score += Math.min(naturalPauses / this.keyboardData.intervals.length, 0.1);

		return Math.max(0, Math.min(1, score));
	}

	/**
	 * Calculate timing behavior score
	 */
	_calculateTimingScore() {
		let score = 0.5;

		// Reward reasonable delay before first interaction
		if (this.timingData.firstInteraction) {
			const delay = this.timingData.firstInteraction - this.timingData.pageLoadTime;

			if (delay < 100) {
				score -= 0.3; // Too fast, likely bot
			} else if (delay > 500 && delay < 10000) {
				score += 0.3; // Natural human delay
			}
		}

		// Analyze interaction delay patterns
		if (this.timingData.interactionDelays.length > 1) {
			const variance = this._calculateVariance(this.timingData.interactionDelays);
			score += Math.min(variance / 1000000, 0.2);
		}

		return Math.max(0, Math.min(1, score));
	}

	/**
	 * Calculate variance of an array
	 */
	_calculateVariance(values) {
		if (values.length === 0) return 0;

		const mean = values.reduce((a, b) => a + b, 0) / values.length;
		const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
		return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
	}

	/**
	 * Get comprehensive analysis of current behavior
	 */
	getAnalysis() {
		return {
			scores: { ...this.scores },
			mouseData: {
				movementCount: this.mouseData.positions.length,
				totalMovement: this.mouseData.totalMovement,
				avgVelocity: this.mouseData.avgVelocity,
				maxVelocity: this.mouseData.maxVelocity,
				linearityScore: this.mouseData.linearityScore
			},
			touchData: {
				touchCount: this.touchData.touches.length,
				multiTouch: this.touchData.multiTouch,
				swipeCount: this.touchData.swipes.length
			},
			clickData: {
				clickCount: this.clickData.clicks.length,
				avgInterval: this.clickData.intervals.length > 0
					? this.clickData.intervals.reduce((a, b) => a + b, 0) / this.clickData.intervals.length
					: 0
			},
			keyboardData: {
				keyPressCount: this.keyboardData.keyPresses.length,
				avgInterval: this.keyboardData.intervals.length > 0
					? this.keyboardData.intervals.reduce((a, b) => a + b, 0) / this.keyboardData.intervals.length
					: 0
			},
			timingData: {
				sessionDuration: Date.now() - this.startTime,
				firstInteractionDelay: this.timingData.firstInteraction
					? this.timingData.firstInteraction - this.timingData.pageLoadTime
					: null
			},
			classification: this._getClassification()
		};
	}

	/**
	 * Get current behavior classification
	 */
	_getClassification() {
		if (this.scores.overall <= this.config.botScoreThreshold) {
			return 'bot';
		} else if (this.scores.overall >= this.config.humanScoreThreshold) {
			return 'human';
		} else {
			return 'uncertain';
		}
	}

	/**
	 * Get current overall score
	 */
	getScore() {
		return this.scores.overall;
	}

	/**
	 * Check if current behavior suggests bot
	 */
	isBot() {
		return this.scores.overall <= this.config.botScoreThreshold;
	}

	/**
	 * Check if current behavior suggests human
	 */
	isHuman() {
		return this.scores.overall >= this.config.humanScoreThreshold;
	}

	/**
	 * Log debug message
	 */
	_log(message, data = null) {
		if (this.config.debug) {
			console.log('[BehaviorTracker]', message, data);
		}
	}

	/**
	 * Log events if enabled
	 */
	_logEvent(event, data) {
		if (this.config.logEvents) {
			console.log(`[BehaviorTracker Event] ${event}:`, data);
		}
	}
}