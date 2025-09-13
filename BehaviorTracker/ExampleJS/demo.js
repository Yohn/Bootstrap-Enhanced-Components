/**
 * Demo script for BehaviorTracker example
 * Handles UI updates and demonstrates the tracking functionality
 */
class BehaviorTrackerDemo {
	constructor() {
		this.tracker = null;
		this.isTracking = false;
		this.updateInterval = null;

		this._initializeElements();
		this._bindEvents();
		this._createTracker();
	}

	/**
	 * Initialize DOM element references
	 */
	_initializeElements() {
		// Control buttons
		this.startBtn = document.getElementById('startBtn');
		this.stopBtn = document.getElementById('stopBtn');
		this.resetBtn = document.getElementById('resetBtn');
		this.clearLogBtn = document.getElementById('clearLogBtn');

		// Display elements
		this.classificationBadge = document.getElementById('classificationBadge');
		this.overallProgress = document.getElementById('overallProgress');
		this.scoreText = document.getElementById('scoreText');
		this.sessionDuration = document.getElementById('sessionDuration');
		this.firstInteraction = document.getElementById('firstInteraction');

		// Score breakdown elements
		this.mouseScore = document.getElementById('mouseScore');
		this.mouseProgress = document.getElementById('mouseProgress');
		this.touchScore = document.getElementById('touchScore');
		this.touchProgress = document.getElementById('touchProgress');
		this.clickScore = document.getElementById('clickScore');
		this.clickProgress = document.getElementById('clickProgress');
		this.keyboardScore = document.getElementById('keyboardScore');
		this.keyboardProgress = document.getElementById('keyboardProgress');
		this.timingScore = document.getElementById('timingScore');
		this.timingProgress = document.getElementById('timingProgress');

		// Statistics elements
		this.mouseMovements = document.getElementById('mouseMovements');
		this.touchEvents = document.getElementById('touchEvents');
		this.clickCount = document.getElementById('clickCount');
		this.keyPresses = document.getElementById('keyPresses');
		this.mouseVelocity = document.getElementById('mouseVelocity');
		this.mouseLinearity = document.getElementById('mouseLinearity');
		this.multiTouch = document.getElementById('multiTouch');
		this.clickInterval = document.getElementById('clickInterval');

		// Activity log
		this.activityLog = document.getElementById('activityLog');

		// Interaction zone
		this.interactionZone = document.getElementById('interactionZone');
	}

	/**
	 * Bind event handlers
	 */
	_bindEvents() {
		this.startBtn.addEventListener('click', () => this._startTracking());
		this.stopBtn.addEventListener('click', () => this._stopTracking());
		this.resetBtn.addEventListener('click', () => this._resetTracking());
		this.clearLogBtn.addEventListener('click', () => this._clearLog());

		// Add interaction zone events for demonstration
		this.interactionZone.addEventListener('mouseenter', () => {
			this._logActivity('Mouse entered interaction zone', 'info');
		});

		this.interactionZone.addEventListener('mouseleave', () => {
			this._logActivity('Mouse left interaction zone', 'info');
		});
	}

	/**
	 * Create and configure the BehaviorTracker instance
	 */
	_createTracker() {
		this.tracker = new BehaviorTracker({
			debug: true,
			logEvents: false,
			botScoreThreshold: 0.3,
			humanScoreThreshold: 0.7,

			// Callback functions
			onScoreUpdate: (score) => {
				this._updateScoreDisplay(score);
			},

			onBotDetected: (analysis) => {
				this._logActivity('🤖 Bot behavior detected!', 'danger');
				this._showNotification('Bot Detected', 'Bot-like behavior patterns identified', 'danger');
			},

			onHumanDetected: (analysis) => {
				this._logActivity('👤 Human behavior confirmed!', 'success');
				this._showNotification('Human Detected', 'Natural human behavior patterns confirmed', 'success');
			}
		});
	}

	/**
	 * Start behavior tracking
	 */
	_startTracking() {
		if (this.isTracking) return;

		this.tracker.start();
		this.isTracking = true;

		// Update UI
		this.startBtn.disabled = true;
		this.stopBtn.disabled = false;

		// Start periodic UI updates
		this.updateInterval = setInterval(() => {
			this._updateDisplay();
		}, 500);

		this._logActivity('🚀 Behavior tracking started', 'success');
		this._updateDisplay();
	}

