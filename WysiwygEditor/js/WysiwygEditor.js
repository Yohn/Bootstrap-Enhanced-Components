/**
 * Bootstrap 5.3 WYSIWYG Editor
 * Main editor class that transforms textarea elements into rich text editors
 *
 * @class WysiwygEditor
 * @version 1.0.0
 */
class WysiwygEditor {
	/**
	 * Creates a new WYSIWYG editor instance
	 *
	 * @param {HTMLTextAreaElement} textareaElement - The textarea to transform
	 * @param {Object} options - Configuration options
	 * @param {Array} options.toolbar - Toolbar configuration with button groups
	 * @param {Object} options.height - Height settings {min, max, default}
	 * @param {string} options.placeholder - Placeholder text for empty editor
	 * @param {Object} options.callbacks - Event callbacks {onChange, onFocus, onBlur, onInit, onDestroy}
	 * @param {Object} options.autosave - Autosave configuration {enabled, interval, key}
	 * @param {Array} options.allowedTags - Whitelist of allowed HTML tags
	 * @param {Object} options.paste - Paste handling {mode: 'plain'|'formatted'|'auto', autoClean: boolean}
	 * @param {string} options.theme - Theme mode 'light'|'dark'|'auto'
	 * @param {boolean} options.spellcheck - Enable/disable spellcheck
	 * @param {Object} options.colors - Custom color palette for text/background
	 * @param {Array} options.fonts - Custom font families
	 * @param {boolean} options.resizable - Allow vertical resizing
	 */
	constructor(textareaElement, options = {}) {
		// Validate input
		if (!(textareaElement instanceof HTMLTextAreaElement)) {
			throw new Error('WysiwygEditor: First parameter must be a textarea element');
		}

		// Store references
		this.textarea = textareaElement;
		this.id = this._generateId();

		// Default configuration
		this.config = this._mergeConfig(options);

		// State management
		this.isInitialized = false;
		this.isDirty = false;
		this.currentRange = null;
		this.history = [];
		this.historyStep = -1;

		// Component references
		this.container = null;
		this.editorElement = null;
		this.toolbarElement = null;
		this.statusBar = null;

		// Component instances
		this.toolbar = null;
		this.commandManager = null;
		this.eventManager = null;
		this.storageManager = null;
		this.sanitizer = null;

		// Initialize the editor
		this._init();
	}

	/**
	 * Initialize the editor
	 * @private
	 */
	_init() {
		try {
			// Create editor structure
			this._createEditorStructure();

			// Initialize components
			this._initializeComponents();

			// Setup event listeners
			this._setupEventListeners();

			// Apply initial content
			this._setInitialContent();

			// Mark as initialized
			this.isInitialized = true;

			// Fire init callback
			this._fireCallback('onInit', this);

		} catch (error) {
			console.error('WysiwygEditor: Initialization failed', error);
			this.destroy();
			throw error;
		}
	}

