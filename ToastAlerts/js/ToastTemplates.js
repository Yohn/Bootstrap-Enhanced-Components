/**
 * ToastTemplates - Template management for ToastAlerts
 * Handles toast HTML generation, templating, and content sanitization
 */
class ToastTemplates {
	static TEMPLATE_TYPES = {
		default: 'default',
		minimal: 'minimal',
		detailed: 'detailed',
		action: 'action',
		progress: 'progress'
	};

	constructor() {
		this.templates = new Map();
		this.customTemplates = new Map();

		this._initializeDefaultTemplates();
	}

	/**
	 * Get template by type and toast type
	 * @param {string} type - Toast type (success, error, etc.)
	 * @param {string} templateType - Template type (default, minimal, etc.)
	 * @returns {string} Template HTML string
	 */
	getTemplate(type = 'default', templateType = 'default') {
		const templateKey = `${templateType}-${type}`;

		// Check custom templates first
		if (this.customTemplates.has(templateKey)) {
			return this.customTemplates.get(templateKey);
		}

		// Check default templates
		if (this.templates.has(templateKey)) {
			return this.templates.get(templateKey);
		}

		// Fall back to default template
		return this.templates.get(`default-${type}`) || this.templates.get('default-default');
	}

	/**
	 * Get default template for a toast type
	 * @param {string} type - Toast type
	 * @returns {string} Template HTML string
	 */
	getDefault(type = 'default') {
		return this.getTemplate(type, 'default');
	}

	/**
	 * Register a custom template
	 * @param {string} name - Template name
	 * @param {string} template - Template HTML string
	 * @param {string} type - Toast type (optional)
	 */
	register(name, template, type = 'default') {
		const templateKey = `${name}-${type}`;
		this.customTemplates.set(templateKey, template);
	}

	/**
	 * Unregister a custom template
	 * @param {string} name - Template name
	 * @param {string} type - Toast type (optional)
	 * @returns {boolean} Success status
	 */
	unregister(name, type = 'default') {
		const templateKey = `${name}-${type}`;
		return this.customTemplates.delete(templateKey);
	}

	/**
	 * Render template with options
	 * @param {string} template - Template HTML string
	 * @param {Object} options - Toast options
	 * @returns {HTMLElement} Rendered toast element
	 */
	render(template, options) {
		// Create temporary container
		const container = document.createElement('div');
		container.innerHTML = this._processTemplate(template, options);

		const element = container.firstElementChild;
		if (!element) {
			throw new Error('Invalid template: must contain at least one element');
		}

		// Post-process the element
		this._postProcessElement(element, options);

		return element;
	}

	/**
	 * Get list of available templates
	 * @returns {Object} Available templates grouped by type
	 */
	getAvailable() {
		const available = {
			default: [],
			custom: []
		};

		// Default templates
		this.templates.forEach((template, key) => {
			const [templateType, toastType] = key.split('-');
			if (!available.default.find(t => t.name === templateType)) {
				available.default.push({
					name: templateType,
					types: [toastType]
				});
			} else {
				const existing = available.default.find(t => t.name === templateType);
				existing.types.push(toastType);
			}
		});

		// Custom templates
		this.customTemplates.forEach((template, key) => {
			const [templateType, toastType] = key.split('-');
			if (!available.custom.find(t => t.name === templateType)) {
				available.custom.push({
					name: templateType,
					types: [toastType]
				});
			} else {
				const existing = available.custom.find(t => t.name === templateType);
				existing.types.push(toastType);
			}
		});

		return available;
	}

	/**
	 * Validate template structure
	 * @param {string} template - Template HTML string
	 * @returns {Object} Validation result
	 */
	validate(template) {
		const result = {
			valid: true,
			errors: [],
			warnings: []
		};

		try {
			const container = document.createElement('div');
			container.innerHTML = template;

			const element = container.firstElementChild;
			if (!element) {
				result.valid = false;
				result.errors.push('Template must contain at least one element');
				return result;
			}

			// Check for required classes
			if (!element.classList.contains('toast')) {
				result.warnings.push('Root element should have "toast" class');
			}

			// Check for content placeholder
			if (!template.includes('{{content}}') && !template.includes('{{title}}')) {
				result.warnings.push('Template should include {{content}} or {{title}} placeholder');
			}

			// Check for close button
			if (!template.includes('toast-alerts-close')) {
				result.warnings.push('Template should include close button with "toast-alerts-close" class');
			}

			// Check for accessibility attributes
			if (!template.includes('role=') && !template.includes('aria-')) {
				result.warnings.push('Template should include accessibility attributes');
			}

		} catch (error) {
			result.valid = false;
			result.errors.push(`Template parsing error: ${error.message}`);
		}

		return result;
	}

