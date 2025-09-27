/**
 * Demo Functions for YoBox Example Page
 * Contains all the demonstration functions called by the example buttons
 */

// Utility function to show results
function showResult(title, message, type = 'info') {
	const alertClass = type === 'success' ? 'alert-success' :
	                   type === 'error' ? 'alert-danger' :
	                   type === 'warning' ? 'alert-warning' : 'alert-info';

	const icon = type === 'success' ? 'fas fa-check-circle' :
	             type === 'error' ? 'fas fa-exclamation-triangle' :
	             type === 'warning' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';

	const html = `
		<div class="alert ${alertClass} d-flex align-items-center" role="alert">
			<i class="${icon} me-2"></i>
			<div>
				<strong>${title}:</strong> ${message}
			</div>
		</div>
	`;

	yobox.alert({
		title: 'Demo Result',
		message: html,
		className: 'yobox-result'
	});
}

// Basic Alert Demos
function demoBasicAlert() {
	yobox.alert('This is a basic alert message!', function() {
		showResult('Alert Result', 'Basic alert was dismissed', 'success');
	});
}

function demoCustomAlert() {
	yobox.alert({
		title: 'Custom Alert',
		message: `
			<div class="text-center">
				<i class="fas fa-star text-warning fa-3x mb-3"></i>
				<h4>Welcome to YoBox!</h4>
				<p>This is a custom alert with HTML content, icons, and styling.</p>
			</div>
		`,
		size: 'lg',
		className: 'yobox-welcome',
		callback: function() {
			showResult('Custom Alert', 'Custom alert was dismissed', 'success');
		}
	});
}

// Basic Confirm Demos
function demoBasicConfirm() {
	yobox.confirm('Do you want to continue with this action?', function(result) {
		if (result) {
			showResult('Confirm Result', 'User clicked OK/Confirm', 'success');
		} else {
			showResult('Confirm Result', 'User clicked Cancel', 'warning');
		}
	});
}

function demoCustomConfirm() {
	yobox.confirm({
		title: 'Save Changes',
		message: `
			<div class="d-flex align-items-center">
				<i class="fas fa-save text-primary fa-2x me-3"></i>
				<div>
					<p class="mb-2"><strong>You have unsaved changes.</strong></p>
					<p class="mb-0 text-muted">Would you like to save your work before continuing?</p>
				</div>
			</div>
		`,
		size: 'lg',
		swapButtonOrder: true,
		callback: function(result) {
			if (result) {
				showResult('Save Result', 'Changes were saved successfully', 'success');
			} else {
				showResult('Save Result', 'Changes were discarded', 'warning');
			}
		}
	});
}

// Basic Prompt Demos
function demoBasicPrompt() {
	yobox.prompt('What is your name?', function(name) {
		if (name === null) {
			showResult('Prompt Result', 'User cancelled the prompt', 'warning');
		} else if (name.trim() === '') {
			showResult('Prompt Result', 'User entered an empty name', 'warning');
		} else {
			showResult('Prompt Result', `Hello, ${name}! Nice to meet you.`, 'success');
		}
	});
}

function demoEmailPrompt() {
	yobox.prompt({
		title: 'Email Subscription',
		message: 'Enter your email address to subscribe to our newsletter:',
		inputType: 'email',
		placeholder: 'user@example.com',
		required: true,
		value: '',
		callback: function(email) {
			if (email === null) {
				showResult('Email Prompt', 'Subscription cancelled', 'warning');
			} else {
				showResult('Email Prompt', `Subscription confirmed for: ${email}`, 'success');
			}
		}
	});
}

