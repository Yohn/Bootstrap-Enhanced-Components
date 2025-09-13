/**
 * HumanVerificationForm - Complete form protection system
 * Integrates BehaviorTracker with multi-layered verification
 */
class HumanVerificationForm {
	constructor(formSelector, options = {}) {
		this.form = document.querySelector(formSelector);
		if (!this.form) {
			throw new Error(`Form not found: ${formSelector}`);
		}

		// Configuration with multi-layered protection
		this.config = {
			// BehaviorTracker settings
			behaviorTracking: {
				enabled: true,
				minTrackingTime: 10000, // 10 seconds minimum
				requiredInteractions: 5,
				botScoreThreshold: 0.3,
				humanScoreThreshold: 0.7
			},

			// Timing analysis
			timingChecks: {
				minFillTime: 3000, // 3 seconds minimum
				maxFillTime: 1800000, // 30 minutes maximum
				suspiciousFastFill: 1000, // Under 1 second is suspicious
				naturalPauseThreshold: 500 // Natural pauses expected
			},

			// Interaction requirements
			interactionChecks: {
				requireMouseMovement: true,
				requireKeyboardInput: true,
				requireFocusEvents: true,
				minFieldInteractions: 3
			},

			// Honeypot fields
			honeypot: {
				enabled: true,
				fieldName: 'email_confirm', // Hidden field
				expectedValue: '' // Should remain empty
			},

			// Progressive enhancement
			progressive: {
				initialCheck: true, // Basic checks first
				enhancedCheck: false, // Advanced after initial fail
				captchaFallback: true // CAPTCHA as last resort
			},

			// Security measures
			security: {
				checkDevTools: true,
				checkAutomationFlags: true,
				validateUserAgent: true,
				checkViewportRatio: true
			},

			// Callbacks
			onVerificationStart: null,
			onVerificationComplete: null,
			onBotDetected: null,
			onHumanVerified: null,
			onSubmissionBlocked: null,

			...options
		};

		this.verificationData = this._initializeVerificationData();
		this.behaviorTracker = null;

		this._initialize();
	}

	/**
	 * Initialize verification data tracking
	 */
	_initializeVerificationData() {
		return {
			startTime: Date.now(),
			firstInteraction: null,
			fieldInteractions: new Map(),
			mouseMovements: 0,
			keystrokes: 0,
			focusEvents: 0,
			formFillTime: 0,
			suspiciousFlags: [],
			verificationScore: 0,
			humanConfidence: 0.5,
			isVerified: false,
			verificationLevel: 'none' // none, basic, enhanced, verified
		};
	}

	/**
	 * Initialize the verification system
	 */
	_initialize() {
		this._setupBehaviorTracking();
		this._setupFormMonitoring();
		this._setupHoneypot();
		this._setupSecurityChecks();
		this._setupSubmissionHandler();

		if (this.config.onVerificationStart) {
			this.config.onVerificationStart(this.verificationData);
		}

		this._log('Human verification system initialized');
	}

	/**
	 * Setup behavior tracking integration
	 */
	_setupBehaviorTracking() {
		if (!this.config.behaviorTracking.enabled) return;

		this.behaviorTracker = new BehaviorTracker({
			debug: false,
			botScoreThreshold: this.config.behaviorTracking.botScoreThreshold,
			humanScoreThreshold: this.config.behaviorTracking.humanScoreThreshold,

			onScoreUpdate: (score) => {
				this.verificationData.humanConfidence = score;
				this._updateVerificationLevel();
			},

			onBotDetected: (analysis) => {
				this._flagSuspiciousBehavior('bot_behavior_detected', analysis);
			},

			onHumanDetected: (analysis) => {
				this._confirmHumanBehavior(analysis);
			}
		});

		this.behaviorTracker.start();
	}

	/**
	 * Setup comprehensive form monitoring
	 */
	_setupFormMonitoring() {
		// Track field interactions
		this.form.addEventListener('focusin', (e) => this._trackFieldFocus(e));
		this.form.addEventListener('input', (e) => this._trackFieldInput(e));
		this.form.addEventListener('change', (e) => this._trackFieldChange(e));

		// Monitor typing patterns
		this.form.addEventListener('keydown', (e) => this._trackKeydown(e));
		this.form.addEventListener('keyup', (e) => this._trackKeyup(e));

		// Mouse movement tracking
		this.form.addEventListener('mousemove', (e) => this._trackMouseMovement(e));
		this.form.addEventListener('click', (e) => this._trackClick(e));

		// Copy/paste detection
		this.form.addEventListener('paste', (e) => this._trackPaste(e));

		// Form visibility changes
		document.addEventListener('visibilitychange', () => this._trackVisibilityChange());
	}

