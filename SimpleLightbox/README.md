# ImageLightbox Component

A feature-rich image lightbox component for Bootstrap 5.3 with gallery support, zoom functionality, and mobile-friendly interactions.

## Features

- Single image or gallery lightbox
- Hover zoom preview
- Touch/swipe support for mobile
- Keyboard navigation (arrow keys, ESC)
- Image zoom with mouse wheel and touch
- Fade transitions between images
- Dark backdrop overlay
- Multiple close options
- Image descriptions support
- Fully responsive

## Usage

### HTML Structure

#### Single Image
```html
<img src="image.jpg"
     class="lightbox-trigger"
     alt="Description"
     data-lightbox-title="Image Title"
     data-lightbox-description="Image description">
```

#### Gallery Images
```html
<img src="image1.jpg"
     class="lightbox-trigger"
     alt="Image 1"
     data-lightbox-gallery="gallery1"
     data-lightbox-title="Image 1 Title"
     data-lightbox-description="Description for image 1">

<img src="image2.jpg"
     class="lightbox-trigger"
     alt="Image 2"
     data-lightbox-gallery="gallery1"
     data-lightbox-title="Image 2 Title"
     data-lightbox-description="Description for image 2">
```

### JavaScript Initialization

```javascript
// Initialize with default options
const lightbox = new ImageLightbox();

// Initialize with custom options
const lightbox = new ImageLightbox({
	hoverZoomScale: 1.1,
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
	animationType: 'fade'
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hoverZoomScale` | number | 1.05 | Scale factor for hover zoom effect |
| `transitionDuration` | number | 300 | Transition duration in milliseconds |
| `zoomStep` | number | 0.2 | Zoom increment/decrement step |
| `maxZoom` | number | 3 | Maximum zoom level |
| `minZoom` | number | 1 | Minimum zoom level |
| `enableKeyboard` | boolean | true | Enable keyboard navigation |
| `enableTouch` | boolean | true | Enable touch/swipe gestures |
| `enableZoom` | boolean | true | Enable zoom functionality |
| `showArrows` | boolean | true | Show navigation arrows for galleries |
| `showCloseButton` | boolean | true | Show close button |
| `showCounter` | boolean | true | Show image counter for galleries |
| `backdropOpacity` | number | 0.9 | Backdrop opacity (0-1) |
| `animationType` | string | 'fade' | Animation type: 'fade', 'slide', 'zoom' |

## Data Attributes

| Attribute | Description |
|-----------|-------------|
| `data-lightbox-gallery` | Groups images into a gallery |
| `data-lightbox-title` | Image title displayed in lightbox |
| `data-lightbox-description` | Image description displayed in lightbox |
| `data-lightbox-zoom-disabled` | Disables zoom for specific image |

## Methods

```javascript
// Open lightbox programmatically
lightbox.open(imageElement, galleryName);

// Close lightbox
lightbox.close();

// Navigate to next image (galleries only)
lightbox.next();

// Navigate to previous image (galleries only)
lightbox.previous();

// Set zoom level
lightbox.setZoom(zoomLevel);

// Reset zoom to original size
lightbox.resetZoom();

// Destroy lightbox instance
lightbox.destroy();
```

## Events

The component fires custom events that you can listen to:

```javascript
// Listen to lightbox events
document.addEventListener('lightbox:opened', (e) => {
	console.log('Lightbox opened', e.detail);
});

document.addEventListener('lightbox:closed', (e) => {
	console.log('Lightbox closed', e.detail);
});

document.addEventListener('lightbox:changed', (e) => {
	console.log('Image changed', e.detail);
});

document.addEventListener('lightbox:zoomed', (e) => {
	console.log('Image zoomed', e.detail);
});
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## Dependencies

- Bootstrap 5.3+
- Modern browser with ES6 support