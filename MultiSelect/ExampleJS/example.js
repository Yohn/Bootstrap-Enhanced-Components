/**
 * MultiSelect Component Example JavaScript
 * Demonstrates various features and configurations
 */

document.addEventListener('DOMContentLoaded', function() {

	// Theme Toggle Functionality
	const themeToggle = document.getElementById('themeToggle');
	const htmlElement = document.documentElement;

	themeToggle.addEventListener('click', function() {
		const currentTheme = htmlElement.getAttribute('data-bs-theme');
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

		htmlElement.setAttribute('data-bs-theme', newTheme);

		// Update button icon
		const icon = themeToggle.querySelector('i');
		if (newTheme === 'dark') {
			icon.className = 'bi bi-moon-fill';
		} else {
			icon.className = 'bi bi-sun-fill';
		}
	});

	// Basic MultiSelect Example
	const basicSelect = new MultiSelect('#basic-select', {
		searchable: true,
		placeholder: 'Select programming languages...',
		showTags: true,
		allowClear: true
	});

	// Update result display for basic example
	basicSelect.element.addEventListener('multiselect:change', function(e) {
		const resultDiv = document.getElementById('basic-result');
		resultDiv.textContent = JSON.stringify(e.detail.values, null, 2);
	});

	// Grouped Options Example
	const groupedData = [
		{ value: 'react', text: 'React', category: 'Frontend Frameworks' },
		{ value: 'vue', text: 'Vue.js', category: 'Frontend Frameworks' },
		{ value: 'angular', text: 'Angular', category: 'Frontend Frameworks' },
		{ value: 'svelte', text: 'Svelte', category: 'Frontend Frameworks' },
		{ value: 'node', text: 'Node.js', category: 'Backend Technologies' },
		{ value: 'express', text: 'Express.js', category: 'Backend Technologies' },
		{ value: 'django', text: 'Django', category: 'Backend Technologies' },
		{ value: 'flask', text: 'Flask', category: 'Backend Technologies' },
		{ value: 'mongodb', text: 'MongoDB', category: 'Databases' },
		{ value: 'postgresql', text: 'PostgreSQL', category: 'Databases' },
		{ value: 'mysql', text: 'MySQL', category: 'Databases' },
		{ value: 'redis', text: 'Redis', category: 'Databases' },
		{ value: 'docker', text: 'Docker', category: 'DevOps Tools' },
		{ value: 'kubernetes', text: 'Kubernetes', category: 'DevOps Tools' },
		{ value: 'aws', text: 'AWS', category: 'DevOps Tools' },
		{ value: 'azure', text: 'Azure', category: 'DevOps Tools' }
	];

	// Populate grouped select options
	const groupedSelectElement = document.getElementById('grouped-select');
	groupedData.forEach(item => {
		const option = document.createElement('option');
		option.value = item.value;
		option.textContent = item.text;
		option.setAttribute('data-group', item.category);
		groupedSelectElement.appendChild(option);
	});

	const groupedSelect = new MultiSelect('#grouped-select', {
		searchable: true,
		groupBy: 'group',
		maxSelections: 6,
		sortSelected: true,
		placeholder: 'Select up to 6 technologies...',
		groupTemplate: (groupName) => {
			return `<i class="bi bi-folder me-1"></i>${groupName}`;
		}
	});

	// Update result display for grouped example
	groupedSelect.element.addEventListener('multiselect:change', function(e) {
		const resultDiv = document.getElementById('grouped-result');
		const selected = e.detail.selected.map(item => ({
			value: item.value,
			text: item.text,
			category: item.group
		}));
		resultDiv.textContent = JSON.stringify(selected, null, 2);
	});

	// Custom Rendering Example with Team Members
	const teamMembersData = [
		{
			value: 'john',
			text: 'John Doe',
			role: 'Frontend Developer',
			avatar: '👨‍💻',
			department: 'Engineering'
		},
		{
			value: 'jane',
			text: 'Jane Smith',
			role: 'Backend Developer',
			avatar: '👩‍💻',
			department: 'Engineering'
		},
		{
			value: 'mike',
			text: 'Mike Johnson',
			role: 'UI/UX Designer',
			avatar: '🎨',
			department: 'Design'
		},
		{
			value: 'sarah',
			text: 'Sarah Wilson',
			role: 'Product Manager',
			avatar: '👩‍💼',
			department: 'Product'
		},
		{
			value: 'alex',
			text: 'Alex Brown',
			role: 'DevOps Engineer',
			avatar: '⚙️',
			department: 'Engineering'
		},
		{
			value: 'lisa',
			text: 'Lisa Davis',
			role: 'QA Engineer',
			avatar: '🔍',
			department: 'Quality Assurance'
		}
	];

	// Populate custom select options
	const customSelectElement = document.getElementById('custom-select');
	teamMembersData.forEach(member => {
		const option = document.createElement('option');
		option.value = member.value;
		option.textContent = member.text;
		option.setAttribute('data-role', member.role);
		option.setAttribute('data-avatar', member.avatar);
		option.setAttribute('data-department', member.department);
		customSelectElement.appendChild(option);
	});

	const customSelect = new MultiSelect('#custom-select', {
		searchable: true,
		placeholder: 'Select team members...',
		maxSelections: 4,
		customRenderer: (option) => {
			return `
				<div class="d-flex align-items-center">
					<span class="me-2" style="font-size: 1.2em;">${option.avatar}</span>
					<div class="flex-grow-1">
						<div class="fw-medium">${option.text}</div>
						<small class="text-muted">${option.role}</small>
					</div>
					<small class="badge bg-secondary">${option.department}</small>
				</div>
			`;
		},
		tagTemplate: (option) => {
			return `
				<span class="badge bg-info text-dark me-1 d-flex align-items-center">
					<span class="me-1">${option.avatar}</span>
					${option.text}
					<button type="button" class="btn-close ms-1" data-remove="${option.value}" aria-label="Remove"></button>
				</span>
			`;
		}
	});

	// Update result display for custom example
	customSelect.element.addEventListener('multiselect:change', function(e) {
		const resultDiv = document.getElementById('custom-result');
		const selected = e.detail.selected.map(member => ({
			name: member.text,
			role: member.role,
			department: member.department
		}));
		resultDiv.textContent = JSON.stringify(selected, null, 2);
	});

	// Size Variation Examples
	const smallSelect = new MultiSelect('#small-select', {
		searchable: false,
		placeholder: 'Small size...',
		size: 'sm'
	});

	const normalSelect = new MultiSelect('#normal-select', {
		searchable: true,
		placeholder: 'Normal size...',
		size: 'default'
	});

	const largeSelect = new MultiSelect('#large-select', {
		searchable: true,
		placeholder: 'Large size...',
		size: 'lg'
	});

	// API Demonstration
	const apiSelect = new MultiSelect('#api-select', {
		searchable: true,
		placeholder: 'Try the API buttons...',
		showTags: true
	});

	// API event logging
	const apiLog = document.getElementById('api-log');
	function logEvent(eventName, detail) {
		const timestamp = new Date().toLocaleTimeString();
		const logEntry = document.createElement('div');
		logEntry.innerHTML = `
			<strong>[${timestamp}]</strong> ${eventName}<br>
			<small>${JSON.stringify(detail)}</small>
		`;
		logEntry.style.marginBottom = '0.5rem';
		logEntry.style.paddingBottom = '0.5rem';
		logEntry.style.borderBottom = '1px solid var(--bs-border-color)';

		apiLog.insertBefore(logEntry, apiLog.firstChild);

		// Keep only last 10 entries
		while (apiLog.children.length > 10) {
			apiLog.removeChild(apiLog.lastChild);
		}
	}

	// Log all events for API demo
	['change', 'select', 'deselect', 'clear', 'open', 'close'].forEach(eventName => {
		apiSelect.element.addEventListener(`multiselect:${eventName}`, function(e) {
			logEvent(`multiselect:${eventName}`, e.detail);
		});
	});

	// API button handlers
	document.getElementById('selectRed').addEventListener('click', function() {
		apiSelect.setValue(['red']);
	});

	document.getElementById('selectAll').addEventListener('click', function() {
		apiSelect.setValue(['red', 'blue', 'green', 'yellow', 'purple', 'orange']);
	});

	document.getElementById('clearAll').addEventListener('click', function() {
		apiSelect.clear();
	});

	let isDisabled = false;
	document.getElementById('disableToggle').addEventListener('click', function() {
		if (isDisabled) {
			apiSelect.enable();
			this.textContent = 'Disable';
			logEvent('Component enabled', {});
		} else {
			apiSelect.disable();
			this.textContent = 'Enable';
			logEvent('Component disabled', {});
		}
		isDisabled = !isDisabled;
	});

	// Form Integration Examples
	const requiredSelect = new MultiSelect('#required-select', {
		searchable: true,
		placeholder: 'This field is required...',
		required: true
	});

	const limitedSelect = new MultiSelect('#limited-select', {
		searchable: true,
		maxSelections: 2,
		placeholder: 'Select up to 2 items...'
	});

	// Form validation handling
	const demoForm = document.getElementById('demo-form');
	demoForm.addEventListener('submit', function(e) {
		e.preventDefault();

		// Simple validation for required select
		const requiredValues = requiredSelect.getValue();
		const requiredElement = document.getElementById('required-select');

		if (requiredValues.length === 0) {
			requiredElement.classList.add('is-invalid');
			requiredSelect.container.classList.add('is-invalid');
		} else {
			requiredElement.classList.remove('is-invalid');
			requiredSelect.container.classList.remove('is-invalid');
			requiredElement.classList.add('is-valid');
			requiredSelect.container.classList.add('is-valid');
		}

		// If validation passes
		if (requiredValues.length > 0) {
			alert('Form submitted successfully!\n\nSelected values:\n' +
				  JSON.stringify({
					  required: requiredValues,
					  limited: limitedSelect.getValue()
				  }, null, 2));
		}
	});

	// Handle max selections reached for limited select
	limitedSelect.element.addEventListener('multiselect:change', function(e) {
		const helpText = document.querySelector('#limited-select').parentElement.querySelector('.form-text');
		if (e.detail.values.length >= 2) {
			helpText.textContent = 'Maximum selections reached.';
			helpText.classList.add('text-warning');
		} else {
			helpText.textContent = 'You can select up to 2 items.';
			helpText.classList.remove('text-warning');
		}
	});

	// Dynamic option demonstration
	function addDynamicOptions() {
		setTimeout(() => {
			basicSelect.addOption({ value: 'rust', text: 'Rust' });
			basicSelect.addOption({ value: 'kotlin', text: 'Kotlin' });
			basicSelect.addOption({ value: 'swift', text: 'Swift' });

			console.log('Added dynamic options to basic select');
		}, 2000);
	}

	// Add some dynamic options after page load
	addDynamicOptions();

	// Keyboard navigation demonstration
	console.log('MultiSelect components initialized!');
	console.log('Try using keyboard navigation:');
	console.log('- Tab to focus a component');
	console.log('- Enter/Space to open dropdown');
	console.log('- Arrow keys to navigate options');
	console.log('- Escape to close dropdown');

	// Performance monitoring
	const performanceObserver = new PerformanceObserver((list) => {
		list.getEntries().forEach((entry) => {
			if (entry.name.includes('multiselect')) {
				console.log(`Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
			}
		});
	});

	if ('PerformanceObserver' in window) {
		performanceObserver.observe({ entryTypes: ['measure'] });
	}

	// Accessibility improvements
	document.querySelectorAll('.multiselect-container').forEach(container => {
		// Add ARIA labels
		const selection = container.querySelector('.multiselect-selection');
		if (selection) {
			selection.setAttribute('role', 'combobox');
			selection.setAttribute('aria-expanded', 'false');
			selection.setAttribute('aria-haspopup', 'listbox');
		}

		// Monitor open/close states for ARIA
		const element = container.previousElementSibling;
		if (element) {
			element.addEventListener('multiselect:open', function() {
				selection.setAttribute('aria-expanded', 'true');
			});

			element.addEventListener('multiselect:close', function() {
				selection.setAttribute('aria-expanded', 'false');
			});
		}
	});

	// Error handling demonstration
	window.addEventListener('error', function(e) {
		if (e.message.includes('MultiSelect')) {
			console.error('MultiSelect Error:', e.message);

			// Show user-friendly error message
			const errorDiv = document.createElement('div');
			errorDiv.className = 'alert alert-danger alert-dismissible fade show';
			errorDiv.innerHTML = `
				<strong>Component Error:</strong> ${e.message}
				<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
			`;

			document.body.insertBefore(errorDiv, document.body.firstChild);
		}
	});

	// Touch device optimizations
	if ('ontouchstart' in window) {
		// Add touch-friendly classes
		document.querySelectorAll('.multiselect-container').forEach(container => {
			container.classList.add('touch-device');
		});

		// Adjust dropdown positioning for mobile
		const style = document.createElement('style');
		style.textContent = `
			.touch-device .multiselect-dropdown {
				max-height: 50vh;
			}

			.touch-device .multiselect-option {
				padding: 0.75rem 1rem;
				font-size: 1rem;
			}
		`;
		document.head.appendChild(style);
	}

	// Development helper functions (only in development)
	if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
		window.MultiSelectDebug = {
			getInstances: () => {
				return {
					basic: basicSelect,
					grouped: groupedSelect,
					custom: customSelect,
					api: apiSelect,
					required: requiredSelect,
					limited: limitedSelect
				};
			},

			logState: (instanceName) => {
				const instances = window.MultiSelectDebug.getInstances();
				const instance = instances[instanceName];
				if (instance) {
					console.log(`${instanceName} State:`, {
						isOpen: instance.isOpen,
						isDisabled: instance.isDisabled,
						selectedValues: Array.from(instance.selectedValues),
						filteredOptions: instance.filteredOptions.length,
						totalOptions: instance.allOptions.length
					});
				}
			},

			testPerformance: (iterations = 1000) => {
				console.time('MultiSelect Performance Test');

				for (let i = 0; i < iterations; i++) {
					basicSelect.setValue(['js', 'py']);
					basicSelect.clear();
				}

				console.timeEnd('MultiSelect Performance Test');
			}
		};

		console.log('Development helpers available: window.MultiSelectDebug');
	}
});