// Advanced Prompt Demos
function demoSelectPrompt() {
	yobox.prompt({
		title: 'Select Your Country',
		message: 'Please choose your country from the list below:',
		inputType: 'select',
		inputOptions: [
			{ text: 'Select a country...', value: '' },
			{ text: '🇺🇸 United States', value: 'us' },
			{ text: '🇨🇦 Canada', value: 'ca' },
			{ text: '🇬🇧 United Kingdom', value: 'uk' },
			{ text: '🇫🇷 France', value: 'fr' },
			{ text: '🇩🇪 Germany', value: 'de' },
			{ text: '🇯🇵 Japan', value: 'jp' },
			{ text: '🇦🇺 Australia', value: 'au' }
		],
		required: true,
		callback: function(country) {
			if (country === null) {
				showResult('Country Selection', 'Selection cancelled', 'warning');
			} else if (country === '') {
				showResult('Country Selection', 'No country selected', 'warning');
			} else {
				const countryNames = {
					'us': 'United States',
					'ca': 'Canada',
					'uk': 'United Kingdom',
					'fr': 'France',
					'de': 'Germany',
					'jp': 'Japan',
					'au': 'Australia'
				};
				showResult('Country Selection', `You selected: ${countryNames[country]}`, 'success');
			}
		}
	});
}

function demoCheckboxPrompt() {
	yobox.prompt({
		title: 'Select Your Interests',
		message: 'Choose all topics that interest you:',
		inputType: 'checkbox',
		inputOptions: [
			{ text: '💻 Technology & Programming', value: 'tech' },
			{ text: '🎨 Design & Creativity', value: 'design' },
			{ text: '📊 Business & Finance', value: 'business' },
			{ text: '🏃 Health & Fitness', value: 'health' },
			{ text: '🎵 Music & Entertainment', value: 'music' },
			{ text: '✈️ Travel & Adventure', value: 'travel' },
			{ text: '📚 Education & Learning', value: 'education' },
			{ text: '🍳 Food & Cooking', value: 'food' }
		],
		value: ['tech', 'design'], // Pre-select some options
		callback: function(interests) {
			if (interests === null) {
				showResult('Interest Selection', `Selected interests: ${selectedNames}`, 'success');
			}
		}
	});
}

function demoRadioPrompt() {
	yobox.prompt({
		title: 'Choose Your Plan',
		message: 'Select a subscription plan:',
		inputType: 'radio',
		inputOptions: [
			{ text: '🆓 Free Plan - Basic features', value: 'free' },
			{ text: '⭐ Standard Plan - $9.99/month', value: 'standard' },
			{ text: '💎 Premium Plan - $19.99/month', value: 'premium' },
			{ text: '🚀 Enterprise Plan - Contact us', value: 'enterprise' }
		],
		value: 'standard', // Pre-select standard plan
		callback: function(plan) {
			if (plan === null) {
				showResult('Plan Selection', 'Selection cancelled', 'warning');
			} else {
				const planNames = {
					'free': 'Free Plan',
					'standard': 'Standard Plan ($9.99/month)',
					'premium': 'Premium Plan ($19.99/month)',
					'enterprise': 'Enterprise Plan'
				};
				showResult('Plan Selection', `You selected: ${planNames[plan]}`, 'success');
			}
		}
	});
}

function demoDatePrompt() {
	yobox.prompt({
		title: 'Select Date',
		message: 'Choose your preferred appointment date:',
		inputType: 'date',
		value: new Date().toISOString().split('T')[0], // Today's date
		min: new Date().toISOString().split('T')[0], // Can't select past dates
		required: true,
		callback: function(date) {
			if (date === null) {
				showResult('Date Selection', 'Selection cancelled', 'warning');
			} else {
				const selectedDate = new Date(date);
				const formattedDate = selectedDate.toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				});
				showResult('Date Selection', `Appointment scheduled for: ${formattedDate}`, 'success');
			}
		}
	});
}

function demoTimePrompt() {
	yobox.prompt({
		title: 'Select Time',
		message: 'Choose your preferred appointment time:',
		inputType: 'time',
		value: '09:00',
		min: '08:00',
		max: '18:00',
		step: '00:30', // 30-minute intervals
		required: true,
		callback: function(time) {
			if (time === null) {
				showResult('Time Selection', 'Selection cancelled', 'warning');
			} else {
				// Convert 24-hour to 12-hour format
				const [hours, minutes] = time.split(':');
				const hour12 = ((parseInt(hours) + 11) % 12) + 1;
				const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
				const formattedTime = `${hour12}:${minutes} ${ampm}`;
				showResult('Time Selection', `Appointment time: ${formattedTime}`, 'success');
			}
		}
	});
}

