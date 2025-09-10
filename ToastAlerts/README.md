# ToastAlerts - Advanced Bootstrap 5.3 Toast Component

A comprehensive, accessible, and feature-rich toast notification system built for Bootstrap 5.3. ToastAlerts extends Bootstrap's native toast functionality with dynamic creation, advanced positioning, intelligent queueing, and extensive customization options.

## 🚀 Features

### Core Functionality
- **Dynamic Toast Creation** - Generate toasts programmatically without pre-existing HTML
- **Smart Queue Management** - Intelligent queueing with priority-based ordering
- **Multiple Positioning** - 7 predefined positions plus custom positioning
- **Rich Animation System** - 5+ animation types with accessibility support
- **Progress Indicators** - Visual progress bars with timing controls
- **Persistent Toasts** - Manual dismissal mode for critical notifications

### Advanced Features
- **Touch Gesture Support** - Swipe-to-dismiss for mobile devices
- **Keyboard Navigation** - Full keyboard accessibility with focus management
- **Screen Reader Support** - ARIA live regions and announcements
- **Event System** - Comprehensive event callbacks and custom events
- **Template Engine** - Flexible templating with conditional rendering
- **Theme Integration** - Seamless Bootstrap 5.3 theme support

### Accessibility & UX
- **WCAG 2.1 Compliant** - Full accessibility standards compliance
- **Reduced Motion Support** - Respects user motion preferences
- **High Contrast Mode** - Enhanced visibility for accessibility needs
- **Focus Management** - Proper focus handling and keyboard navigation
- **Internationalization Ready** - Configurable text and ARIA labels

## 📦 Installation

### Basic Setup

1. Include Bootstrap 5.3.7 and Bootstrap Icons:
```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.7/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.7/js/bootstrap.bundle.min.js"></script>
```

2. Include ToastAlerts files:
```html
<!-- CSS -->
<link href="scss/toast-alerts.css" rel="stylesheet">
<link href="scss/toast-animations.css" rel="stylesheet">
<link href="scss/toast-themes.css" rel="stylesheet">

<!-- JavaScript -->
<script src="js/ToastQueue.js"></script>
<script src="js/ToastAnimations.js"></script>
<script src="js/ToastTemplates.js"></script>
<script src="js/ToastAlerts.js"></script>
```

3. Initialize:
```javascript
const toastAlerts = new ToastAlerts();
toastAlerts.show('Welcome to ToastAlerts!');
```

## 🎯 Quick Start

### Basic Usage

```javascript
// Simple toast
toastAlerts.show('Operation completed successfully!');

// Toast with type
toastAlerts.show('Error occurred!', { type: 'error' });

// Toast with full options
toastAlerts.show('Custom notification', {
	type: 'success',
	title: 'Success',
	position: 'top-center',
	duration: 3000,
	animation: 'bounce'
});
```

### Configuration Options

```javascript
const toastAlerts = new ToastAlerts({
	position: 'top-right',        // Toast position
	duration: 5000,               // Auto-hide duration (ms)
	type: 'info',                 // Default toast type
	maxVisible: 5,                // Maximum visible toasts
	animation: 'slide',           // Animation type
	animationDuration: 300,       // Animation duration (ms)
	clickToClose: true,           // Click to close
	swipeToDismiss: true,         // Swipe to dismiss
	progressBar: true,            // Show progress bar
	persistent: false,            // Manual dismissal only
	pauseOnHover: true,           // Pause timer on hover
	pauseOnFocus: true,           // Pause timer on focus
	showIcon: true,               // Show type icon
	showCloseButton: true,        // Show close button
	zIndex: 1055,                 // CSS z-index
	offset: { x: 20, y: 20 },     // Position offset
	customClass: '',              // Additional CSS classes
	ariaLive: 'polite',           // ARIA live region type
	html: false,                  // Allow HTML content
	template: null,               // Custom template
	priority: 0,                  // Queue priority
	callbacks: {                  // Event callbacks
		beforeShow: null,
		shown: null,
		beforeHide: null,
		hidden: null,
		paused: null,
		resumed: null
	}
});
```

## 📍 Positioning

