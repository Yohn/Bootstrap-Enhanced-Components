/**
 * AjaxForm Demo JavaScript
 * Example implementations for the demo page
 */

// Mock API endpoint simulator
const MockAPI = {
	/**
	 * Simulate API response with delay
	 * @param {Object} data - Request data
	 * @param {number} delay - Delay in milliseconds
	 * @param {boolean} shouldFail - Whether to simulate failure
	 * @returns {Promise}
	 */
	simulate: function(data, delay = 1000, shouldFail = false) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (shouldFail) {
					reject({
						status: 500,
						message: 'Simulated server error'
					});
				} else {
					resolve({
						status: 'success',
						message: 'Request processed successfully',
						data: data,
						timestamp: new Date().toISOString()
					});
				}
			}, delay);
		});
	}
};

// Helper function to display response
function displayResponse(elementId, data) {
	const element = document.getElementById(elementId);
	if (element) {
		element.innerHTML = '<strong>Response:</strong>\n' + JSON.stringify(data, null, 2);
		element.style.display = 'block';
	}
}

// Example 1: Simple Contact Form
(function() {
	const contactForm = new AjaxForm('#contactForm', {
		beforeSubmit: function(formArray, form, options) {
			console.log('Contact form submitting...', formArray);
			form.classList.add('ajax-form-submitting');
			return true;
		},
		success: function(data, textStatus, xhr) {
			console.log('Contact form success:', data);
			const form = document.getElementById('contactForm');
			form.classList.remove('ajax-form-submitting');
			form.classList.add('ajax-form-success');

			// Simulate response
			displayResponse('contactResponse', {
				status: 'success',
				message: 'Thank you for your message!',
				name: form.querySelector('[name="name"]').value,
				email: form.querySelector('[name="email"]').value
			});

			// Reset form after 2 seconds
			setTimeout(() => {
				form.reset();
				form.classList.remove('ajax-form-success');
			}, 3000);
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Contact form error:', errorThrown);
			const form = document.getElementById('contactForm');
			form.classList.remove('ajax-form-submitting');
			form.classList.add('ajax-form-error');

			setTimeout(() => {
				form.classList.remove('ajax-form-error');
			}, 5000);
		}
	});
})();

// Example 2: Multiple File Upload with Progress
(function() {
	const uploadForm = document.getElementById('uploadForm');
	const fileInput = document.getElementById('upload-files');
	const filePreview = document.getElementById('filePreview');
	const progressContainer = document.getElementById('uploadProgress');
	const progressBar = document.getElementById('uploadProgressBar');
	const progressText = document.getElementById('uploadProgressText');

	// Preview selected files
	fileInput.addEventListener('change', function(e) {
		filePreview.innerHTML = '';
		const files = e.target.files;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const reader = new FileReader();

			reader.onload = function(event) {
				const previewItem = document.createElement('div');
				previewItem.className = 'file-preview-item';
				previewItem.innerHTML = `
					<img src="${event.target.result}" alt="${file.name}">
					<div class="file-preview-name">${file.name}</div>
				`;
				filePreview.appendChild(previewItem);
			};

			reader.readAsDataURL(file);
		}
	});

	const uploadFormHandler = new AjaxForm('#uploadForm', {
		beforeSubmit: function(formArray, form, options) {
			progressContainer.style.display = 'block';
			progressBar.style.width = '0%';
			progressText.textContent = '0%';
			return true;
		},
		uploadProgress: function(event, loaded, total, percentComplete) {
			progressBar.style.width = percentComplete + '%';
			progressText.textContent = Math.round(percentComplete) + '%';
		},
		success: function(data, textStatus, xhr) {
			console.log('Upload success:', data);

			// Simulate response with file list
			const files = fileInput.files;
			const fileList = [];
			for (let i = 0; i < files.length; i++) {
				fileList.push({
					name: files[i].name,
					size: files[i].size,
					type: files[i].type
				});
			}

			displayResponse('uploadResponse', {
				status: 'success',
				message: 'Files uploaded successfully!',
				count: files.length,
				files: fileList
			});

			// Hide progress after 2 seconds
			setTimeout(() => {
				progressContainer.style.display = 'none';
			}, 2000);
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Upload error:', errorThrown);
			progressContainer.style.display = 'none';
			alert('Upload failed! Please try again.');
		}
	});

	// Clear button
	document.getElementById('clearUpload').addEventListener('click', function() {
		uploadForm.reset();
		filePreview.innerHTML = '';
		progressContainer.style.display = 'none';
		document.getElementById('uploadResponse').style.display = 'none';
	});
})();

