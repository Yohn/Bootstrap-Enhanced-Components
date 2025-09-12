/**
 * TourStepHandler - Handles the display and interaction of individual tour steps
 * Manages tooltips, highlighting, backdrop, and user interactions
 */
class TourStepHandler {
	constructor(tourManager) {
		this.tourManager = tourManager;
		this.currentStep = null;
		this.currentStepIndex = 0;
		this.elements = {
			backdrop: null,
			highlight: null,
			tooltip: null,
			arrow: null
		};
		this.isVisible = false;

		this.bindEvents();
	}

	bindEvents() {
		// Handle window resize
		window.addEventListener('resize', () => {
			if (this.isVisible && this.currentStep) {
				this.positionTooltip();
			}
		});

		// Handle scroll
		window.addEventListener('scroll', () => {
			if (this.isVisible && this.currentStep) {
				this.positionTooltip();
			}
		});
	}

	async showStep(step, stepIndex) {
		this.currentStep = step;
		this.currentStepIndex = stepIndex;

		// Wait for target element if required
		if (step.target && step.config.waitForElement) {
			try {
				await this.tourManager.waitForElement(step.target, step.config.elementTimeout);
			} catch (error) {
				console.warn(`Target element ${step.target} not found for step ${step.id}`);
				// Continue with step anyway, will be centered
			}
		}

		// Check if step should be shown
		if (!step.shouldShow()) {
			this.tourManager.nextStep();
			return;
		}

		// Execute step enter callback
		const enterResult = step.onEnter(this.tourManager);
		if (enterResult === false) {
			return;
		}

		// Apply delay if specified
		if (step.config.delay > 0) {
			await this.delay(step.config.delay);
		}

		// Create and show step elements
		this.createBackdrop();
		this.createHighlight();
		this.createTooltip();

		this.isVisible = true;

		// Scroll to target element if needed
		if (step.config.scrollTo && step.target) {
			this.scrollToTarget();
		}

		// Trigger step enter event
		this.tourManager.triggerEvent('step:enter', {
			step: step,
			stepIndex: stepIndex
		});

		// Auto-advance if duration is set
		if (step.config.duration > 0) {
			setTimeout(() => {
				this.tourManager.nextStep();
			}, step.config.duration);
		}
	}

	hideStep() {
		if (!this.isVisible) {
			return;
		}

		// Execute step exit callback
		if (this.currentStep) {
			this.currentStep.onExit(this.tourManager);

			// Trigger step exit event
			this.tourManager.triggerEvent('step:exit', {
				step: this.currentStep,
				stepIndex: this.currentStepIndex
			});
		}

		// Remove all step elements
		this.removeBackdrop();
		this.removeHighlight();
		this.removeTooltip();

		this.isVisible = false;
		this.currentStep = null;
	}

