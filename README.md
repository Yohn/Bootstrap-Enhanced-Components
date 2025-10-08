# Bootstrap Enhanced Components

A comprehensive collection of advanced Bootstrap 5.3 components and enhancements built with modern JavaScript, providing production-ready solutions for common web development needs.

---
## Install

```bash
npm install yohns-bs5-components
```
---

## 📋 Quick Reference

### ✅ Production Ready (10 Components)

| Component | Demo | Documentation |
|-----------|------|---------------|
| **JSON Table** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/JsonTable/Example.html) | [📖 README](blob/main/JsonTableME.md) |
| **YoBox** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/YoBox/Example.html) | [📖 README](blob/main/YoBoxME.md) |
| **Auto Textarea** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/AutoTextarea/Example.html) | [📖 README](blob/main/AutoTextareaME.md) |
| **Input Mask** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/InputMask/Example.html) | [📖 README](blob/main/InputMaskME.md) |
| **Multi Select** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/MultiSelect/Example.html) | [📖 README](blob/main/MultiSelectME.md) |
| **File Upload Preview** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/FileUploadPreview/Example.html) | [📖 README](blob/main/FileUploadPreviewME.md) |
| **WYSIWYG Editor** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/WysiwygEditor/Example.html) | [📖 README](blob/main/WysiwygEditorME.md) |
| **Toast Alerts** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/ToastAlerts/Example.html) | [📖 README](blob/main/ToastAlertsME.md) |
| **Simple Lightbox** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/SimpleLightbox/Example.html) | [📖 README](blob/main/SimpleLightboxME.md) |
| **Context Menu** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/ContextMenu/Example.html) | [📖 README](blob/main/ContextMenuME.md) |

### 🧪 Needs More Testing (4 Components)

| Component | Demo | Documentation |
|-----------|------|---------------|
| **Human Verified** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/BehaviorTracker/HumanVerified.html) | [📖 README](blob/main/BehaviorTrackerME.md) |
| **Behavior Tracker** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/BehaviorTracker/Example.html) | [📖 README](blob/main/BehaviorTrackerME.md) |
| **Multi Level Dropdown** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/MultiLevelDropdown/Example.html) | [📖 README](blob/main/MultiLevelDropdownME.md) |
| **Onboarding Tour** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/OnboardingTour/Example.html) | [📖 README](blob/main/OnboardingTourME.md) |

### 🔧 Needs Improvements (2 Components)

| Component | Demo | Documentation |
|-----------|------|---------------|
| **Rate Limiter** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/RateLimiter/Example.html) | [📖 README](blob/main/RateLimiterME.md) |
| **Image Lightbox** | [🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/ImageLightbox/Example.html) | [📖 README](blob/main/ImageLightboxME.md) |

---

## 🚀 Overview

This project extends Bootstrap 5.3.7 with custom components that maintain full compatibility with Bootstrap's design system while adding powerful functionality. All components are built using object-oriented JavaScript with customizable JSON configurations, following Bootstrap's conventions and accessibility standards.

---

## 📦 Component Details

### ✅ Production Ready (10 Components)

#### [JSON Table](https://yohn.github.io/Bootstrap-Enhanced-Components/JsonTable/Example.html)
*Advanced data tables without jQuery - sorting, filtering, pagination, and inline editing*

A lightweight yet powerful data table implementation that rivals DataTables functionality with pure vanilla JavaScript. Features global search, column-specific filtering, sortable columns, customizable pagination, and built-in row editing capabilities. Less than 600 lines of code with zero dependencies beyond Bootstrap.

- **Key Features**: JSON data loading, global/column search, custom sort functions, inline editing, dynamic pagination, rows per page selector
- **Use Cases**: Admin panels, data dashboards, reporting interfaces, content management, user directories
- **Special Features**: Floating labels in edit modals, toast notifications, event system for all actions, custom sort functions for dates/currency
- **[📖 Documentation](blob/main/JsonTableME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/JsonTable/Example.html)**

#### [YoBox](https://yohn.github.io/Bootstrap-Enhanced-Components/YoBox/Example.html)
*Modern Bootstrap modal dialogs - a vanilla JS replacement for Bootbox*