	/**
	 * Clone template for modification
	 * @param {string} templateName - Template name to clone
	 * @param {string} type - Toast type
	 * @returns {string} Cloned template
	 */
	clone(templateName, type = 'default') {
		const template = this.getTemplate(type, templateName);
		return template ? template : null;
	}

	/**
	 * Initialize default templates
	 * @private
	 */
	_initializeDefaultTemplates() {
		const types = ['success', 'error', 'warning', 'info', 'default'];

		types.forEach(type => {
			// Default template
			this.templates.set(`default-${type}`, this._createDefaultTemplate(type));

			// Minimal template
			this.templates.set(`minimal-${type}`, this._createMinimalTemplate(type));

			// Detailed template
			this.templates.set(`detailed-${type}`, this._createDetailedTemplate(type));

			// Action template
			this.templates.set(`action-${type}`, this._createActionTemplate(type));

			// Progress template
			this.templates.set(`progress-${type}`, this._createProgressTemplate(type));
		});
	}

	/**
	 * Create default template
	 * @param {string} type - Toast type
	 * @returns {string} Template HTML
	 * @private
	 */
	_createDefaultTemplate(type) {
		return `
			<div class="toast align-items-center {{bgClass}} border-0" role="alert" aria-live="assertive" aria-atomic="true">
				<div class="d-flex">
					{{#showIcon}}
					<div class="toast-body d-flex align-items-center">
						<i class="{{iconClass}} me-2"></i>
						<div>
							{{#title}}<div class="fw-bold mb-1">{{title}}</div>{{/title}}
							<div>{{content}}</div>
						</div>
					</div>
					{{/showIcon}}
					{{^showIcon}}
					<div class="toast-body">
						{{#title}}<div class="fw-bold mb-1">{{title}}</div>{{/title}}
						<div>{{content}}</div>
					</div>
					{{/showIcon}}
					{{#showCloseButton}}
					<button type="button" class="btn-close toast-alerts-close me-2 m-auto" aria-label="Close"></button>
					{{/showCloseButton}}
				</div>
				{{#progressBar}}
				<div class="toast-progress-bar" style="position: absolute; bottom: 0; left: 0; height: 3px; background: rgba(255,255,255,0.3); transition: width {{duration}}ms linear;"></div>
				{{/progressBar}}
			</div>
		`;
	}

	/**
	 * Create minimal template
	 * @param {string} type - Toast type
	 * @returns {string} Template HTML
	 * @private
	 */
	_createMinimalTemplate(type) {
		return `
			<div class="toast align-items-center {{bgClass}} border-0" role="alert" aria-live="polite" aria-atomic="true">
				<div class="toast-body d-flex justify-content-between align-items-center">
					<span>{{content}}</span>
					{{#showCloseButton}}
					<button type="button" class="btn-close toast-alerts-close" aria-label="Close"></button>
					{{/showCloseButton}}
				</div>
			</div>
		`;
	}

	/**
	 * Create detailed template
	 * @param {string} type - Toast type
	 * @returns {string} Template HTML
	 * @private
	 */
	_createDetailedTemplate(type) {
		return `
			<div class="toast {{bgClass}}" role="alert" aria-live="assertive" aria-atomic="true">
				<div class="toast-header">
					{{#showIcon}}
					<i class="{{iconClass}} me-2"></i>
					{{/showIcon}}
					<strong class="me-auto">{{title}}</strong>
					<small class="text-muted">{{timestamp}}</small>
					{{#showCloseButton}}
					<button type="button" class="btn-close toast-alerts-close" aria-label="Close"></button>
					{{/showCloseButton}}
				</div>
				<div class="toast-body">
					{{content}}
				</div>
				{{#progressBar}}
				<div class="toast-progress-bar" style="position: absolute; bottom: 0; left: 0; height: 3px; background: rgba(0,0,0,0.1); transition: width {{duration}}ms linear;"></div>
				{{/progressBar}}
			</div>
		`;
	}

