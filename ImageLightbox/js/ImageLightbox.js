/**
 * ImageLightbox - Enhanced image lightbox using Bootstrap Modal and Carousel
 * Compatible with Bootstrap 5.3+
 */
class ImageLightbox {
	constructor(options = {}) {
		this.options = {
			// Core functionality
			navigation: true,
			thumbnails: false,
			zoom: true,
			slideshow: false,
			keyboard: true,
			touchGestures: true,
			showCounter: true,
			captions: true,

			// Zoom settings
			zoomLevel: 1,
			maxZoom: 3,
			zoomStep: 0.5,

			// Slideshow settings
			slideshowSpeed: 3000,

			// Animation settings
			animationType: 'fade', // 'fade', 'slide', 'zoom'

			// Styling
			overlayColor: 'rgba(0, 0, 0, 0.9)',

			// Selectors
			imageSelector: '[data-lightbox]',

			// Callbacks
			onOpen: null,
			onClose: null,
			onNavigate: null,
			onZoom: null,

			...options
		};

		this.currentGroup = null;
		this.currentImages = [];
		this.currentIndex = 0;
		this.currentZoom = this.options.zoomLevel;
		this.slideshowInterval = null;
		this.modal = null;
		this.carousel = null;
		this.isInitialized = false;

		this.init();
	}

	init() {
		if (this.isInitialized) return;

		this.createModal();
		this.bindEvents();
		this.isInitialized = true;
	}

	createModal() {
		// Create modal HTML structure
		const modalHtml = `
			<div class="modal fade image-lightbox-modal" id="imageLightboxModal" tabindex="-1" aria-hidden="true">
				<div class="modal-dialog modal-fullscreen">
					<div class="modal-content bg-transparent border-0">
						<div class="modal-header border-0 position-absolute top-0 end-0 z-3">
							${this.options.showCounter ? '<div class="image-lightbox-counter text-white me-3"></div>' : ''}
							<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-body p-0 d-flex align-items-center justify-content-center">
							<div id="imageLightboxCarousel" class="carousel slide w-100 h-100" data-bs-ride="false">
								<div class="carousel-inner h-100"></div>
								${this.options.navigation ? `
									<button class="carousel-control-prev" type="button" data-bs-target="#imageLightboxCarousel" data-bs-slide="prev">
										<span class="carousel-control-prev-icon" aria-hidden="true"></span>
										<span class="visually-hidden">Previous</span>
									</button>
									<button class="carousel-control-next" type="button" data-bs-target="#imageLightboxCarousel" data-bs-slide="next">
										<span class="carousel-control-next-icon" aria-hidden="true"></span>
										<span class="visually-hidden">Next</span>
									</button>
								` : ''}
							</div>
						</div>
						${this.options.thumbnails ? '<div class="modal-footer border-0 image-lightbox-thumbnails"></div>' : ''}
						${this.options.zoom ? `
							<div class="position-absolute bottom-0 start-0 p-3 z-3">
								<div class="btn-group" role="group">
									<button type="button" class="btn btn-outline-light btn-sm image-lightbox-zoom-out">-</button>
									<button type="button" class="btn btn-outline-light btn-sm image-lightbox-zoom-reset">Reset</button>
									<button type="button" class="btn btn-outline-light btn-sm image-lightbox-zoom-in">+</button>
								</div>
							</div>
						` : ''}
						${this.options.slideshow ? `
							<div class="position-absolute bottom-0 end-0 p-3 z-3">
								<button type="button" class="btn btn-outline-light btn-sm image-lightbox-slideshow">
									<i class="bi bi-play"></i>
								</button>
							</div>
						` : ''}
					</div>
				</div>
			</div>
		`;

		// Remove existing modal if present
		const existingModal = document.getElementById('imageLightboxModal');
		if (existingModal) {
			existingModal.remove();
		}

		// Add modal to DOM
		document.body.insertAdjacentHTML('beforeend', modalHtml);

		// Initialize Bootstrap components
		this.modal = new bootstrap.Modal(document.getElementById('imageLightboxModal'));
		this.carousel = new bootstrap.Carousel(document.getElementById('imageLightboxCarousel'), {
			interval: false,
			wrap: true
		});

		// Apply custom styling
		this.applyCustomStyling();
	}

