Finally, let me create a utility class for advanced pattern operations:## Summary

I've created a comprehensive InputMask component for Bootstrap 5.3 with the following structure and features:

### 📁 **File Structure Created:**

1. **`InputMask.js`** - Main component class with full masking functionality
2. **`PatternHelpers.js`** - Utility class with presets and helper methods
3. **`InputValidator.js`** - Advanced validation utilities
4. **`_inputmask.scss`** - Bootstrap-integrated styling with CSS variables
5. **`demo.js`** - Interactive demo functionality
6. **`README.md`** - Comprehensive documentation
7. **`Example.html`** - Full demo page with dark mode support

### 🎯 **Key Features Implemented:**

**Core Functionality:**
- ✅ Real-time input formatting with customizable patterns
- ✅ Tab-indented, OOP JavaScript classes
- ✅ JSON-configurable options for all settings
- ✅ Built-in patterns (phone, SSN, credit card, date, etc.)
- ✅ Custom pattern support with validation

**Configuration Options (All Available):**
- ✅ `pattern`: mask pattern (e.g., "(999) 999-9999")
- ✅ `placeholder`: placeholder character ('_', '*')
- ✅ `allowIncomplete`: accept partial entries
- ✅ `stripMask`: remove mask characters on form submit
- ✅ `customPatterns`: define custom pattern characters
- ✅ `validateOnBlur`: validate when focus leaves
- ✅ `showMaskOnFocus`: show mask template on focus
- ✅ Plus 10+ additional advanced options

**Bootstrap 5.3 Integration:**
- ✅ Dark mode support using CSS variables
- ✅ Form validation classes (is-valid, is-invalid)
- ✅ Input groups and floating labels compatibility
- ✅ Size variants (sm, default, lg)
- ✅ Accessibility features

**Advanced Features:**
- ✅ Luhn algorithm credit card validation
- ✅ International phone number support
- ✅ IP address and MAC address validation
- ✅ Date/time validation with range checking
- ✅ Pattern auto-detection
- ✅ Event callbacks for all interactions
- ✅ API methods (setValue, getValue, validate, clear, destroy)

### 🚀 **Usage Examples:**

**Simple initialization:**
```javascript
new InputMask('#phone', { pattern: '(999) 999-9999' });
```

**Using presets:**
```javascript
new InputMask('#ssn', PatternHelpers.getPreset('ssn'));
```

**Data attribute initialization:**
```html
<input data-mask="phone" data-mask-validateonblur="true" class="form-control">
```

The component follows all your requirements:
- Tab indentation throughout
- Object-oriented design
- Each feature in separate artifacts
- Bootstrap 5.3 CSS variable integration
- Comprehensive documentation with all option keys
- Dark mode example page
- Complete folder structure as requested

The InputMask component is production-ready and provides a robust foundation for any input formatting needs in Bootstrap applications.