// Example 3: Form with Before Submit Validation
(function() {
	const registrationForm = new AjaxForm('#registrationForm', {
		beforeSubmit: function(formArray, form, options) {
			const username = form.querySelector('[name="username"]').value;
			const email = form.querySelector('[name="email"]').value;
			const password = form.querySelector('[name="password"]').value;
			const confirmPassword = form.querySelector('[name="confirm_password"]').value;
			const errorsDiv = document.getElementById('validationErrors');
			const errors = [];

			// Validation rules
			if (username.length < 3) {
				errors.push('Username must be at least 3 characters long.');
			}

			if (password.length < 8) {
				errors.push('Password must be at least 8 characters long.');
			}

			if (password !== confirmPassword) {
				errors.push('Passwords do not match.');
			}

			if (errors.length > 0) {
				errorsDiv.innerHTML = '<strong>Please fix the following errors:</strong><ul>' +
					errors.map(err => '<li>' + err + '</li>').join('') + '</ul>';
				errorsDiv.style.display = 'block';
				return false; // Cancel submission
			}

			errorsDiv.style.display = 'none';
			return true;
		},
		success: function(data, textStatus, xhr) {
			console.log('Registration success:', data);
			const form = document.getElementById('registrationForm');

			displayResponse('registrationResponse', {
				status: 'success',
				message: 'Account created successfully!',
				username: form.querySelector('[name="username"]').value,
				email: form.querySelector('[name="email"]').value
			});

			// Clear form
			form.reset();
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Registration error:', errorThrown);
			displayResponse('registrationResponse', {
				status: 'error',
				message: 'Registration failed. Please try again.'
			});
		}
	});
})();

// Example 4: AjaxSubmit (Immediate)
(function() {
	const searchForm = document.getElementById('searchForm');

	// Search button click
	document.getElementById('searchBtn').addEventListener('click', function() {
		AjaxSubmit.submit('#searchForm', {
			success: function(data, textStatus, xhr) {
				console.log('Search success:', data);

				const query = searchForm.querySelector('[name="query"]').value;
				const category = searchForm.querySelector('[name="category"]').value;

				// Simulate search results
				const mockResults = [
					{ title: 'Result 1 for "' + query + '"', description: 'This is a sample result.' },
					{ title: 'Result 2 for "' + query + '"', description: 'Another relevant result.' },
					{ title: 'Result 3 for "' + query + '"', description: 'Yet another match.' }
				];

				displayResponse('searchResults', {
					status: 'success',
					query: query,
					category: category,
					results: mockResults,
					count: mockResults.length
				});
			},
			error: function(xhr, textStatus, errorThrown) {
				console.error('Search error:', errorThrown);
				displayResponse('searchResults', {
					status: 'error',
					message: 'Search failed. Please try again.'
				});
			}
		});
	});

	// Advanced search button
	document.getElementById('advancedSearchBtn').addEventListener('click', function() {
		AjaxSubmit.submit('#searchForm', {
			extraData: {
				advanced: true,
				filters: ['recent', 'popular'],
				limit: 50
			},
			success: function(data, textStatus, xhr) {
				console.log('Advanced search success:', data);

				displayResponse('searchResults', {
					status: 'success',
					message: 'Advanced search completed',
					advanced: true,
					filters: ['recent', 'popular']
				});
			}
		});
	});
})();

