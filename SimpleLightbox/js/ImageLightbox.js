/**
 * ImageLightbox - Feature-rich image lightbox component for Bootstrap 5.3
 * Supports single images, galleries, zoom, touch gestures, and keyboard navigation
 */
class ImageLightbox {
	constructor(options = {}) {
		// Default configuration
		this.config = {
			hoverZoomScale: 1.05,
			transitionDuration: 300,
			zoomStep: 0.2,
			maxZoom: 3,
			minZoom: 1,
			enableKeyboard: true,
			enableTouch: true,
			enableZoom: true,
			showArrows: true,
			showCloseButton: true,
			showCounter: true,
			backdropOpacity: 0.9,
			animationType: 'fade', // 'fade', 'slide', 'zoom'
			...options
		};

		// State management
		this.isOpen = false;
		this.currentIndex = 0;
		this.currentGallery = null;
		this.galleryImages = [];
		this.currentZoom = 1;
		this.isDragging = false;
		this.dragStart = { x: 0, y: 0 };
		this.imageOffset = { x: 0, y: 0 };
		this.touchStartDistance = 0;
		this.lastTouchDistance = 0;

		// DOM elements
		this.lightboxElement = null;
		this.backdropElement = null;
		this.containerElement = null;
		this.imageElement = null;
		this.titleElement = null;
		this.descriptionElement = null;
		this.counterElement = null;
		this.closeButton = null;
		this.prevButton = null;
		this.nextButton = null;

		// Initialize component
		this.init();
	}

	/**
	 * Initialize the lightbox component
	 */
	init() {
		this.createLightboxDOM();
		this.bindEvents();
		this.setupTriggers();
	}

	/**
	 * Create the lightbox DOM structure
	 */
	createLightboxDOM() {
		// Main lightbox container
		this.lightboxElement = document.createElement('div');
		this.lightboxElement.className = 'image-lightbox';
		this.lightboxElement.innerHTML = `
			<div class="lightbox-backdrop"></div>
			<div class="lightbox-container">
				<div class="lightbox-content">
					<img class="lightbox-image" alt="" />
					<div class="lightbox-loading">
						<div class="spinner-border text-light" role="status">
							<span class="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
				<div class="lightbox-info">
					<div class="lightbox-title"></div>
					<div class="lightbox-description"></div>
					<div class="lightbox-counter"></div>
				</div>
				<button type="button" class="lightbox-close" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
				<button type="button" class="lightbox-prev" aria-label="Previous">
					<span aria-hidden="true">‹</span>
				</button>
				<button type="button" class="lightbox-next" aria-label="Next">
					<span aria-hidden="true">›</span>
				</button>
			</div>
		`;

		// Cache DOM references
		this.backdropElement = this.lightboxElement.querySelector('.lightbox-backdrop');
		this.containerElement = this.lightboxElement.querySelector('.lightbox-container');
		this.imageElement = this.lightboxElement.querySelector('.lightbox-image');
		this.titleElement = this.lightboxElement.querySelector('.lightbox-title');
		this.descriptionElement = this.lightboxElement.querySelector('.lightbox-description');
		this.counterElement = this.lightboxElement.querySelector('.lightbox-counter');
		this.closeButton = this.lightboxElement.querySelector('.lightbox-close');
		this.prevButton = this.lightboxElement.querySelector('.lightbox-prev');
		this.nextButton = this.lightboxElement.querySelector('.lightbox-next');
		this.loadingElement = this.lightboxElement.querySelector('.lightbox-loading');

		// Append to document
		document.body.appendChild(this.lightboxElement);
	}

	/**
	 * Bind all event listeners
	 */
	bindEvents() {
		// Close events
		this.closeButton.addEventListener('click', () => this.close());
		this.backdropElement.addEventListener('click', () => this.close());

		// Navigation events
		this.prevButton.addEventListener('click', () => this.previous());
		this.nextButton.addEventListener('click', () => this.next());

		// Keyboard events
		if (this.config.enableKeyboard) {
			document.addEventListener('keydown', (e) => this.handleKeydown(e));
		}

		// Touch events for mobile
		if (this.config.enableTouch) {
			this.bindTouchEvents();
		}

		// Zoom events
		if (this.config.enableZoom) {
			this.bindZoomEvents();
		}

		// Prevent context menu on image
		this.imageElement.addEventListener('contextmenu', (e) => e.preventDefault());

		// Image load events
		this.imageElement.addEventListener('load', () => this.handleImageLoad());
		this.imageElement.addEventListener('error', () => this.handleImageError());
	}

