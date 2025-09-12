/**
 * Demo Implementation for Onboarding Tour
 * Shows practical examples of tour usage with various features
 */
document.addEventListener('DOMContentLoaded', function() {
	// Initialize the tour manager
	const tour = new TourManager({
		tourId: "welcome-tour",
		theme: "primary",
		showProgress: true,
		allowSkip: true,
		crossPageEnabled: false, // Disabled for single-page demo
		preserveProgress: true,
		backdropOpacity: 0.6,

		// Callbacks
		onStart: function(event) {
			console.log('Tour started!', event.detail);
			// Track analytics
			trackEvent('tour_started');
		},

		onComplete: function(event) {
			console.log('Tour completed!', event.detail);
			showCompletionMessage();
			trackEvent('tour_completed');
		},

		onSkip: function(event) {
			console.log('Tour skipped!', event.detail);
			trackEvent('tour_skipped');
		},

		onStepEnter: function(event) {
			const { step, stepIndex } = event.detail;
			console.log(`Entered step: ${step.id} (${stepIndex + 1})`);
			trackEvent('tour_step_enter', { step_id: step.id, step_index: stepIndex });
		}
	});

	// Add tour steps
	setupTourSteps(tour);

	// Bind event listeners
	bindEventListeners(tour);

	// Auto-start tour for new users (simulate)
	checkAutoStart(tour);

	/**
	 * Setup all tour steps with different configurations
	 */
	function setupTourSteps(tour) {
		// Step 1: Welcome & Navigation
		tour.addStep({
			id: "welcome-step",
			target: "#welcome-title",
			title: "Welcome to Our Platform!",
			content: "Let's take a quick tour to help you get familiar with all the amazing features available to you.",
			placement: "bottom",
			showStepNumber: true,
			buttons: {
				previous: { show: false },
				skip: {
					text: "Skip Tour",
					class: "btn btn-link text-muted"
				}
			},
			onEnter: function(step, tour) {
				// Highlight the welcome section
				document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
				return true;
			}
		});

		// Step 2: Navigation Menu
		tour.addStep({
			id: "navigation-step",
			target: "#main-navigation",
			title: "Navigation Menu",
			content: "This is your main navigation bar. You can access different sections of the platform from here. Try exploring <strong>Features</strong>, <strong>Dashboard</strong>, and <strong>Settings</strong>.",
			placement: "bottom",
			highlightPadding: 8,
			scrollTo: true
		});

		// Step 3: User Profile Menu
		tour.addStep({
			id: "profile-menu-step",
			target: "#user-menu",
			title: "Your Profile Menu",
			content: "Click here to access your profile settings, account information, and logout options. Keep your profile updated for the best experience.",
			placement: "bottom",
			offset: [-50, 15],
			onEnter: function(step, tour) {
				// Ensure dropdown is visible in navbar
				const navbar = document.querySelector('.navbar-collapse');
				if (navbar && !navbar.classList.contains('show')) {
					const toggler = document.querySelector('.navbar-toggler');
					if (toggler && window.innerWidth < 992) {
						toggler.click();
					}
				}
				return true;
			}
		});

		// Step 4: Platform Statistics
		tour.addStep({
			id: "stats-step",
			target: "#stats-title",
			title: "Platform Statistics",
			content: "Here you can see live statistics about our platform - number of users, projects, and uptime. These numbers update in real-time!",
			placement: "left",
			width: 300
		});

		// Step 5: Features Overview
		tour.addStep({
			id: "features-step",
			target: "#features-title",
			title: "Explore Our Features",
			content: "Below you'll find our core platform features. Each feature is designed to help you be more productive and successful.",
			placement: "bottom",
			scrollTo: true,
			delay: 200
		});

		// Step 6: Analytics Feature
		tour.addStep({
			id: "analytics-feature-step",
			target: "#feature-analytics",
			title: "Analytics Dashboard",
			content: "Get powerful insights into your data with our comprehensive analytics tools. Track performance, identify trends, and make data-driven decisions.",
			placement: "top",
			highlightClass: "tour-highlight-feature"
		});

		// Step 7: Collaboration Feature
		tour.addStep({
			id: "collaboration-step",
			target: "#feature-collaboration",
			title: "Team Collaboration",
			content: "Work seamlessly with your team using our advanced collaboration features. Share projects, communicate in real-time, and track progress together.",
			placement: "top"
		});

		// Step 8: Security Feature
		tour.addStep({
			id: "security-step",
			target: "#feature-security",
			title: "Enterprise Security",
			content: "Your data is protected with industry-leading security measures including encryption, access controls, and compliance certifications.",
			placement: "top"
		});

		// Step 9: Profile Form (with form validation)
		tour.addStep({
			id: "profile-form-step",
			target: "#form-title",
			title: "Complete Your Profile",
			content: "Let's set up your profile to personalize your experience. Fill out the form below - don't worry, you can always update this later!",
			placement: "bottom",
			requireForm: true,
			formSelector: "#demo-form",
			formFields: ["firstName", "lastName", "email"],
			validateForm: true,
			scrollTo: true,
			buttons: {
				next: {
					text: "Save & Continue",
					class: "btn btn-success"
				}
			},
			onNext: function(step, tour) {
				const validation = step.validateFormFields();
				if (!validation.isValid) {
					showFormErrors(validation.errors);
					return false;
				}

				// Simulate form processing
				showFormSuccess();
				return true;
			}
		});

		// Step 10: Dashboard Overview
		tour.addStep({
			id: "dashboard-step",
			target: "#dashboard-title",
			title: "Your Personal Dashboard",
			content: "This is your command center! Monitor your projects, track tasks, view notifications, and access quick actions all from one place.",
			placement: "bottom",
			scrollTo: true
		});

		// Step 11: Dashboard Widgets
		tour.addStep({
			id: "widgets-step",
			target: "#widget-projects",
			title: "Dashboard Widgets",
			content: "These widgets give you an at-a-glance view of your important metrics. Click on any widget to dive deeper into the details.",
			placement: "bottom",
			width: 350,
			onEnter: function(step, tour) {
				// Animate all widgets
				const widgets = document.querySelectorAll('[id^="widget-"]');
				widgets.forEach((widget, index) => {
					setTimeout(() => {
						widget.style.transform = 'scale(1.05)';
						setTimeout(() => {
							widget.style.transform = 'scale(1)';
						}, 200);
					}, index * 100);
				});
				return true;
			}
		});

		// Step 12: Quick Actions
		tour.addStep({
			id: "quick-actions-step",
			target: "#quick-actions",
			title: "Quick Actions",
			content: "Use these buttons to perform common tasks quickly. Create new projects, invite team members, view reports, or access settings with just one click.",
			placement: "top",
			buttons: {
				next: {
					text: "Finish Tour",
					class: "btn btn-success"
				}
			}
		});

		// Step 13: Tour Completion
		tour.addStep({
			id: "completion-step",
			target: null, // Centered step
			title: "🎉 Tour Complete!",
			content: `
				<div class="text-center">
					<p class="lead">Congratulations! You've completed the onboarding tour.</p>
					<p>You're now ready to start using our platform. Remember:</p>
					<ul class="list-unstyled">
						<li>✅ Explore the navigation menu</li>
						<li>✅ Complete your profile</li>
						<li>✅ Check out the dashboard</li>
						<li>✅ Try the quick actions</li>
					</ul>
					<p class="text-muted">You can restart this tour anytime by clicking the "Restart Tour" button in the footer.</p>
				</div>
			`,
			placement: "center",
			width: 400,
			backdrop: true,
			buttons: {
				previous: { show: false },
				skip: { show: false },
				next: {
					text: "Get Started!",
					class: "btn btn-primary btn-lg"
				}
			}
		});
	}

	/**
	 * Bind event listeners for tour controls
	 */
	function bindEventListeners(tour) {
		// Start tour button
		document.getElementById('start-tour-btn').addEventListener('click', function() {
			tour.reset();
			tour.start();
		});

		// Restart tour button
		document.getElementById('restart-tour').addEventListener('click', function() {
			tour.reset();
			tour.start();
		});

		// Skip intro button
		document.getElementById('skip-intro').addEventListener('click', function() {
			// Jump to dashboard section
			document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
		});

		// Form submission handling
		document.getElementById('demo-form').addEventListener('submit', function(e) {
			e.preventDefault();

			// Basic form validation
			if (!this.checkValidity()) {
				e.stopPropagation();
				this.classList.add('was-validated');
				return;
			}

			// Simulate form submission
			showFormSuccess();
			this.classList.add('was-validated');
		});

		// Quick action buttons
		document.getElementById('action-new-project').addEventListener('click', function() {
			showModal('New Project', 'Project creation wizard would open here.');
		});

		document.getElementById('action-invite-team').addEventListener('click', function() {
			showModal('Invite Team', 'Team invitation dialog would open here.');
		});

		document.getElementById('action-view-reports').addEventListener('click', function() {
			showModal('Reports', 'Reports dashboard would open here.');
		});

		document.getElementById('action-settings').addEventListener('click', function() {
			showModal('Settings', 'Settings panel would open here.');
		});

		// Feature card interactions
		document.querySelectorAll('.feature-card').forEach(card => {
			card.addEventListener('click', function() {
				const title = this.querySelector('.card-title').textContent;
				showModal(title, `${title} feature details would be shown here.`);
			});
		});

		// Dashboard widget interactions
		document.querySelectorAll('[id^="widget-"]').forEach(widget => {
			widget.addEventListener('click', function() {
				const title = this.querySelector('.card-title').textContent;
				showModal(title, `Detailed ${title.toLowerCase()} information would be displayed here.`);
			});
		});
	}

	/**
	 * Check if tour should auto-start
	 */
	function checkAutoStart(tour) {
		// Check if user is new (simulate with localStorage)
		const isNewUser = !localStorage.getItem('tour_completed');
		const urlParams = new URLSearchParams(window.location.search);
		const autoStart = urlParams.get('tour') === 'start';

		if (isNewUser || autoStart) {
			// Delay to let page load completely
			setTimeout(() => {
				tour.start();
			}, 1000);
		}
	}

	/**
	 * Show tour completion message
	 */
	function showCompletionMessage() {
		// Mark tour as completed
		localStorage.setItem('tour_completed', 'true');
		localStorage.setItem('tour_completion_date', new Date().toISOString());

		// Show success message
		showToast('Tour Completed!', 'You have successfully completed the onboarding tour. Welcome aboard!', 'success');
	}

	/**
	 * Show form validation errors
	 */
	function showFormErrors(errors) {
		const errorHtml = errors.map(error => `<div>${error}</div>`).join('');
		showToast('Form Validation', errorHtml, 'danger');
	}

	/**
	 * Show form success message
	 */
	function showFormSuccess() {
		showToast('Profile Saved!', 'Your profile has been updated successfully.', 'success');

		// Update form to show saved state
		const form = document.getElementById('demo-form');
		form.classList.add('was-validated');

		// Disable form temporarily
		const inputs = form.querySelectorAll('input, select');
		inputs.forEach(input => {
			input.setAttribute('readonly', true);
			setTimeout(() => {
				input.removeAttribute('readonly');
			}, 2000);
		});
	}

	/**
	 * Show modal dialog
	 */
	function showModal(title, content) {
		// Create modal if it doesn't exist
		let modal = document.getElementById('demo-modal');
		if (!modal) {
			modal = createModal();
		}

		// Update modal content
		modal.querySelector('.modal-title').textContent = title;
		modal.querySelector('.modal-body').innerHTML = content;

		// Show modal
		const bsModal = new bootstrap.Modal(modal);
		bsModal.show();
	}

	/**
	 * Create modal element
	 */
	function createModal() {
		const modalHtml = `
			<div class="modal fade" id="demo-modal" tabindex="-1">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title"></h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div class="modal-body"></div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
		`;

		document.body.insertAdjacentHTML('beforeend', modalHtml);
		return document.getElementById('demo-modal');
	}

	/**
	 * Show toast notification
	 */
	function showToast(title, message, type = 'info') {
		// Create toast container if it doesn't exist
		let container = document.getElementById('toast-container');
		if (!container) {
			container = document.createElement('div');
			container.id = 'toast-container';
			container.className = 'toast-container position-fixed top-0 end-0 p-3';
			container.style.zIndex = '9999';
			document.body.appendChild(container);
		}

		// Create toast
		const toastId = 'toast-' + Date.now();
		const toastHtml = `
			<div id="${toastId}" class="toast" role="alert">
				<div class="toast-header">
					<div class="rounded me-2 bg-${type}" style="width: 20px; height: 20px;"></div>
					<strong class="me-auto">${title}</strong>
					<button type="button" class="btn-close" data-bs-dismiss="toast"></button>
				</div>
				<div class="toast-body">${message}</div>
			</div>
		`;

		container.insertAdjacentHTML('beforeend', toastHtml);

		// Show toast
		const toastElement = document.getElementById(toastId);
		const toast = new bootstrap.Toast(toastElement, {
			autohide: true,
			delay: 5000
		});
		toast.show();

		// Remove toast element after it's hidden
		toastElement.addEventListener('hidden.bs.toast', function() {
			this.remove();
		});
	}

	/**
	 * Track analytics events (placeholder)
	 */
	function trackEvent(eventName, data = {}) {
		console.log('Analytics Event:', eventName, data);

		// Here you would integrate with your analytics service
		// Example: gtag('event', eventName, data);
		// Example: analytics.track(eventName, data);
	}

	/**
	 * Add some interactive behaviors for demo
	 */
	function addInteractiveBehaviors() {
		// Animate widgets on hover
		document.querySelectorAll('[id^="widget-"]').forEach(widget => {
			widget.addEventListener('mouseenter', function() {
				this.style.transform = 'translateY(-2px)';
				this.style.transition = 'transform 0.2s ease';
			});

			widget.addEventListener('mouseleave', function() {
				this.style.transform = 'translateY(0)';
			});
		});

		// Add loading states to buttons
		document.querySelectorAll('[id^="action-"]').forEach(button => {
			button.addEventListener('click', function() {
				const originalText = this.innerHTML;
				this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
				this.disabled = true;

				setTimeout(() => {
					this.innerHTML = originalText;
					this.disabled = false;
				}, 1500);
			});
		});

		// Smooth scroll for navigation links
		document.querySelectorAll('a[href^="#"]').forEach(link => {
			link.addEventListener('click', function(e) {
				e.preventDefault();
				const target = document.querySelector(this.getAttribute('href'));
				if (target) {
					target.scrollIntoView({ behavior: 'smooth' });
				}
			});
		});
	}

	// Initialize interactive behaviors
	addInteractiveBehaviors();

	// Add keyboard shortcuts for tour control
	document.addEventListener('keydown', function(e) {
		// Ctrl/Cmd + Shift + T to start tour
		if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
			e.preventDefault();
			tour.reset();
			tour.start();
		}

		// Ctrl/Cmd + Shift + R to restart tour
		if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
			e.preventDefault();
			tour.reset();
			tour.start();
		}
	});

	// Show keyboard shortcuts hint
	setTimeout(() => {
		if (!localStorage.getItem('shortcuts_shown')) {
			showToast(
				'Keyboard Shortcuts',
				'💡 <strong>Tip:</strong> Press <kbd>Ctrl+Shift+T</kbd> to start the tour anytime!',
				'info'
			);
			localStorage.setItem('shortcuts_shown', 'true');
		}
	}, 3000);
});