// Toast notification helper
function showToast(message) {
	const toastEl = document.getElementById('notificationToast');
	const toastBody = toastEl.querySelector('.toast-body');
	toastBody.textContent = message;

	const toast = new bootstrap.Toast(toastEl);
	toast.show();
}

// Theme toggle functionality
document.getElementById('themeToggle').addEventListener('click', function() {
	const html = document.documentElement;
	const currentTheme = html.getAttribute('data-bs-theme');
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
	html.setAttribute('data-bs-theme', newTheme);

	const icon = this.querySelector('i');
	icon.className = newTheme === 'dark' ? 'fa fa-moon' : 'fa fa-sun';
});

// Demo 1: Basic Right-Click Menu
const demo1Menu = new ContextMenu('#demo1Box', {
	menuItems: [
		{
			name: 'Action',
			iconClass: 'fa-bolt',
			onClick: function() {
				showToast("'Action' clicked!");
			}
		},
		{
			name: 'Another Action',
			iconClass: 'fa-star',
			onClick: function() {
				showToast("'Another Action' clicked!");
			}
		},
		{
			divider: true
		},
		{
			name: 'A Third Action',
			iconClass: 'fa-gear',
			onClick: function() {
				showToast("'A Third Action' clicked!");
			}
		}
	]
});

// Demo 2: Submenu
const demo2Menu = new ContextMenu('#demo2Box', {
	menuItems: [
		{
			name: 'File Operations',
			iconClass: 'fa-folder',
			subMenuItems: [
				{
					name: 'New File',
					iconClass: 'fa-plus',
					onClick: function() {
						showToast("'New File' clicked!");
					}
				},
				{
					name: 'Open File',
					iconClass: 'fa-folder-open',
					onClick: function() {
						showToast("'Open File' clicked!");
					}
				},
				{
					name: 'Save File',
					iconClass: 'fa-floppy-disk',
					onClick: function() {
						showToast("'Save File' clicked!");
					}
				}
			]
		},
		{
			divider: true
		},
		{
			name: 'Edit',
			iconClass: 'fa-pencil',
			onClick: function() {
				showToast("'Edit' clicked!");
			}
		},
		{
			name: 'Delete',
			iconClass: 'fa-trash',
			onClick: function() {
				showToast("'Delete' clicked!");
			}
		}
	]
});

// Demo 3: Dynamic Menu with Element Data
const demo3RowData = {
	'1': { name: 'John Doe', editable: true, deletable: true },
	'2': { name: 'Jane Smith', editable: false, deletable: true },
	'3': { name: 'Bob Johnson', editable: true, deletable: false }
};

const demo3Menu = new ContextMenu('.table-row', {
	fetchElementData: function(element) {
		const rowId = element.dataset.rowId;
		return demo3RowData[rowId];
	},
	menuItems: [
		{
			header: 'Edit Actions'
		},
		{
			name: function(row) {
				return 'Edit Name: ' + row.name;
			},
			iconClass: 'fa-pencil',
			isEnabled: function(row) {
				return row.editable;
			},
			onClick: function(row) {
				showToast("Edit name clicked for '" + row.name + "'");
			}
		},
		{
			name: 'Edit Description',
			iconClass: 'fa-pen-to-square',
			isEnabled: function(row) {
				return row.editable;
			},
			onClick: function(row) {
				showToast("Edit description clicked for '" + row.name + "'");
			}
		},
		{
			divider: true
		},
		{
			header: 'Status Actions'
		},
		{
			name: 'Set Editable',
			iconClass: 'fa-unlock',
			isShown: function(row) {
				return !row.editable;
			},
			onClick: function(row) {
				showToast("Set editable clicked for '" + row.name + "'");
			}
		},
		{
			name: 'Set Uneditable',
			iconClass: 'fa-lock',
			isShown: function(row) {
				return row.editable;
			},
			onClick: function(row) {
				showToast("Set uneditable clicked for '" + row.name + "'");
			}
		},
		{
			divider: true
		},
		{
			name: function(row) {
				return 'Delete ' + row.name;
			},
			iconClass: 'fa-trash',
			classNames: 'text-danger',
			isEnabled: function(row) {
				return row.editable && row.deletable;
			},
			onClick: function(row) {
				showToast("Delete clicked for '" + row.name + "'");
			}
		}
	]
});

// Demo 4: Different Trigger Events
const triggerActions = [
	{
		name: 'Option 1',
		iconClass: 'fa-1',
		onClick: function() {
			showToast("Option 1 clicked!");
		}
	},
	{
		name: 'Option 2',
		iconClass: 'fa-2',
		onClick: function() {
			showToast("Option 2 clicked!");
		}
	}
];

// Click trigger
const clickMenu = new ContextMenu('#clickBtn', {
	menuEvent: 'click',
	menuSource: 'element',
	menuPosition: 'belowLeft',
	menuItems: triggerActions
});

// Right-click trigger
const rightClickMenu = new ContextMenu('#rightClickBtn', {
	menuEvent: 'right-click',
	menuSource: 'element',
	menuPosition: 'belowLeft',
	menuItems: triggerActions
});

// Hover trigger
const hoverMenu = new ContextMenu('#hoverBtn', {
	menuEvent: 'hover',
	menuSource: 'element',
	menuPosition: 'belowRight',
	menuItems: triggerActions
});

// Demo 5: Conditional Menu Items
const demo5Menu = new ContextMenu('.conditional-row', {
	fetchElementData: function(element) {
		return {
			id: element.dataset.itemId,
			name: element.querySelector('td:nth-child(2)').textContent,
			isActive: element.dataset.active === 'true'
		};
	},
	menuItems: [
		{
			name: function(data) {
				return data.isActive ? 'Deactivate User' : 'Activate User';
			},
			iconClass: function(data) {
				return data.isActive ? 'fa-toggle-off' : 'fa-toggle-on';
			},
			classNames: function(data) {
				return {
					'text-warning': data.isActive,
					'text-success': !data.isActive
				};
			},
			onClick: function(data) {
				const action = data.isActive ? 'Deactivating' : 'Activating';
				showToast(action + " user '" + data.name + "'");
			}
		},
		{
			divider: true
		},
		{
			name: function(data) {
				return 'User Settings: ' + data.name;
			},
			iconClass: 'fa-gear',
			isShown: function(data) {
				// Only show for active users
				return data.isActive;
			},
			onClick: function(data) {
				showToast("Opening settings for '" + data.name + "'");
			}
		},
		{
			name: 'View Profile',
			iconClass: 'fa-user',
			onClick: function(data) {
				showToast("Viewing profile for '" + data.name + "'");
			}
		},
		{
			divider: true
		},
		{
			name: 'Send Message',
			iconClass: 'fa-envelope',
			isEnabled: function(data) {
				return data.isActive;
			},
			onClick: function(data) {
				showToast("Sending message to '" + data.name + "'");
			}
		},
		{
			name: 'Block User',
			iconClass: 'fa-ban',
			classNames: 'action-danger',
			onClick: function(data) {
				showToast("Blocking user '" + data.name + "'");
			}
		}
	]
});