	/**
	 * Setup honeypot field
	 */
	_setupHoneypot() {
		if (!this.config.honeypot.enabled) return;

		const honeypot = document.createElement('input');
		honeypot.type = 'text';
		honeypot.name = this.config.honeypot.fieldName;
		honeypot.style.cssText = `
			position: absolute !important;
			left: -9999px !important;
			top: -9999px !important;
			visibility: hidden !important;
			opacity: 0 !important;
			pointer-events: none !important;
			tab-index: -1 !important;
		`;
		honeypot.setAttribute('autocomplete', 'off');
		honeypot.setAttribute('aria-hidden', 'true');

		this.form.appendChild(honeypot);
		this.honeypotField = honeypot;

		// Monitor honeypot
		honeypot.addEventListener('input', () => {
			this._flagSuspiciousBehavior('honeypot_filled', {
				value: honeypot.value,
				timestamp: Date.now()
			});
		});
	}

	/**
	 * Setup security checks
	 */
	_setupSecurityChecks() {
		if (this.config.security.checkDevTools) {
			this._checkDevTools();
		}

		if (this.config.security.checkAutomationFlags) {
			this._checkAutomationFlags();
		}

		if (this.config.security.validateUserAgent) {
			this._validateUserAgent();
		}

		if (this.config.security.checkViewportRatio) {
			this._checkViewportRatio();
		}
	}

	/**
	 * Setup form submission handler
	 */
	_setupSubmissionHandler() {
		this.form.addEventListener('submit', (e) => this._handleSubmission(e));
	}

	/**
	 * Track field focus events
	 */
	_trackFieldFocus(event) {
		const field = event.target;
		if (!field.name) return;

		this.verificationData.focusEvents++;

		if (!this.verificationData.firstInteraction) {
			this.verificationData.firstInteraction = Date.now();
		}

		// Track field-specific interactions
		if (!this.verificationData.fieldInteractions.has(field.name)) {
			this.verificationData.fieldInteractions.set(field.name, {
				focusCount: 0,
				inputCount: 0,
				changeCount: 0,
				firstFocus: Date.now(),
				lastActivity: Date.now()
			});
		}

		const fieldData = this.verificationData.fieldInteractions.get(field.name);
		fieldData.focusCount++;
		fieldData.lastActivity = Date.now();
	}

	/**
	 * Track field input events
	 */
	_trackFieldInput(event) {
		const field = event.target;
		if (!field.name) return;

		this.verificationData.keystrokes++;

		const fieldData = this.verificationData.fieldInteractions.get(field.name);
		if (fieldData) {
			fieldData.inputCount++;
			fieldData.lastActivity = Date.now();
		}

		// Check for suspiciously fast typing
		if (fieldData && fieldData.inputCount === 1) {
			const timeSinceFocus = Date.now() - fieldData.firstFocus;
			if (timeSinceFocus < 100) { // Less than 100ms
				this._flagSuspiciousBehavior('fast_typing', {
					field: field.name,
					timeSinceFocus
				});
			}
		}
	}

	/**
	 * Track field change events
	 */
	_trackFieldChange(event) {
		const field = event.target;
		if (!field.name) return;

		const fieldData = this.verificationData.fieldInteractions.get(field.name);
		if (fieldData) {
			fieldData.changeCount++;
			fieldData.lastActivity = Date.now();
		}
	}

	/**
	 * Track keyboard events
	 */
	_trackKeydown(event) {
		// Track typing rhythm and patterns
		const now = Date.now();
		if (this.lastKeyTime) {
			const interval = now - this.lastKeyTime;
			// Natural typing has variations in timing
			if (interval > 0 && interval < 50) {
				this._flagSuspiciousBehavior('uniform_typing', { interval });
			}
		}
		this.lastKeyTime = now;
	}

	_trackKeyup(event) {
		// Additional typing pattern analysis
	}

	/**
	 * Track mouse movements
	 */
	_trackMouseMovement(event) {
		this.verificationData.mouseMovements++;

		// Store recent movements for analysis
		if (!this.mouseMovements) this.mouseMovements = [];
		this.mouseMovements.push({
			x: event.clientX,
			y: event.clientY,
			timestamp: Date.now()
		});

		// Keep only recent movements
		if (this.mouseMovements.length > 100) {
			this.mouseMovements.shift();
		}
	}