	applyCustomStyling() {
		const modalElement = document.getElementById('imageLightboxModal');
		const backdropStyle = `background-color: ${this.options.overlayColor} !important;`;

		// Add custom CSS
		if (!document.getElementById('image-lightbox-styles')) {
			const styleSheet = document.createElement('style');
			styleSheet.id = 'image-lightbox-styles';
			styleSheet.textContent = `
				.image-lightbox-modal .modal-backdrop {
					${backdropStyle}
				}
				.image-lightbox-modal .carousel-item img {
					max-width: 100%;
					max-height: 100vh;
					object-fit: contain;
					cursor: ${this.options.zoom ? 'zoom-in' : 'default'};
					transition: transform 0.3s ease;
				}
				.image-lightbox-modal .carousel-item.zoomed img {
					cursor: ${this.options.zoom ? 'zoom-out' : 'default'};
				}
				.image-lightbox-modal .image-lightbox-thumbnails {
					background: rgba(0, 0, 0, 0.7);
					max-height: 120px;
					overflow-x: auto;
					white-space: nowrap;
				}
				.image-lightbox-modal .image-lightbox-thumbnail {
					width: 80px;
					height: 60px;
					object-fit: cover;
					cursor: pointer;
					opacity: 0.6;
					transition: opacity 0.3s ease;
				}
				.image-lightbox-modal .image-lightbox-thumbnail.active,
				.image-lightbox-modal .image-lightbox-thumbnail:hover {
					opacity: 1;
				}
				.image-lightbox-modal .image-lightbox-caption {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
					color: white;
					padding: 2rem 1rem 1rem;
					text-align: center;
				}
			`;
			document.head.appendChild(styleSheet);
		}
	}

	bindEvents() {
		// Image click events
		document.addEventListener('click', (e) => {
			const image = e.target.closest(this.options.imageSelector);
			if (image) {
				e.preventDefault();
				this.openLightbox(image);
			}
		});

		// Modal events
		const modalElement = document.getElementById('imageLightboxModal');
		modalElement.addEventListener('shown.bs.modal', () => {
			if (this.options.keyboard) {
				this.bindKeyboardEvents();
			}
			if (this.options.touchGestures) {
				this.bindTouchEvents();
			}
			if (this.options.onOpen) {
				this.options.onOpen(this.currentImages[this.currentIndex], this.currentIndex);
			}
		});

		modalElement.addEventListener('hidden.bs.modal', () => {
			this.cleanup();
			if (this.options.onClose) {
				this.options.onClose();
			}
		});

		// Carousel events
		const carouselElement = document.getElementById('imageLightboxCarousel');
		carouselElement.addEventListener('slid.bs.carousel', (e) => {
			this.currentIndex = Array.from(e.target.querySelectorAll('.carousel-item')).indexOf(e.relatedTarget);
			this.updateCounter();
			this.updateThumbnails();
			this.resetZoom();
			if (this.options.onNavigate) {
				this.options.onNavigate(this.currentImages[this.currentIndex], this.currentIndex);
			}
		});

		// Zoom events
		if (this.options.zoom) {
			this.bindZoomEvents();
		}

		// Slideshow events
		if (this.options.slideshow) {
			this.bindSlideshowEvents();
		}
	}

	bindKeyboardEvents() {
		this.keyboardHandler = (e) => {
			if (!document.getElementById('imageLightboxModal').classList.contains('show')) return;

			switch (e.key) {
				case 'ArrowLeft':
					e.preventDefault();
					this.carousel.prev();
					break;
				case 'ArrowRight':
					e.preventDefault();
					this.carousel.next();
					break;
				case 'Escape':
					e.preventDefault();
					this.modal.hide();
					break;
				case '+':
				case '=':
					if (this.options.zoom) {
						e.preventDefault();
						this.zoomIn();
					}
					break;
				case '-':
					if (this.options.zoom) {
						e.preventDefault();
						this.zoomOut();
					}
					break;
				case '0':
					if (this.options.zoom) {
						e.preventDefault();
						this.resetZoom();
					}
					break;
			}
		};

		document.addEventListener('keydown', this.keyboardHandler);
	}

	bindTouchEvents() {
		const carouselInner = document.querySelector('#imageLightboxCarousel .carousel-inner');
		let startX = 0;
		let startY = 0;
		let initialDistance = 0;
		let initialZoom = 1;

		carouselInner.addEventListener('touchstart', (e) => {
			if (e.touches.length === 1) {
				startX = e.touches[0].clientX;
				startY = e.touches[0].clientY;
			} else if (e.touches.length === 2 && this.options.zoom) {
				initialDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
				initialZoom = this.currentZoom;
			}
		});

		carouselInner.addEventListener('touchend', (e) => {
			if (e.changedTouches.length === 1) {
				const endX = e.changedTouches[0].clientX;
				const endY = e.changedTouches[0].clientY;
				const diffX = startX - endX;
				const diffY = startY - endY;

				if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
					if (diffX > 0) {
						this.carousel.next();
					} else {
						this.carousel.prev();
					}
				}
			}
		});