Pure JavaScript modal dialog system that provides alert, confirm, and prompt dialogs using Bootstrap 5.3 modals. No jQuery dependency, fully customizable with support for dynamic content, custom buttons, and internationalization. Perfect drop-in replacement for Bootbox with a cleaner API.

- **Key Features**: Alert/confirm/prompt dialogs, custom buttons, nested modals, i18n support, promise-based API, various input types
- **Use Cases**: User confirmations, form prompts, notifications, interactive dialogs, input collection
- **Input Types**: text, textarea, email, number, password, select, checkbox, radio
- **[📖 Documentation](blob/main/YoBoxME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/YoBox/Example.html)**

#### [Auto Textarea](https://yohn.github.io/Bootstrap-Enhanced-Components/AutoTextarea/Example.html)
*Automatically adjusts textarea height based on content*

Smart textarea component that dynamically resizes as users type, providing a better user experience for content input. Features smooth animations, configurable constraints, and full Bootstrap integration with support for reduced motion preferences.

- **Key Features**: Auto-resizing, min/max height limits, smooth animations, form validation integration, scroll threshold management
- **Use Cases**: Message forms, comment boxes, content management systems, feedback forms
- **Accessibility**: Respects prefers-reduced-motion, high contrast mode support, proper ARIA attributes
- **[📖 Documentation](blob/main/AutoTextareaME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/AutoTextarea/Example.html)**

#### [Input Mask](https://yohn.github.io/Bootstrap-Enhanced-Components/InputMask/Example.html)
*Real-time input formatting with pattern validation*

Powerful input masking component that formats user input in real-time with customizable patterns, built-in presets for common formats, and comprehensive validation features. Includes Luhn algorithm for credit card validation.

- **Key Features**: Real-time formatting, built-in patterns (phone, SSN, credit card, date, time), custom validation, Bootstrap integration
- **Use Cases**: Forms with formatted inputs, payment forms, contact information, data entry, international phone numbers
- **Built-in Patterns**: US/International phone, SSN, credit cards, dates, times, postal codes, IP addresses
- **[📖 Documentation](blob/main/InputMaskME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/InputMask/Example.html)**

#### [Multi Select](https://yohn.github.io/Bootstrap-Enhanced-Components/MultiSelect/Example.html)
*Advanced multi-selection dropdown with search and grouping*

Sophisticated multi-select dropdown component with search functionality, option grouping, custom rendering, and extensive customization options for complex selection interfaces. Supports virtual scrolling for large datasets.

- **Key Features**: Search filtering, option grouping, custom renderers, tag display, bulk operations, keyboard navigation
- **Use Cases**: Multi-choice forms, filter interfaces, user permissions, category selection, tag management
- **Advanced Options**: Maximum selections, sort selected to top, select all/none, disabled options
- **[📖 Documentation](blob/main/MultiSelectME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/MultiSelect/Example.html)**

#### [File Upload Preview](https://yohn.github.io/Bootstrap-Enhanced-Components/FileUploadPreview/Example.html)
*Enhanced file upload with visual previews and validation*

Comprehensive file upload enhancement that provides visual previews for images and videos, file validation, and management capabilities with full Bootstrap integration. Supports drag-and-drop, multiple files, and various display modes.

- **Key Features**: Visual previews, file validation, multiple display modes (list/grid), file management, type detection
- **Use Cases**: Media uploads, document management, profile pictures, content creation, gallery uploads
- **Supported Types**: Images (JPG, PNG, GIF, WebP), Videos (MP4, WebM, AVI), Documents (PDF, DOCX, XLSX), Archives
- **[📖 Documentation](blob/main/FileUploadPreviewME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/FileUploadPreview/Example.html)**

#### [WYSIWYG Editor](https://yohn.github.io/Bootstrap-Enhanced-Components/WysiwygEditor/Example.html)
*Full-featured rich text editor with Bootstrap 5.3 integration*

A fully-featured, modular WYSIWYG editor built with vanilla JavaScript. Includes text formatting, tables, media insertion, code view, fullscreen mode, autosave, and comprehensive HTML sanitization for security. Completely customizable toolbar.

- **Key Features**: Rich text formatting, table support, media insertion, autosave, code view, XSS prevention, undo/redo
- **Use Cases**: Content management, blog editors, messaging systems, form builders, documentation
- **Security**: XSS prevention, HTML sanitization, tag whitelisting, URL validation, safe paste handling
- **[📖 Documentation](blob/main/WysiwygEditorME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/WysiwygEditor/Example.html)**