	/**
	 * Track click events
	 */
	_trackClick(event) {
		// Analyze click patterns
		const now = Date.now();
		if (this.lastClickTime) {
			const interval = now - this.lastClickTime;
			if (interval < 100) { // Suspiciously fast clicks
				this._flagSuspiciousBehavior('fast_clicking', { interval });
			}
		}
		this.lastClickTime = now;
	}

	/**
	 * Track paste events
	 */
	_trackPaste(event) {
		this._flagSuspiciousBehavior('paste_detected', {
			field: event.target.name,
			dataLength: event.clipboardData?.getData('text')?.length || 0
		});
	}

	/**
	 * Track visibility changes
	 */
	_trackVisibilityChange() {
		if (document.hidden) {
			// User switched away - normal behavior
		} else {
			// User returned - check for automation
			this._checkForAutomation();
		}
	}

	/**
	 * Check for developer tools
	 */
	_checkDevTools() {
		// Basic dev tools detection
		let devtools = {
			open: false,
			orientation: null
		};

		const threshold = 160;

		setInterval(() => {
			if (window.outerHeight - window.innerHeight > threshold ||
				window.outerWidth - window.innerWidth > threshold) {
				if (!devtools.open) {
					devtools.open = true;
					this._flagSuspiciousBehavior('dev_tools_detected');
				}
			} else {
				devtools.open = false;
			}
		}, 500);
	}

	/**
	 * Check for automation flags
	 */
	_checkAutomationFlags() {
		// Check for common automation indicators
		if (window.navigator.webdriver) {
			this._flagSuspiciousBehavior('webdriver_detected');
		}

		if (window.chrome && window.chrome.runtime && window.chrome.runtime.onConnect) {
			// Extension environment
		}

		// Check for unusual window properties
		if (typeof window.callPhantom === 'function' ||
			typeof window._phantom !== 'undefined') {
			this._flagSuspiciousBehavior('phantom_detected');
		}
	}

	/**
	 * Validate user agent
	 */
	_validateUserAgent() {
		const ua = navigator.userAgent;

		// Check for headless browsers
		if (ua.includes('HeadlessChrome') ||
			ua.includes('PhantomJS') ||
			ua === 'undefined') {
			this._flagSuspiciousBehavior('suspicious_user_agent', { userAgent: ua });
		}

		// Check for missing expected properties
		if (!navigator.languages || navigator.languages.length === 0) {
			this._flagSuspiciousBehavior('missing_languages');
		}
	}

	/**
	 * Check viewport ratio for unusual dimensions
	 */
	_checkViewportRatio() {
		const ratio = window.innerWidth / window.innerHeight;

		// Unusual ratios might indicate automation
		if (ratio < 0.3 || ratio > 5) {
			this._flagSuspiciousBehavior('unusual_viewport_ratio', { ratio });
		}
	}

	/**
	 * Check for automation during visibility change
	 */
	_checkForAutomation() {
		// Rapid activity immediately after becoming visible is suspicious
		const checkDelay = 100;
		setTimeout(() => {
			const recentActivity = this._getRecentActivity(checkDelay);
			if (recentActivity.interactions > 5) {
				this._flagSuspiciousBehavior('rapid_activity_after_focus', recentActivity);
			}
		}, checkDelay);
	}

	/**
	 * Get recent activity count
	 */
	_getRecentActivity(timeWindow) {
		const now = Date.now();
		const cutoff = now - timeWindow;

		let interactions = 0;
		this.verificationData.fieldInteractions.forEach(fieldData => {
			if (fieldData.lastActivity > cutoff) {
				interactions++;
			}
		});

		return { interactions, timeWindow };
	}

	/**
	 * Flag suspicious behavior
	 */
	_flagSuspiciousBehavior(type, data = {}) {
		this.verificationData.suspiciousFlags.push({
			type,
			data,
			timestamp: Date.now()
		});

		// Reduce human confidence based on severity
		const severityPenalties = {
			'honeypot_filled': -0.8,
			'bot_behavior_detected': -0.6,
			'webdriver_detected': -0.7,
			'dev_tools_detected': -0.2,
			'fast_typing': -0.3,
			'uniform_typing': -0.4,
			'paste_detected': -0.1,
			'phantom_detected': -0.9
		};

		const penalty = severityPenalties[type] || -0.1;
		this.verificationData.humanConfidence = Math.max(0,
			this.verificationData.humanConfidence + penalty);

		this._updateVerificationLevel();

		this._log(`Suspicious behavior flagged: ${type}`, data);
	}