### Predefined Positions
- `top-left` - Top left corner
- `top-center` - Top center
- `top-right` - Top right corner (default)
- `center` - Screen center
- `bottom-left` - Bottom left corner
- `bottom-center` - Bottom center
- `bottom-right` - Bottom right corner

### Custom Positioning
```javascript
// Custom offset
toastAlerts.show('Custom position', {
	position: 'top-right',
	offset: { x: 50, y: 100 }
});
```

## 🎨 Toast Types

### Built-in Types
- `success` - Green success notifications
- `error` - Red error notifications
- `warning` - Yellow warning notifications
- `info` - Blue informational notifications
- `default` - Neutral notifications

### Type Configuration
Each type includes:
- **Icon** - Bootstrap icon class
- **Background** - Bootstrap background class
- **Color scheme** - Text and border colors

## ✨ Animations

### Animation Types
- `slide` - Slide in from the side
- `fade` - Simple fade in/out
- `bounce` - Bouncy entrance effect
- `zoom` - Scale in/out effect
- `flip` - 3D flip animation
- `none` - No animation

### Animation Settings
```javascript
toastAlerts.show('Animated toast', {
	animation: 'bounce',
	animationDuration: 600
});
```

### Accessibility
- Automatically uses `fade` animation for users with `prefers-reduced-motion`
- Reduced animation duration for accessibility
- Smooth 60fps animations with proper easing

## 🎭 Templates

### Built-in Templates
- `default` - Standard toast layout
- `minimal` - Compact design
- `detailed` - Rich header/body layout
- `action` - Includes action buttons
- `progress` - Progress indicator display

