/**
 * Demo JavaScript for File Upload Preview Examples
 */
class FileUploadDemo {
	constructor() {
		this.uploaders = new Map();
		this.statistics = {
			totalFiles: 0,
			totalSize: 0,
			imageCount: 0,
			videoCount: 0,
			documentCount: 0
		};

		this.init();
	}

	/**
	 * Initialize all demo uploaders
	 */
	init() {
		this.initImageGallery();
		this.initDocumentUpload();
		this.initVideoUpload();
		this.initMixedMedia();
		this.initConfigurationPanel();
		this.bindEvents();
		this.updateStatistics();
	}

	/**
	 * Initialize image gallery uploader
	 */
	initImageGallery() {
		const imageUploader = new FileUploadPreview('#imageInput', {
			displayMode: 'preview',
			allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
			maxFileSize: 5 * 1024 * 1024, // 5MB
			maxFiles: 12,
			imagePreviewSize: 150,
			showFileSize: true,
			showFileType: false,
			containerClass: 'file-upload-preview-container fade-in',
			previewGridClass: 'row g-3',
			labels: {
				fileSize: 'Size',
				remove: 'Remove',
				invalidType: 'Only image files are allowed',
				invalidSize: 'Image must be smaller than 5MB',
				maxFilesExceeded: 'Maximum 12 images allowed'
			},
			onFileAdded: (fileData) => {
				this.onFileAdded('image', fileData);
				this.showNotification(`Image "${fileData.file.name}" added`, 'success');
			},
			onFileRemoved: (fileData) => {
				this.onFileRemoved('image', fileData);
				this.showNotification(`Image "${fileData.file.name}" removed`, 'info');
			},
			onValidationError: (errors) => {
				this.showNotification(errors.join(', '), 'danger');
			}
		});

		this.uploaders.set('image', imageUploader);
	}

	/**
	 * Initialize document upload
	 */
	initDocumentUpload() {
		const documentUploader = new FileUploadPreview('#documentInput', {
			displayMode: 'list',
			allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'],
			maxFileSize: 10 * 1024 * 1024, // 10MB
			maxFiles: 8,
			showFileSize: true,
			showFileType: true,
			containerClass: 'file-upload-preview-container file-upload-list fade-in',
			labels: {
				fileSize: 'File Size',
				fileType: 'Document Type',
				remove: 'Delete',
				invalidType: 'Only document files are allowed',
				invalidSize: 'Document must be smaller than 10MB',
				maxFilesExceeded: 'Maximum 8 documents allowed'
			},
			onFileAdded: (fileData) => {
				this.onFileAdded('document', fileData);
				this.showNotification(`Document "${fileData.file.name}" added`, 'success');
			},
			onFileRemoved: (fileData) => {
				this.onFileRemoved('document', fileData);
				this.showNotification(`Document "${fileData.file.name}" removed`, 'info');
			},
			onValidationError: (errors) => {
				this.showNotification(errors.join(', '), 'danger');
			}
		});

		this.uploaders.set('document', documentUploader);
	}

	/**
	 * Initialize video upload
	 */
	initVideoUpload() {
		const videoUploader = new FileUploadPreview('#videoInput', {
			displayMode: 'preview',
			allowedTypes: ['mp4', 'webm', 'mov', 'avi', 'wmv', 'flv', 'mkv'],
			maxFileSize: 50 * 1024 * 1024, // 50MB
			maxFiles: 6,
			videoPreviewSize: 200,
			generateVideoThumbnail: true,
			showFileSize: true,
			showFileType: true,
			containerClass: 'file-upload-preview-container fade-in',
			previewGridClass: 'row g-3',
			labels: {
				fileSize: 'Size',
				fileType: 'Format',
				remove: 'Remove',
				invalidType: 'Only video files are allowed',
				invalidSize: 'Video must be smaller than 50MB',
				maxFilesExceeded: 'Maximum 6 videos allowed'
			},
			onFileAdded: (fileData) => {
				this.onFileAdded('video', fileData);
				this.showNotification(`Video "${fileData.file.name}" added`, 'success');
			},
			onFileRemoved: (fileData) => {
				this.onFileRemoved('video', fileData);
				this.showNotification(`Video "${fileData.file.name}" removed`, 'info');
			},
			onValidationError: (errors) => {
				this.showNotification(errors.join(', '), 'danger');
			}
		});

		this.uploaders.set('video', videoUploader);
	}