	/**
	 * Confirm human behavior
	 */
	_confirmHumanBehavior(analysis) {
		this.verificationData.humanConfidence = Math.min(1,
			this.verificationData.humanConfidence + 0.2);

		this._updateVerificationLevel();

		if (this.config.onHumanVerified) {
			this.config.onHumanVerified(analysis);
		}
	}

	/**
	 * Update verification level based on current data
	 */
	_updateVerificationLevel() {
		const confidence = this.verificationData.humanConfidence;
		const suspiciousFlags = this.verificationData.suspiciousFlags.length;
		const sessionTime = Date.now() - this.verificationData.startTime;

		if (confidence >= 0.8 && suspiciousFlags === 0 &&
			sessionTime >= this.config.behaviorTracking.minTrackingTime) {
			this.verificationData.verificationLevel = 'verified';
			this.verificationData.isVerified = true;
		} else if (confidence >= 0.6 && suspiciousFlags <= 1) {
			this.verificationData.verificationLevel = 'enhanced';
		} else if (confidence >= 0.4) {
			this.verificationData.verificationLevel = 'basic';
		} else {
			this.verificationData.verificationLevel = 'none';
		}

		this._calculateVerificationScore();
	}

	/**
	 * Calculate overall verification score
	 */
	_calculateVerificationScore() {
		let score = this.verificationData.humanConfidence * 100;

		// Behavioral factors
		if (this.behaviorTracker) {
			const analysis = this.behaviorTracker.getAnalysis();
			score += analysis.scores.overall * 20;
		}

		// Interaction requirements
		const requiredInteractions = this.config.behaviorTracking.requiredInteractions;
		const actualInteractions = this.verificationData.fieldInteractions.size;
		if (actualInteractions >= requiredInteractions) {
			score += 10;
		}

		// Time factor
		const sessionTime = Date.now() - this.verificationData.startTime;
		if (sessionTime >= this.config.timingChecks.minFillTime) {
			score += 5;
		}

		// Penalties for suspicious behavior
		score -= this.verificationData.suspiciousFlags.length * 15;

		this.verificationData.verificationScore = Math.max(0, Math.min(100, score));
	}

	/**
	 * Handle form submission
	 */
	_handleSubmission(event) {
		event.preventDefault(); // Always prevent default first

		this.verificationData.formFillTime = Date.now() - this.verificationData.startTime;

		// Perform final verification
		const verification = this._performFinalVerification();

		if (verification.allow) {
			this._allowSubmission(verification);
		} else {
			this._blockSubmission(verification);
		}
	}

	/**
	 * Perform comprehensive final verification
	 */
	_performFinalVerification() {
		const result = {
			allow: false,
			reason: '',
			confidence: this.verificationData.humanConfidence,
			score: this.verificationData.verificationScore,
			recommendations: []
		};

		// Check honeypot
		if (this.honeypotField && this.honeypotField.value !== this.config.honeypot.expectedValue) {
			result.reason = 'Honeypot field filled';
			result.recommendations.push('Block submission - likely bot');
			return result;
		}

		// Check minimum tracking time
		const sessionTime = Date.now() - this.verificationData.startTime;
		if (sessionTime < this.config.behaviorTracking.minTrackingTime) {
			result.reason = 'Insufficient tracking time';
			result.recommendations.push('Require longer interaction time');
			return result;
		}

		// Check form fill time
		if (this.verificationData.formFillTime < this.config.timingChecks.minFillTime) {
			result.reason = 'Form filled too quickly';
			result.recommendations.push('Show CAPTCHA or additional verification');
			return result;
		}

		// Check interaction requirements
		if (this.config.interactionChecks.requireMouseMovement &&
			this.verificationData.mouseMovements < 10) {
			result.reason = 'Insufficient mouse movement';
			result.recommendations.push('Request mouse interaction');
			return result;
		}

		// Check behavior score
		if (this.behaviorTracker && this.behaviorTracker.isBot()) {
			result.reason = 'Bot behavior detected';
			result.recommendations.push('Block submission - behavioral analysis failed');
			return result;
		}

		// Check verification level
		if (this.verificationData.verificationLevel === 'verified') {
			result.allow = true;
			result.reason = 'Human verified';
		} else if (this.verificationData.verificationLevel === 'enhanced') {
			// Enhanced verification might be acceptable depending on requirements
			if (this.verificationData.verificationScore >= 70) {
				result.allow = true;
				result.reason = 'Enhanced verification passed';
			} else {
				result.reason = 'Enhanced verification insufficient';
				result.recommendations.push('Show CAPTCHA');
			}
		} else {
			result.reason = 'Verification level insufficient';
			result.recommendations.push('Show CAPTCHA or additional challenges');
		}

		return result;
	}

