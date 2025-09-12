/**
 * TourStep - Individual tour step configuration and management
 * Represents a single step in the onboarding tour
 */
class TourStep {
	constructor(config = {}) {
		this.config = this.mergeDefaults(config);
		this.id = this.config.id || this.generateId();
		this.title = this.config.title;
		this.content = this.config.content;
		this.target = this.config.target;
		this.page = this.config.page;
		this.placement = this.config.placement;
		this.requireForm = this.config.requireForm;
		this.formSelector = this.config.formSelector;
		this.condition = this.config.condition;

		this.isValid = this.validate();
	}

	mergeDefaults(config) {
		const defaults = {
			// Basic Step Configuration
			id: null,
			title: "",
			content: "",
			target: null,

			// Page Configuration
			page: null,
			waitForElement: true,
			elementTimeout: 5000,

			// Positioning Options
			placement: "bottom",
			offset: [0, 10],
			arrow: true,

			// Display Options
			width: null,
			maxWidth: 400,
			showTitle: true,
			showStepNumber: true,
			showProgress: true,

			// Interaction Options
			closable: true,
			skippable: true,
			allowPrevious: true,

			// Navigation Buttons
			buttons: {
				previous: {
					text: "Previous",
					class: "btn btn-outline-secondary",
					show: true
				},
				next: {
					text: "Next",
					class: "btn btn-primary",
					show: true
				},
				skip: {
					text: "Skip Tour",
					class: "btn btn-link",
					show: true
				},
				close: {
					text: "×",
					class: "btn-close",
					show: true
				}
			},

			// Highlighting Options
			highlight: true,
			highlightPadding: 5,
			highlightClass: "tour-highlight",

			// Form Integration
			requireForm: false,
			formSelector: null,
			formFields: [],
			validateForm: true,
			submitForm: false,

			// Custom Actions
			onEnter: null,
			onExit: null,
			onNext: null,
			onPrevious: null,
			onSkip: null,

			// Advanced Options
			backdrop: true,
			keyboard: true,
			focus: true,
			scrollTo: true,

			// Conditional Display
			condition: null,
			showIf: null,
			hideIf: null,

			// Timing Options
			delay: 0,
			duration: 0,

			// Multi-step Grouping
			group: null,
			dependencies: []
		};

		return this.deepMerge(defaults, config);
	}