	/**
	 * Create action template
	 * @param {string} type - Toast type
	 * @returns {string} Template HTML
	 * @private
	 */
	_createActionTemplate(type) {
		return `
			<div class="toast {{bgClass}}" role="alert" aria-live="assertive" aria-atomic="true">
				<div class="toast-header">
					{{#showIcon}}
					<i class="{{iconClass}} me-2"></i>
					{{/showIcon}}
					<strong class="me-auto">{{title}}</strong>
					{{#showCloseButton}}
					<button type="button" class="btn-close toast-alerts-close" aria-label="Close"></button>
					{{/showCloseButton}}
				</div>
				<div class="toast-body">
					<div class="mb-3">{{content}}</div>
					<div class="mt-2 pt-2 border-top">
						{{#actions}}
						<button type="button" class="btn btn-{{style}} btn-sm me-2" data-action="{{action}}">{{label}}</button>
						{{/actions}}
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Create progress template
	 * @param {string} type - Toast type
	 * @returns {string} Template HTML
	 * @private
	 */
	_createProgressTemplate(type) {
		return `
			<div class="toast {{bgClass}}" role="alert" aria-live="polite" aria-atomic="true">
				<div class="toast-body">
					<div class="d-flex align-items-center">
						{{#showIcon}}
						<i class="{{iconClass}} me-3"></i>
						{{/showIcon}}
						<div class="flex-grow-1">
							{{#title}}<div class="fw-bold">{{title}}</div>{{/title}}
							<div>{{content}}</div>
							<div class="progress mt-2" style="height: 6px;">
								<div class="progress-bar toast-progress-indicator" role="progressbar" style="width: {{progress}}%" aria-valuenow="{{progress}}" aria-valuemin="0" aria-valuemax="100"></div>
							</div>
						</div>
						{{#showCloseButton}}
						<button type="button" class="btn-close toast-alerts-close ms-3" aria-label="Close"></button>
						{{/showCloseButton}}
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Process template with options
	 * @param {string} template - Template HTML string
	 * @param {Object} options - Toast options
	 * @returns {string} Processed HTML
	 * @private
	 */
	_processTemplate(template, options) {
		let processed = template;

		// Get toast type configuration
		const typeConfig = this._getTypeConfig(options.type);

		// Create template data
		const data = {
			...options,
			iconClass: `${typeConfig.icon} toast-alerts-icon`,
			bgClass: typeConfig.bgClass,
			timestamp: this._formatTimestamp(new Date()),
			progress: options.progress || 0,
			duration: options.duration || 5000
		};

		// Process conditional blocks
		processed = this._processConditionals(processed, data);

		// Process variable substitutions
		processed = this._processVariables(processed, data);

		// Sanitize content if HTML is not allowed
		if (!options.html) {
			processed = this._sanitizeContent(processed, data);
		}

		return processed;
	}

	/**
	 * Process conditional template blocks
	 * @param {string} template - Template string
	 * @param {Object} data - Template data
	 * @returns {string} Processed template
	 * @private
	 */
	_processConditionals(template, data) {
		let processed = template;

		// Process {{#variable}} blocks (if variable is truthy)
		processed = processed.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, variable, content) => {
			const value = this._getNestedValue(data, variable);
			return this._isTruthy(value) ? content : '';
		});

		// Process {{^variable}} blocks (if variable is falsy)
		processed = processed.replace(/\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, variable, content) => {
			const value = this._getNestedValue(data, variable);
			return !this._isTruthy(value) ? content : '';
		});

		// Process array iterations {{#array}} ... {{/array}}
		processed = processed.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, variable, content) => {
			const value = this._getNestedValue(data, variable);
			if (Array.isArray(value)) {
				return value.map(item => {
					return this._processVariables(content, { ...data, ...item });
				}).join('');
			}
			return this._isTruthy(value) ? content : '';
		});

		return processed;
	}

	/**
	 * Process variable substitutions
	 * @param {string} template - Template string
	 * @param {Object} data - Template data
	 * @returns {string} Processed template
	 * @private
	 */
	_processVariables(template, data) {
		return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
			const value = this._getNestedValue(data, variable);
			return value !== undefined ? String(value) : '';
		});
	}

