# File Upload Preview Component

A comprehensive file upload preview enhancement for Bootstrap 5.3 that provides visual previews, validation, and management for uploaded files.

## Features

- **Visual Previews**: Image thumbnails, video thumbnails with play overlay, and file type icons
- **Multiple Display Modes**: List view or grid preview view
- **File Validation**: Type, size, and custom validation rules
- **File Management**: Remove files, view file details
- **Bootstrap Integration**: Fully compatible with Bootstrap 5.3.7 and dark mode
- **Responsive Design**: Mobile-friendly with adaptive layouts
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Customizable**: Extensive configuration options via JSON

## Installation

1. Include Bootstrap 5.3.7 CSS and JavaScript
2. Include Bootstrap Icons
3. Include the component files:
   ```html
   <link rel="stylesheet" href="scss/_file-upload-preview.scss">
   <script src="js/FileValidator.js"></script>
   <script src="js/PreviewManager.js"></script>
   <script src="js/FileUploadPreview.js"></script>
   ```

## Basic Usage

```html
<input type="file" id="fileInput" multiple>
<script>
const fileUpload = new FileUploadPreview('#fileInput', {
    displayMode: 'preview',
    allowedTypes: ['jpg', 'png', 'mp4'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    showFileSize: true,
    showFileType: true
});
</script>
```

## Configuration Options

### Display Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `displayMode` | string | `'preview'` | Display mode: `'list'` or `'preview'` |
| `showFileSize` | boolean | `true` | Show file size in display |
| `showFileType` | boolean | `true` | Show file type in display |
| `showRemoveButton` | boolean | `true` | Show remove button for each file |

### File Restrictions
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowedTypes` | array | `[]` | Allowed file types/extensions (empty = all allowed) |
| `maxFileSize` | number | `null` | Maximum file size in bytes |
| `maxFiles` | number | `null` | Maximum number of files |

### Preview Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `imagePreviewSize` | number | `150` | Image preview size in pixels |
| `videoPreviewSize` | number | `150` | Video preview size in pixels |
| `generateVideoThumbnail` | boolean | `true` | Generate video thumbnails |

### UI Customization
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerClass` | string | `'file-upload-preview-container'` | Main container CSS class |
| `listGroupClass` | string | `'list-group'` | List group CSS class |
| `previewGridClass` | string | `'row g-3'` | Preview grid CSS class |
| `errorClass` | string | `'alert alert-danger'` | Error alert CSS class |
| `successClass` | string | `'alert alert-success'` | Success alert CSS class |

### Labels and Messages
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `labels.fileSize` | string | `'Size'` | File size label |
| `labels.fileType` | string | `'Type'` | File type label |
| `labels.remove` | string | `'Remove'` | Remove button text |
| `labels.invalidType` | string | `'Invalid file type'` | Invalid type error message |
| `labels.invalidSize` | string | `'File size exceeds limit'` | Invalid size error message |
| `labels.maxFilesExceeded` | string | `'Maximum number of files exceeded'` | Max files error message |

### Callbacks
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onFileAdded` | function | `null` | Called when file is added |
| `onFileRemoved` | function | `null` | Called when file is removed |
| `onValidationError` | function | `null` | Called when validation fails |
| `onAllFilesProcessed` | function | `null` | Called when all files are processed |

## Advanced Examples

### Image Gallery with Size Restrictions
```javascript
const imageGallery = new FileUploadPreview('#imageInput', {
    displayMode: 'preview',
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 10,
    imagePreviewSize: 200,
    onFileAdded: (fileData) => {
        console.log('Image added:', fileData.file.name);
    }
});
```

### Document Upload with List View
```javascript
const documentUpload = new FileUploadPreview('#docInput', {
    displayMode: 'list',
    allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    showFileSize: true,
    showFileType: true,
    labels: {
        fileSize: 'File Size',
        fileType: 'Document Type',
        remove: 'Delete'
    }
});
```

### Video Upload with Custom Validation
```javascript
const videoUpload = new FileUploadPreview('#videoInput', {
    displayMode: 'preview',
    allowedTypes: ['mp4', 'avi', 'mov', 'webm'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    generateVideoThumbnail: true,
    videoPreviewSize: 300,
    onValidationError: (errors) => {
        console.error('Validation errors:', errors);
        // Custom error handling
    }
});
```

### Mixed Media with Type-Specific Settings
```javascript
const mixedUpload = new FileUploadPreview('#mixedInput', {
    displayMode: 'preview',
    allowedTypes: [
        'jpg', 'jpeg', 'png', 'gif', // Images
        'mp4', 'webm', 'mov',        // Videos
        'pdf', 'doc', 'docx'         // Documents
    ],
    maxFileSize: 25 * 1024 * 1024, // 25MB
    imagePreviewSize: 150,
    videoPreviewSize: 150,
    onFileAdded: (fileData) => {
        const category = getFileCategory(fileData.file);
        console.log(`${category} file added:`, fileData.file.name);
    }
});
```

## API Methods

### Instance Methods
| Method | Parameters | Description |
|--------|------------|-------------|
| `getFiles()` | - | Returns array of current files |
| `clear()` | - | Removes all files |
| `removeFile(fileId)` | `fileId: string` | Removes specific file |
| `updateConfig(config)` | `config: object` | Updates configuration |
| `validateFile(file)` | `file: File` | Validates single file |
| `showErrors(errors)` | `errors: array` | Displays error messages |
| `clearErrors()` | - | Clears all error messages |

### Static Methods
| Method | Parameters | Description |
|--------|------------|-------------|
| `FileValidator.validateFile()` | `file, options` | Advanced file validation |
| `PreviewManager.generatePreview()` | `file, container, size` | Generate file preview |

## Supported File Types

### Images
- JPEG/JPG (`image/jpeg`)
- PNG (`image/png`)
- GIF (`image/gif`)
- WebP (`image/webp`)
- SVG (`image/svg+xml`)
- BMP (`image/bmp`)
- TIFF (`image/tiff`)

### Videos
- MP4 (`video/mp4`)
- WebM (`video/webm`)
- AVI (`video/x-msvideo`)
- MOV (`video/quicktime`)
- WMV (`video/x-ms-wmv`)

### Documents
- PDF (`application/pdf`)
- Word (`application/msword`, `.docx`)
- Excel (`application/vnd.ms-excel`, `.xlsx`)
- PowerPoint (`application/vnd.ms-powerpoint`, `.pptx`)
- Text (`text/plain`)

### Archives
- ZIP (`application/zip`)
- RAR (`application/vnd.rar`)
- 7Z (`application/x-7z-compressed`)

### Audio
- MP3 (`audio/mpeg`)
- WAV (`audio/wav`)
- OGG (`audio/ogg`)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## Dependencies

- Bootstrap 5.3.7
- Bootstrap Icons (for file type icons)
- Modern browser with HTML5 File API support

## License

This component is released under the MIT License.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Follow the coding standards (tab indentation, OOP structure)
4. Add tests for new features
5. Submit a pull request

## Changelog

### v1.0.0
- Initial release
- Image and video preview support
- File validation
- Bootstrap 5.3 integration
- Responsive design
- Accessibility features