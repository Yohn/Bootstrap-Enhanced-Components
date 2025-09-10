/**
 * Example JavaScript for ImageLightbox Demo
 * This file demonstrates various ways to initialize and control the ImageLightbox
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {

	// Initialize ImageLightbox with default settings
	const lightbox = new ImageLightbox({
		// Core functionality
		navigation: true,
		thumbnails: false, // Will be overridden by data attributes where needed
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
		animationType: 'fade',

		// Styling
		overlayColor: 'rgba(0, 0, 0, 0.9)',

		// Callbacks for demonstration
		onOpen: function(image, index) {
			console.log('Lightbox opened:', image.src, 'Index:', index);

			// Show toast notification
			showToast('Lightbox opened', 'Image ' + (index + 1) + ' displayed');
		},

		onClose: function() {
			console.log('Lightbox closed');
			showToast('Lightbox closed', 'Thanks for viewing!');
		},

		onNavigate: function(image, index) {
			console.log('Navigated to:', image.src, 'Index:', index);
		},

		onZoom: function(zoomLevel) {
			console.log('Zoom level changed to:', zoomLevel);
			if (zoomLevel > 2) {
				showToast('High zoom active', 'Zoom level: ' + zoomLevel.toFixed(1) + 'x');
			}
		}
	});

	// Programmatic control examples
	document.getElementById('openGallery').addEventListener('click', function() {
		// Open the basic gallery starting from the second image
		lightbox.open('[data-lightbox="basic-gallery"]', 1);
	});

	document.getElementById('openSingle').addEventListener('click', function() {
		// Open a single image
		lightbox.open('[data-lightbox="single-portrait"]', 0);
	});

	// Dynamic image addition example
	const dynamicGallery = document.createElement('div');
	dynamicGallery.className = 'mt-5';
	dynamicGallery.innerHTML = `
		<h3>Dynamically Added Images</h3>
		<p class="text-muted">These images were added after page load to demonstrate dynamic functionality.</p>
		<div class="row g-3">
			<div class="col-md-3">
				<img src="https://picsum.photos/300/200?random=100"
					 class="img-fluid demo-image w-100"
					 data-lightbox="dynamic-gallery"
					 data-lightbox-caption="Dynamically added image 1"
					 alt="Dynamic 1">
			</div>
			<div class="col-md-3">
				<img src="https://picsum.photos/300/200?random=101"
					 class="img-fluid demo-image w-100"
					 data-lightbox="dynamic-gallery"
					 data-lightbox-caption="Dynamically added image 2"
					 alt="Dynamic 2">
			</div>
			<div class="col-md-3">
				<img src="https://picsum.photos/300/200?random=102"
					 class="img-fluid demo-image w-100"
					 data-lightbox="dynamic-gallery"
					 data-lightbox-caption="Dynamically added image 3"
					 alt="Dynamic 3">
			</div>
			<div class="col-md-3">
				<button class="btn btn-outline-primary h-100 w-100 d-flex align-items-center justify-content-center"
						onclick="addMoreImages()">
					<i class="bi bi-plus-lg me-2"></i>Add More
				</button>
			</div>
		</div>
	`;

	// Add dynamic gallery to page
	document.querySelector('.container').appendChild(dynamicGallery);

	// Performance monitoring
	let openTime;

	// Monitor lightbox performance
	const originalOpen = lightbox.openLightbox;
	lightbox.openLightbox = function(...args) {
		openTime = performance.now();
		return originalOpen.apply(this, args);
	};

	// Log performance when modal is shown
	document.addEventListener('shown.bs.modal', function(e) {
		if (e.target.id === 'imageLightboxModal') {
			const loadTime = performance.now() - openTime;
			console.log('Lightbox opened in:', loadTime.toFixed(2), 'ms');
		}
	});

	// Example of creating a custom lightbox instance with different settings
	const customLightbox = new ImageLightbox({
		imageSelector: '[data-custom-lightbox]',
		navigation: false,
		zoom: false,
		keyboard: false,
		overlayColor: 'rgba(0, 0, 100, 0.8)',
		animationType: 'slide',
		onOpen: function() {
			console.log('Custom lightbox opened');
		}
	});

	// Add some custom lightbox images
	const customSection = document.createElement('div');
	customSection.className = 'mt-5 p-4 bg-primary bg-opacity-10 rounded';
	customSection.innerHTML = `
		<h4>Custom Lightbox Instance</h4>
		<p class="text-muted">These images use a separate lightbox instance with custom settings (no navigation, no zoom, blue overlay).</p>
		<div class="row g-3">
			<div class="col-md-6">
				<img src="https://picsum.photos/400/300?random=200"
					 class="img-fluid demo-image w-100"
					 data-custom-lightbox="custom-group"
					 data-lightbox-caption="Custom lightbox image 1"
					 alt="Custom 1">
			</div>
			<div class="col-md-6">
				<img src="https://picsum.photos/400/300?random=201"
					 class="img-fluid demo-image w-100"
					 data-custom-lightbox="custom-group"
					 data-lightbox-caption="Custom lightbox image 2"
					 alt="Custom 2">
			</div>
		</div>
	`;

	document.querySelector('.container').appendChild(customSection);

	// Theme switching example
	const themeToggle = document.createElement('button');
	themeToggle.className = 'btn btn-outline-secondary position-fixed top-0 end-0 m-3';
	themeToggle.style.zIndex = '1030';
	themeToggle.innerHTML = '<i class="bi bi-sun"></i>';
	themeToggle.title = 'Toggle theme';

	themeToggle.addEventListener('click', function() {
		const currentTheme = document.documentElement.getAttribute('data-bs-theme');
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

		document.documentElement.setAttribute('data-bs-theme', newTheme);

		// Update button icon
		const icon = newTheme === 'dark' ? 'bi-moon' : 'bi-sun';
		themeToggle.innerHTML = `<i class="bi ${icon}"></i>`;

		showToast('Theme changed', `Switched to ${newTheme} mode`);
	});

	document.body.appendChild(themeToggle);

	// Error handling example
	window.addEventListener('error', function(e) {
		if (e.message.includes('lightbox')) {
			console.error('Lightbox error:', e.message);
			showToast('Error', 'An error occurred with the lightbox', 'error');
		}
	});

	// Mobile-specific optimizations
	if ('ontouchstart' in window) {
		// Add mobile-specific styles or behaviors
		document.body.classList.add('mobile-device');

		// Prevent zoom on double tap for demo images
		document.addEventListener('touchend', function(e) {
			if (e.target.classList.contains('demo-image')) {
				e.preventDefault();
			}
		});
	}

	// Accessibility improvements
	document.addEventListener('keydown', function(e) {
		// Add custom keyboard shortcuts for the demo
		if (e.key === 'h' && e.ctrlKey) {
			e.preventDefault();
			showKeyboardHelp();
		}
	});

	// Initialize tooltips for demo
	const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
	tooltipTriggerList.map(function(tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl);
	});

	console.log('ImageLightbox demo initialized successfully');
});

/**
 * Helper function to show toast notifications
 */