	/**
	 * Generate unique ID for editor instance
	 * @private
	 * @returns {string} Unique identifier
	 */
	_generateId() {
		return `wysiwyg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Merge user options with defaults
	 * @private
	 * @param {Object} options - User provided options
	 * @returns {Object} Merged configuration
	 */
	_mergeConfig(options) {
		const defaults = {
			toolbar: [
				['style', ['style']],
				['font', ['bold', 'italic', 'underline', 'clear']],
				['fontname', ['fontname']],
				['fontsize', ['fontsize']],
				['color', ['color']],
				['para', ['ul', 'ol', 'paragraph']],
				['height', ['height']],
				['table', ['table']],
				['insert', ['link', 'picture', 'video']],
				['view', ['fullscreen', 'codeview', 'help']]
			],
			height: {
				min: 150,
				max: 600,
				default: 300
			},
			placeholder: 'Enter text here...',
			callbacks: {
				onChange: null,
				onFocus: null,
				onBlur: null,
				onInit: null,
				onDestroy: null,
				onPaste: null,
				onKeydown: null,
				onKeyup: null,
				onMouseup: null,
				onImageUpload: null
			},
			autosave: {
				enabled: false,
				interval: 30000, // 30 seconds
				key: null
			},
			allowedTags: [
				'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
				'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
				'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
				'a', 'img', 'video', 'audio', 'iframe',
				'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
				'div', 'span', 'sup', 'sub', 'mark', 'small',
				'hr', 'figure', 'figcaption'
			],
			allowedAttributes: {
				'*': ['class', 'id', 'style'],
				'a': ['href', 'target', 'rel', 'title'],
				'img': ['src', 'alt', 'width', 'height', 'title'],
				'video': ['src', 'width', 'height', 'controls', 'autoplay'],
				'audio': ['src', 'controls', 'autoplay'],
				'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen']
			},
			paste: {
				mode: 'auto', // 'plain', 'formatted', 'auto'
				autoClean: true,
				stripStyles: true,
				stripClasses: true,
				stripIds: true
			},
			theme: 'auto', // 'light', 'dark', 'auto'
			spellcheck: true,
			colors: {
				text: [
					['#000000', '#424242', '#636363', '#9C9C94', '#CEC6CE', '#EFEFEF', '#F7F7F7', '#FFFFFF'],
					['#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF'],
					['#F7C6CE', '#FFE7CE', '#FFEFC6', '#D6EFD6', '#CEDEE7', '#CEE7F7', '#D6D6E7', '#E7D6DE'],
					['#E79C9C', '#FFC69C', '#FFE79C', '#B5D6A5', '#A5C6CE', '#9CC6EF', '#B5A5D6', '#D6A5BD'],
					['#E76363', '#F7AD6B', '#FFD663', '#94BD7B', '#73A5AD', '#6BADDE', '#8C7BC6', '#C67BA5'],
					['#CE0000', '#E79439', '#EFC631', '#6BA54A', '#4A7B8C', '#3984C6', '#634AA5', '#A54A7B'],
					['#9C0000', '#B56308', '#BD9400', '#397B21', '#104A5A', '#085294', '#311873', '#731842']
				],
				background: [
					['#000000', '#424242', '#636363', '#9C9C94', '#CEC6CE', '#EFEFEF', '#F7F7F7', '#FFFFFF'],
					['#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF'],
					['#F7C6CE', '#FFE7CE', '#FFEFC6', '#D6EFD6', '#CEDEE7', '#CEE7F7', '#D6D6E7', '#E7D6DE'],
					['#E79C9C', '#FFC69C', '#FFE79C', '#B5D6A5', '#A5C6CE', '#9CC6EF', '#B5A5D6', '#D6A5BD'],
					['#E76363', '#F7AD6B', '#FFD663', '#94BD7B', '#73A5AD', '#6BADDE', '#8C7BC6', '#C67BA5'],
					['#CE0000', '#E79439', '#EFC631', '#6BA54A', '#4A7B8C', '#3984C6', '#634AA5', '#A54A7B'],
					['#9C0000', '#B56308', '#BD9400', '#397B21', '#104A5A', '#085294', '#311873', '#731842']
				]
			},
			fonts: [
				'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New',
				'Georgia', 'Helvetica', 'Impact', 'Lucida Console',
				'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
			],
			fontSizes: ['8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64'],
			resizable: true,
			focus: false,
			tabSize: 4,
			direction: 'ltr', // 'ltr', 'rtl'
			lineHeights: ['1.0', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0', '2.5', '3.0'],
			shortcuts: true,
			disableDragAndDrop: false,
			maximumImageSize: 5242880, // 5MB
			acceptedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
		};

		// Deep merge function
		const deepMerge = (target, source) => {
			const output = { ...target };
			if (isObject(target) && isObject(source)) {
				Object.keys(source).forEach(key => {
					if (isObject(source[key])) {
						if (!(key in target)) {
							Object.assign(output, { [key]: source[key] });
						} else {
							output[key] = deepMerge(target[key], source[key]);
						}
					} else {
						Object.assign(output, { [key]: source[key] });
					}
				});
			}
			return output;
		};

		const isObject = (item) => {
			return item && typeof item === 'object' && !Array.isArray(item);
		};

		return deepMerge(defaults, options);
	}

	/**
	 * Create the editor DOM structure
	 * @private
	 */
	_createEditorStructure() {
		// Hide original textarea
		this.textarea.style.display = 'none';

		// Create container
		this.container = document.createElement('div');
		this.container.className = 'wysiwyg-editor-container';
		this.container.setAttribute('data-editor-id', this.id);

		// Apply theme
		this._applyTheme();

		// Create toolbar container
		this.toolbarElement = document.createElement('div');
		this.toolbarElement.className = 'wysiwyg-toolbar btn-toolbar';
		this.toolbarElement.setAttribute('role', 'toolbar');

		// Create editor wrapper
		const editorWrapper = document.createElement('div');
		editorWrapper.className = 'wysiwyg-editor-wrapper';

		// Create editable area
		this.editorElement = document.createElement('div');
		this.editorElement.className = 'wysiwyg-editor-content';
		this.editorElement.contentEditable = true;
		this.editorElement.spellcheck = this.config.spellcheck;
		this.editorElement.setAttribute('role', 'textbox');
		this.editorElement.setAttribute('aria-multiline', 'true');
		this.editorElement.setAttribute('aria-label', 'Editor content');
		this.editorElement.style.minHeight = `${this.config.height.min}px`;
		this.editorElement.style.maxHeight = `${this.config.height.max}px`;
		this.editorElement.style.height = `${this.config.height.default}px`;
		this.editorElement.style.direction = this.config.direction;

		// Add placeholder
		if (this.config.placeholder) {
			this.editorElement.setAttribute('data-placeholder', this.config.placeholder);
		}

		// Create status bar
		this.statusBar = document.createElement('div');
		this.statusBar.className = 'wysiwyg-statusbar';

		// Assemble structure
		editorWrapper.appendChild(this.editorElement);
		this.container.appendChild(this.toolbarElement);
		this.container.appendChild(editorWrapper);
		this.container.appendChild(this.statusBar);

		// Insert after textarea
		this.textarea.parentNode.insertBefore(this.container, this.textarea.nextSibling);

		// Add resize handle if enabled
		if (this.config.resizable) {
			this._addResizeHandle();
		}
	}

	/**
	 * Initialize all component instances
	 * @private
	 */
	_initializeComponents() {
		// Initialize toolbar
		if (typeof WysiwygToolbar !== 'undefined') {
			this.toolbar = new WysiwygToolbar(this, this.toolbarElement, this.config.toolbar);
		}

		// Initialize command manager
		if (typeof WysiwygCommandManager !== 'undefined') {
			this.commandManager = new WysiwygCommandManager(this);
		}

		// Initialize event manager
		if (typeof WysiwygEventManager !== 'undefined') {
			this.eventManager = new WysiwygEventManager(this, this.config.callbacks);
		}

		// Initialize storage manager
		if (typeof WysiwygStorageManager !== 'undefined' && this.config.autosave.enabled) {
			this.storageManager = new WysiwygStorageManager(this, this.config.autosave);
		}

		// Initialize sanitizer
		if (typeof WysiwygSanitizer !== 'undefined') {
			this.sanitizer = new WysiwygSanitizer(this.config.allowedTags, this.config.allowedAttributes);
		}
	}

	/**
	 * Setup event listeners
	 * @private
	 */
	_setupEventListeners() {
		// Editor content events
		this.editorElement.addEventListener('input', this._handleInput.bind(this));
		this.editorElement.addEventListener('focus', this._handleFocus.bind(this));
		this.editorElement.addEventListener('blur', this._handleBlur.bind(this));
		this.editorElement.addEventListener('paste', this._handlePaste.bind(this));
		this.editorElement.addEventListener('drop', this._handleDrop.bind(this));
		this.editorElement.addEventListener('dragover', this._handleDragOver.bind(this));
		this.editorElement.addEventListener('keydown', this._handleKeyDown.bind(this));
		this.editorElement.addEventListener('keyup', this._handleKeyUp.bind(this));
		this.editorElement.addEventListener('mouseup', this._handleMouseUp.bind(this));

		// Selection change
		document.addEventListener('selectionchange', this._handleSelectionChange.bind(this));

		// Form submit - sync content
		const form = this.textarea.form;
		if (form) {
			form.addEventListener('submit', this._syncContent.bind(this));
		}
	}

	/**
	 * Set initial content from textarea
	 * @private
	 */
	_setInitialContent() {
		const content = this.textarea.value || '';
		if (content) {
			this.setContent(content);
		} else {
			this._updatePlaceholder();
		}
	}

	/**
	 * Apply theme to editor
	 * @private
	 */
	_applyTheme() {
		let theme = this.config.theme;

		if (theme === 'auto') {
			// Detect system preference
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			theme = prefersDark ? 'dark' : 'light';
		}

		this.container.setAttribute('data-bs-theme', theme);
		this.container.classList.remove('wysiwyg-theme-light', 'wysiwyg-theme-dark');
		this.container.classList.add(`wysiwyg-theme-${theme}`);
	}

	/**
	 * Add resize handle to editor
	 * @private
	 */
	_addResizeHandle() {
		const resizeHandle = document.createElement('div');
		resizeHandle.className = 'wysiwyg-resize-handle';
		resizeHandle.innerHTML = '<span class="resize-grip"></span>';

		let isResizing = false;
		let startY = 0;
		let startHeight = 0;

		const startResize = (e) => {
			isResizing = true;
			startY = e.clientY;
			startHeight = parseInt(window.getComputedStyle(this.editorElement).height, 10);
			document.addEventListener('mousemove', doResize);
			document.addEventListener('mouseup', stopResize);
			e.preventDefault();
		};

		const doResize = (e) => {
			if (!isResizing) return;

			const newHeight = startHeight + (e.clientY - startY);
			if (newHeight >= this.config.height.min && newHeight <= this.config.height.max) {
				this.editorElement.style.height = `${newHeight}px`;
			}
		};

		const stopResize = () => {
			isResizing = false;
			document.removeEventListener('mousemove', doResize);
			document.removeEventListener('mouseup', stopResize);
		};

		resizeHandle.addEventListener('mousedown', startResize);
		this.statusBar.appendChild(resizeHandle);
	}

	/**
	 * Handle input event
	 * @private
	 * @param {Event} event - Input event
	 */
	_handleInput(event) {
		this.isDirty = true;
		this._syncContent();
		this._updatePlaceholder();
		this._updateStatusBar();
		this._fireCallback('onChange', this.getContent());

		// Add to history
		this._addToHistory();
	}

	/**
	 * Handle focus event
	 * @private
	 * @param {Event} event - Focus event
	 */
	_handleFocus(event) {
		this.container.classList.add('focused');
		this._fireCallback('onFocus', event);
	}

	/**
	 * Handle blur event
	 * @private
	 * @param {Event} event - Blur event
	 */
	_handleBlur(event) {
		this.container.classList.remove('focused');
		this._syncContent();
		this._fireCallback('onBlur', event);
	}

	/**
	 * Handle paste event
	 * @private
	 * @param {Event} event - Paste event
	 */
	_handlePaste(event) {
		event.preventDefault();

		const clipboardData = event.clipboardData || window.clipboardData;
		let content = '';

		// Determine paste mode
		const pasteMode = this.config.paste.mode;

		if (pasteMode === 'plain' || (pasteMode === 'auto' && event.shiftKey)) {
			// Plain text paste
			content = clipboardData.getData('text/plain');
			this.insertText(content);
		} else {
			// HTML paste
			content = clipboardData.getData('text/html') || clipboardData.getData('text/plain');

			// Clean content if needed
			if (this.config.paste.autoClean && this.sanitizer) {
				content = this.sanitizer.clean(content, this.config.paste);
			}

			this.insertHTML(content);
		}

		this._fireCallback('onPaste', { event, content });
	}

	/**
	 * Handle drop event
	 * @private
	 * @param {Event} event - Drop event
	 */
	_handleDrop(event) {
		if (this.config.disableDragAndDrop) {
			event.preventDefault();
			return;
		}

		const files = event.dataTransfer.files;
		if (files.length > 0) {
			event.preventDefault();
			this._handleFileUpload(files);
		}
	}

	/**
	 * Handle dragover event
	 * @private
	 * @param {Event} event - Dragover event
	 */
	_handleDragOver(event) {
		if (!this.config.disableDragAndDrop) {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		}
	}

	/**
	 * Handle keydown event
	 * @private
	 * @param {Event} event - Keydown event
	 */
	_handleKeyDown(event) {
		// Handle shortcuts
		if (this.config.shortcuts) {
			this._handleShortcuts(event);
		}

		// Handle tab key
		if (event.key === 'Tab') {
			event.preventDefault();
			this.insertText('\t'.repeat(this.config.tabSize / 4) || '    ');
		}

		this._fireCallback('onKeydown', event);
	}

	/**
	 * Handle keyup event
	 * @private
	 * @param {Event} event - Keyup event
	 */
	_handleKeyUp(event) {
		this._fireCallback('onKeyup', event);
	}

	/**
	 * Handle mouseup event
	 * @private
	 * @param {Event} event - Mouseup event
	 */
	_handleMouseUp(event) {
		this._saveSelection();
		this._fireCallback('onMouseup', event);
	}

	/**
	 * Handle selection change
	 * @private
	 */
	_handleSelectionChange() {
		if (document.activeElement === this.editorElement) {
			this._saveSelection();
			this._updateToolbarState();
		}
	}

	/**
	 * Handle keyboard shortcuts
	 * @private
	 * @param {KeyboardEvent} event - Keyboard event
	 */
	_handleShortcuts(event) {
		const shortcuts = {
			'b': 'bold',
			'i': 'italic',
			'u': 'underline',
			'z': 'undo',
			'y': 'redo',
			'l': 'justifyLeft',
			'e': 'justifyCenter',
			'r': 'justifyRight',
			'j': 'justifyFull',
			'k': 'createLink',
			'/': 'formatBlock'
		};

		if ((event.ctrlKey || event.metaKey) && shortcuts[event.key.toLowerCase()]) {
			event.preventDefault();
			if (this.commandManager) {
				this.commandManager.execute(shortcuts[event.key.toLowerCase()]);
			}
		}
	}

	/**
	 * Handle file upload
	 * @private
	 * @param {FileList} files - Files to upload
	 */
	_handleFileUpload(files) {
		Array.from(files).forEach(file => {
			// Check if image
			if (file.type.startsWith('image/')) {
				// Check size
				if (file.size > this.config.maximumImageSize) {
					alert(`Image ${file.name} is too large. Maximum size is ${this.config.maximumImageSize / 1048576}MB`);
					return;
				}

				// Check type
				if (!this.config.acceptedImageTypes.includes(file.type)) {
					alert(`Image type ${file.type} is not supported`);
					return;
				}

				// Fire callback or handle internally
				if (this._fireCallback('onImageUpload', file) === false) {
					// Callback handled the upload
					return;
				}

				// Default: convert to base64 and insert
				const reader = new FileReader();
				reader.onload = (e) => {
					this.insertImage(e.target.result, file.name);
				};
				reader.readAsDataURL(file);
			}
		});
	}

	/**
	 * Save current selection
	 * @private
	 */
	_saveSelection() {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			this.currentRange = selection.getRangeAt(0);
		}
	}

	/**
	 * Restore saved selection
	 * @private
	 */
	_restoreSelection() {
		if (this.currentRange) {
			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(this.currentRange);
		}
	}

	/**
	 * Update toolbar button states
	 * @private
	 */
	_updateToolbarState() {
		if (this.toolbar) {
			this.toolbar.updateButtonStates();
		}
	}

	/**
	 * Update placeholder visibility
	 * @private
	 */
	_updatePlaceholder() {
		const isEmpty = this.editorElement.textContent.trim() === '' &&
			!this.editorElement.querySelector('img, video, audio, iframe');

		this.editorElement.classList.toggle('is-empty', isEmpty);
	}

	/**
	 * Update status bar
	 * @private
	 */
	_updateStatusBar() {
		if (!this.statusBar) return;

		const wordCount = this.getWordCount();
		const charCount = this.getCharCount();

		const statusText = this.statusBar.querySelector('.status-text');
		if (statusText) {
			statusText.textContent = `Words: ${wordCount} | Characters: ${charCount}`;
		} else {
			const span = document.createElement('span');
			span.className = 'status-text';
			span.textContent = `Words: ${wordCount} | Characters: ${charCount}`;
			this.statusBar.insertBefore(span, this.statusBar.firstChild);
		}
	}

	/**
	 * Sync content to textarea
	 * @private
	 */
	_syncContent() {
		this.textarea.value = this.getContent();
	}

	/**
	 * Add current state to history
	 * @private
	 */
	_addToHistory() {
		const content = this.getContent();

		// Remove any history after current position
		this.history = this.history.slice(0, this.historyStep + 1);

		// Add new state
		this.history.push(content);
		this.historyStep++;

		// Limit history size
		const maxHistory = 50;
		if (this.history.length > maxHistory) {
			this.history = this.history.slice(-maxHistory);
			this.historyStep = this.history.length - 1;
		}
	}

	/**
	 * Fire a callback if it exists
	 * @private
	 * @param {string} name - Callback name
	 * @param {*} data - Data to pass to callback
	 * @returns {*} Callback return value
	 */
	_fireCallback(name, data) {
		const callback = this.config.callbacks[name];
		if (typeof callback === 'function') {
			return callback.call(this, data);
		}
		return undefined;
	}

	// ============================================
	// Public API Methods
	// ============================================

	/**
	 * Get editor content as HTML
	 * @public
	 * @returns {string} HTML content
	 */
	getContent() {
		return this.editorElement.innerHTML;
	}

	/**
	 * Set editor content
	 * @public
	 * @param {string} content - HTML content to set
	 */
	setContent(content) {
		if (this.sanitizer) {
			content = this.sanitizer.clean(content);
		}
		this.editorElement.innerHTML = content;
		this._syncContent();
		this._updatePlaceholder();
		this._updateStatusBar();
		this.isDirty = false;
	}

	/**
	 * Get plain text content
	 * @public
	 * @returns {string} Plain text content
	 */
	getText() {
		return this.editorElement.textContent || '';
	}

	/**
	 * Insert HTML at cursor position
	 * @public
	 * @param {string} html - HTML to insert
	 */
	insertHTML(html) {
		this._restoreSelection();

		if (this.sanitizer) {
			html = this.sanitizer.clean(html);
		}

		if (this.commandManager) {
			this.commandManager.execute('insertHTML', html);
		} else {
			document.execCommand('insertHTML', false, html);
		}

		this._syncContent();
	}

	/**
	 * Insert plain text at cursor position
	 * @public
	 * @param {string} text - Text to insert
	 */
	insertText(text) {
		this._restoreSelection();

		const textNode = document.createTextNode(text);
		const selection = window.getSelection();

		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			range.deleteContents();
			range.insertNode(textNode);
			range.collapse(false);
			selection.removeAllRanges();
			selection.addRange(range);
		}

		this._syncContent();
	}

	/**
	 * Insert image
	 * @public
	 * @param {string} src - Image source URL or base64
	 * @param {string} alt - Alt text
	 * @param {Object} attributes - Additional attributes
	 */
	insertImage(src, alt = '', attributes = {}) {
		const img = document.createElement('img');
		img.src = src;
		img.alt = alt;

		// Apply additional attributes
		Object.keys(attributes).forEach(key => {
			img.setAttribute(key, attributes[key]);
		});

		this.insertHTML(img.outerHTML);
	}

	/**
	 * Insert link
	 * @public
	 * @param {string} url - Link URL
	 * @param {string} text - Link text
	 * @param {boolean} newWindow - Open in new window
	 */
	insertLink(url, text, newWindow = false) {
		const link = document.createElement('a');
		link.href = url;
		link.textContent = text || url;

		if (newWindow) {
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
		}

		this.insertHTML(link.outerHTML);
	}

	/**
	 * Clear editor content
	 * @public
	 */
	clear() {
		this.setContent('');
		this.isDirty = false;
		this._addToHistory();
	}

	/**
	 * Focus the editor
	 * @public
	 */
	focus() {
		this.editorElement.focus();
	}

	/**
	 * Blur the editor
	 * @public
	 */
	blur() {
		this.editorElement.blur();
	}

	/**
	 * Check if editor has focus
	 * @public
	 * @returns {boolean} True if focused
	 */
	hasFocus() {
		return document.activeElement === this.editorElement;
	}

	/**
	 * Enable editor
	 * @public
	 */
	enable() {
		this.editorElement.contentEditable = true;
		this.container.classList.remove('disabled');
		if (this.toolbar) {
			this.toolbar.enable();
		}
	}

	/**
	 * Disable editor
	 * @public
	 */
	disable() {
		this.editorElement.contentEditable = false;
		this.container.classList.add('disabled');
		if (this.toolbar) {
			this.toolbar.disable();
		}
	}

	/**
	 * Check if editor is enabled
	 * @public
	 * @returns {boolean} True if enabled
	 */
	isEnabled() {
		return this.editorElement.contentEditable === 'true';
	}

	/**
	 * Toggle fullscreen mode
	 * @public
	 */
	toggleFullscreen() {
		this.container.classList.toggle('fullscreen');
		document.body.classList.toggle('wysiwyg-fullscreen-active');

		if (this.container.classList.contains('fullscreen')) {
			// Save original height
			this._originalHeight = this.editorElement.style.height;
			this.editorElement.style.height = '100%';
			this.editorElement.style.maxHeight = 'none';
		} else {
			// Restore original height
			this.editorElement.style.height = this._originalHeight || this.config.height.default + 'px';
			this.editorElement.style.maxHeight = this.config.height.max + 'px';
		}
	}

	/**
	 * Check if in fullscreen mode
	 * @public
	 * @returns {boolean} True if fullscreen
	 */
	isFullscreen() {
		return this.container.classList.contains('fullscreen');
	}

	/**
	 * Undo last action
	 * @public
	 */
	undo() {
		if (this.historyStep > 0) {
			this.historyStep--;
			this.setContent(this.history[this.historyStep]);
		}
	}

	/**
	 * Redo last undone action
	 * @public
	 */
	redo() {
		if (this.historyStep < this.history.length - 1) {
			this.historyStep++;
			this.setContent(this.history[this.historyStep]);
		}
	}

	/**
	 * Check if can undo
	 * @public
	 * @returns {boolean} True if can undo
	 */
	canUndo() {
		return this.historyStep > 0;
	}

	/**
	 * Check if can redo
	 * @public
	 * @returns {boolean} True if can redo
	 */
	canRedo() {
		return this.historyStep < this.history.length - 1;
	}

	/**
	 * Get word count
	 * @public
	 * @returns {number} Word count
	 */
	getWordCount() {
		const text = this.getText();
		const words = text.trim().split(/\s+/);
		return text.trim() === '' ? 0 : words.length;
	}

	/**
	 * Get character count
	 * @public
	 * @returns {number} Character count
	 */
	getCharCount() {
		return this.getText().length;
	}

	/**
	 * Get selected text
	 * @public
	 * @returns {string} Selected text
	 */
	getSelectedText() {
		const selection = window.getSelection();
		return selection.toString();
	}

	/**
	 * Check if editor is dirty (has unsaved changes)
	 * @public
	 * @returns {boolean} True if dirty
	 */
	isDirtyCheck() {
		return this.isDirty;
	}

	/**
	 * Mark editor as clean (no unsaved changes)
	 * @public
	 */
	markClean() {
		this.isDirty = false;
	}

	/**
	 * Execute a command
	 * @public
	 * @param {string} command - Command name
	 * @param {*} value - Command value
	 */
	execCommand(command, value = null) {
		if (this.commandManager) {
			this.commandManager.execute(command, value);
		} else {
			document.execCommand(command, false, value);
		}
		this._syncContent();
		this._updateToolbarState();
	}

	/**
	 * Format block element
	 * @public
	 * @param {string} tag - HTML tag name
	 */
	formatBlock(tag) {
		this.execCommand('formatBlock', `<${tag}>`);
	}

	/**
	 * Set font name
	 * @public
	 * @param {string} fontName - Font family name
	 */
	setFontName(fontName) {
		this.execCommand('fontName', fontName);
	}

	/**
	 * Set font size
	 * @public
	 * @param {string} size - Font size
	 */
	setFontSize(size) {
		this.execCommand('fontSize', size);
	}

	/**
	 * Set text color
	 * @public
	 * @param {string} color - Color value
	 */
	setTextColor(color) {
		this.execCommand('foreColor', color);
	}

	/**
	 * Set background color
	 * @public
	 * @param {string} color - Color value
	 */
	setBackgroundColor(color) {
		this.execCommand('hiliteColor', color);
	}

	/**
	 * Create list
	 * @public
	 * @param {string} type - 'ordered' or 'unordered'
	 */
	createList(type) {
		const command = type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList';
		this.execCommand(command);
	}

	/**
	 * Set text alignment
	 * @public
	 * @param {string} alignment - 'left', 'center', 'right', 'justify'
	 */
	setAlignment(alignment) {
		const commands = {
			'left': 'justifyLeft',
			'center': 'justifyCenter',
			'right': 'justifyRight',
			'justify': 'justifyFull'
		};

		if (commands[alignment]) {
			this.execCommand(commands[alignment]);
		}
	}

	/**
	 * Indent text
	 * @public
	 */
	indent() {
		this.execCommand('indent');
	}

	/**
	 * Outdent text
	 * @public
	 */
	outdent() {
		this.execCommand('outdent');
	}

	/**
	 * Insert horizontal rule
	 * @public
	 */
	insertHorizontalRule() {
		this.execCommand('insertHorizontalRule');
	}

	/**
	 * Remove formatting from selection
	 * @public
	 */
	removeFormat() {
		this.execCommand('removeFormat');
	}

	/**
	 * Get editor configuration
	 * @public
	 * @returns {Object} Current configuration
	 */
	getConfig() {
		return { ...this.config };
	}

	/**
	 * Update editor configuration
	 * @public
	 * @param {Object} newConfig - New configuration options
	 */
	updateConfig(newConfig) {
		this.config = this._mergeConfig(newConfig);

		// Apply changes that can be updated dynamically
		if (newConfig.theme) {
			this._applyTheme();
		}

		if (newConfig.spellcheck !== undefined) {
			this.editorElement.spellcheck = newConfig.spellcheck;
		}

		if (newConfig.direction) {
			this.editorElement.style.direction = newConfig.direction;
		}

		if (newConfig.height) {
			if (newConfig.height.min) this.editorElement.style.minHeight = `${newConfig.height.min}px`;
			if (newConfig.height.max) this.editorElement.style.maxHeight = `${newConfig.height.max}px`;
			if (newConfig.height.default) this.editorElement.style.height = `${newConfig.height.default}px`;
		}

		// Rebuild toolbar if needed
		if (newConfig.toolbar && this.toolbar) {
			this.toolbar.rebuild(newConfig.toolbar);
		}
	}

	/**
	 * Export content in specified format
	 * @public
	 * @param {string} format - 'html', 'text', 'markdown'
	 * @returns {string} Exported content
	 */
	export(format = 'html') {
		switch (format.toLowerCase()) {
			case 'text':
				return this.getText();
			case 'markdown':
				// Basic HTML to Markdown conversion
				return this._htmlToMarkdown(this.getContent());
			case 'html':
			default:
				return this.getContent();
		}
	}

	/**
	 * Convert HTML to Markdown (basic conversion)
	 * @private
	 * @param {string} html - HTML content
	 * @returns {string} Markdown content
	 */
	_htmlToMarkdown(html) {
		// This is a basic implementation - consider using a library for full support
		let markdown = html;

		// Headers
		markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
		markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
		markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
		markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
		markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
		markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');

		// Bold and Italic
		markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
		markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
		markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
		markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

		// Links
		markdown = markdown.replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

		// Images
		markdown = markdown.replace(/<img[^>]+src="([^"]*)"[^>]+alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
		markdown = markdown.replace(/<img[^>]+src="([^"]*)"[^>]*>/gi, '![]($1)');

		// Lists
		markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
			return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
		});
		markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
			let counter = 1;
			return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
				return `${counter++}. $1\n`;
			});
		});

		// Paragraphs and breaks
		markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
		markdown = markdown.replace(/<br[^>]*>/gi, '\n');

		// Blockquotes
		markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n');

		// Code
		markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
		markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n');

		// Clean remaining tags
		markdown = markdown.replace(/<[^>]+>/g, '');

		// Clean extra whitespace
		markdown = markdown.replace(/\n{3,}/g, '\n\n');
		markdown = markdown.trim();

		return markdown;
	}

	/**
	 * Destroy the editor instance
	 * @public
	 */
	destroy() {
		// Fire destroy callback
		this._fireCallback('onDestroy', this);

		// Stop autosave
		if (this.storageManager) {
			this.storageManager.destroy();
		}

		// Remove event listeners
		this.editorElement.removeEventListener('input', this._handleInput.bind(this));
		this.editorElement.removeEventListener('focus', this._handleFocus.bind(this));
		this.editorElement.removeEventListener('blur', this._handleBlur.bind(this));
		this.editorElement.removeEventListener('paste', this._handlePaste.bind(this));
		this.editorElement.removeEventListener('drop', this._handleDrop.bind(this));
		this.editorElement.removeEventListener('dragover', this._handleDragOver.bind(this));
		this.editorElement.removeEventListener('keydown', this._handleKeyDown.bind(this));
		this.editorElement.removeEventListener('keyup', this._handleKeyUp.bind(this));
		this.editorElement.removeEventListener('mouseup', this._handleMouseUp.bind(this));
		document.removeEventListener('selectionchange', this._handleSelectionChange.bind(this));

		// Destroy components
		if (this.toolbar) this.toolbar.destroy();
		if (this.commandManager) this.commandManager.destroy();
		if (this.eventManager) this.eventManager.destroy();

		// Sync final content
		this._syncContent();

		// Remove DOM
		this.container.remove();

		// Show textarea
		this.textarea.style.display = '';

		// Clear references
		this.container = null;
		this.editorElement = null;
		this.toolbarElement = null;
		this.statusBar = null;
		this.toolbar = null;
		this.commandManager = null;
		this.eventManager = null;
		this.storageManager = null;
		this.sanitizer = null;

		this.isInitialized = false;
	}
}