function demoNumberPrompt() {
	yobox.prompt({
		title: 'Enter Quantity',
		message: 'How many items would you like to order?',
		inputType: 'number',
		value: 1,
		min: 1,
		max: 100,
		step: 1,
		placeholder: 'Enter quantity (1-100)',
		required: true,
		callback: function(quantity) {
			if (quantity === null) {
				showResult('Quantity Input', 'Order cancelled', 'warning');
			} else {
				const total = parseFloat(quantity) * 19.99;
				showResult('Quantity Input', `Ordered ${quantity} items. Total: ${total.toFixed(2)}`, 'success');
			}
		}
	});
}

// Custom Dialog Demos
function demoDeleteDialog() {
	yobox.dialog({
		title: 'Confirm Deletion',
		message: `
			<div class="text-center">
				<i class="fas fa-exclamation-triangle text-warning fa-4x mb-3"></i>
				<h4 class="text-warning">This action cannot be undone!</h4>
				<p>Are you sure you want to permanently delete this item?</p>
				<p class="text-muted mb-0">This will remove all associated data and cannot be recovered.</p>
			</div>
		`,
		className: 'yobox-danger',
		centerVertical: true,
		buttons: {
			cancel: {
				label: 'Keep Item',
				className: 'btn-outline-secondary',
				callback: function() {
					showResult('Delete Action', 'Item was kept safe', 'success');
				}
			},
			delete: {
				label: 'Delete Forever',
				className: 'btn-danger',
				callback: function() {
					// Simulate deletion process
					showResult('Delete Action', 'Item was permanently deleted', 'error');
				}
			}
		}
	});
}

function demoSuccessDialog() {
	yobox.dialog({
		title: 'Operation Successful',
		message: `
			<div class="text-center">
				<i class="fas fa-check-circle text-success fa-4x mb-3"></i>
				<h4 class="text-success">All Done!</h4>
				<p>Your operation has been completed successfully.</p>
				<div class="alert alert-success" role="alert">
					<i class="fas fa-info-circle me-2"></i>
					Processing time: 0.32 seconds
				</div>
			</div>
		`,
		className: 'yobox-success',
		closeButton: false,
		buttons: {
			ok: {
				label: 'Awesome!',
				className: 'btn-success',
				callback: function() {
					showResult('Success Dialog', 'Success dialog was acknowledged', 'success');
				}
			}
		}
	});
}

function demoMultiButtonDialog() {
	yobox.dialog({
		title: 'Multiple Action Dialog',
		message: `
			<div>
				<p><strong>Choose an action to perform:</strong></p>
				<p>This dialog demonstrates multiple buttons with different actions and behaviors.</p>
			</div>
		`,
		size: 'lg',
		buttons: {
			save: {
				label: 'Save Draft',
				className: 'btn-outline-primary',
				callback: function() {
					showResult('Multi-Button Action', 'Draft saved successfully', 'success');
				}
			},
			preview: {
				label: 'Preview',
				className: 'btn-outline-info',
				callback: function() {
					showResult('Multi-Button Action', 'Opening preview window...', 'info');
					return false; // Don't close the dialog
				}
			},
			cancel: {
				label: 'Cancel',
				className: 'btn-outline-secondary',
				callback: function() {
					showResult('Multi-Button Action', 'Action cancelled', 'warning');
				}
			},
			publish: {
				label: 'Publish Now',
				className: 'btn-success',
				callback: function() {
					showResult('Multi-Button Action', 'Content published successfully!', 'success');
				}
			}
		}
	});
}