		if (this.options.zoom) {
			carouselInner.addEventListener('touchmove', (e) => {
				if (e.touches.length === 2) {
					e.preventDefault();
					const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
					const scale = currentDistance / initialDistance;
					this.setZoom(Math.max(1, Math.min(this.options.maxZoom, initialZoom * scale)));
				}
			});
		}
	}

	bindZoomEvents() {
		// Zoom buttons
		document.addEventListener('click', (e) => {
			if (e.target.classList.contains('image-lightbox-zoom-in')) {
				this.zoomIn();
			} else if (e.target.classList.contains('image-lightbox-zoom-out')) {
				this.zoomOut();
			} else if (e.target.classList.contains('image-lightbox-zoom-reset')) {
				this.resetZoom();
			}
		});

		// Image click to zoom
		document.addEventListener('click', (e) => {
			if (e.target.closest('#imageLightboxCarousel img')) {
				const img = e.target.closest('img');
				if (this.currentZoom === 1) {
					this.zoomIn();
				} else {
					this.resetZoom();
				}
			}
		});

		// Mouse wheel zoom
		document.addEventListener('wheel', (e) => {
			if (document.getElementById('imageLightboxModal').classList.contains('show')) {
				e.preventDefault();
				if (e.deltaY < 0) {
					this.zoomIn();
				} else {
					this.zoomOut();
				}
			}
		});
	}

	bindSlideshowEvents() {
		document.addEventListener('click', (e) => {
			if (e.target.closest('.image-lightbox-slideshow')) {
				this.toggleSlideshow();
			}
		});
	}

	openLightbox(clickedImage) {
		const groupName = clickedImage.dataset.lightbox;
		const mergedOptions = this.mergeDataAttributes(clickedImage);

		// Update options with data attributes
		Object.assign(this.options, mergedOptions);

		// Find all images in the same group
		if (groupName) {
			this.currentImages = Array.from(document.querySelectorAll(`[data-lightbox="${groupName}"]`));
		} else {
			this.currentImages = [clickedImage];
		}

		this.currentIndex = this.currentImages.indexOf(clickedImage);
		this.currentGroup = groupName;

		this.populateCarousel();
		this.updateCounter();
		this.createThumbnails();
		this.modal.show();
	}

	mergeDataAttributes(element) {
		const options = {};
		const dataset = element.dataset;

		// Boolean options
		['navigation', 'thumbnails', 'zoom', 'slideshow', 'keyboard', 'touchGestures', 'showCounter', 'captions'].forEach(key => {
			if (dataset[`lightbox${key.charAt(0).toUpperCase() + key.slice(1)}`] !== undefined) {
				options[key] = dataset[`lightbox${key.charAt(0).toUpperCase() + key.slice(1)}`] !== 'false';
			}
		});

		// Number options
		['zoomLevel', 'maxZoom', 'zoomStep', 'slideshowSpeed'].forEach(key => {
			if (dataset[`lightbox${key.charAt(0).toUpperCase() + key.slice(1)}`] !== undefined) {
				options[key] = parseFloat(dataset[`lightbox${key.charAt(0).toUpperCase() + key.slice(1)}`]);
			}
		});

		// String options
		['animationType', 'overlayColor'].forEach(key => {
			if (dataset[`lightbox${key.charAt(0).toUpperCase() + key.slice(1)}`] !== undefined) {
				options[key] = dataset[`lightbox${key.charAt(0).toUpperCase() + key.slice(1)}`];
			}
		});

		return options;
	}

	populateCarousel() {
		const carouselInner = document.querySelector('#imageLightboxCarousel .carousel-inner');
		carouselInner.innerHTML = '';

		this.currentImages.forEach((img, index) => {
			const carouselItem = document.createElement('div');
			carouselItem.className = `carousel-item ${index === this.currentIndex ? 'active' : ''}`;

			const image = document.createElement('img');
			image.src = img.src;
			image.alt = img.alt || '';
			image.className = 'd-block mx-auto';

			carouselItem.appendChild(image);

			// Add caption if enabled and available
			if (this.options.captions && (img.dataset.lightboxCaption || img.alt)) {
				const caption = document.createElement('div');
				caption.className = 'image-lightbox-caption';
				caption.textContent = img.dataset.lightboxCaption || img.alt;
				carouselItem.appendChild(caption);
			}

			carouselInner.appendChild(carouselItem);
		});
	}

	updateCounter() {
		if (!this.options.showCounter) return;

		const counter = document.querySelector('.image-lightbox-counter');
		if (counter) {
			counter.textContent = `${this.currentIndex + 1} of ${this.currentImages.length}`;
		}
	}

	createThumbnails() {
		if (!this.options.thumbnails) return;

		const thumbnailContainer = document.querySelector('.image-lightbox-thumbnails');
		if (!thumbnailContainer) return;

		thumbnailContainer.innerHTML = '';

		this.currentImages.forEach((img, index) => {
			const thumbnail = document.createElement('img');
			thumbnail.src = img.src;
			thumbnail.className = `image-lightbox-thumbnail me-2 ${index === this.currentIndex ? 'active' : ''}`;
			thumbnail.addEventListener('click', () => {
				this.carousel.to(index);
			});
			thumbnailContainer.appendChild(thumbnail);
		});
	}

	updateThumbnails() {
		if (!this.options.thumbnails) return;

		const thumbnails = document.querySelectorAll('.image-lightbox-thumbnail');
		thumbnails.forEach((thumb, index) => {
			thumb.classList.toggle('active', index === this.currentIndex);
		});
	}

	// Zoom methods
	zoomIn() {
		if (this.currentZoom < this.options.maxZoom) {
			this.currentZoom = Math.min(this.options.maxZoom, this.currentZoom + this.options.zoomStep);
			this.applyZoom();
		}
	}

	zoomOut() {
		if (this.currentZoom > 1) {
			this.currentZoom = Math.max(1, this.currentZoom - this.options.zoomStep);
			this.applyZoom();
		}
	}

	resetZoom() {
		this.currentZoom = 1;
		this.applyZoom();
	}

	setZoom(level) {
		this.currentZoom = Math.max(1, Math.min(this.options.maxZoom, level));
		this.applyZoom();
	}

	applyZoom() {
		const activeImage = document.querySelector('#imageLightboxCarousel .carousel-item.active img');
		if (activeImage) {
			activeImage.style.transform = `scale(${this.currentZoom})`;
			activeImage.closest('.carousel-item').classList.toggle('zoomed', this.currentZoom > 1);

			if (this.options.onZoom) {
				this.options.onZoom(this.currentZoom);
			}
		}
	}

	// Slideshow methods
	toggleSlideshow() {
		if (this.slideshowInterval) {
			this.stopSlideshow();
		} else {
			this.startSlideshow();
		}
	}

	startSlideshow() {
		this.slideshowInterval = setInterval(() => {
			this.carousel.next();
		}, this.options.slideshowSpeed);

		const button = document.querySelector('.image-lightbox-slideshow i');
		if (button) {
			button.className = 'bi bi-pause';
		}
	}

	stopSlideshow() {
		if (this.slideshowInterval) {
			clearInterval(this.slideshowInterval);
			this.slideshowInterval = null;
		}

		const button = document.querySelector('.image-lightbox-slideshow i');
		if (button) {
			button.className = 'bi bi-play';
		}
	}

	// Utility methods
	getTouchDistance(touch1, touch2) {
		const dx = touch1.clientX - touch2.clientX;
		const dy = touch1.clientY - touch2.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	cleanup() {
		this.stopSlideshow();
		this.resetZoom();

		if (this.keyboardHandler) {
			document.removeEventListener('keydown', this.keyboardHandler);
		}
	}

	// Public API methods
	destroy() {
		this.cleanup();
		const modalElement = document.getElementById('imageLightboxModal');
		if (modalElement) {
			modalElement.remove();
		}

		const styles = document.getElementById('image-lightbox-styles');
		if (styles) {
			styles.remove();
		}

		this.isInitialized = false;
	}

	open(imageSelector, index = 0) {
		const images = document.querySelectorAll(imageSelector);
		if (images[index]) {
			this.openLightbox(images[index]);
		}
	}

	close() {
		if (this.modal) {
			this.modal.hide();
		}
	}

	next() {
		if (this.carousel) {
			this.carousel.next();
		}
	}

	prev() {
		if (this.carousel) {
			this.carousel.prev();
		}
	}

	goTo(index) {
		if (this.carousel && index >= 0 && index < this.currentImages.length) {
			this.carousel.to(index);
		}
	}
}