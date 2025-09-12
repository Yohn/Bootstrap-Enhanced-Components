/**
 * Demo JavaScript for ImageLightbox Example Page
 * Demonstrates initialization and event handling
 */
document.addEventListener('DOMContentLoaded', function() {

	// Initialize the ImageLightbox with custom configuration
	const lightbox = new ImageLightbox({
		hoverZoomScale: 1.05,          // Subtle hover effect
		transitionDuration: 300,        // Smooth transitions
		zoomStep: 0.3,                 // Faster zoom steps
		maxZoom: 4,                    // Allow more zoom
		minZoom: 0.5,                  // Allow zoom out
		enableKeyboard: true,          // Enable all keyboard controls
		enableTouch: true,             // Enable touch gestures
		enableZoom: true,              // Enable zoom functionality
		showArrows: true,              // Show navigation arrows
		showCloseButton: true,         // Show close button
		showCounter: true,             // Show image counter for galleries
		backdropOpacity: 0.9,          // Semi-transparent backdrop
		animationType: 'fade'          // Smooth fade transitions
	});

	// Add event listeners for demonstration
	document.addEventListener('lightbox:opened', function(e) {
		console.log('Lightbox opened:', e.detail);

		// Optional: Show a toast notification
		showToast('Lightbox opened', 'info');

		// Optional: Track analytics
		// analytics.track('lightbox_opened', e.detail);
	});

	document.addEventListener('lightbox:closed', function(e) {
		console.log('Lightbox closed:', e.detail);
		showToast('Lightbox closed', 'secondary');
	});

	document.addEventListener('lightbox:changed', function(e) {
		console.log('Image changed to index:', e.detail.index);
		showToast(`Image ${e.detail.index + 1} of gallery`, 'primary');
	});

	document.addEventListener('lightbox:zoomed', function(e) {
		console.log('Zoom level changed to:', e.detail.zoom);

		// Show zoom level feedback
		const zoomPercent = Math.round(e.detail.zoom * 100);
		showToast(`Zoom: ${zoomPercent}%`, 'success');
	});

	// Demo: Programmatic lightbox opening
	function addDemoControls() {
		// Create demo control panel
		const controlPanel = document.createElement('div');
		controlPanel.className = 'demo-controls position-fixed bottom-0 start-0 m-3 p-3 bg-dark rounded shadow';
		controlPanel.style.zIndex = '1050';
		controlPanel.innerHTML = `
			<h6 class="text-light mb-2">Demo Controls</h6>
			<div class="btn-group-vertical d-grid gap-2" role="group">
				<button type="button" class="btn btn-outline-primary btn-sm" id="openFirst">
					Open First Gallery Image
				</button>
				<button type="button" class="btn btn-outline-success btn-sm" id="openSingle">
					Open Single Image
				</button>
				<button type="button" class="btn btn-outline-warning btn-sm" id="toggleZoom">
					Toggle Zoom
				</button>
				<button type="button" class="btn btn-outline-info btn-sm" id="getState">
					Log State
				</button>
			</div>
		`;

		document.body.appendChild(controlPanel);

		// Bind demo control events
		document.getElementById('openFirst').addEventListener('click', function() {
			const firstGalleryImage = document.querySelector('[data-lightbox-gallery="demo-gallery"]');
			if (firstGalleryImage) {
				lightbox.openImage(firstGalleryImage, 'demo-gallery');
			}
		});

		document.getElementById('openSingle').addEventListener('click', function() {
			const singleImage = document.querySelector('.single-image-demo img');
			if (singleImage) {
				lightbox.openImage(singleImage);
			}
		});

		document.getElementById('toggleZoom').addEventListener('click', function() {
			const currentConfig = lightbox.config;
			lightbox.updateConfig({
				enableZoom: !currentConfig.enableZoom
			});

			showToast(`Zoom ${currentConfig.enableZoom ? 'disabled' : 'enabled'}`, 'warning');
		});

		document.getElementById('getState').addEventListener('click', function() {
			const state = lightbox.getState();
			console.log('Current lightbox state:', state);

			showToast('State logged to console', 'info');
		});
	}

	// Add keyboard shortcuts info
	function addKeyboardShortcuts() {
		const shortcutsPanel = document.createElement('div');
		shortcutsPanel.className = 'demo-shortcuts position-fixed bottom-0 end-0 m-3 p-3 bg-dark rounded shadow';
		shortcutsPanel.style.zIndex = '1050';
		shortcutsPanel.style.maxWidth = '300px';
		shortcutsPanel.innerHTML = `
			<h6 class="text-light mb-2">
				<i class="bi bi-keyboard"></i> Keyboard Shortcuts
			</h6>
			<div class="text-light-emphasis small">
				<div class="d-flex justify-content-between mb-1">
					<span>ESC</span>
					<span>Close lightbox</span>
				</div>
				<div class="d-flex justify-content-between mb-1">
					<span>← →</span>
					<span>Navigate gallery</span>
				</div>
				<div class="d-flex justify-content-between mb-1">
					<span>+ -</span>
					<span>Zoom in/out</span>
				</div>
				<div class="d-flex justify-content-between mb-1">
					<span>0</span>
					<span>Reset zoom</span>
				</div>
				<div class="d-flex justify-content-between">
					<span>Wheel</span>
					<span>Zoom (on image)</span>
				</div>
			</div>
		`;

		document.body.appendChild(shortcutsPanel);
	}

	// Toast notification system for demo feedback
	function showToast(message, type = 'info') {
		// Create toast container if it doesn't exist
		let toastContainer = document.querySelector('.toast-container');
		if (!toastContainer) {
			toastContainer = document.createElement('div');
			toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
			toastContainer.style.zIndex = '9999';
			document.body.appendChild(toastContainer);
		}

		// Create toast element
		const toastId = 'toast-' + Date.now();
		const toast = document.createElement('div');
		toast.className = `toast align-items-center text-bg-${type} border-0`;
		toast.id = toastId;
		toast.setAttribute('role', 'alert');
		toast.innerHTML = `
			<div class="d-flex">
				<div class="toast-body">${message}</div>
				<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
			</div>
		`;

		toastContainer.appendChild(toast);

		// Initialize and show toast using Bootstrap
		const bsToast = new bootstrap.Toast(toast, {
			autohide: true,
			delay: 3000
		});
		bsToast.show();

		// Remove toast element after it's hidden
		toast.addEventListener('hidden.bs.toast', function() {
			toast.remove();
		});
	}

	// Add loading overlay for demo images
	function addImageLoadingEffects() {
		const images = document.querySelectorAll('.lightbox-trigger');

		images.forEach(img => {
			// Add loading class initially
			img.addEventListener('load', function() {
				this.classList.add('loaded');
			});

			// Add error handling
			img.addEventListener('error', function() {
				console.warn('Failed to load image:', this.src);
				showToast('Failed to load image', 'danger');
			});
		});
	}

	// Performance monitoring for demo
	function addPerformanceMonitoring() {
		let openTime;

		document.addEventListener('lightbox:opened', function() {
			openTime = performance.now();
		});

		document.addEventListener('lightbox:closed', function() {
			if (openTime) {
				const duration = performance.now() - openTime;
				console.log(`Lightbox was open for ${Math.round(duration)}ms`);
			}
		});
	}

	// Initialize demo features
	function initializeDemo() {
		console.log('ImageLightbox Demo initialized');

		// Add demo features
		addDemoControls();
		addKeyboardShortcuts();
		addImageLoadingEffects();
		addPerformanceMonitoring();

		// Show welcome message
		setTimeout(() => {
			showToast('ImageLightbox Demo Ready! Click any image to start.', 'success');
		}, 500);

		// Add some fun easter eggs
		let clickCount = 0;
		document.addEventListener('click', function(e) {
			if (e.target.classList.contains('lightbox-trigger')) {
				clickCount++;
				if (clickCount === 10) {
					showToast('🎉 You\'ve clicked 10 images! Lightbox master!', 'primary');
				}
			}
		});
	}

	// Add CSS for demo enhancements
	function addDemoStyles() {
		const style = document.createElement('style');
		style.textContent = `
			.demo-controls, .demo-shortcuts {
				backdrop-filter: blur(10px);
				border: 1px solid rgba(255, 255, 255, 0.1);
			}

			.lightbox-trigger {
				transition: all 0.3s ease;
			}

			.lightbox-trigger:not(.loaded) {
				opacity: 0.7;
				filter: blur(1px);
			}

			.lightbox-trigger.loaded {
				opacity: 1;
				filter: none;
			}

			.toast-container .toast {
				backdrop-filter: blur(10px);
			}

			@media (max-width: 768px) {
				.demo-controls, .demo-shortcuts {
					font-size: 0.8rem;
					padding: 0.75rem !important;
				}

				.demo-shortcuts {
					display: none;
				}
			}
		`;
		document.head.appendChild(style);
	}

	// Initialize everything
	addDemoStyles();
	initializeDemo();

	// Expose lightbox instance globally for console debugging
	window.demoLightbox = lightbox;
	console.log('Access lightbox instance via window.demoLightbox');
});
