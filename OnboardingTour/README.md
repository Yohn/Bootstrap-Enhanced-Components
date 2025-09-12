# Onboarding Tour Feature

A comprehensive onboarding tour system for Bootstrap 5.3 that guides users through website features with support for multi-page navigation, form interactions, and customizable styling.

## Features

- **Multi-page support** - Tour can continue across different pages
- **Form integration** - Steps can require form completion before proceeding
- **Flexible positioning** - Tooltips/modals can be positioned around target elements
- **Customizable styling** - Uses Bootstrap 5.3 CSS variables and custom SCSS
- **Progress tracking** - Visual progress indicator
- **Responsive design** - Works on all screen sizes
- **Keyboard navigation** - Full keyboard support
- **Accessibility** - ARIA compliant

## Configuration Options

### TourManager Options

```javascript
{
	// Basic Configuration
	tourId: "welcome-tour",					// Unique identifier for the tour
	autoStart: false,						// Auto-start tour on page load
	showProgress: true,						// Show progress indicator
	showStepNumbers: true,					// Show step numbers in UI

	// Navigation Options
	allowSkip: true,						// Allow users to skip the tour
	allowPrevious: true,					// Allow going back to previous steps
	exitOnEscape: true,						// Exit tour on ESC key
	exitOnOverlayClick: false,				// Exit tour when clicking overlay

	// Storage Options
	storage: "localStorage",				// "localStorage", "sessionStorage", or "none"
	storageKey: "onboarding_tour_progress",	// Key for storing progress

	// Timing Options
	stepDelay: 300,							// Delay between steps (ms)
	highlightDelay: 150,					// Delay for highlight animation (ms)

	// Styling Options
	theme: "default",						// "default", "dark", "primary", "success"
	backdropOpacity: 0.5,					// Backdrop opacity (0-1)
	borderRadius: "0.5rem",					// Border radius for tour elements

	// Callbacks
	onStart: null,							// Function called when tour starts
	onComplete: null,						// Function called when tour completes
	onSkip: null,							// Function called when tour is skipped
	onStepEnter: null,						// Function called on each step entry
	onStepExit: null,						// Function called on each step exit
	onBeforeStepChange: null,				// Function called before step change
	onAfterStepChange: null,				// Function called after step change

	// Advanced Options
	scrollBehavior: "smooth",				// Scroll behavior when focusing elements
	scrollOffset: 100,						// Offset from top when scrolling to elements
	zIndexBase: 10000,						// Base z-index for tour elements
	animationDuration: 250,					// Animation duration (ms)

	// Multi-page Options
	crossPageEnabled: true,					// Enable cross-page functionality
	pageChangeDelay: 1000,					// Delay after page change (ms)
	preserveProgress: true,					// Preserve progress across page reloads

	// Form Integration
	formValidation: true,					// Enable form validation
	formSubmitMode: "validate",				// "validate", "submit", "custom"
	waitForFormResponse: true,				// Wait for form response before proceeding
}
```

### TourStep Options