	/**
	 * Stop behavior tracking
	 */
	_stopTracking() {
		if (!this.isTracking) return;

		this.tracker.stop();
		this.isTracking = false;

		// Update UI
		this.startBtn.disabled = false;
		this.stopBtn.disabled = true;

		// Stop periodic updates
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
			this.updateInterval = null;
		}

		this._logActivity('⏹️ Behavior tracking stopped', 'warning');
		this._updateDisplay();
	}

	/**
	 * Reset tracking data
	 */
	_resetTracking() {
		const wasTracking = this.isTracking;

		if (this.isTracking) {
			this._stopTracking();
		}

		this.tracker.reset();
		this._updateDisplay();
		this._logActivity('🔄 Tracking data reset', 'info');

		if (wasTracking) {
			setTimeout(() => this._startTracking(), 100);
		}
	}

	/**
	 * Clear activity log
	 */
	_clearLog() {
		this.activityLog.innerHTML = '<div class="text-muted text-center py-3">Activity log cleared...</div>';
	}

	/**
	 * Update the main display with current tracking data
	 */
	_updateDisplay() {
		const analysis = this.tracker.getAnalysis();

		// Update classification badge
		this._updateClassificationBadge(analysis.classification, analysis.scores.overall);

		// Update scores
		this._updateScoreBreakdown(analysis.scores);

		// Update statistics
		this._updateStatistics(analysis);

		// Update session info
		this._updateSessionInfo(analysis);
	}

	/**
	 * Update classification badge
	 */
	_updateClassificationBadge(classification, score) {
		let badgeText = '';
		let badgeClass = '';

		switch (classification) {
			case 'bot':
				badgeText = '🤖 BOT DETECTED';
				badgeClass = 'bot-indicator';
				break;
			case 'human':
				badgeText = '👤 HUMAN VERIFIED';
				badgeClass = 'human-indicator';
				break;
			default:
				badgeText = '🔍 ANALYZING...';
				badgeClass = 'uncertain-indicator';
		}

		this.classificationBadge.textContent = badgeText;
		this.classificationBadge.className = `classification-badge ${badgeClass}`;
	}

	/**
	 * Update overall score display
	 */
	_updateScoreDisplay(score) {
		const percentage = Math.round(score * 100);

		this.overallProgress.style.width = `${percentage}%`;
		this.overallProgress.setAttribute('aria-valuenow', percentage);
		this.scoreText.textContent = score.toFixed(3);

		// Update progress bar color based on score
		this.overallProgress.className = 'progress-bar';
		if (score <= 0.3) {
			this.overallProgress.classList.add('bg-danger');
		} else if (score >= 0.7) {
			this.overallProgress.classList.add('bg-success');
		} else {
			this.overallProgress.classList.add('bg-warning');
		}
	}

	/**
	 * Update score breakdown display
	 */
	_updateScoreBreakdown(scores) {
		// Mouse score
		this.mouseScore.textContent = scores.mouse.toFixed(3);
		this.mouseProgress.style.width = `${Math.round(scores.mouse * 100)}%`;

		// Touch score
		this.touchScore.textContent = scores.touch.toFixed(3);
		this.touchProgress.style.width = `${Math.round(scores.touch * 100)}%`;

		// Click score
		this.clickScore.textContent = scores.click.toFixed(3);
		this.clickProgress.style.width = `${Math.round(scores.click * 100)}%`;

		// Keyboard score
		this.keyboardScore.textContent = scores.keyboard.toFixed(3);
		this.keyboardProgress.style.width = `${Math.round(scores.keyboard * 100)}%`;

		// Timing score
		this.timingScore.textContent = scores.timing.toFixed(3);
		this.timingProgress.style.width = `${Math.round(scores.timing * 100)}%`;
	}

	/**
	 * Update statistics display
	 */
	_updateStatistics(analysis) {
		// Activity counts
		this.mouseMovements.textContent = analysis.mouseData.movementCount.toLocaleString();
		this.touchEvents.textContent = analysis.touchData.touchCount.toLocaleString();
		this.clickCount.textContent = analysis.clickData.clickCount.toLocaleString();
		this.keyPresses.textContent = analysis.keyboardData.keyPressCount.toLocaleString();

		// Detailed metrics
		this.mouseVelocity.textContent = `${Math.round(analysis.mouseData.avgVelocity)} px/s`;
		this.mouseLinearity.textContent = `${Math.round(analysis.mouseData.linearityScore * 100)}%`;
		this.multiTouch.textContent = analysis.touchData.multiTouch ? 'Yes' : 'No';
		this.clickInterval.textContent = `${Math.round(analysis.clickData.avgInterval)}ms`;
	}

	/**
	 * Update session information
	 */
	_updateSessionInfo(analysis) {
		// Session duration
		const duration = Math.round(analysis.timingData.sessionDuration / 1000);
		this.sessionDuration.textContent = `${duration}s`;

		// First interaction delay
		if (analysis.timingData.firstInteractionDelay !== null) {
			const delay = Math.round(analysis.timingData.firstInteractionDelay);
			this.firstInteraction.textContent = `${delay}ms`;
		} else {
			this.firstInteraction.textContent = 'None';
		}
	}

	/**
	 * Log activity to the activity log
	 */
	_logActivity(message, type = 'info') {
		const timestamp = new Date().toLocaleTimeString();
		const logEntry = document.createElement('div');
		logEntry.className = `mb-1 text-${type}`;
		logEntry.innerHTML = `<small class="text-muted">[${timestamp}]</small> ${message}`;

		// Clear placeholder if present
		if (this.activityLog.children.length === 1 &&
			this.activityLog.children[0].textContent.includes('Start tracking')) {
			this.activityLog.innerHTML = '';
		}

		this.activityLog.appendChild(logEntry);

		// Auto-scroll to bottom
		this.activityLog.scrollTop = this.activityLog.scrollHeight;

		// Limit log entries
		while (this.activityLog.children.length > 50) {
			this.activityLog.removeChild(this.activityLog.firstChild);
		}
	}

	/**
	 * Show notification toast
	 */
	_showNotification(title, message, type = 'info') {
		// Create toast element
		const toastId = `toast-${Date.now()}`;
		const toastHtml = `
			<div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
				<div class="toast-header bg-${type} text-white">
					<strong class="me-auto">${title}</strong>
					<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
				</div>
				<div class="toast-body">
					${message}
				</div>
			</div>
		`;

		// Create toast container if it doesn't exist
		let toastContainer = document.getElementById('toast-container');
		if (!toastContainer) {
			toastContainer = document.createElement('div');
			toastContainer.id = 'toast-container';
			toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
			toastContainer.style.zIndex = '1055';
			document.body.appendChild(toastContainer);
		}

		// Add toast to container
		toastContainer.insertAdjacentHTML('beforeend', toastHtml);

		// Initialize and show toast
		const toastElement = document.getElementById(toastId);
		const toast = new bootstrap.Toast(toastElement, {
			autohide: true,
			delay: 4000
		});

		toast.show();

		// Remove toast element after it's hidden
		toastElement.addEventListener('hidden.bs.toast', () => {
			toastElement.remove();
		});
	}
}

// Initialize demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	window.behaviorDemo = new BehaviorTrackerDemo();

	// Add some demo interaction handlers
	document.querySelectorAll('.btn-interaction').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const demo = window.behaviorDemo;
			demo._logActivity(`Button clicked: "${e.target.textContent}"`, 'primary');

			// Add visual feedback
			e.target.classList.add('btn-outline-light');
			setTimeout(() => {
				e.target.classList.remove('btn-outline-light');
			}, 200);
		});
	});

	// Add keyboard event logging for the input field
	document.querySelector('input[type="text"]').addEventListener('input', (e) => {
		const demo = window.behaviorDemo;
		if (e.target.value.length % 5 === 0 && e.target.value.length > 0) {
			demo._logActivity(`Typing detected: ${e.target.value.length} characters`, 'info');
		}
	});

	// Add range slider interaction
	document.querySelector('input[type="range"]').addEventListener('input', (e) => {
		const demo = window.behaviorDemo;
		demo._logActivity(`Slider moved to: ${e.target.value}%`, 'secondary');
	});
});