	createBackdrop() {
		if (!this.tourManager.options.backdropOpacity || this.elements.backdrop) {
			return;
		}

		this.elements.backdrop = document.createElement('div');
		this.elements.backdrop.className = 'tour-backdrop';
		this.elements.backdrop.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, ${this.tourManager.options.backdropOpacity});
			z-index: ${this.tourManager.options.zIndexBase};
			opacity: 0;
			transition: opacity ${this.tourManager.options.animationDuration}ms ease;
		`;

		document.body.appendChild(this.elements.backdrop);

		// Handle backdrop click
		if (this.tourManager.options.exitOnOverlayClick) {
			this.elements.backdrop.addEventListener('click', () => {
				this.tourManager.stop();
			});
		}

		// Animate in
		requestAnimationFrame(() => {
			this.elements.backdrop.style.opacity = '1';
		});
	}

	removeBackdrop() {
		if (!this.elements.backdrop) {
			return;
		}

		this.elements.backdrop.style.opacity = '0';

		setTimeout(() => {
			if (this.elements.backdrop && this.elements.backdrop.parentNode) {
				this.elements.backdrop.parentNode.removeChild(this.elements.backdrop);
			}
			this.elements.backdrop = null;
		}, this.tourManager.options.animationDuration);
	}

	createHighlight() {
		if (!this.currentStep.config.highlight || !this.currentStep.target || this.elements.highlight) {
			return;
		}

		const highlightArea = this.currentStep.getHighlightArea();
		if (!highlightArea) {
			return;
		}

		this.elements.highlight = document.createElement('div');
		this.elements.highlight.className = `tour-highlight ${this.currentStep.config.highlightClass}`;
		this.elements.highlight.style.cssText = `
			position: fixed;
			left: ${highlightArea.x}px;
			top: ${highlightArea.y}px;
			width: ${highlightArea.width}px;
			height: ${highlightArea.height}px;
			border: 2px solid var(--bs-primary);
			border-radius: 4px;
			box-shadow: 0 0 0 9999px rgba(0, 0, 0, ${this.tourManager.options.backdropOpacity * 0.8});
			z-index: ${this.tourManager.options.zIndexBase + 1};
			pointer-events: none;
			opacity: 0;
			transition: opacity ${this.tourManager.options.highlightDelay}ms ease;
		`;

		document.body.appendChild(this.elements.highlight);

		// Animate in
		setTimeout(() => {
			if (this.elements.highlight) {
				this.elements.highlight.style.opacity = '1';
			}
		}, this.tourManager.options.highlightDelay);
	}

	removeHighlight() {
		if (!this.elements.highlight) {
			return;
		}

		this.elements.highlight.style.opacity = '0';

		setTimeout(() => {
			if (this.elements.highlight && this.elements.highlight.parentNode) {
				this.elements.highlight.parentNode.removeChild(this.elements.highlight);
			}
			this.elements.highlight = null;
		}, this.tourManager.options.animationDuration);
	}

	createTooltip() {
		if (this.elements.tooltip) {
			return;
		}

		this.elements.tooltip = document.createElement('div');
		this.elements.tooltip.className = 'tour-tooltip';
		this.elements.tooltip.innerHTML = this.buildTooltipContent();

		// Apply styles
		this.styleTooltip();

		document.body.appendChild(this.elements.tooltip);

		// Position tooltip
		this.positionTooltip();

		// Bind tooltip events
		this.bindTooltipEvents();

		// Animate in
		requestAnimationFrame(() => {
			this.elements.tooltip.style.opacity = '1';
			this.elements.tooltip.style.transform = 'scale(1)';
		});

		// Focus on tooltip for accessibility
		if (this.currentStep.config.focus) {
			this.elements.tooltip.focus();
		}
	}

	removeTooltip() {
		if (!this.elements.tooltip) {
			return;
		}

		this.elements.tooltip.style.opacity = '0';
		this.elements.tooltip.style.transform = 'scale(0.95)';

		setTimeout(() => {
			if (this.elements.tooltip && this.elements.tooltip.parentNode) {
				this.elements.tooltip.parentNode.removeChild(this.elements.tooltip);
			}
			this.elements.tooltip = null;
			this.elements.arrow = null;
		}, this.tourManager.options.animationDuration);
	}

	buildTooltipContent() {
		const step = this.currentStep;
		const progress = this.tourManager.getProgress();
		const isFirstStep = this.currentStepIndex === 0;
		const isLastStep = this.currentStepIndex === this.tourManager.steps.length - 1;

		let content = '<div class="tour-step-content">';

		// Header with title and close button
		if (step.config.showTitle || step.config.closable) {
			content += '<div class="tour-header d-flex justify-content-between align-items-start">';

			if (step.config.showTitle && step.title) {
				content += '<div class="tour-title">';

				if (step.config.showStepNumber) {
					content += `<span class="tour-step-number">${progress.currentStep}.</span> `;
				}

				content += `<span class="tour-title-text">${step.title}</span>`;
				content += '</div>';
			}

			if (step.config.closable && step.config.buttons.close.show) {
				content += `<button type="button" class="tour-close ${step.config.buttons.close.class}" data-tour-action="close">${step.config.buttons.close.text}</button>`;
			}

			content += '</div>';
		}

		// Progress indicator
		if (step.config.showProgress && this.tourManager.options.showProgress) {
			content += '<div class="tour-progress-container">';
			content += '<div class="tour-progress">';
			content += `<div class="tour-progress-bar" style="width: ${progress.percentage}%"></div>`;
			content += '</div>';
			content += `<small class="tour-progress-text">${progress.currentStep} of ${progress.totalSteps}</small>`;
			content += '</div>';
		}

		// Main content
		if (step.content) {
			content += `<div class="tour-content">${step.content}</div>`;
		}

		// Form integration
		if (step.requireForm && step.formSelector) {
			content += this.buildFormContent();
		}

		// Navigation buttons
		content += '<div class="tour-buttons d-flex justify-content-between align-items-center">';

		// Left side buttons (previous, skip)
		content += '<div class="tour-buttons-left">';

		if (!isFirstStep && step.config.allowPrevious && this.tourManager.options.allowPrevious && step.config.buttons.previous.show) {
			content += `<button type="button" class="tour-btn-previous ${step.config.buttons.previous.class}" data-tour-action="previous">${step.config.buttons.previous.text}</button>`;
		}

		if (step.config.skippable && this.tourManager.options.allowSkip && step.config.buttons.skip.show) {
			content += `<button type="button" class="tour-btn-skip ${step.config.buttons.skip.class}" data-tour-action="skip">${step.config.buttons.skip.text}</button>`;
		}

		content += '</div>';

		// Right side buttons (next/finish)
		content += '<div class="tour-buttons-right">';

		if (step.config.buttons.next.show) {
			const nextText = isLastStep ? 'Finish' : step.config.buttons.next.text;
			content += `<button type="button" class="tour-btn-next ${step.config.buttons.next.class}" data-tour-action="next">${nextText}</button>`;
		}

		content += '</div>';
		content += '</div>'; // tour-buttons

		content += '</div>'; // tour-step-content

		return content;
	}

	buildFormContent() {
		const step = this.currentStep;
		const form = step.getFormElement();

		if (!form) {
			return '<div class="tour-form-error">Form not found</div>';
		}

		let content = '<div class="tour-form-section">';
		content += '<p class="tour-form-instruction">Please complete the form below to continue:</p>';

		// Show form validation errors if any
		const validation = step.validateFormFields();
		if (!validation.isValid && validation.errors.length > 0) {
			content += '<div class="tour-form-errors alert alert-danger">';
			validation.errors.forEach(error => {
				content += `<div>${error}</div>`;
			});
			content += '</div>';
		}

		content += '</div>';

		return content;
	}

	styleTooltip() {
		const step = this.currentStep;

		this.elements.tooltip.style.cssText = `
			position: fixed;
			max-width: ${step.config.maxWidth}px;
			${step.config.width ? `width: ${step.config.width}px;` : ''}
			background: var(--bs-body-bg, #fff);
			border: 1px solid var(--bs-border-color, #dee2e6);
			border-radius: ${this.tourManager.options.borderRadius};
			box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
			z-index: ${this.tourManager.options.zIndexBase + 2};
			opacity: 0;
			transform: scale(0.95);
			transition: all ${this.tourManager.options.animationDuration}ms ease;
			font-family: var(--bs-font-sans-serif);
			font-size: 0.875rem;
			line-height: 1.5;
			color: var(--bs-body-color);
			outline: none;
		`;

		// Apply theme-specific styles
		this.elements.tooltip.classList.add(`tour-theme-${this.tourManager.options.theme}`);
	}

	positionTooltip() {
		if (!this.elements.tooltip || !this.currentStep) {
			return;
		}

		const position = this.currentStep.getPosition();
		const tooltipRect = this.elements.tooltip.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let x = position.x;
		let y = position.y;

		// Adjust for placement
		switch (position.placement) {
			case 'top':
				x -= tooltipRect.width / 2;
				y -= tooltipRect.height;
				break;

			case 'bottom':
				x -= tooltipRect.width / 2;
				break;

			case 'left':
				x -= tooltipRect.width;
				y -= tooltipRect.height / 2;
				break;

			case 'right':
				y -= tooltipRect.height / 2;
				break;

			case 'center':
				x -= tooltipRect.width / 2;
				y -= tooltipRect.height / 2;
				break;
		}

		// Keep tooltip within viewport
		const margin = 10;
		x = Math.max(margin, Math.min(x, viewportWidth - tooltipRect.width - margin));
		y = Math.max(margin, Math.min(y, viewportHeight - tooltipRect.height - margin));

		this.elements.tooltip.style.left = `${x}px`;
		this.elements.tooltip.style.top = `${y}px`;

		// Create arrow if needed
		this.createArrow(position, x, y);
	}

	createArrow(position, tooltipX, tooltipY) {
		if (!this.currentStep.config.arrow || position.placement === 'center') {
			return;
		}

		if (this.elements.arrow) {
			this.elements.arrow.remove();
		}

		this.elements.arrow = document.createElement('div');
		this.elements.arrow.className = 'tour-arrow';

		const arrowSize = 8;
		let arrowStyles = `
			position: absolute;
			width: 0;
			height: 0;
			border: ${arrowSize}px solid transparent;
		`;

		switch (position.placement) {
			case 'top':
				arrowStyles += `
					bottom: -${arrowSize * 2}px;
					left: 50%;
					transform: translateX(-50%);
					border-top-color: var(--bs-body-bg, #fff);
				`;
				break;

			case 'bottom':
				arrowStyles += `
					top: -${arrowSize * 2}px;
					left: 50%;
					transform: translateX(-50%);
					border-bottom-color: var(--bs-body-bg, #fff);
				`;
				break;

			case 'left':
				arrowStyles += `
					right: -${arrowSize * 2}px;
					top: 50%;
					transform: translateY(-50%);
					border-left-color: var(--bs-body-bg, #fff);
				`;
				break;

			case 'right':
				arrowStyles += `
					left: -${arrowSize * 2}px;
					top: 50%;
					transform: translateY(-50%);
					border-right-color: var(--bs-body-bg, #fff);
				`;
				break;
		}

		this.elements.arrow.style.cssText = arrowStyles;
		this.elements.tooltip.appendChild(this.elements.arrow);
	}

	bindTooltipEvents() {
		if (!this.elements.tooltip) {
			return;
		}

		// Button click handlers
		this.elements.tooltip.addEventListener('click', (e) => {
			const action = e.target.getAttribute('data-tour-action');

			switch (action) {
				case 'next':
					this.handleNext();
					break;

				case 'previous':
					this.handlePrevious();
					break;

				case 'skip':
					this.handleSkip();
					break;

				case 'close':
					this.handleClose();
					break;
			}
		});

		// Keyboard navigation
		if (this.currentStep.config.keyboard) {
			this.elements.tooltip.addEventListener('keydown', (e) => {
				switch (e.key) {
					case 'Enter':
					case ' ':
						if (e.target.getAttribute('data-tour-action')) {
							e.target.click();
						} else {
							this.handleNext();
						}
						e.preventDefault();
						break;

					case 'ArrowRight':
						this.handleNext();
						e.preventDefault();
						break;

					case 'ArrowLeft':
						this.handlePrevious();
						e.preventDefault();
						break;

					case 'Escape':
						this.handleClose();
						e.preventDefault();
						break;
				}
			});
		}
	}

	async handleNext() {
		// Check form validation if required
		if (this.currentStep.requireForm) {
			const validation = this.currentStep.validateFormFields();

			if (!validation.isValid) {
				this.showFormErrors(validation.errors);
				return;
			}

			// Submit form if required
			if (this.currentStep.config.submitForm) {
				const form = this.currentStep.getFormElement();
				if (form && this.tourManager.options.waitForFormResponse) {
					await this.submitForm(form);
				}
			}
		}

		// Execute step callback
		const result = this.currentStep.onNext(this.tourManager);
		if (result === false) {
			return;
		}

		this.tourManager.nextStep();
	}

	handlePrevious() {
		const result = this.currentStep.onPrevious(this.tourManager);
		if (result === false) {
			return;
		}

		this.tourManager.previousStep();
	}

	handleSkip() {
		const result = this.currentStep.onSkip(this.tourManager);
		if (result === false) {
			return;
		}

		this.tourManager.skip();
	}

	handleClose() {
		this.tourManager.stop();
	}

	showFormErrors(errors) {
		// Update tooltip content to show errors
		const errorContainer = this.elements.tooltip.querySelector('.tour-form-errors');

		if (errorContainer) {
			errorContainer.innerHTML = '';
			errors.forEach(error => {
				const errorDiv = document.createElement('div');
				errorDiv.textContent = error;
				errorContainer.appendChild(errorDiv);
			});
			errorContainer.style.display = 'block';
		}
	}

	async submitForm(form) {
		return new Promise((resolve, reject) => {
			const originalAction = form.action;
			const originalMethod = form.method || 'GET';

			// Create FormData
			const formData = new FormData(form);

			// Trigger form submit event
			this.tourManager.triggerEvent('form:submit', {
				form: form,
				formData: formData,
				step: this.currentStep
			});

			// If form has action, submit it
			if (originalAction) {
				fetch(originalAction, {
					method: originalMethod,
					body: formData
				})
				.then(response => response.json())
				.then(data => {
					this.tourManager.triggerEvent('form:response', {
						form: form,
						response: data,
						step: this.currentStep
					});
					resolve(data);
				})
				.catch(error => {
					console.error('Form submission error:', error);
					reject(error);
				});
			} else {
				// Just resolve immediately if no action
				resolve({});
			}
		});
	}

	scrollToTarget() {
		const target = this.currentStep.getTargetElement();

		if (!target) {
			return;
		}

		const rect = target.getBoundingClientRect();
		const offset = this.tourManager.options.scrollOffset;

		window.scrollTo({
			top: window.pageYOffset + rect.top - offset,
			behavior: this.tourManager.options.scrollBehavior
		});
	}

	delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}