function showToast(title, message, type = 'info') {
	// Create toast container if it doesn't exist
	let toastContainer = document.getElementById('toast-container');
	if (!toastContainer) {
		toastContainer = document.createElement('div');
		toastContainer.id = 'toast-container';
		toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
		toastContainer.style.zIndex = '1055';
		document.body.appendChild(toastContainer);
	}

	// Create toast element
	const toastId = 'toast-' + Date.now();
	const toastEl = document.createElement('div');
	toastEl.id = toastId;
	toastEl.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'primary'} border-0`;
	toastEl.setAttribute('role', 'alert');
	toastEl.setAttribute('aria-live', 'assertive');
	toastEl.setAttribute('aria-atomic', 'true');

	toastEl.innerHTML = `
		<div class="d-flex">
			<div class="toast-body">
				<strong>${title}</strong><br>
				${message}
			</div>
			<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
		</div>
	`;

	toastContainer.appendChild(toastEl);

	// Initialize and show toast
	const toast = new bootstrap.Toast(toastEl, {
		autohide: true,
		delay: 3000
	});

	toast.show();

	// Remove toast element after it's hidden
	toastEl.addEventListener('hidden.bs.toast', function() {
		toastEl.remove();
	});
}

/**
 * Function to add more images dynamically
 */
function addMoreImages() {
	const gallery = document.querySelector('[data-lightbox="dynamic-gallery"]').closest('.row');
	const currentCount = gallery.querySelectorAll('img').length;

	const newCol = document.createElement('div');
	newCol.className = 'col-md-3';

	const randomId = Math.floor(Math.random() * 1000) + 200;
	newCol.innerHTML = `
		<img src="https://picsum.photos/300/200?random=${randomId}"
			 class="img-fluid demo-image w-100"
			 data-lightbox="dynamic-gallery"
			 data-lightbox-caption="Dynamically added image ${currentCount + 1}"
			 alt="Dynamic ${currentCount + 1}">
	`;

	// Insert before the "Add More" button
	const addButton = gallery.querySelector('button').closest('.col-md-3');
	gallery.insertBefore(newCol, addButton);

	showToast('Image added', `Added image ${currentCount + 1} to gallery`);
}

/**
 * Show keyboard help modal
 */
function showKeyboardHelp() {
	const helpModal = document.createElement('div');
	helpModal.className = 'modal fade';
	helpModal.innerHTML = `
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Keyboard Shortcuts</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>
				<div class="modal-body">
					<table class="table table-sm">
						<tbody>
							<tr><td><kbd>←</kbd> <kbd>→</kbd></td><td>Navigate between images</td></tr>
							<tr><td><kbd>Esc</kbd></td><td>Close lightbox</td></tr>
							<tr><td><kbd>+</kbd> <kbd>=</kbd></td><td>Zoom in</td></tr>
							<tr><td><kbd>-</kbd></td><td>Zoom out</td></tr>
							<tr><td><kbd>0</kbd></td><td>Reset zoom</td></tr>
							<tr><td><kbd>Ctrl</kbd> + <kbd>H</kbd></td><td>Show this help</td></tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	`;

	document.body.appendChild(helpModal);
	const modal = new bootstrap.Modal(helpModal);
	modal.show();

	helpModal.addEventListener('hidden.bs.modal', function() {
		helpModal.remove();
	});
}