### Custom Templates
```javascript
// Register custom template
toastAlerts.templates.register('custom', `
	<div class="toast {{bgClass}}" role="alert">
		<div class="toast-body">
			{{#showIcon}}<i class="{{iconClass}} me-2"></i>{{/showIcon}}
			<strong>{{title}}</strong>
			<p>{{content}}</p>
		</div>
	</div>
`);

// Use custom template
toastAlerts.show('Custom content', {
	template: 'custom',
	title: 'Custom Title'
});
```

### Template Variables
- `{{content}}` - Toast content
- `{{title}}` - Toast title
- `{{iconClass}}` - Icon CSS class
- `{{bgClass}}` - Background CSS class
- `{{timestamp}}` - Formatted timestamp
- `{{progress}}` - Progress percentage
- `{{duration}}` - Duration in milliseconds

### Conditional Rendering
```html
{{#showIcon}}
	<i class="{{iconClass}}"></i>
{{/showIcon}}

{{^persistent}}
	<div class="toast-progress-bar"></div>
{{/persistent}}

{{#actions}}
	<button data-action="{{action}}">{{label}}</button>
{{/actions}}
```

## 🎛️ API Reference

### Main Methods

#### `show(content, options)`
Display a new toast notification.

**Parameters:**
- `content` (string|object) - Toast content or full options object
- `options` (object) - Configuration options

**Returns:** `string` - Toast ID

```javascript
const toastId = toastAlerts.show('Hello World!', {
	type: 'success',
	duration: 3000
});
```

#### `hide(toastId)`
Hide a specific toast by ID.

**Parameters:**
- `toastId` (string) - Toast ID to hide

**Returns:** `boolean` - Success status

```javascript
toastAlerts.hide(toastId);
```

#### `hideAll()`
Hide all visible toasts.

**Returns:** `number` - Number of toasts hidden

```javascript
const hiddenCount = toastAlerts.hideAll();
```

#### `update(toastId, content, options)`
Update an existing toast.

**Parameters:**
- `toastId` (string) - Toast ID to update
- `content` (string|object) - New content or options
- `options` (object) - New configuration options

**Returns:** `boolean` - Success status

```javascript
toastAlerts.update(toastId, 'Updated content!', {
	type: 'warning'
});
```

#### `getVisible()`
Get all currently visible toasts.

**Returns:** `Array` - Array of visible toast objects

```javascript
const visibleToasts = toastAlerts.getVisible();
console.log(`${visibleToasts.length} toasts visible`);
```

#### `getQueue()`
Get all queued toasts.

**Returns:** `Array` - Array of queued toast objects

```javascript
const queuedToasts = toastAlerts.getQueue();
console.log(`${queuedToasts.length} toasts in queue`);
```

#### `setGlobalDefaults(options)`
Set global default options.

**Parameters:**
- `options` (object) - Default options to set

```javascript
toastAlerts.setGlobalDefaults({
	duration: 3000,
	animation: 'fade',
	position: 'bottom-right'
});
```

#### `destroy()`
Clean up and remove all toasts.

```javascript
toastAlerts.destroy();
```

### Queue Management

#### `ToastQueue` Class
Manages toast queueing and priority ordering.

```javascript
// Access queue directly
const queue = toastAlerts.queue;

// Queue methods
queue.add(toastData);           // Add to queue
queue.remove(toastId);          // Remove from queue
queue.getNext(position);        // Get next toast
queue.clear(position);          // Clear queue
queue.getStats();               // Get statistics
queue.updatePriority(id, pri);  // Update priority
```

### Animation System

#### `ToastAnimations` Class
Handles all animation effects.

```javascript
// Access animations directly
const animations = toastAlerts.animations;

// Animation methods
animations.enter(element, type, callback);     // Entrance animation
animations.exit(element, type, callback);      // Exit animation
animations.stop(element);                      // Stop animation
animations.isAnimating(element);               // Check if animating
```

### Template System

#### `ToastTemplates` Class
Manages toast templates and rendering.

```javascript
// Access templates directly
const templates = toastAlerts.templates;

// Template methods
templates.register(name, template, type);      // Register custom template
templates.unregister(name, type);              // Remove template
templates.getTemplate(type, templateType);     // Get template
templates.render(template, options);           // Render template
templates.validate(template);                  // Validate template
```

## 🎪 Events

### Event Types
- `beforeShow.toast-alerts` - Before toast appears
- `shown.toast-alerts` - After toast is fully visible
- `beforeHide.toast-alerts` - Before toast starts hiding
- `hidden.toast-alerts` - After toast is completely hidden
- `paused.toast-alerts` - When timer is paused
- `resumed.toast-alerts` - When timer resumes
- `queueUpdated.toast-alerts` - When queue changes

### Event Handling

```javascript
// Global event listeners
document.addEventListener('shown.toast-alerts', (e) => {
	console.log('Toast shown:', e.detail);
});

document.addEventListener('hidden.toast-alerts', (e) => {
	console.log('Toast hidden:', e.detail);
});

// Callback functions
toastAlerts.show('Hello!', {
	callbacks: {
		beforeShow: (toast) => console.log('About to show:', toast.id),
		shown: (toast) => console.log('Now showing:', toast.id),
		hidden: (toast) => console.log('Hidden:', toast.id)
	}
});
```

### Event Data
Each event includes:
- `id` - Toast unique identifier
- `options` - Toast configuration
- `element` - DOM element (when available)
- `timer` - Timer reference
- `isVisible` - Visibility state
- `isPaused` - Pause state
- `createdAt` - Creation timestamp
- `priority` - Queue priority

## ⌨️ Keyboard Navigation

### Shortcuts
- `Tab` - Focus next toast
- `Shift + Tab` - Focus previous toast
- `Enter` / `Space` - Activate focused toast
- `Escape` - Close focused toast
- `Ctrl/Cmd + Escape` - Close all toasts

### Focus Management
- Toasts are keyboard focusable with `tabindex="0"`
- Focus ring visible on keyboard navigation
- Proper focus order maintained
- Focus restored after toast dismissal

## ♿ Accessibility

### ARIA Support
- **Live Regions** - Automatic screen reader announcements
- **Role Attributes** - Proper semantic roles
- **Labels** - Descriptive ARIA labels
- **States** - Dynamic state announcements

### Standards Compliance
- **WCAG 2.1 AA** - Full compliance
- **Section 508** - Government accessibility standards
- **ADA** - Americans with Disabilities Act compliance

### Accessibility Features
```javascript
toastAlerts.show('Accessible toast', {
	ariaLive: 'assertive',        // Immediate announcement
	title: 'Important Notice',    // Screen reader title
	callbacks: {
		shown: (toast) => {
			// Custom accessibility announcement
			toast.element.setAttribute('aria-describedby', 'help-text');