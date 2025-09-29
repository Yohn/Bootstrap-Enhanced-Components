/**
 * WYSIWYG HTML Sanitizer
 * Cleans and validates HTML content to prevent XSS and maintain consistency
 *
 * @class WysiwygSanitizer
 * @version 1.0.0
 */
class WysiwygSanitizer {
	/**
	 * Create sanitizer instance
	 *
	 * @param {Array} allowedTags - Allowed HTML tags
	 * @param {Object} allowedAttributes - Allowed attributes per tag
	 * @param {Object} options - Additional options
	 */
	constructor(allowedTags = [], allowedAttributes = {}, options = {}) {
		// Default allowed tags
		this.allowedTags = new Set(allowedTags.length > 0 ? allowedTags : [
			'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
			'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
			'a', 'img', 'video', 'audio', 'iframe',
			'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
			'div', 'span', 'sup', 'sub', 'mark', 'small',
			'hr', 'figure', 'figcaption'
		]);

		// Default allowed attributes
		this.allowedAttributes = {
			'*': ['class', 'id', 'style', 'title'],
			'a': ['href', 'target', 'rel', 'download'],
			'img': ['src', 'alt', 'width', 'height', 'loading'],
			'video': ['src', 'width', 'height', 'controls', 'autoplay', 'muted', 'loop', 'poster'],
			'audio': ['src', 'controls', 'autoplay', 'muted', 'loop'],
			'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow'],
			'table': ['border', 'cellpadding', 'cellspacing'],
			'td': ['colspan', 'rowspan', 'align', 'valign'],
			'th': ['colspan', 'rowspan', 'align', 'valign'],
			...allowedAttributes
		};

		// Options
		this.options = {
			stripStyles: false,
			stripClasses: false,
			stripIds: false,
			stripDataAttributes: true,
			stripComments: true,
			stripEmptyTags: true,
			normalizeWhitespace: true,
			convertBoldItalic: true,
			fixNesting: true,
			removeScripts: true,
			removeEvents: true,
			sanitizeUrls: true,
			allowedProtocols: ['http', 'https', 'mailto', 'tel', 'data'],
			allowedDomains: [],
			maxDepth: 20,
			...options
		};

		// Dangerous tags that are always removed
		this.dangerousTags = new Set([
			'script', 'style', 'link', 'meta', 'base',
			'object', 'embed', 'applet', 'form',
			'input', 'textarea', 'button', 'select'
		]);

