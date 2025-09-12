/**
 * TourManager - Main class for managing onboarding tours
 * Handles tour flow, storage, and cross-page navigation
 */
class TourManager {
	constructor(options = {}) {
		this.options = this.mergeOptions(this.getDefaultOptions(), options);
		this.steps = [];
		this.currentStepIndex = 0;
		this.isActive = false;
		this.isPaused = false;
		this.stepHandler = null;
		this.storage = this.initStorage();

		this.init();
	}

	getDefaultOptions() {
		return {
			// Basic Configuration
			tourId: "onboarding-tour",
			autoStart: false,
			showProgress: true,
			showStepNumbers: true,

			// Navigation Options
			allowSkip: true,
			allowPrevious: true,
			exitOnEscape: true,
			exitOnOverlayClick: false,

			// Storage Options
			storage: "localStorage",
			storageKey: "onboarding_tour_progress",

			// Timing Options
			stepDelay: 300,
			highlightDelay: 150,

			// Styling Options
			theme: "default",
			backdropOpacity: 0.5,
			borderRadius: "0.5rem",

			// Callbacks
			onStart: null,
			onComplete: null,
			onSkip: null,
			onStepEnter: null,
			onStepExit: null,
			onBeforeStepChange: null,
			onAfterStepChange: null,

			// Advanced Options
			scrollBehavior: "smooth",
			scrollOffset: 100,
			zIndexBase: 10000,
			animationDuration: 250,

			// Multi-page Options
			crossPageEnabled: true,
			pageChangeDelay: 1000,
			preserveProgress: true,

			// Form Integration
			formValidation: true,
			formSubmitMode: "validate",
			waitForFormResponse: true
		};
	}

	mergeOptions(defaults, options) {
		const result = { ...defaults };

		for (const key in options) {
			if (options.hasOwnProperty(key)) {
				if (typeof options[key] === 'object' && options[key] !== null && !Array.isArray(options[key])) {
					result[key] = this.mergeOptions(defaults[key] || {}, options[key]);
				} else {
					result[key] = options[key];
				}
			}
		}

		return result;
	}

	init() {
		this.stepHandler = new TourStepHandler(this);
		this.bindEvents();
		this.loadProgress();

		if (this.options.autoStart) {
			this.start();
		}
	}

	initStorage() {
		if (this.options.storage === "localStorage" && typeof localStorage !== 'undefined') {
			return localStorage;
		} else if (this.options.storage === "sessionStorage" && typeof sessionStorage !== 'undefined') {
			return sessionStorage;
		}
		return null;
	}

	bindEvents() {
		// Keyboard navigation
		if (this.options.exitOnEscape) {
			document.addEventListener('keydown', (e) => {
				if (e.key === 'Escape' && this.isActive) {
					this.stop();
				}
			});
		}

		// Handle page navigation for cross-page tours
		if (this.options.crossPageEnabled) {
			window.addEventListener('beforeunload', () => {
				this.saveProgress();
			});

			window.addEventListener('load', () => {
				this.handlePageLoad();
			});
		}

		// Custom event listeners
		this.addEventListener('tour:start', this.options.onStart);
		this.addEventListener('tour:complete', this.options.onComplete);
		this.addEventListener('tour:skip', this.options.onSkip);
		this.addEventListener('step:enter', this.options.onStepEnter);
		this.addEventListener('step:exit', this.options.onStepExit);
		this.addEventListener('step:beforechange', this.options.onBeforeStepChange);
		this.addEventListener('step:afterchange', this.options.onAfterStepChange);
	}

	addEventListener(event, callback) {
		if (typeof callback === 'function') {
			document.addEventListener(event, callback);
		}
	}

	triggerEvent(eventName, data = {}) {
		const event = new CustomEvent(eventName, {
			detail: { tour: this, ...data }
		});
		document.dispatchEvent(event);
	}

	addStep(stepConfig) {
		const step = new TourStep(stepConfig);
		this.steps.push(step);
		return this;
	}

	removeStep(stepId) {
		this.steps = this.steps.filter(step => step.id !== stepId);
		return this;
	}

	start() {
		if (this.isActive) {
			return;
		}

		this.isActive = true;
		this.currentStepIndex = this.getStoredProgress();

		this.triggerEvent('tour:start');

		// Add tour-active class to body
		document.body.classList.add('tour-active', `tour-theme-${this.options.theme}`);

		this.showCurrentStep();
	}

	stop() {
		if (!this.isActive) {
			return;
		}

		this.isActive = false;
		this.stepHandler.hideStep();

		// Remove tour classes from body
		document.body.classList.remove('tour-active', `tour-theme-${this.options.theme}`);

		this.clearProgress();
		this.triggerEvent('tour:stop');
	}

	skip() {
		if (!this.isActive) {
			return;
		}

		this.triggerEvent('tour:skip');
		this.stop();
	}

	pause() {
		this.isPaused = true;
		this.stepHandler.hideStep();
	}

	resume() {
		this.isPaused = false;
		this.showCurrentStep();
	}