	/**
	 * Initialize mixed media upload
	 */
	initMixedMedia() {
		const mixedUploader = new FileUploadPreview('#mixedInput', {
			displayMode: 'preview',
			allowedTypes: [], // All types allowed
			maxFileSize: 5 * 1024 * 1024, // 5MB
			maxFiles: 10,
			imagePreviewSize: 150,
			videoPreviewSize: 150,
			generateVideoThumbnail: true,
			showFileSize: true,
			showFileType: true,
			containerClass: 'file-upload-preview-container fade-in',
			previewGridClass: 'row g-3',
			labels: {
				fileSize: 'Size',
				fileType: 'Type',
				remove: 'Remove',
				invalidSize: 'File must be smaller than 5MB',
				maxFilesExceeded: 'Maximum 10 files allowed'
			},
			onFileAdded: (fileData) => {
				const category = this.getFileCategory(fileData.file);
				this.onFileAdded(category, fileData);
				this.showNotification(`File "${fileData.file.name}" added`, 'success');
			},
			onFileRemoved: (fileData) => {
				const category = this.getFileCategory(fileData.file);
				this.onFileRemoved(category, fileData);
				this.showNotification(`File "${fileData.file.name}" removed`, 'info');
			},
			onValidationError: (errors) => {
				this.showNotification(errors.join(', '), 'danger');
			}
		});

		this.uploaders.set('mixed', mixedUploader);
	}

	/**
	 * Initialize configuration panel
	 */
	initConfigurationPanel() {
		// Display mode change
		document.getElementById('displayModeSelect').addEventListener('change', (e) => {
			this.updateAllConfigs({ displayMode: e.target.value });
		});

		// Preview size change
		document.getElementById('previewSizeSelect').addEventListener('change', (e) => {
			const size = parseInt(e.target.value);
			this.updateAllConfigs({
				imagePreviewSize: size,
				videoPreviewSize: size
			});
		});

		// Max file size change
		document.getElementById('maxSizeSelect').addEventListener('change', (e) => {
			const size = e.target.value ? parseInt(e.target.value) : null;
			this.updateAllConfigs({ maxFileSize: size });
		});

		// Toggle options
		document.getElementById('showFileSize').addEventListener('change', (e) => {
			this.updateAllConfigs({ showFileSize: e.target.checked });
		});

		document.getElementById('showFileType').addEventListener('change', (e) => {
			this.updateAllConfigs({ showFileType: e.target.checked });
		});

		document.getElementById('generateVideoThumbnails').addEventListener('change', (e) => {
			this.updateAllConfigs({ generateVideoThumbnail: e.target.checked });
		});
	}

	/**
	 * Bind global events
	 */
	bindEvents() {
		// Theme toggle
		window.toggleTheme = () => {
			const html = document.documentElement;
			const currentTheme = html.getAttribute('data-bs-theme');
			const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
			html.setAttribute('data-bs-theme', newTheme);

			const icon = document.querySelector('[onclick="toggleTheme()"] i');
			icon.className = newTheme === 'dark' ? 'bi bi-sun' : 'bi bi-moon';
		};

		// Show info modal
		window.showInfo = () => {
			const modal = new bootstrap.Modal(document.getElementById('infoModal'));
			modal.show();
		};

		// Clear all files
		window.clearAllFiles = () => {
			this.uploaders.forEach(uploader => {
				uploader.clear();
			});
			this.resetStatistics();
			this.showNotification('All files cleared', 'info');
		};
	}

	/**
	 * Update configuration for all uploaders
	 */
	updateAllConfigs(config) {
		this.uploaders.forEach(uploader => {
			uploader.updateConfig(config);
		});
	}