function demoLargeDialog() {
	yobox.dialog({
		title: 'Large Dialog with Rich Content',
		message: `
			<div class="row">
				<div class="col-md-6">
					<h5><i class="fas fa-chart-bar text-primary me-2"></i>Statistics</h5>
					<div class="list-group list-group-flush">
						<div class="list-group-item d-flex justify-content-between">
							<span>Total Users</span>
							<strong>12,847</strong>
						</div>
						<div class="list-group-item d-flex justify-content-between">
							<span>Active Sessions</span>
							<strong>3,291</strong>
						</div>
						<div class="list-group-item d-flex justify-content-between">
							<span>Revenue Today</span>
							<strong>$4,832.50</strong>
						</div>
					</div>
				</div>
				<div class="col-md-6">
					<h5><i class="fas fa-bell text-warning me-2"></i>Recent Activities</h5>
					<div class="list-group list-group-flush">
						<div class="list-group-item">
							<i class="fas fa-user-plus text-success me-2"></i>
							New user registered
							<small class="text-muted d-block">2 minutes ago</small>
						</div>
						<div class="list-group-item">
							<i class="fas fa-shopping-cart text-primary me-2"></i>
							Order #1234 completed
							<small class="text-muted d-block">5 minutes ago</small>
						</div>
						<div class="list-group-item">
							<i class="fas fa-exclamation-triangle text-warning me-2"></i>
							Server alert resolved
							<small class="text-muted d-block">12 minutes ago</small>
						</div>
					</div>
				</div>
			</div>
			<hr>
			<div class="text-center">
				<p class="mb-0"><strong>System Status:</strong>
					<span class="badge bg-success">All Systems Operational</span>
				</p>
			</div>
		`,
		size: 'xl',
		centerVertical: true,
		scrollable: true,
		buttons: {
			refresh: {
				label: 'Refresh Data',
				className: 'btn-outline-primary',
				callback: function() {
					showResult('Large Dialog', 'Data refreshed successfully', 'success');
					return false; // Keep dialog open
				}
			},
			export: {
				label: 'Export Report',
				className: 'btn-outline-success',
				callback: function() {
					showResult('Large Dialog', 'Report exported to downloads', 'success');
				}
			},
			close: {
				label: 'Close',
				className: 'btn-secondary',
				callback: function() {
					showResult('Large Dialog', 'Dashboard closed', 'info');
				}
			}
		}
	});
}

// Utility demo functions
function demoLocalization() {
	// Add Spanish locale
	yobox.addLocale('es', {
		OK: 'Aceptar',
		CANCEL: 'Cancelar',
		CONFIRM: 'Confirmar'
	});

	yobox.confirm({
		message: '¿Estás seguro de que quieres continuar?',
		locale: 'es',
		callback: function(result) {
			if (result) {
				showResult('Localización', 'Usuario confirmó la acción', 'success');
			} else {
				showResult('Localización', 'Usuario canceló la acción', 'warning');
			}
		}
	});
}

function demoNonBlocking() {
	const dialog = yobox.dialog({
		title: 'Loading...',
		message: `
			<div class="text-center">
				<div class="spinner-border text-primary mb-3" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
				<p>Processing your request...</p>
				<div class="progress">
					<div class="progress-bar progress-bar-striped progress-bar-animated"
						 role="progressbar" style="width: 0%" id="progressBar"></div>
				</div>
			</div>
		`,
		buttons: {
			cancel: {
				label: 'Cancel',
				className: 'btn-outline-danger',
				callback: function() {
					clearInterval(progressInterval);
					showResult('Loading Dialog', 'Operation cancelled by user', 'warning');
				}
			}
		},
		backdrop: false,
		closeButton: false
	});

	// Simulate progress
	let progress = 0;
	const progressBar = document.getElementById('progressBar');
	const progressInterval = setInterval(() => {
		progress += Math.random() * 15;
		if (progress >= 100) {
			progress = 100;
			progressBar.style.width = '100%';
			clearInterval(progressInterval);

			setTimeout(() => {
				const bsModal = bootstrap.Modal.getInstance(dialog);
				if (bsModal) {
					bsModal.hide();
				}
				showResult('Loading Dialog', 'Operation completed successfully!', 'success');
			}, 500);
		} else {
			progressBar.style.width = progress + '%';
		}
	}, 200);
}

/*
Selection', 'Selection cancelled', 'warning');
			} else if (interests.length === 0) {
				showResult('Interest Selection', 'No interests selected', 'warning');
			} else {
				const interestNames = {
					'tech': 'Technology & Programming',
					'design': 'Design & Creativity',
					'business': 'Business & Finance',
					'health': 'Health & Fitness',
					'music': 'Music & Entertainment',
					'travel': 'Travel & Adventure',
					'education': 'Education & Learning',
					'food': 'Food & Cooking'
				};
				const selectedNames = interests.map(i => interestNames[i]).join(', ');
				showResult('Interest&
*/