		// Event attributes to remove
		this.eventAttributes = new Set([
			'onabort', 'onblur', 'onchange', 'onclick', 'ondblclick',
			'onerror', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup',
			'onload', 'onmousedown', 'onmousemove', 'onmouseout',
			'onmouseover', 'onmouseup', 'onreset', 'onresize',
			'onselect', 'onsubmit', 'onunload', 'onbeforeunload',
			'onhashchange', 'onmessage', 'onoffline', 'ononline',
			'onpopstate', 'onresize', 'onstorage'
		]);
	}

	/**
	 * Clean HTML content
	 * @public
	 * @param {string} html - HTML to clean
	 * @param {Object} customOptions - Custom options for this clean
	 * @returns {string} Cleaned HTML
	 */
	clean(html, customOptions = {}) {
		// Merge options
		const options = { ...this.options, ...customOptions };

		// Create temporary container
		const container = document.createElement('div');
		container.innerHTML = html;

		// Clean recursively
		this._cleanNode(container, options, 0);

		// Post-process
		if (options.normalizeWhitespace) {
			this._normalizeWhitespace(container);
		}

		if (options.fixNesting) {
			this._fixNesting(container);
		}

		if (options.stripEmptyTags) {
			this._removeEmptyTags(container);
		}

		return container.innerHTML;
	}

	/**
	 * Clean a single node recursively
	 * @private
	 * @param {Node} node - Node to clean
	 * @param {Object} options - Cleaning options
	 * @param {number} depth - Current depth
	 */
	_cleanNode(node, options, depth) {
		// Check max depth
		if (depth > options.maxDepth) {
			node.remove();
			return;
		}

		// Process child nodes first (backwards to handle removals)
		const children = Array.from(node.childNodes);
		for (let i = children.length - 1; i >= 0; i--) {
			const child = children[i];

			if (child.nodeType === Node.ELEMENT_NODE) {
				this._cleanElement(child, options, depth + 1);
			} else if (child.nodeType === Node.COMMENT_NODE && options.stripComments) {
				child.remove();
			} else if (child.nodeType === Node.TEXT_NODE) {
				this._cleanTextNode(child, options);
			}
		}
	}

	/**
	 * Clean element node
	 * @private
	 * @param {Element} element - Element to clean
	 * @param {Object} options - Cleaning options
	 * @param {number} depth - Current depth
	 */
	_cleanElement(element, options, depth) {
		const tagName = element.tagName.toLowerCase();

		// Remove dangerous tags
		if (this.dangerousTags.has(tagName)) {
			element.remove();
			return;
		}

		// Remove scripts if option is set
		if (options.removeScripts && tagName === 'script') {
			element.remove();
			return;
		}

		// Check if tag is allowed
		if (!this.allowedTags.has(tagName)) {
			// Unwrap element (keep children)
			this._unwrapElement(element);
			return;
		}

		// Clean attributes
		this._cleanAttributes(element, options);

		// Convert deprecated tags
		if (options.convertBoldItalic) {
			this._convertDeprecatedTags(element);
		}

		// Process children
		this._cleanNode(element, options, depth);

		// Special handling for specific tags
		this._handleSpecialTags(element, options);
	}

	/**
	 * Clean element attributes
	 * @private
	 * @param {Element} element - Element to clean
	 * @param {Object} options - Cleaning options
	 */
	_cleanAttributes(element, options) {
		const tagName = element.tagName.toLowerCase();
		const allowedForTag = this.allowedAttributes[tagName] || [];
		const allowedGlobal = this.allowedAttributes['*'] || [];
		const allowed = new Set([...allowedForTag, ...allowedGlobal]);

		// Get all attributes
		const attributes = Array.from(element.attributes);

		attributes.forEach(attr => {
			const name = attr.name.toLowerCase();
			const value = attr.value;

			// Remove event handlers
			if (options.removeEvents && this.eventAttributes.has(name)) {
				element.removeAttribute(name);
				return;
			}

			// Remove javascript: protocol
			if (name === 'href' || name === 'src') {
				if (this._isDangerousUrl(value, options)) {
					element.removeAttribute(name);
					return;
				}
			}

			// Strip specific attributes based on options
			if (options.stripStyles && name === 'style') {
				element.removeAttribute(name);
				return;
			}

			if (options.stripClasses && name === 'class') {
				element.removeAttribute(name);
				return;
			}

			if (options.stripIds && name === 'id') {
				element.removeAttribute(name);
				return;
			}

			if (options.stripDataAttributes && name.startsWith('data-')) {
				element.removeAttribute(name);
				return;
			}

			// Check if attribute is allowed
			if (!allowed.has(name)) {
				element.removeAttribute(name);
			}
		});

		// Sanitize style attribute if present
		if (element.hasAttribute('style') && !options.stripStyles) {
			this._sanitizeStyle(element);
		}
	}

	/**
	 * Check if URL is dangerous
	 * @private
	 * @param {string} url - URL to check
	 * @param {Object} options - Options
	 * @returns {boolean} True if dangerous
	 */
	_isDangerousUrl(url, options) {
		if (!url) return false;

		const trimmed = url.trim().toLowerCase();

		// Check for javascript: protocol
		if (trimmed.startsWith('javascript:')) return true;
		if (trimmed.startsWith('vbscript:')) return true;
		if (trimmed.startsWith('data:text/html')) return true;

		// Check allowed protocols
		if (options.sanitizeUrls && options.allowedProtocols.length > 0) {
			const protocol = trimmed.split(':')[0];
			if (!options.allowedProtocols.includes(protocol)) {
				// Allow relative URLs
				if (!trimmed.includes(':')) return false;
				// Otherwise it's not allowed
				return true;
			}
		}

		// Check allowed domains if specified
		if (options.allowedDomains && options.allowedDomains.length > 0) {
			try {
				const urlObj = new URL(url);
				if (!options.allowedDomains.includes(urlObj.hostname)) {
					return true;
				}
			} catch (e) {
				// Invalid URL or relative URL
			}
		}

		return false;
	}

	/**
	 * Sanitize style attribute
	 * @private
	 * @param {Element} element - Element with style
	 */
	_sanitizeStyle(element) {
		const style = element.getAttribute('style');
		if (!style) return;

		// Remove dangerous CSS
		const dangerous = [
			'javascript:',
			'expression',
			'behavior',
			'@import',
			'position:fixed',
			'position:absolute'
		];

		let sanitized = style;
		dangerous.forEach(pattern => {
			const regex = new RegExp(pattern, 'gi');
			sanitized = sanitized.replace(regex, '');
		});

		// Update or remove style
		if (sanitized.trim()) {
			element.setAttribute('style', sanitized);
		} else {
			element.removeAttribute('style');
		}
	}

	/**
	 * Clean text node
	 * @private
	 * @param {Text} textNode - Text node to clean
	 * @param {Object} options - Options
	 */
	_cleanTextNode(textNode, options) {
		// Remove zero-width characters
		let text = textNode.textContent;
		text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

		// Update text if changed
		if (text !== textNode.textContent) {
			textNode.textContent = text;
		}

		// Remove empty text nodes (except in pre/code)
		const parent = textNode.parentElement;
		if (parent && !['PRE', 'CODE'].includes(parent.tagName)) {
			if (text.trim() === '') {
				textNode.remove();
			}
		}
	}

	/**
	 * Convert deprecated tags
	 * @private
	 * @param {Element} element - Element to check
	 */
	_convertDeprecatedTags(element) {
		const tagName = element.tagName.toLowerCase();
		const replacements = {
			'b': 'strong',
			'i': 'em',
			's': 'del',
			'strike': 'del',
			'center': 'div'
		};

		if (replacements[tagName]) {
			const newElement = document.createElement(replacements[tagName]);

			// Copy attributes
			Array.from(element.attributes).forEach(attr => {
				newElement.setAttribute(attr.name, attr.value);
			});

			// Special handling for center tag
			if (tagName === 'center') {
				newElement.style.textAlign = 'center';
			}

			// Move children
			while (element.firstChild) {
				newElement.appendChild(element.firstChild);
			}

			// Replace element
			element.parentNode.replaceChild(newElement, element);
		}
	}

	/**
	 * Handle special tags
	 * @private
	 * @param {Element} element - Element to handle
	 * @param {Object} options - Options
	 */
	_handleSpecialTags(element, options) {
		const tagName = element.tagName.toLowerCase();

		switch (tagName) {
			case 'img':
				this._sanitizeImage(element, options);
				break;

			case 'a':
				this._sanitizeLink(element, options);
				break;

			case 'iframe':
				this._sanitizeIframe(element, options);
				break;

			case 'table':
				this._sanitizeTable(element, options);
				break;
		}
	}

	/**
	 * Sanitize image element
	 * @private
	 * @param {Element} img - Image element
	 * @param {Object} options - Options
	 */
	_sanitizeImage(img, options) {
		// Ensure alt attribute
		if (!img.hasAttribute('alt')) {
			img.setAttribute('alt', '');
		}

		// Add loading="lazy" by default
		if (!img.hasAttribute('loading')) {
			img.setAttribute('loading', 'lazy');
		}

		// Validate dimensions
		const width = img.getAttribute('width');
		const height = img.getAttribute('height');

		if (width && isNaN(parseInt(width))) {
			img.removeAttribute('width');
		}
		if (height && isNaN(parseInt(height))) {
			img.removeAttribute('height');
		}
	}

	/**
	 * Sanitize link element
	 * @private
	 * @param {Element} link - Link element
	 * @param {Object} options - Options
	 */
	_sanitizeLink(link, options) {
		// Add rel="noopener" for external links
		const href = link.getAttribute('href');
		const target = link.getAttribute('target');

		if (target === '_blank') {
			const rel = link.getAttribute('rel') || '';
			if (!rel.includes('noopener')) {
				link.setAttribute('rel', (rel + ' noopener').trim());
			}
			if (!rel.includes('noreferrer')) {
				link.setAttribute('rel', (link.getAttribute('rel') + ' noreferrer').trim());
			}
		}

		// Ensure link has content
		if (!link.textContent.trim() && !link.querySelector('img')) {
			link.textContent = href || 'Link';
		}
	}

	/**
	 * Sanitize iframe element
	 * @private
	 * @param {Element} iframe - Iframe element
	 * @param {Object} options - Options
	 */
	_sanitizeIframe(iframe, options) {
		const src = iframe.getAttribute('src');

		// Whitelist of allowed iframe sources
		const allowedSources = [
			'youtube.com',
			'youtube-nocookie.com',
			'vimeo.com',
			'dailymotion.com',
			'spotify.com',
			'soundcloud.com',
			'codepen.io',
			'jsfiddle.net',
			'maps.google.com',
			'google.com/maps'
		];

		// Check if source is allowed
		let isAllowed = false;
		if (src) {
			allowedSources.forEach(domain => {
				if (src.includes(domain)) {
					isAllowed = true;
				}
			});
		}

		if (!isAllowed) {
			iframe.remove();
			return;
		}

		// Add sandbox attribute for security
		if (!iframe.hasAttribute('sandbox')) {
			iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
		}
	}

	/**
	 * Sanitize table element
	 * @private
	 * @param {Element} table - Table element
	 * @param {Object} options - Options
	 */
	_sanitizeTable(table, options) {
		// Add Bootstrap classes if not present
		if (!table.className.includes('table')) {
			table.classList.add('table');
		}

		// Ensure proper structure
		const rows = table.querySelectorAll('tr');
		rows.forEach(row => {
			// Ensure at least one cell
			if (row.children.length === 0) {
				row.remove();
			}
		});
	}

	/**
	 * Normalize whitespace
	 * @private
	 * @param {Element} container - Container element
	 */
	_normalizeWhitespace(container) {
		const walker = document.createTreeWalker(
			container,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);

		let node;
		while (node = walker.nextNode()) {
			const parent = node.parentElement;

			// Skip pre and code elements
			if (parent && ['PRE', 'CODE'].includes(parent.tagName)) {
				continue;
			}

			// Normalize whitespace
			let text = node.textContent;
			text = text.replace(/\s+/g, ' ');

			// Update if changed
			if (text !== node.textContent) {
				node.textContent = text;
			}
		}
	}

	/**
	 * Fix nesting issues
	 * @private
	 * @param {Element} container - Container element
	 */
	_fixNesting(container) {
		// Fix common nesting issues

		// P tags cannot contain block elements
		const paragraphs = container.querySelectorAll('p');
		paragraphs.forEach(p => {
			const blockElements = p.querySelectorAll('div, p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote');
			blockElements.forEach(block => {
				// Move block element out of paragraph
				p.parentNode.insertBefore(block, p.nextSibling);
			});
		});

		// Lists should only contain li elements
		const lists = container.querySelectorAll('ul, ol');
		lists.forEach(list => {
			Array.from(list.children).forEach(child => {
				if (child.tagName !== 'LI') {
					// Wrap in li
					const li = document.createElement('li');
					list.insertBefore(li, child);
					li.appendChild(child);
				}
			});
		});
	}

	/**
	 * Remove empty tags
	 * @private
	 * @param {Element} container - Container element
	 */
	_removeEmptyTags(container) {
		const emptySelectors = [
			'p:empty',
			'div:empty',
			'span:empty',
			'strong:empty',
			'em:empty',
			'u:empty',
			'li:empty'
		];

		emptySelectors.forEach(selector => {
			const elements = container.querySelectorAll(selector);
			elements.forEach(el => {
				// Check if truly empty (no whitespace)
				if (!el.textContent.trim() && !el.querySelector('img, video, audio, iframe, hr, br')) {
					el.remove();
				}
			});
		});
	}

	/**
	 * Unwrap element (keep children)
	 * @private
	 * @param {Element} element - Element to unwrap
	 */
	_unwrapElement(element) {
		const parent = element.parentNode;

		while (element.firstChild) {
			parent.insertBefore(element.firstChild, element);
		}

		element.remove();
	}

	// ============================================
	// Public API Methods
	// ============================================

	/**
	 * Validate HTML
	 * @public
	 * @param {string} html - HTML to validate
	 * @returns {Object} Validation result
	 */
	validate(html) {
		const issues = [];
		const container = document.createElement('div');
		container.innerHTML = html;

		// Check for dangerous content
		const dangerous = container.querySelectorAll('script, style, link, meta, form, input');
		if (dangerous.length > 0) {
			issues.push({
				type: 'danger',
				message: `Found ${dangerous.length} potentially dangerous elements`
			});
		}

		// Check for event handlers
		const withEvents = container.querySelectorAll('[onclick], [onload], [onerror]');
		if (withEvents.length > 0) {
			issues.push({
				type: 'warning',
				message: `Found ${withEvents.length} elements with event handlers`
			});
		}

		// Check for javascript: URLs
		const jsLinks = container.querySelectorAll('a[href^="javascript:"], img[src^="javascript:"]');
		if (jsLinks.length > 0) {
			issues.push({
				type: 'danger',
				message: `Found ${jsLinks.length} javascript: URLs`
			});
		}

		return {
			valid: issues.length === 0,
			issues
		};
	}

	/**
	 * Strip all HTML tags
	 * @public
	 * @param {string} html - HTML to strip
	 * @returns {string} Plain text
	 */
	stripTags(html) {
		const container = document.createElement('div');
		container.innerHTML = html;
		return container.textContent || container.innerText || '';
	}

	/**
	 * Escape HTML
	 * @public
	 * @param {string} text - Text to escape
	 * @returns {string} Escaped HTML
	 */
	escape(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	/**
	 * Unescape HTML
	 * @public
	 * @param {string} html - HTML to unescape
	 * @returns {string} Unescaped text
	 */
	unescape(html) {
		const div = document.createElement('div');
		div.innerHTML = html;
		return div.textContent || '';
	}

	/**
	 * Update configuration
	 * @public
	 * @param {Object} config - New configuration
	 */
	updateConfig(config) {
		if (config.allowedTags) {
			this.allowedTags = new Set(config.allowedTags);
		}

		if (config.allowedAttributes) {
			this.allowedAttributes = config.allowedAttributes;
		}

		if (config.options) {
			this.options = { ...this.options, ...config.options };
		}
	}
}