#### [Toast Alerts](https://yohn.github.io/Bootstrap-Enhanced-Components/ToastAlerts/Example.html)
*Advanced toast notification system with dynamic creation and queue management*

Comprehensive toast notification system that extends Bootstrap's native toasts with dynamic creation, intelligent queueing, multiple positioning options, and advanced interaction features. Includes touch gestures and progress indicators.

- **Key Features**: Dynamic creation, priority queueing, 7 position options, touch gestures, progress indicators, keyboard navigation
- **Use Cases**: User notifications, status updates, feedback messages, alert systems, real-time updates
- **Accessibility**: WCAG 2.1 compliant, ARIA live regions, screen reader support, reduced motion support
- **[📖 Documentation](blob/main/ToastAlertsME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/ToastAlerts/Example.html)**

#### [Simple Lightbox](https://yohn.github.io/Bootstrap-Enhanced-Components/SimpleLightbox/Example.html)
*Lightweight image lightbox with gallery support*

Feature-rich yet lightweight image lightbox component with gallery support, zoom functionality, and mobile-friendly touch interactions for showcasing images. Clean, minimalist design that works on all devices.

- **Key Features**: Gallery support, zoom functionality, touch/swipe gestures, keyboard navigation, responsive design
- **Use Cases**: Image galleries, product showcases, portfolio displays, photo viewers, media presentations
- **Interactions**: Hover zoom preview, mouse wheel zoom, pinch-to-zoom, swipe navigation, keyboard shortcuts
- **[📖 Documentation](blob/main/SimpleLightboxME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/SimpleLightbox/Example.html)**

#### [Context Menu](https://yohn.github.io/Bootstrap-Enhanced-Components/ContextMenu/Example.html)
*Feature-rich right-click context menus with submenu support*

Flexible context menu component that supports right-click, click, and hover triggers. Includes nested submenus, dynamic content generation, conditional rendering, and element-specific data fetching for context-aware menus.

- **Key Features**: Multiple trigger events, nested submenus, dynamic items, conditional visibility, Font Awesome icons
- **Use Cases**: Data tables, file managers, admin interfaces, custom toolbars, interactive applications
- **Advanced**: Element-specific data, isShown/isEnabled callbacks, custom styling functions, multiple positioning
- **[📖 Documentation](blob/main/ContextMenuME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/ContextMenu/Example.html)**

---

### 🧪 Needs More Testing (4 Components)

#### [Human Verified](BehaviorTracker/HumanVerified.html)
*Advanced bot detection and human verification for forms*

Sophisticated form verification system that uses behavior analysis, typing patterns, mouse movements, and timing to distinguish humans from bots without requiring CAPTCHAs. Non-intrusive security layer.

- **Key Features**: Behavior tracking, typing pattern analysis, mouse movement detection, timing validation, bot fingerprinting
- **Use Cases**: Form security, bot prevention, signup protection, authentication, spam prevention
- **Detection Methods**: Typing rhythm, mouse trajectories, interaction timing, automation flags
- **[📖 Documentation](blob/main/BehaviorTrackerME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/BehaviorTracker/HumanVerified.html)**

#### [Behavior Tracker](https://yohn.github.io/Bootstrap-Enhanced-Components/BehaviorTracker/Example.html)
*Comprehensive user behavior tracking and analytics*

Advanced behavior tracking system that monitors user interactions, form engagement, and page analytics with built-in bot detection and human verification capabilities. Privacy-focused with configurable tracking levels.

- **Key Features**: Interaction tracking, form analytics, heatmap generation, engagement metrics, privacy controls
- **Use Cases**: User analytics, form optimization, UX research, conversion tracking, A/B testing
- **Metrics**: Click tracking, scroll depth, time on page, form field interactions, navigation patterns
- **[📖 Documentation](blob/main/BehaviorTrackerME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/BehaviorTracker/Example.html)**

#### [Multi Level Dropdown](https://yohn.github.io/Bootstrap-Enhanced-Components/MultiLevelDropdown/Example.html)
*Bootstrap-compatible multi-level dropdown navigation*