	/**
	 * Handle file added event
	 */
	onFileAdded(category, fileData) {
		this.statistics.totalFiles++;
		this.statistics.totalSize += fileData.file.size;

		if (category === 'image' || this.isImage(fileData.file)) {
			this.statistics.imageCount++;
		} else if (category === 'video' || this.isVideo(fileData.file)) {
			this.statistics.videoCount++;
		} else {
			this.statistics.documentCount++;
		}

		this.updateStatistics();
	}

	/**
	 * Handle file removed event
	 */
	onFileRemoved(category, fileData) {
		this.statistics.totalFiles--;
		this.statistics.totalSize -= fileData.file.size;

		if (category === 'image' || this.isImage(fileData.file)) {
			this.statistics.imageCount--;
		} else if (category === 'video' || this.isVideo(fileData.file)) {
			this.statistics.videoCount--;
		} else {
			this.statistics.documentCount--;
		}

		this.updateStatistics();
	}

	/**
	 * Update statistics display
	 */
	updateStatistics() {
		document.getElementById('totalFiles').textContent = this.statistics.totalFiles;
		document.getElementById('totalSize').textContent = this.formatFileSize(this.statistics.totalSize);
		document.getElementById('imageCount').textContent = this.statistics.imageCount;
		document.getElementById('videoCount').textContent = this.statistics.videoCount;
	}

	/**
	 * Reset statistics
	 */
	resetStatistics() {
		this.statistics = {
			totalFiles: 0,
			totalSize: 0,
			imageCount: 0,
			videoCount: 0,
			documentCount: 0
		};
		this.updateStatistics();
	}

	/**
	 * Get file category
	 */
	getFileCategory(file) {
		const mimeType = file.type.toLowerCase();

		if (mimeType.startsWith('image/')) return 'image';
		if (mimeType.startsWith('video/')) return 'video';
		return 'document';
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
	 * Format file size for display
	 */
	formatFileSize(bytes) {
		if (bytes === 0) return '0 B';

		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	/**
	 * Show notification toast
	 */
	showNotification(message, type = 'info') {
		// Create toast container if it doesn't exist
		let toastContainer = document.getElementById('toastContainer');
		if (!toastContainer) {
			toastContainer = document.createElement('div');
			toastContainer.id = 'toastContainer';
			toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
			toastContainer.style.zIndex = '1055';
			document.body.appendChild(toastContainer);
		}

		// Create toast
		const toastId = 'toast_' + Date.now();
		const toastHtml = `
			<div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert">
				<div class="d-flex">
					<div class="toast-body">
						<i class="bi bi-${this.getIconForType(type)} me-2"></i>
						${message}
					</div>
					<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
				</div>
			</div>
		`;

		toastContainer.insertAdjacentHTML('beforeend', toastHtml);

		// Show toast
		const toastElement = document.getElementById(toastId);
		const toast = new bootstrap.Toast(toastElement, {
			autohide: true,
			delay: 3000
		});
		toast.show();

		// Remove toast element after it's hidden
		toastElement.addEventListener('hidden.bs.toast', () => {
			toastElement.remove();
		});
	}

	/**
	 * Get Bootstrap icon for notification type
	 */
	getIconForType(type) {
		const icons = {
			success: 'check-circle',
			danger: 'exclamation-triangle',
			warning: 'exclamation-triangle',
			info: 'info-circle',
			primary: 'info-circle',
			secondary: 'info-circle'
		};
		return icons[type] || 'info-circle';
	}

	/**
	 * Initialize demo with sample data
	 */
	loadSampleData() {
		// This would load sample files for demonstration
		// In a real application, you might want to show this as a tutorial
		this.showNotification('Demo loaded! Try uploading some files to see the preview in action.', 'info');
	}
}

// Global demo methods for easy access
let demoInstance;

/**
 * Initialize demo when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
	demoInstance = new FileUploadDemo();

	// Show welcome message
	setTimeout(() => {
		demoInstance.showNotification('Welcome! Try uploading files to see the preview system in action.', 'primary');
	}, 1000);
});

/**
 * Global utility functions
 */
window.getDemoInstance = () => demoInstance;

/**
 * Export demo for potential module usage
 */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = FileUploadDemo;
}