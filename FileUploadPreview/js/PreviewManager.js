/**
 * PreviewManager - Handles file preview generation
 */
class PreviewManager {
	constructor(options = {}) {
		this.config = {
			// Image preview settings
			imagePreviewSize: 150,
			imageQuality: 0.8,
			generateImageThumbnails: true,

			// Video preview settings
			videoPreviewSize: 150,
			videoSeekTime: 1, // Seconds to seek for thumbnail
			videoQuality: 0.7,
			generateVideoThumbnails: true,

			// Canvas settings
			canvasSupported: true,

			// File type icons (Bootstrap Icons)
			fileIcons: {
				// Images
				'image': 'bi-file-earmark-image',
				'jpg': 'bi-file-earmark-image',
				'jpeg': 'bi-file-earmark-image',
				'png': 'bi-file-earmark-image',
				'gif': 'bi-file-earmark-image',
				'webp': 'bi-file-earmark-image',
				'svg': 'bi-file-earmark-image',

				// Videos
				'video': 'bi-file-earmark-play',
				'mp4': 'bi-file-earmark-play',
				'avi': 'bi-file-earmark-play',
				'mov': 'bi-file-earmark-play',
				'wmv': 'bi-file-earmark-play',
				'webm': 'bi-file-earmark-play',

				// Documents
				'pdf': 'bi-file-earmark-pdf',
				'doc': 'bi-file-earmark-word',
				'docx': 'bi-file-earmark-word',
				'xls': 'bi-file-earmark-excel',
				'xlsx': 'bi-file-earmark-excel',
				'ppt': 'bi-file-earmark-ppt',
				'pptx': 'bi-file-earmark-ppt',
				'txt': 'bi-file-earmark-text',

				// Archives
				'zip': 'bi-file-earmark-zip',
				'rar': 'bi-file-earmark-zip',
				'7z': 'bi-file-earmark-zip',

				// Audio
				'mp3': 'bi-file-earmark-music',
				'wav': 'bi-file-earmark-music',
				'ogg': 'bi-file-earmark-music',

				// Code
				'js': 'bi-file-earmark-code',
				'html': 'bi-file-earmark-code',
				'css': 'bi-file-earmark-code',
				'json': 'bi-file-earmark-code',

				// Default
				'default': 'bi-file-earmark'
			},

			// Error handling
			fallbackToIcon: true,
			showLoadingSpinner: true,

			...options
		};

		// Check canvas support
		this.config.canvasSupported = this.checkCanvasSupport();
	}

	/**
	 * Check if canvas is supported
	 */
	checkCanvasSupport() {
		try {
			const canvas = document.createElement('canvas');
			return !!(canvas.getContext && canvas.getContext('2d'));
		} catch (e) {
			return false;
		}
	}

	/**
	 * Generate preview for any file type
	 */
	async generatePreview(file, container, size = null) {
		const previewSize = size || Math.max(this.config.imagePreviewSize, this.config.videoPreviewSize);

		try {
			if (this.isImage(file) && this.config.generateImageThumbnails) {
				return await this.generateImagePreview(file, container, previewSize);
			} else if (this.isVideo(file) && this.config.generateVideoThumbnails) {
				return await this.generateVideoPreview(file, container, previewSize);
			} else {
				return this.generateFileIconPreview(file, container, previewSize);
			}
		} catch (error) {
			console.warn('Preview generation failed:', error);
			if (this.config.fallbackToIcon) {
				return this.generateFileIconPreview(file, container, previewSize);
			}
			throw error;
		}
	}

	/**
	 * Generate image preview
	 */
	generateImagePreview(file, container, size) {
		return new Promise((resolve, reject) => {
			const img = document.createElement('img');
			img.className = 'card-img-top';
			img.style.width = '100%';
			img.style.height = `${size}px`;
			img.style.objectFit = 'cover';
			img.alt = file.name;

			// Show loading if enabled
			if (this.config.showLoadingSpinner) {
				this.showLoadingSpinner(container);
			}

			const reader = new FileReader();

			reader.onload = (e) => {
				img.onload = () => {
					this.clearLoadingSpinner(container);

					// Optimize image if canvas is supported
					if (this.config.canvasSupported && this.shouldOptimizeImage(file)) {
						try {
							const optimizedSrc = this.optimizeImage(img, size);
							img.src = optimizedSrc;
						} catch (optimizeError) {
							console.warn('Image optimization failed:', optimizeError);
							// Keep original image
						}
					}

					container.appendChild(img);
					resolve(img);
				};

				img.onerror = () => {
					this.clearLoadingSpinner(container);
					reject(new Error('Failed to load image'));
				};

				img.src = e.target.result;
			};

			reader.onerror = () => {
				this.clearLoadingSpinner(container);
				reject(new Error('Failed to read file'));
			};

			reader.readAsDataURL(file);
		});
	}