	deepMerge(target, source) {
		const result = { ...target };

		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
					result[key] = this.deepMerge(target[key] || {}, source[key]);
				} else {
					result[key] = source[key];
				}
			}
		}

		return result;
	}

	generateId() {
		return 'tour-step-' + Math.random().toString(36).substr(2, 9);
	}

	validate() {
		const errors = [];

		// Check required properties
		if (!this.content && !this.title) {
			errors.push('Step must have either title or content');
		}

		// Validate placement
		const validPlacements = ['top', 'bottom', 'left', 'right', 'center'];
		if (!validPlacements.includes(this.placement)) {
			errors.push(`Invalid placement: ${this.placement}. Must be one of: ${validPlacements.join(', ')}`);
		}

		// Validate form configuration
		if (this.requireForm && !this.formSelector) {
			errors.push('formSelector is required when requireForm is true');
		}

		// Validate offset
		if (this.config.offset && (!Array.isArray(this.config.offset) || this.config.offset.length !== 2)) {
			errors.push('offset must be an array of two numbers [x, y]');
		}

		if (errors.length > 0) {
			console.error('TourStep validation errors:', errors);
			return false;
		}

		return true;
	}

	// Get the target element for this step
	getTargetElement() {
		if (!this.target) {
			return null;
		}

		return document.querySelector(this.target);
	}

	// Check if the target element exists
	hasTargetElement() {
		return this.getTargetElement() !== null;
	}

	// Get the form element if this step requires form interaction
	getFormElement() {
		if (!this.requireForm || !this.formSelector) {
			return null;
		}

		return document.querySelector(this.formSelector);
	}

	// Validate form fields if required
	validateFormFields() {
		if (!this.requireForm || !this.config.validateForm) {
			return { isValid: true, errors: [] };
		}

		const form = this.getFormElement();
		if (!form) {
			return { isValid: false, errors: ['Form not found'] };
		}

		const errors = [];
		const formData = new FormData(form);

		// Check required fields
		this.config.formFields.forEach(fieldName => {
			const value = formData.get(fieldName);
			if (!value || value.trim() === '') {
				errors.push(`${fieldName} is required`);
			}
		});

		// Check HTML5 form validation
		if (form.checkValidity && !form.checkValidity()) {
			const invalidFields = form.querySelectorAll(':invalid');
			invalidFields.forEach(field => {
				if (field.validationMessage) {
					errors.push(field.validationMessage);
				}
			});
		}

		return {
			isValid: errors.length === 0,
			errors: errors,
			formData: formData
		};
	}

	// Get step position relative to target element
	getPosition() {
		const target = this.getTargetElement();

		if (!target) {
			return this.getCenterPosition();
		}

		const targetRect = target.getBoundingClientRect();
		const [offsetX, offsetY] = this.config.offset;

		let position = {
			x: 0,
			y: 0,
			placement: this.placement
		};

		switch (this.placement) {
			case 'top':
				position.x = targetRect.left + (targetRect.width / 2) + offsetX;
				position.y = targetRect.top + offsetY;
				break;

			case 'bottom':
				position.x = targetRect.left + (targetRect.width / 2) + offsetX;
				position.y = targetRect.bottom + offsetY;
				break;

			case 'left':
				position.x = targetRect.left + offsetX;
				position.y = targetRect.top + (targetRect.height / 2) + offsetY;
				break;

			case 'right':
				position.x = targetRect.right + offsetX;
				position.y = targetRect.top + (targetRect.height / 2) + offsetY;
				break;

			case 'center':
			default:
				return this.getCenterPosition();
		}

		return position;
	}

	getCenterPosition() {
		return {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
			placement: 'center'
		};
	}

	// Get highlight area for target element
	getHighlightArea() {
		const target = this.getTargetElement();

		if (!target || !this.config.highlight) {
			return null;
		}

		const rect = target.getBoundingClientRect();
		const padding = this.config.highlightPadding;

		return {
			x: rect.left - padding,
			y: rect.top - padding,
			width: rect.width + (padding * 2),
			height: rect.height + (padding * 2)
		};
	}

	// Check if step should be shown based on conditions
	shouldShow() {
		// Check showIf condition
		if (this.config.showIf && typeof this.config.showIf === 'function') {
			if (!this.config.showIf()) {
				return false;
			}
		}

		// Check hideIf condition
		if (this.config.hideIf && typeof this.config.hideIf === 'function') {
			if (this.config.hideIf()) {
				return false;
			}
		}

		// Check general condition
		if (this.condition && typeof this.condition === 'function') {
			return this.condition();
		}

		return true;
	}

	// Execute step enter callback
	onEnter(tourManager) {
		if (typeof this.config.onEnter === 'function') {
			return this.config.onEnter(this, tourManager);
		}
		return true;
	}

	// Execute step exit callback
	onExit(tourManager) {
		if (typeof this.config.onExit === 'function') {
			return this.config.onExit(this, tourManager);
		}
		return true;
	}

	// Execute next button callback
	onNext(tourManager) {
		if (typeof this.config.onNext === 'function') {
			return this.config.onNext(this, tourManager);
		}
		return true;
	}

	// Execute previous button callback
	onPrevious(tourManager) {
		if (typeof this.config.onPrevious === 'function') {
			return this.config.onPrevious(this, tourManager);
		}
		return true;
	}

	// Execute skip button callback
	onSkip(tourManager) {
		if (typeof this.config.onSkip === 'function') {
			return this.config.onSkip(this, tourManager);
		}
		return true;
	}

	// Get step data for serialization
	toJSON() {
		return {
			id: this.id,
			title: this.title,
			content: this.content,
			target: this.target,
			page: this.page,
			placement: this.placement,
			requireForm: this.requireForm,
			formSelector: this.formSelector,
			config: this.config
		};
	}

	// Create step from JSON data
	static fromJSON(data) {
		return new TourStep(data.config || data);
	}
}