Advanced dropdown component that extends Bootstrap's dropdown with multi-level navigation support, responsive behavior, and intelligent positioning for complex menu structures. Handles hover and click triggers.

- **Key Features**: Nested menu levels, responsive collapse, hover/click triggers, smart positioning, mobile optimization
- **Use Cases**: Complex navigation menus, category trees, hierarchical data display, mega menus
- **Responsive**: Auto-collapses on mobile, adjusts direction based on viewport, handles nested levels gracefully
- **[📖 Documentation](blob/main/MultiLevelDropdownME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/MultiLevelDropdown/Example.html)**

#### [Onboarding Tour](https://yohn.github.io/Bootstrap-Enhanced-Components/OnboardingTour/Example.html)
*Interactive user onboarding and feature tours*

Comprehensive onboarding tour system with multi-page support, form integration, progress tracking, and customizable styling to guide users through applications and features. Remembers user progress.

- **Key Features**: Multi-page tours, form integration, progress indicators, responsive design, keyboard navigation, storage
- **Use Cases**: User onboarding, feature introduction, tutorial systems, guided workflows, product demos
- **Integration**: Form validation, multi-step processes, conditional steps, custom callbacks
- **[📖 Documentation](blob/main/OnboardingTourME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/OnboardingTour/Example.html)**

---

### 🔧 Needs Improvements (2 Components)

#### [Rate Limiter](https://yohn.github.io/Bootstrap-Enhanced-Components/RateLimiter/Example.html)
*Client-side rate limiting for API calls*

Client-side rate limiting system with queue management, backoff strategies, and priority handling for API calls and form submissions. Prevents API abuse and manages request throttling.

- **Status**: Under development - API refinements and UI improvements needed
- **Planned Features**: Exponential backoff, request priority, queue visualization, metrics tracking
- **[📖 Documentation](blob/main/RateLimiterME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/RateLimiter/Example.html)**

#### [Image Lightbox](https://yohn.github.io/Bootstrap-Enhanced-Components/ImageLightbox/Example.html)
*Advanced image lightbox with zoom and slideshow*

Feature-rich image lightbox with advanced zoom functionality, slideshow capabilities, thumbnail navigation, and extensive customization options. More advanced than Simple Lightbox.