	/**
	 * Generate video preview with thumbnail
	 */
	generateVideoPreview(file, container, size) {
		return new Promise((resolve, reject) => {
			if (!this.config.canvasSupported) {
				reject(new Error('Canvas not supported for video thumbnails'));
				return;
			}

			const video = document.createElement('video');
			video.style.display = 'none';
			video.muted = true;
			video.playsInline = true;

			// Show loading if enabled
			if (this.config.showLoadingSpinner) {
				this.showLoadingSpinner(container);
			}

			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			const reader = new FileReader();

			reader.onload = (e) => {
				video.src = e.target.result;

				video.addEventListener('loadedmetadata', () => {
					// Seek to specified time or 10% of duration, whichever is smaller
					const seekTime = Math.min(this.config.videoSeekTime, video.duration * 0.1);
					video.currentTime = seekTime;
				});

				video.addEventListener('seeked', () => {
					try {
						// Create thumbnail
						canvas.width = size;
						canvas.height = size;

						// Calculate dimensions to maintain aspect ratio
						const aspectRatio = video.videoWidth / video.videoHeight;
						let drawWidth = size;
						let drawHeight = size;
						let offsetX = 0;
						let offsetY = 0;

						if (aspectRatio > 1) {
							// Video is wider
							drawHeight = size / aspectRatio;
							offsetY = (size - drawHeight) / 2;
						} else {
							// Video is taller
							drawWidth = size * aspectRatio;
							offsetX = (size - drawWidth) / 2;
						}

						// Fill background
						ctx.fillStyle = '#000';
						ctx.fillRect(0, 0, size, size);

						// Draw video frame
						ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

						// Create thumbnail image
						const thumbnail = document.createElement('img');
						thumbnail.className = 'card-img-top position-relative';
						thumbnail.style.width = '100%';
						thumbnail.style.height = `${size}px`;
						thumbnail.style.objectFit = 'cover';
						thumbnail.alt = file.name;
						thumbnail.src = canvas.toDataURL('image/jpeg', this.config.videoQuality);

						// Add play icon overlay
						const overlay = this.createPlayIconOverlay();
						const wrapper = document.createElement('div');
						wrapper.className = 'position-relative';
						wrapper.appendChild(thumbnail);
						wrapper.appendChild(overlay);

						this.clearLoadingSpinner(container);
						container.appendChild(wrapper);

						// Clean up
						video.remove();

						resolve(wrapper);
					} catch (error) {
						this.clearLoadingSpinner(container);
						reject(error);
					}
				});

				video.addEventListener('error', () => {
					this.clearLoadingSpinner(container);
					reject(new Error('Failed to load video'));
				});
			};

			reader.onerror = () => {
				this.clearLoadingSpinner(container);
				reject(new Error('Failed to read video file'));
			};

			reader.readAsDataURL(file);
		});
	}

	/**
	 * Generate file icon preview
	 */
	generateFileIconPreview(file, container, size) {
		const iconDiv = document.createElement('div');
		iconDiv.className = 'card-img-top d-flex flex-column align-items-center justify-content-center bg-light text-muted';
		iconDiv.style.height = `${size}px`;

		// Get file icon
		const iconClass = this.getFileIcon(file);
		const icon = document.createElement('i');
		icon.className = `${iconClass} fs-1 mb-2`;

		// Add file extension badge
		const extension = this.getFileExtension(file);
		const badge = document.createElement('span');
		badge.className = 'badge bg-secondary text-uppercase';
		badge.textContent = extension;

		iconDiv.appendChild(icon);
		iconDiv.appendChild(badge);
		container.appendChild(iconDiv);

		return Promise.resolve(iconDiv);
	}

	/**
	 * Create play icon overlay for video thumbnails
	 */
	createPlayIconOverlay() {
		const overlay = document.createElement('div');
		overlay.className = 'position-absolute top-50 start-50 translate-middle';
		overlay.style.pointerEvents = 'none';

		const playIcon = document.createElement('div');
		playIcon.className = 'bg-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center';
		playIcon.style.width = '3rem';
		playIcon.style.height = '3rem';

		const icon = document.createElement('i');
		icon.className = 'bi bi-play-fill fs-4';
		icon.style.marginLeft = '2px'; // Optical centering

		playIcon.appendChild(icon);
		overlay.appendChild(playIcon);

		return overlay;
	}