	nextStep() {
		if (this.currentStepIndex < this.steps.length - 1) {
			this.goToStep(this.currentStepIndex + 1);
		} else {
			this.complete();
		}
	}

	previousStep() {
		if (this.currentStepIndex > 0 && this.options.allowPrevious) {
			this.goToStep(this.currentStepIndex - 1);
		}
	}

	goToStep(index) {
		if (index < 0 || index >= this.steps.length) {
			return;
		}

		const previousIndex = this.currentStepIndex;
		const currentStep = this.steps[previousIndex];
		const nextStep = this.steps[index];

		// Trigger before change event
		this.triggerEvent('step:beforechange', {
			previousStep: currentStep,
			nextStep: nextStep,
			previousIndex: previousIndex,
			nextIndex: index
		});

		// Check if we need to navigate to a different page
		if (nextStep.page && nextStep.page !== window.location.pathname) {
			this.navigateToPage(nextStep.page, index);
			return;
		}

		this.currentStepIndex = index;
		this.saveProgress();

		setTimeout(() => {
			this.showCurrentStep();

			// Trigger after change event
			this.triggerEvent('step:afterchange', {
				previousStep: currentStep,
				currentStep: nextStep,
				previousIndex: previousIndex,
				currentIndex: index
			});
		}, this.options.stepDelay);
	}

	navigateToPage(url, stepIndex) {
		// Store the step index we want to show after navigation
		this.saveProgress(stepIndex);

		// Navigate to the new page
		window.location.href = url;
	}

	handlePageLoad() {
		// Check if we should resume a tour after page load
		const storedProgress = this.getStoredProgress();

		if (storedProgress !== null && this.options.preserveProgress) {
			setTimeout(() => {
				this.currentStepIndex = storedProgress;
				this.start();
			}, this.options.pageChangeDelay);
		}
	}

	showCurrentStep() {
		if (!this.isActive || this.isPaused || this.steps.length === 0) {
			return;
		}

		const step = this.steps[this.currentStepIndex];

		if (!step) {
			this.complete();
			return;
		}

		// Check step condition
		if (step.condition && typeof step.condition === 'function' && !step.condition()) {
			this.nextStep();
			return;
		}

		// Show the step
		this.stepHandler.showStep(step, this.currentStepIndex);
	}

	complete() {
		this.triggerEvent('tour:complete');
		this.stop();
	}

	getCurrentStep() {
		return this.steps[this.currentStepIndex] || null;
	}

	getProgress() {
		return {
			currentStep: this.currentStepIndex + 1,
			totalSteps: this.steps.length,
			percentage: Math.round(((this.currentStepIndex + 1) / this.steps.length) * 100),
			isComplete: this.currentStepIndex >= this.steps.length - 1
		};
	}

	reset() {
		this.currentStepIndex = 0;
		this.clearProgress();

		if (this.isActive) {
			this.showCurrentStep();
		}
	}

	saveProgress(stepIndex = null) {
		if (!this.storage || !this.options.preserveProgress) {
			return;
		}

		const progressData = {
			tourId: this.options.tourId,
			stepIndex: stepIndex !== null ? stepIndex : this.currentStepIndex,
			timestamp: Date.now(),
			url: window.location.href
		};

		try {
			this.storage.setItem(this.options.storageKey, JSON.stringify(progressData));
		} catch (e) {
			console.warn('Failed to save tour progress:', e);
		}
	}

	loadProgress() {
		if (!this.storage || !this.options.preserveProgress) {
			return;
		}

		try {
			const stored = this.storage.getItem(this.options.storageKey);

			if (stored) {
				const progressData = JSON.parse(stored);

				if (progressData.tourId === this.options.tourId) {
					this.currentStepIndex = progressData.stepIndex || 0;
				}
			}
		} catch (e) {
			console.warn('Failed to load tour progress:', e);
		}
	}

	getStoredProgress() {
		if (!this.storage || !this.options.preserveProgress) {
			return 0;
		}

		try {
			const stored = this.storage.getItem(this.options.storageKey);

			if (stored) {
				const progressData = JSON.parse(stored);

				if (progressData.tourId === this.options.tourId) {
					return progressData.stepIndex || 0;
				}
			}
		} catch (e) {
			console.warn('Failed to get stored progress:', e);
		}

		return 0;
	}

	clearProgress() {
		if (!this.storage) {
			return;
		}

		try {
			this.storage.removeItem(this.options.storageKey);
		} catch (e) {
			console.warn('Failed to clear tour progress:', e);
		}
	}

	// Utility method to check if element exists
	waitForElement(selector, timeout = 5000) {
		return new Promise((resolve, reject) => {
			const element = document.querySelector(selector);

			if (element) {
				resolve(element);
				return;
			}

			const observer = new MutationObserver((mutations, obs) => {
				const element = document.querySelector(selector);

				if (element) {
					obs.disconnect();
					resolve(element);
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true
			});

			setTimeout(() => {
				observer.disconnect();
				reject(new Error(`Element ${selector} not found within ${timeout}ms`));
			}, timeout);
		});
	}
}