- **Status**: Under development - performance optimizations and feature stabilization needed
- **Planned Features**: Advanced zoom controls, slideshow transitions, thumbnail strip, fullscreen mode
- **[📖 Documentation](blob/main/ImageLightboxME.md)** | **[🎯 Demo](https://yohn.github.io/Bootstrap-Enhanced-Components/ImageLightbox/Example.html)**

---

## 🏗️ Architecture

### Design Principles

- **Tab Indentation**: All code uses tabs for consistent formatting
- **Object-Oriented Design**: Clean class-based architecture with proper encapsulation
- **JSON Configuration**: Customizable options via JSON objects for easy integration
- **Bootstrap Integration**: Uses Bootstrap 5.3 CSS variables for seamless theming
- **Accessibility First**: WCAG 2.1 compliant with screen reader support
- **Performance Optimized**: Efficient DOM manipulation and event handling
- **Vanilla JavaScript**: No jQuery or other dependencies required

### Project Structure

Each component follows a standardized directory structure:

```
ComponentName/
├── README.md              # Complete documentation
├── Example.html          # Bootstrap 5.3 dark mode demo
├── js/
│   └── ComponentName.js  # Main component class
├── scss/
│   └── _component.scss   # SCSS using Bootstrap variables
└── ExampleJS/
    └── demo.js           # Demo-specific functionality
```

---

## 🚀 Quick Start

### Basic Installation

1. **Include Bootstrap 5.3.7:**
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
```

2. **Include Component Files:**
```html
<!-- Component CSS -->
<link href="ComponentName/scss/_component.css" rel="stylesheet">

<!-- Component JavaScript -->
<script src="ComponentName/js/ComponentName.js"></script>
```

3. **Initialize Component:**
```javascript
// Basic initialization
const component = new ComponentName('#element');

// With custom options
const component = new ComponentName('#element', {
	option1: 'value1',
	option2: true,
	callbacks: {
		onEvent: (data) => console.log(data)
	}
});
```

### Configuration Pattern

All components follow a consistent configuration pattern:

```javascript
const component = new ComponentName(selector, {
	// Core options
	enabled: true,
	theme: 'default',

	// Feature toggles
	feature1: true,
	feature2: false,

	// Customization
	customClass: '',
	customTemplate: null,

	// Event callbacks
	callbacks: {
		onInit: null,
		onChange: null,
		onDestroy: null
	}
});
```

---

## 🎨 Theming

### Bootstrap Integration

Components seamlessly integrate with Bootstrap's theming system:

- **CSS Variables**: All styling uses Bootstrap's CSS custom properties
- **Dark Mode**: Full support for Bootstrap's dark mode via `data-bs-theme`
- **Color System**: Consistent with Bootstrap's color palette
- **Responsive**: Built with Bootstrap's responsive breakpoints

### Custom Themes

Create custom themes by overriding CSS variables:

```css
:root {
	--bs-primary: #your-color;
	--bs-secondary: #your-color;
	/* Component-specific variables */
	--component-bg: var(--bs-body-bg);
	--component-border: var(--bs-border-color);
}

[data-bs-theme="dark"] {
	--component-bg: var(--bs-dark);
}
```

---

## ♿ Accessibility

### Standards Compliance

- **WCAG 2.1 AA**: All components meet accessibility guidelines
- **Section 508**: Government accessibility standards
- **ARIA Support**: Proper ARIA labels, roles, and states
- **Keyboard Navigation**: Full keyboard accessibility

### Accessibility Features

- Screen reader announcements via ARIA live regions
- High contrast mode support
- Reduced motion preferences (`prefers-reduced-motion`)
- Focus management and visible focus indicators
- Semantic HTML structure
- Proper tab order and focus trapping

---

## 🔧 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **iOS Safari**: 12+
- **Android Chrome**: 60+

Modern browser with ES6+ support required.

---

## 📚 Documentation

### Component Documentation

Each component includes comprehensive documentation:

- **Getting Started**: Quick setup guide
- **Configuration Options**: All available options with detailed descriptions
- **API Reference**: Methods, events, and properties
- **Usage Examples**: Common use cases and patterns
- **Accessibility**: Accessibility features and considerations
- **Browser Support**: Compatibility information

### Code Standards

All components follow these standards:

- **Tab Indentation**: Consistent 4-space tab indentation
- **OOP Principles**: Encapsulation, inheritance, polymorphism
- **JSDoc Comments**: Comprehensive code documentation
- **Bootstrap Conventions**: Follows Bootstrap's naming patterns
- **ES6+ Syntax**: Modern JavaScript features

---

## 🤝 Contributing

### Development Guidelines

1. **Code Standards**:
	- Use tab indentation
	- Follow OOP principles
	- Use Bootstrap 5.3 conventions
	- Add JSDoc comments

2. **Testing**:
	- Test in all supported browsers
	- Validate accessibility compliance
	- Test with keyboard navigation
	- Test dark mode compatibility

3. **Documentation**:
	- Update README files
	- Include usage examples
	- Document all configuration options
	- Add inline code comments

### Getting Started

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the coding standards
4. Add tests for new features
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

---

## 📄 License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Yohn/Bootstrap-Enhanced-Components/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Yohn/Bootstrap-Enhanced-Components/discussions)

---

## 🎯 Roadmap

### Improvements

- **Performance**: Further optimization for mobile devices
- **Accessibility**: Enhanced screen reader support and ARIA implementation
- **Testing**: Comprehensive automated testing suite
- **Documentation**: Interactive documentation site with live code examples
- **TypeScript**: TypeScript definitions for all components
- **Internationalization**: Multi-language support across all components

### Future Components

- **Date Picker**: Advanced date/time selection with range support
- **Charts**: Data visualization components using Chart.js
- **Form Builder**: Dynamic form generation with validation
- **Kanban Board**: Drag-and-drop task management
- **Notification Center**: Centralized notification management

---

## 📊 Component Statistics

| Category | Count | Percentage |
|----------|-------|------------|
| Production Ready | 10 | 62.5% |
| Needs Testing | 4 | 25% |
| Needs Improvements | 2 | 12.5% |
| **Total** | **16** | **100%** |

---

**Built with ❤️ for the Bootstrap community**