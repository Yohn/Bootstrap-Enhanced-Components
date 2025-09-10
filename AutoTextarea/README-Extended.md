I've created a comprehensive AutoTextarea component for Bootstrap 5.3 that automatically adjusts textarea height based on content. Here's what I've built:

### **Key Features Implemented:**

1. **Automatic Height Adjustment** - Smoothly resizes as users type
2. **Configurable Constraints** - Min/max height limits with scroll fallback
3. **Bootstrap 5.3 Integration** - Uses BS5 CSS variables and design system
4. **Dark Mode Support** - Full compatibility with Bootstrap's dark theme
5. **### **Key Features Implemented:** (continued)

5. **Animation Control** - Customizable transition speeds with reduced motion support
6. **Event System** - Custom events for resize, max height, and min height states
7. **Accessibility** - High contrast mode, keyboard navigation, screen reader friendly
8. **Form Integration** - Works seamlessly with Bootstrap forms, validation states, and input groups

### **Technical Implementation:**

**Class-Based Architecture:**
- Object-oriented design with customizable options via JSON configuration
- Static methods for batch initialization and utility functions
- Proper cleanup and destroy methods for memory management

**Smart Resize Logic:**
- Uses hidden clone technique for accurate height calculation
- Accounts for padding, borders, and line height in measurements
- ResizeObserver integration for external changes detection
- Debounced resize operations to prevent performance issues

**Bootstrap 5.3 Integration:**
- Leverages CSS custom properties (--bs-* variables)
- Supports all Bootstrap form components and validation states
- Compatible with input groups, floating labels, and size variants
- Maintains Bootstrap's design consistency across themes

### **Configuration Options Available:**

```javascript
{
	minHeight: 60,           // Minimum height in pixels
	maxHeight: 400,          // Maximum before scrolling
	padding: 12,             // Padding adjustments
	lineHeight: 1.5,         // Line height multiplier
	borderWidth: 1,          // Border consideration
	animationSpeed: 150,     // Transition duration
	scrollThreshold: 0.9,    // When to enable scrolling
	enableAnimation: true,   // Animation toggle
	autoFocus: false,        // Auto focus on init
	placeholder: null,       // Custom placeholder
	maxLength: null,         // Character limit
	onResize: null,          // Resize callback
	onMaxHeight: null        // Max height callback
}
```

### **Usage Examples:**

**Basic Usage:**
```javascript
const autoTextarea = new AutoTextarea('#my-textarea');
```

**Advanced Configuration:**
```javascript
const autoTextarea = new AutoTextarea('.message-box', {
	minHeight: 80,
	maxHeight: 250,
	animationSpeed: 200,
	onResize: (height) => console.log(`New height: ${height}px`),
	onMaxHeight: () => showWarning('Maximum height reached')
});
```

**Batch Initialization:**
```javascript
AutoTextarea.initializeAll('.auto-resize', {
	minHeight: 60,
	maxHeight: 300
});
```

### **File Structure Created:**

```
AutoTextarea/
├── README.md                 # Complete documentation
├── Example.html             # Bootstrap 5.3 dark mode demo
├── js/
│   └── AutoTextarea.js      # Main component class
├── scss/
│   └── autotextarea.scss    # SCSS with BS5 variables
│   └── autotextarea.css     # Compiled CSS
└── ExampleJS/
    └── demo.js              # Interactive demo functionality
```

### **Advanced Features:**

**Event System:**
- `autotextarea:resize` - Fired on height changes
- `autotextarea:maxheight` - Fired when max height reached
- `autotextarea:minheight` - Fired when returning to min height
- `autotextarea:initialized` - Fired after setup complete

**Methods Available:**
- `resize()` - Manual resize trigger
- `setMinHeight(height)` - Dynamic min height update
- `setMaxHeight(height)` - Dynamic max height update
- `updateOptions(options)` - Live configuration changes
- `reset()` - Clear content and return to min height
- `destroy()` - Complete cleanup and restoration
- `getHeight()` - Get current calculated height

**Responsive & Accessible:**
- Respects `prefers-reduced-motion` for accessibility
- High contrast mode support
- Custom scrollbar styling for both light and dark themes
- Print-friendly styles
- Mobile-responsive design

### **Demo Page Highlights:**

The example page showcases:
- **Basic Implementation** with default settings
- **Configuration Examples** showing different constraint combinations
- **Interactive Controls** for live option adjustment
- **Form Integration** demonstrating real-world usage
- **Theme Toggle** showing dark/light mode compatibility
- **Keyboard Shortcuts** (Ctrl+R to reset, Ctrl+T for theme)

This component provides a production-ready solution that enhances Bootstrap 5.3 forms with intelligent textarea behavior while maintaining full compatibility with the Bootstrap ecosystem.