	/**
	 * Bind touch events for mobile gestures
	 */
	bindTouchEvents() {
		let touchStartX = 0;
		let touchStartY = 0;
		let isSwiping = false;

		this.containerElement.addEventListener('touchstart', (e) => {
			const touches = e.touches;

			if (touches.length === 1) {
				// Single touch - potential swipe
				touchStartX = touches[0].clientX;
				touchStartY = touches[0].clientY;
				isSwiping = true;
			} else if (touches.length === 2) {
				// Two finger touch - zoom gesture
				this.touchStartDistance = this.getTouchDistance(touches);
				this.lastTouchDistance = this.touchStartDistance;
				isSwiping = false;
			}
		}, { passive: true });

		this.containerElement.addEventListener('touchmove', (e) => {
			const touches = e.touches;

			if (touches.length === 2 && this.config.enableZoom) {
				// Pinch to zoom
				e.preventDefault();
				const currentDistance = this.getTouchDistance(touches);
				const scale = currentDistance / this.lastTouchDistance;
				this.adjustZoom(this.currentZoom * scale);
				this.lastTouchDistance = currentDistance;
			}
		}, { passive: false });

		this.containerElement.addEventListener('touchend', (e) => {
			if (!isSwiping || e.changedTouches.length === 0) return;

			const touchEndX = e.changedTouches[0].clientX;
			const touchEndY = e.changedTouches[0].clientY;
			const deltaX = touchEndX - touchStartX;
			const deltaY = touchEndY - touchStartY;

			// Check if it's a horizontal swipe
			if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
				if (deltaX > 0) {
					this.previous();
				} else {
					this.next();
				}
			}
		}, { passive: true });