// Example 5: Update Target Element
(function() {
	let commentCount = 0;

	const commentForm = new AjaxForm('#commentForm', {
		success: function(data, textStatus, xhr) {
			console.log('Comment posted:', data);
			const form = document.getElementById('commentForm');
			const author = form.querySelector('[name="author"]').value;
			const comment = form.querySelector('[name="comment"]').value;

			commentCount++;

			// Create new comment HTML
			const commentElement = document.createElement('div');
			commentElement.className = 'border-bottom pb-3 mb-3';
			commentElement.innerHTML = `
				<div class="d-flex justify-content-between align-items-start mb-2">
					<strong>${author}</strong>
					<small class="text-muted">${new Date().toLocaleString()}</small>
				</div>
				<p class="mb-0">${comment}</p>
			`;

			// Update comments list
			const commentsList = document.getElementById('commentsList');
			if (commentCount === 1) {
				commentsList.innerHTML = '';
			}
			commentsList.appendChild(commentElement);

			// Clear form
			form.reset();

			// Show success message
			alert('Comment posted successfully!');
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Comment error:', errorThrown);
			alert('Failed to post comment. Please try again.');
		}
	});
})();

// Example 6: Form with Extra Data
(function() {
	// Display extra data info
	document.getElementById('pageUrl').textContent = window.location.href;
	document.getElementById('userAgent').textContent = navigator.userAgent.substring(0, 50) + '...';
	document.getElementById('timestamp').textContent = new Date().toISOString();

	const feedbackForm = new AjaxForm('#feedbackForm', {
		extraData: {
			pageUrl: window.location.href,
			userAgent: navigator.userAgent,
			timestamp: Date.now(),
			sessionId: 'session_' + Math.random().toString(36).substr(2, 9)
		},
		success: function(data, textStatus, xhr) {
			console.log('Feedback success:', data);
			const form = document.getElementById('feedbackForm');

			displayResponse('feedbackResponse', {
				status: 'success',
				message: 'Thank you for your feedback!',
				rating: form.querySelector('[name="rating"]').value,
				comments: form.querySelector('[name="comments"]').value,
				extraData: {
					pageUrl: window.location.href,
					timestamp: new Date().toISOString()
				}
			});

			form.reset();
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Feedback error:', errorThrown);
			alert('Failed to submit feedback. Please try again.');
		}
	});
})();

// Example 7: Single File Upload (Avatar)
(function() {
	const avatarFile = document.getElementById('avatar-file');
	const avatarPreview = document.getElementById('avatarPreview');
	const progressContainer = document.getElementById('avatarProgress');
	const progressBar = document.getElementById('avatarProgressBar');
	const progressText = document.getElementById('avatarProgressText');

	// Preview avatar
	avatarFile.addEventListener('change', function(e) {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = function(event) {
				avatarPreview.src = event.target.result;
				avatarPreview.style.display = 'block';
			};
			reader.readAsDataURL(file);
		}
	});

	const avatarForm = new AjaxForm('#avatarForm', {
		beforeSubmit: function(formArray, form, options) {
			progressContainer.style.display = 'block';
			progressBar.style.width = '0%';
			progressText.textContent = '0%';
			return true;
		},
		uploadProgress: function(event, loaded, total, percentComplete) {
			progressBar.style.width = percentComplete + '%';
			progressText.textContent = Math.round(percentComplete) + '%';
		},
		success: function(data, textStatus, xhr) {
			console.log('Avatar upload success:', data);

			displayResponse('avatarResponse', {
				status: 'success',
				message: 'Avatar uploaded successfully!',
				filename: avatarFile.files[0].name,
				size: avatarFile.files[0].size
			});

			setTimeout(() => {
				progressContainer.style.display = 'none';
			}, 2000);
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Avatar upload error:', errorThrown);
			progressContainer.style.display = 'none';
			alert('Avatar upload failed!');
		}
	});
})();

// Example 8: Clear Form After Success
(function() {
	const newsletterForm = new AjaxForm('#newsletterForm', {
		clearForm: true,  // This will clear the form after success
		success: function(data, textStatus, xhr) {
			console.log('Newsletter success:', data);

			document.getElementById('newsletterSuccess').style.display = 'block';

			displayResponse('newsletterResponse', {
				status: 'success',
				message: 'Subscription confirmed!',
				email: 'Form was cleared automatically'
			});

			setTimeout(() => {
				document.getElementById('newsletterSuccess').style.display = 'none';
			}, 5000);
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Newsletter error:', errorThrown);
			alert('Subscription failed. Please try again.');
		}
	});
})();

// Log initialization
console.log('AjaxForm Demo initialized. All examples are ready!');