```javascript
{
	// Basic Step Configuration
	id: "step-1",							// Unique step identifier
	title: "Welcome!",						// Step title
	content: "Welcome to our platform...",	// Step content (HTML supported)
	target: "#welcome-button",				// Target element selector

	// Page Configuration
	page: "/dashboard",						// Page URL for this step
	waitForElement: true,					// Wait for target element to exist
	elementTimeout: 5000,					// Timeout for waiting for element (ms)

	// Positioning Options
	placement: "bottom",					// "top", "bottom", "left", "right", "center"
	offset: [0, 10],						// Offset [x, y] from target element
	arrow: true,							// Show arrow pointing to target

	// Display Options
	width: 320,								// Fixed width (optional)
	maxWidth: 400,							// Maximum width
	showTitle: true,						// Show step title
	showStepNumber: true,					// Show step number
	showProgress: true,						// Show progress for this step

	// Interaction Options
	closable: true,							// Allow closing this step
	skippable: true,						// Allow skipping this step
	allowPrevious: true,					// Allow going to previous step

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
	highlight: true,						// Highlight target element
	highlightPadding: 5,					// Padding around highlighted element
	highlightClass: "tour-highlight",		// Custom highlight CSS class

	// Form Integration
	requireForm: false,						// Require form completion
	formSelector: "#onboarding-form",		// Form selector
	formFields: ["name", "email"],			// Required form fields
	validateForm: true,						// Validate form before proceeding
	submitForm: false,						// Submit form when proceeding

	// Custom Actions
	onEnter: null,							// Function called when entering step
	onExit: null,							// Function called when exiting step
	onNext: null,							// Function called on next button click
	onPrevious: null,						// Function called on previous button click
	onSkip: null,							// Function called on skip button click

	// Advanced Options
	backdrop: true,							// Show backdrop
	keyboard: true,							// Enable keyboard navigation
	focus: true,							// Focus on tour element
	scrollTo: true,							// Scroll to target element

	// Conditional Display
	condition: null,						// Function to determine if step should show
	showIf: null,							// Condition for showing step
	hideIf: null,							// Condition for hiding step

	// Timing Options
	delay: 0,								// Delay before showing step (ms)
	duration: 0,							// Auto-advance after duration (0 = disabled)

	// Multi-step Grouping
	group: null,							// Group identifier
	dependencies: [],						// Array of step IDs this depends on
}
```

## Usage Examples

### Basic Tour Setup

```javascript
// Initialize tour manager
const tour = new TourManager({
	tourId: "welcome-tour",
	showProgress: true,
	theme: "primary"
});

// Add steps
tour.addStep({
	id: "step-1",
	target: "#main-menu",
	title: "Navigation Menu",
	content: "This is your main navigation menu...",
	placement: "bottom"
});

tour.addStep({
	id: "step-2",
	target: "#user-profile",
	title: "Your Profile",
	content: "Click here to manage your profile...",
	placement: "left"
});

// Start the tour
tour.start();
```

### Multi-Page Tour

```javascript
const tour = new TourManager({
	tourId: "multi-page-tour",
	crossPageEnabled: true,
	preserveProgress: true
});

tour.addStep({
	id: "dashboard-step",
	page: "/dashboard",
	target: "#dashboard-widget",
	title: "Dashboard Overview",
	content: "This is your main dashboard..."
});

tour.addStep({
	id: "settings-step",
	page: "/settings",
	target: "#settings-panel",
	title: "Settings Panel",
	content: "Configure your preferences here..."
});
```

### Form Integration

```javascript
tour.addStep({
	id: "profile-form-step",
	target: "#profile-form",
	title: "Complete Your Profile",
	content: "Please fill out your profile information:",
	requireForm: true,
	formSelector: "#profile-form",
	formFields: ["firstName", "lastName", "email"],
	validateForm: true,
	onNext: function(step, form) {
		// Custom validation or processing
		if (form.isValid()) {
			return true; // Allow proceeding
		}
		return false; // Block proceeding
	}
});
```

## API Methods

### TourManager Methods

- `start()` - Start the tour
- `stop()` - Stop the tour
- `pause()` - Pause the tour
- `resume()` - Resume the tour
- `goToStep(stepId)` - Navigate to specific step
- `nextStep()` - Go to next step
- `previousStep()` - Go to previous step
- `addStep(stepConfig)` - Add a new step
- `removeStep(stepId)` - Remove a step
- `getCurrentStep()` - Get current step information
- `getProgress()` - Get tour progress information
- `reset()` - Reset tour to beginning

### Events

- `tour:start` - Tour started
- `tour:complete` - Tour completed
- `tour:skip` - Tour skipped
- `step:enter` - Step entered
- `step:exit` - Step exited
- `step:change` - Step changed
- `form:submit` - Form submitted in step
- `form:validate` - Form validated in step

## CSS Classes

- `.tour-backdrop` - Backdrop overlay
- `.tour-highlight` - Element highlighting
- `.tour-tooltip` - Tooltip container
- `.tour-progress` - Progress indicator
- `.tour-step-content` - Step content area
- `.tour-buttons` - Button container
- `.tour-arrow` - Tooltip arrow