	/**
	 * Get nested value from object
	 * @param {Object} obj - Object to search
	 * @param {string} path - Property path
	 * @returns {*} Value or undefined
	 * @private
	 */
	_getNestedValue(obj, path) {
		return path.split('.').reduce((current, key) => {
			return current && current[key] !== undefined ? current[key] : undefined;
		}, obj);
	}

	/**
	 * Check if value is truthy for template conditionals
	 * @param {*} value - Value to check
	 * @returns {boolean} Whether value is truthy
	 * @private
	 */
	_isTruthy(value) {
		if (Array.isArray(value)) {
			return value.length > 0;
		}
		return Boolean(value);
	}

	/**
	 * Sanitize content to prevent XSS
	 * @param {string} template - Template string
	 * @param {Object} data - Template data
	 * @returns {string} Sanitized template
	 * @private
	 */
	_sanitizeContent(template, data) {
		// Basic XSS prevention - escape HTML in content and title
		const escapeHtml = (text) => {
			const div = document.createElement('div');
			div.textContent = text;
			return div.innerHTML;
		};

		if (data.content && typeof data.content === 'string') {
			template = template.replace(/\{\{content\}\}/g, escapeHtml(data.content));
		}

		if (data.title && typeof data.title === 'string') {
			template = template.replace(/\{\{title\}\}/g, escapeHtml(data.title));
		}

		return template;
	}

	/**
	 * Post-process rendered element
	 * @param {HTMLElement} element - Rendered element
	 * @param {Object} options - Toast options
	 * @private
	 */
	_postProcessElement(element, options) {
		// Add custom classes
		if (options.customClass) {
			element.classList.add(...options.customClass.split(' '));
		}

		// Set accessibility attributes
		if (options.ariaLive) {
			element.setAttribute('aria-live', options.ariaLive);
		}

		// Initialize progress bar if present
		const progressBar = element.querySelector('.toast-progress-bar');
		if (progressBar && options.progressBar && !options.persistent) {
			setTimeout(() => {
				progressBar.style.width = '0%';
			}, 100);
		}

		// Setup action buttons
		const actionButtons = element.querySelectorAll('[data-action]');
		actionButtons.forEach(button => {
			button.addEventListener('click', (e) => {
				const action = e.target.getAttribute('data-action');
				if (options.callbacks && options.callbacks.action) {
					options.callbacks.action(action, options);
				}
			});
		});
	}

	/**
	 * Get type configuration
	 * @param {string} type - Toast type
	 * @returns {Object} Type configuration
	 * @private
	 */
	_getTypeConfig(type) {
		const configs = {
			success: { icon: 'bi-check-circle-fill', bgClass: 'text-bg-success' },
			error: { icon: 'bi-x-circle-fill', bgClass: 'text-bg-danger' },
			warning: { icon: 'bi-exclamation-triangle-fill', bgClass: 'text-bg-warning' },
			info: { icon: 'bi-info-circle-fill', bgClass: 'text-bg-info' },
			default: { icon: 'bi-bell-fill', bgClass: 'text-bg-light' }
		};

		return configs[type] || configs.default;
	}

	/**
	 * Format timestamp for display
	 * @param {Date} date - Date to format
	 * @returns {string} Formatted timestamp
	 * @private
	 */
	_formatTimestamp(date) {
		const now = new Date();
		const diff = now - date;

		if (diff < 60000) { // Less than 1 minute
			return 'now';
		} else if (diff < 3600000) { // Less than 1 hour
			const minutes = Math.floor(diff / 60000);
			return `${minutes}m ago`;
		} else if (diff < 86400000) { // Less than 1 day
			const hours = Math.floor(diff / 3600000);
			return `${hours}h ago`;
		} else {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		}
	}

	/**
	 * Clear all custom templates
	 */
	clearCustom() {
		this.customTemplates.clear();
	}

	/**
	 * Export templates for backup/transfer
	 * @returns {Object} Exported templates
	 */
	export() {
		return {
			custom: Object.fromEntries(this.customTemplates)
		};
	}

	/**
	 * Import templates from backup
	 * @param {Object} data - Imported template data
	 */
	import(data) {
		if (data.custom) {
			Object.entries(data.custom).forEach(([key, template]) => {
				this.customTemplates.set(key, template);
			});
		}
	}
}