		// Double tap to reset zoom
		let lastTouchTime = 0;
		this.imageElement.addEventListener('touchend', (e) => {
			const currentTime = new Date().getTime();
			const tapLength = currentTime - lastTouchTime;

			if (tapLength < 500 && tapLength > 0) {
				e.preventDefault();
				this.resetZoom();
			}

			lastTouchTime = currentTime;
		});
	}

	/**
	 * Bind zoom events (mouse wheel and drag)
	 */
	bindZoomEvents() {
		// Mouse wheel zoom
		this.imageElement.addEventListener('wheel', (e) => {
			e.preventDefault();
			const delta = e.deltaY > 0 ? -this.config.zoomStep : this.config.zoomStep;
			this.adjustZoom(this.currentZoom + delta);
		});

		// Drag to pan when zoomed
		this.imageElement.addEventListener('mousedown', (e) => {
			if (this.currentZoom > 1) {
				e.preventDefault();
				this.isDragging = true;
				this.dragStart = { x: e.clientX - this.imageOffset.x, y: e.clientY - this.imageOffset.y };
				this.imageElement.style.cursor = 'grabbing';
			}
		});

		document.addEventListener('mousemove', (e) => {
			if (this.isDragging) {
				this.imageOffset.x = e.clientX - this.dragStart.x;
				this.imageOffset.y = e.clientY - this.dragStart.y;
				this.updateImageTransform();
			}
		});

		document.addEventListener('mouseup', () => {
			if (this.isDragging) {
				this.isDragging = false;
				this.imageElement.style.cursor = this.currentZoom > 1 ? 'grab' : 'default';
			}
		});
	}

	/**
	 * Setup trigger elements (images with lightbox-trigger class)
	 */
	setupTriggers() {
		const triggers = document.querySelectorAll('.lightbox-trigger');

		triggers.forEach(trigger => {
			// Add hover effect
			trigger.addEventListener('mouseenter', () => this.applyHoverEffect(trigger));
			trigger.addEventListener('mouseleave', () => this.removeHoverEffect(trigger));

			// Add click handler
			trigger.addEventListener('click', (e) => {
				e.preventDefault();
				this.openFromTrigger(trigger);
			});
		});
	}

	/**
	 * Apply hover zoom effect
	 */
	applyHoverEffect(element) {
		element.style.transition = `transform ${this.config.transitionDuration}ms ease`;
		element.style.transform = `scale(${this.config.hoverZoomScale})`;
	}

	/**
	 * Remove hover zoom effect
	 */
	removeHoverEffect(element) {
		element.style.transform = 'scale(1)';
	}

	/**
	 * Open lightbox from trigger element
	 */
	openFromTrigger(trigger) {
		const galleryName = trigger.dataset.lightboxGallery;

		if (galleryName) {
			// Gallery mode
			this.setupGallery(galleryName);
			const index = this.galleryImages.findIndex(img => img.element === trigger);
			this.open(trigger, galleryName, index);
		} else {
			// Single image mode
			this.open(trigger);
		}
	}

	/**
	 * Setup gallery images
	 */
	setupGallery(galleryName) {
		const galleryElements = document.querySelectorAll(`[data-lightbox-gallery="${galleryName}"]`);
		this.galleryImages = Array.from(galleryElements).map(element => ({
			element,
			src: element.src || element.href,
			title: element.dataset.lightboxTitle || element.alt || '',
			description: element.dataset.lightboxDescription || ''
		}));
	}

	/**
	 * Open lightbox
	 */
	open(triggerElement, galleryName = null, index = 0) {
		this.currentGallery = galleryName;
		this.currentIndex = index;

		// Show lightbox
		this.lightboxElement.classList.add('active');
		this.isOpen = true;

		// Prevent body scroll
		document.body.classList.add('lightbox-open');

		// Load image
		this.loadImage(triggerElement);

		// Update navigation visibility
		this.updateNavigation();

		// Fire custom event
		this.fireEvent('lightbox:opened', {
			trigger: triggerElement,
			gallery: galleryName,
			index: index
		});
	}

	/**
	 * Close lightbox
	 */
	close() {
		if (!this.isOpen) return;

		this.lightboxElement.classList.remove('active');
		this.isOpen = false;

		// Re-enable body scroll
		document.body.classList.remove('lightbox-open');

		// Reset zoom and position
		this.resetZoom();

		// Fire custom event
		this.fireEvent('lightbox:closed', {});
	}

	/**
	 * Navigate to next image
	 */
	next() {
		if (!this.currentGallery || this.galleryImages.length === 0) return;

		this.currentIndex = (this.currentIndex + 1) % this.galleryImages.length;
		this.loadCurrentGalleryImage();
		this.fireEvent('lightbox:changed', { index: this.currentIndex });
	}

	/**
	 * Navigate to previous image
	 */
	previous() {
		if (!this.currentGallery || this.galleryImages.length === 0) return;

		this.currentIndex = this.currentIndex === 0 ? this.galleryImages.length - 1 : this.currentIndex - 1;
		this.loadCurrentGalleryImage();
		this.fireEvent('lightbox:changed', { index: this.currentIndex });
	}

	/**
	 * Load current gallery image
	 */
	loadCurrentGalleryImage() {
		const currentImage = this.galleryImages[this.currentIndex];
		this.loadImage(currentImage.element);
		this.resetZoom();
	}

	/**
	 * Load image into lightbox
	 */
	loadImage(triggerElement) {
		this.showLoading();

		const src = triggerElement.src || triggerElement.href;
		const title = triggerElement.dataset.lightboxTitle || triggerElement.alt || '';
		const description = triggerElement.dataset.lightboxDescription || '';

		// Preload image
		const img = new Image();
		img.onload = () => {
			this.imageElement.src = src;
			this.titleElement.textContent = title;
			this.descriptionElement.textContent = description;
			this.updateCounter();
			this.hideLoading();
		};
		img.onerror = () => {
			this.handleImageError();
		};
		img.src = src;
	}

	/**
	 * Handle successful image load
	 */
	handleImageLoad() {
		this.hideLoading();
		this.resetZoom();

		// Apply fade in animation
		this.imageElement.style.opacity = '0';
		setTimeout(() => {
			this.imageElement.style.transition = `opacity ${this.config.transitionDuration}ms ease`;
			this.imageElement.style.opacity = '1';
		}, 10);
	}

	/**
	 * Handle image load error
	 */
	handleImageError() {
		this.hideLoading();
		this.imageElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNzc3IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K';
		this.titleElement.textContent = 'Image Not Found';
		this.descriptionElement.textContent = 'The requested image could not be loaded.';
	}

	/**
	 * Show loading indicator
	 */
	showLoading() {
		this.loadingElement.style.display = 'flex';
		this.imageElement.style.opacity = '0';
	}

	/**
	 * Hide loading indicator
	 */
	hideLoading() {
		this.loadingElement.style.display = 'none';
	}

	/**
	 * Update navigation button visibility
	 */
	updateNavigation() {
		const hasGallery = this.currentGallery && this.galleryImages.length > 1;

		// Show/hide navigation buttons
		this.prevButton.style.display = hasGallery && this.config.showArrows ? 'flex' : 'none';
		this.nextButton.style.display = hasGallery && this.config.showArrows ? 'flex' : 'none';
		this.closeButton.style.display = this.config.showCloseButton ? 'flex' : 'none';
	}

	/**
	 * Update image counter
	 */
	updateCounter() {
		if (this.currentGallery && this.galleryImages.length > 1 && this.config.showCounter) {
			this.counterElement.textContent = `${this.currentIndex + 1} / ${this.galleryImages.length}`;
			this.counterElement.style.display = 'block';
		} else {
			this.counterElement.style.display = 'none';
		}
	}

	/**
	 * Handle keyboard events
	 */
	handleKeydown(event) {
		if (!this.isOpen) return;

		switch (event.key) {
			case 'Escape':
				event.preventDefault();
				this.close();
				break;
			case 'ArrowLeft':
				event.preventDefault();
				this.previous();
				break;
			case 'ArrowRight':
				event.preventDefault();
				this.next();
				break;
			case '+':
			case '=':
				event.preventDefault();
				this.adjustZoom(this.currentZoom + this.config.zoomStep);
				break;
			case '-':
				event.preventDefault();
				this.adjustZoom(this.currentZoom - this.config.zoomStep);
				break;
			case '0':
				event.preventDefault();
				this.resetZoom();
				break;
		}
	}

	/**
	 * Adjust zoom level
	 */
	adjustZoom(newZoom) {
		if (!this.config.enableZoom) return;

		this.currentZoom = Math.min(Math.max(newZoom, this.config.minZoom), this.config.maxZoom);
		this.updateImageTransform();

		// Update cursor
		this.imageElement.style.cursor = this.currentZoom > 1 ? 'grab' : 'default';

		// Fire zoom event
		this.fireEvent('lightbox:zoomed', { zoom: this.currentZoom });
	}

	/**
	 * Reset zoom to original size
	 */
	resetZoom() {
		this.currentZoom = 1;
		this.imageOffset = { x: 0, y: 0 };
		this.updateImageTransform();
		this.imageElement.style.cursor = 'default';
	}

	/**
	 * Set specific zoom level
	 */
	setZoom(zoomLevel) {
		this.adjustZoom(zoomLevel);
	}

	/**
	 * Update image transform (zoom and position)
	 */
	updateImageTransform() {
		const transform = `scale(${this.currentZoom}) translate(${this.imageOffset.x / this.currentZoom}px, ${this.imageOffset.y / this.currentZoom}px)`;
		this.imageElement.style.transform = transform;
		this.imageElement.style.transition = this.isDragging ? 'none' : `transform ${this.config.transitionDuration}ms ease`;
	}

	/**
	 * Get distance between two touch points
	 */
	getTouchDistance(touches) {
		const dx = touches[0].clientX - touches[1].clientX;
		const dy = touches[0].clientY - touches[1].clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Fire custom event
	 */
	fireEvent(eventName, detail) {
		const event = new CustomEvent(eventName, {
			detail: detail,
			bubbles: true,
			cancelable: true
		});
		document.dispatchEvent(event);
	}

	/**
	 * Destroy lightbox instance
	 */
	destroy() {
		// Remove DOM element
		if (this.lightboxElement && this.lightboxElement.parentNode) {
			this.lightboxElement.parentNode.removeChild(this.lightboxElement);
		}

		// Remove event listeners
		document.removeEventListener('keydown', this.handleKeydown);

		// Remove hover effects from triggers
		const triggers = document.querySelectorAll('.lightbox-trigger');
		triggers.forEach(trigger => {
			trigger.style.transform = '';
			trigger.style.transition = '';
		});

		// Re-enable body scroll if disabled
		document.body.classList.remove('lightbox-open');

		// Clear references
		this.lightboxElement = null;
		this.galleryImages = [];
		this.isOpen = false;
	}

	/**
	 * Public API methods
	 */

	/**
	 * Open lightbox programmatically
	 */
	openImage(imageElement, galleryName = null) {
		if (galleryName) {
			this.setupGallery(galleryName);
			const index = this.galleryImages.findIndex(img => img.element === imageElement);
			this.open(imageElement, galleryName, index >= 0 ? index : 0);
		} else {
			this.open(imageElement);
		}
	}

	/**
	 * Get current state
	 */
	getState() {
		return {
			isOpen: this.isOpen,
			currentIndex: this.currentIndex,
			currentGallery: this.currentGallery,
			currentZoom: this.currentZoom,
			galleryLength: this.galleryImages.length
		};
	}

	/**
	 * Update configuration
	 */
	updateConfig(newConfig) {
		this.config = { ...this.config, ...newConfig };

		// Update backdrop opacity
		if (newConfig.backdropOpacity !== undefined) {
			this.backdropElement.style.backgroundColor = `rgba(0, 0, 0, ${this.config.backdropOpacity})`;
		}
	}
}