	/**
	 * Allow form submission
	 */
	_allowSubmission(verification) {
		this._log('Form submission allowed', verification);

		// Add verification data to form
		this._addVerificationFields(verification);

		if (this.config.onVerificationComplete) {
			this.config.onVerificationComplete(verification, this.verificationData);
		}

		// Actually submit the form
		this.form.submit();
	}

	/**
	 * Block form submission
	 */
	_blockSubmission(verification) {
		this._log('Form submission blocked', verification);

		if (this.config.onSubmissionBlocked) {
			this.config.onSubmissionBlocked(verification, this.verificationData);
		}

		// Show appropriate message or fallback
		this._showVerificationFailure(verification);
	}

	/**
	 * Add verification data to form as hidden fields
	 */
	_addVerificationFields(verification) {
		// Add verification token
		const tokenField = document.createElement('input');
		tokenField.type = 'hidden';
		tokenField.name = 'verification_token';
		tokenField.value = this._generateVerificationToken(verification);
		this.form.appendChild(tokenField);

		// Add verification score
		const scoreField = document.createElement('input');
		scoreField.type = 'hidden';
		scoreField.name = 'verification_score';
		scoreField.value = verification.score;
		this.form.appendChild(scoreField);

		// Add session data
		const sessionField = document.createElement('input');
		sessionField.type = 'hidden';
		sessionField.name = 'verification_data';
		sessionField.value = JSON.stringify({
			sessionTime: this.verificationData.formFillTime,
			interactionCount: this.verificationData.fieldInteractions.size,
			humanConfidence: verification.confidence,
			verificationLevel: this.verificationData.verificationLevel
		});
		this.form.appendChild(sessionField);
	}

	/**
	 * Generate verification token
	 */
	_generateVerificationToken(verification) {
		const data = {
			timestamp: Date.now(),
			score: verification.score,
			confidence: verification.confidence,
			sessionTime: this.verificationData.formFillTime
		};

		// Simple token generation (in production, use proper cryptographic methods)
		return btoa(JSON.stringify(data));
	}

	/**
	 * Show verification failure message
	 */
	_showVerificationFailure(verification) {
		// Create or update error message
		let errorDiv = this.form.querySelector('.verification-error');
		if (!errorDiv) {
			errorDiv = document.createElement('div');
			errorDiv.className = 'alert alert-danger verification-error';
			this.form.insertBefore(errorDiv, this.form.firstChild);
		}

		let message = 'Please complete the verification to continue.';

		if (verification.recommendations.includes('Show CAPTCHA')) {
			message = 'Additional verification required. Please complete the CAPTCHA below.';
			this._showCaptcha();
		} else if (verification.recommendations.includes('Request mouse interaction')) {
			message = 'Please interact with the form using your mouse before submitting.';
		}

		errorDiv.textContent = message;
	}

	/**
	 * Show CAPTCHA as fallback
	 */
	_showCaptcha() {
		// Implementation depends on CAPTCHA service (reCAPTCHA, hCaptcha, etc.)
		console.log('CAPTCHA should be shown as fallback verification');
	}

	/**
	 * Get current verification status
	 */
	getVerificationStatus() {
		return {
			level: this.verificationData.verificationLevel,
			score: this.verificationData.verificationScore,
			confidence: this.verificationData.humanConfidence,
			isVerified: this.verificationData.isVerified,
			suspiciousFlags: this.verificationData.suspiciousFlags.length,
			sessionTime: Date.now() - this.verificationData.startTime
		};
	}

	/**
	 * Force verification refresh
	 */
	refreshVerification() {
		this._updateVerificationLevel();
		return this.getVerificationStatus();
	}

	/**
	 * Destroy the verification system
	 */
	destroy() {
		if (this.behaviorTracker) {
			this.behaviorTracker.stop();
		}

		// Remove event listeners
		// (Implementation would remove all bound listeners)

		this._log('Human verification system destroyed');
	}

	/**
	 * Debug logging
	 */
	_log(message, data = null) {
		console.log(`[HumanVerificationForm] ${message}`, data);
	}
}