	/**
	 * Show loading spinner
	 */
	showLoadingSpinner(container) {
		const spinner = document.createElement('div');
		spinner.className = 'card-img-top d-flex align-items-center justify-content-center';
		spinner.style.height = `${this.config.imagePreviewSize}px`;
		spinner.setAttribute('data-loading-spinner', 'true');

		const spinnerEl = document.createElement('div');
		spinnerEl.className = 'spinner-border text-primary';
		spinnerEl.setAttribute('role', 'status');

		const srText = document.createElement('span');
		srText.className = 'visually-hidden';
		srText.textContent = 'Loading...';

		spinnerEl.appendChild(srText);
		spinner.appendChild(spinnerEl);
		container.appendChild(spinner);
	}

	/**
	 * Clear loading spinner
	 */
	clearLoadingSpinner(container) {
		const spinner = container.querySelector('[data-loading-spinner="true"]');
		if (spinner) {
			spinner.remove();
		}
	}

	/**
	 * Check if image should be optimized
	 */
	shouldOptimizeImage(file) {
		// Optimize if file is large or we want to generate thumbnails
		return file.size > 500000 || this.config.generateImageThumbnails; // 500KB threshold
	}

	/**
	 * Optimize image using canvas
	 */
	optimizeImage(img, maxSize) {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		// Calculate new dimensions
		let { width, height } = this.calculateOptimizedDimensions(
			img.naturalWidth,
			img.naturalHeight,
			maxSize
		);

		canvas.width = width;
		canvas.height = height;

		// Draw optimized image
		ctx.drawImage(img, 0, 0, width, height);

		return canvas.toDataURL('image/jpeg', this.config.imageQuality);
	}

	/**
	 * Calculate optimized dimensions maintaining aspect ratio
	 */
	calculateOptimizedDimensions(originalWidth, originalHeight, maxSize) {
		const aspectRatio = originalWidth / originalHeight;

		let width = maxSize;
		let height = maxSize;

		if (aspectRatio > 1) {
			// Image is wider
			height = maxSize / aspectRatio;
		} else {
			// Image is taller
			width = maxSize * aspectRatio;
		}

		return { width: Math.round(width), height: Math.round(height) };
	}

	/**
	 * Get file extension
	 */
	getFileExtension(file) {
		const extension = file.name.split('.').pop();
		return extension ? extension.toLowerCase() : 'file';
	}

	/**
	 * Get file icon class
	 */
	getFileIcon(file) {
		const extension = this.getFileExtension(file);
		const mimeType = file.type.toLowerCase();

		// Check by extension first
		if (this.config.fileIcons[extension]) {
			return this.config.fileIcons[extension];
		}

		// Check by mime type category
		if (mimeType.startsWith('image/')) {
			return this.config.fileIcons.image;
		} else if (mimeType.startsWith('video/')) {
			return this.config.fileIcons.video;
		} else if (mimeType.startsWith('audio/')) {
			return this.config.fileIcons.mp3;
		} else if (mimeType.startsWith('text/')) {
			return this.config.fileIcons.txt;
		}

		return this.config.fileIcons.default;
	}

	/**
	 * Check if file is an image
	 */
	isImage(file) {
		return file.type.startsWith('image/');
	}

	/**
	 * Check if file is a video
	 */
	isVideo(file) {
		return file.type.startsWith('video/');
	}

	/**
	 * Get file type category
	 */
	getFileCategory(file) {
		const mimeType = file.type.toLowerCase();

		if (mimeType.startsWith('image/')) return 'image';
		if (mimeType.startsWith('video/')) return 'video';
		if (mimeType.startsWith('audio/')) return 'audio';
		if (mimeType.startsWith('text/')) return 'text';

		const extension = this.getFileExtension(file);
		const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
		const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
		const codeTypes = ['js', 'html', 'css', 'json', 'xml', 'php', 'py'];

		if (documentTypes.includes(extension)) return 'document';
		if (archiveTypes.includes(extension)) return 'archive';
		if (codeTypes.includes(extension)) return 'code';

		return 'other';
	}

	/**
	 * Generate multiple preview sizes
	 */
	async generateMultiplePreviews(file, container, sizes = [150, 300, 600]) {
		const previews = {};

		for (const size of sizes) {
			try {
				const previewContainer = document.createElement('div');
				const preview = await this.generatePreview(file, previewContainer, size);
				previews[size] = {
					element: preview,
					container: previewContainer
				};
			} catch (error) {
				console.warn(`Failed to generate ${size}px preview:`, error);
			}
		}

		return previews;
	}

	/**
	 * Update configuration
	 */
	updateConfig(newConfig) {
		this.config = { ...this.config, ...newConfig };
	}
}