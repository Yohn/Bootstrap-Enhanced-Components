# ImageLightbox

Enhanced image lightbox component for Bootstrap 5.3+ that provides a modern gallery experience with zoom, navigation, and customizable features.

## Features

- **Modal-based lightbox** using Bootstrap Modal and Carousel
- **Image grouping** via data attributes
- **Zoom functionality** with mouse wheel, buttons, and touch gestures
- **Keyboard navigation** with arrow keys
- **Touch gestures** for mobile devices
- **Thumbnail strip** for quick navigation
- **Slideshow mode** with auto-advance
- **Customizable animations** and styling
- **Responsive design** with mobile optimizations
- **Accessibility support** with ARIA labels and keyboard navigation

## Installation

1. Include Bootstrap 5.3+ CSS and JS
2. Include the ImageLightbox CSS and JS files
3. Initialize the component

```html
<!-- Bootstrap 5.3+ -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

<!-- ImageLightbox -->
<link href="scss/image-lightbox.css" rel="stylesheet">
<script src="js/ImageLightbox.js"></script>
```

## Basic Usage

### HTML Markup

```html
<!-- Grouped images -->
<img src="image1.jpg" data-lightbox="gallery-1" data-lightbox-caption="First image" alt="Image 1">
<img src="image2.jpg" data-lightbox="gallery-1" data-lightbox-caption="Second image" alt="Image 2">
<img src="image3.jpg" data-lightbox="gallery-1" data-lightbox-caption="Third image" alt="Image 3">

<!-- Single image -->
<img src="single.jpg" data-lightbox="single" alt="Single image">

<!-- Image with custom options -->
<img src="zoom-image.jpg"
	 data-lightbox="zoom-gallery"
	 data-lightbox-max-zoom="5"
	 data-lightbox-zoom-step="0.25"
	 alt="Zoomable image">
```

### JavaScript Initialization

```javascript
// Basic initialization
const lightbox = new ImageLightbox();

// With custom options
const lightbox = new ImageLightbox({
	navigation: true,
	thumbnails: true,
	zoom: true,
	maxZoom: 4,
	slideshow: false,
	keyboard: true,
	touchGestures: true
});
```

## Configuration Options

### Core Functionality Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `navigation` | Boolean | `true` | Show prev/next navigation arrows |
| `thumbnails` | Boolean | `false` | Show thumbnail strip at bottom |
| `zoom` | Boolean | `true` | Enable zoom functionality |
| `slideshow` | Boolean | `false` | Enable slideshow mode |
| `keyboard` | Boolean | `true` | Enable keyboard navigation |
| `touchGestures` | Boolean | `true` | Enable touch/swipe gestures |
| `showCounter` | Boolean | `true` | Display image counter (e.g., "1 of 5") |
| `captions` | Boolean | `true` | Show image captions |

### Zoom Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `zoomLevel` | Number | `1` | Initial zoom level |
| `maxZoom` | Number | `3` | Maximum zoom level |
| `zoomStep` | Number | `0.5` | Zoom increment/decrement amount |

### Slideshow Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `slideshowSpeed` | Number | `3000` | Auto-advance interval in milliseconds |

### Animation Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `animationType` | String | `'fade'` | Transition effect: `'fade'`, `'slide'`, `'zoom'` |

### Styling Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `overlayColor` | String | `'rgba(0, 0, 0, 0.9)'` | Background overlay color |

### Selector Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `imageSelector` | String | `'[data-lightbox]'` | CSS selector for lightbox images |

### Callback Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onOpen` | Function | `null` | Called when lightbox opens |
| `onClose` | Function | `null` | Called when lightbox closes |
| `onNavigate` | Function | `null` | Called when navigating between images |
| `onZoom` | Function | `null` | Called when zoom level changes |

## Data Attributes

All options can be set via data attributes on individual images, following Bootstrap's convention:

### Core Data Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-lightbox` | String | **Required.** Group name for related images |
| `data-lightbox-caption` | String | Caption text for the image |

### Feature Control Data Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-lightbox-navigation` | Boolean | Enable/disable navigation arrows |
| `data-lightbox-thumbnails` | Boolean | Enable/disable thumbnail strip |
| `data-lightbox-zoom` | Boolean | Enable/disable zoom functionality |
| `data-lightbox-slideshow` | Boolean | Enable/disable slideshow mode |
| `data-lightbox-keyboard` | Boolean | Enable/disable keyboard navigation |
| `data-lightbox-touch-gestures` | Boolean | Enable/disable touch gestures |
| `data-lightbox-show-counter` | Boolean | Enable/disable image counter |
| `data-lightbox-captions` | Boolean | Enable/disable captions |

### Zoom Data Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-lightbox-zoom-level` | Number | Initial zoom level |
| `data-lightbox-max-zoom` | Number | Maximum zoom level |
| `data-lightbox-zoom-step` | Number | Zoom increment amount |

### Slideshow Data Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-lightbox-slideshow-speed` | Number | Auto-advance interval (ms) |

### Animation Data Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-lightbox-animation-type` | String | Transition effect: `'fade'`, `'slide'`, `'zoom'` |

### Styling Data Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-lightbox-overlay-color` | String | Background overlay color |

## API Methods

### Public Methods

```javascript
const lightbox = new ImageLightbox();

// Open lightbox with specific image
lightbox.open('[data-lightbox="gallery"]', 2); // Open 3rd image in gallery

// Navigation
lightbox.next();     // Go to next image
lightbox.prev();     // Go to previous image
lightbox.goTo(1);    // Go to specific image index

// Control
lightbox.close();    // Close lightbox

// Zoom
lightbox.zoomIn();   // Zoom in
lightbox.zoomOut();  // Zoom out
lightbox.resetZoom(); // Reset zoom to 1x

// Slideshow
lightbox.startSlideshow();  // Start slideshow
lightbox.stopSlideshow();   // Stop slideshow
lightbox.toggleSlideshow(); // Toggle slideshow

// Cleanup
lightbox.destroy();  // Remove lightbox and cleanup
```

## Keyboard Controls

| Key | Action |
|-----|--------|
| `←` / `→` | Navigate between images |
| `Esc` | Close lightbox |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |

## Touch Gestures

| Gesture | Action |
|---------|--------|
| Swipe left/right | Navigate between images |
| Pinch to zoom | Zoom in/out (when zoom enabled) |
| Tap image | Toggle zoom in/out |

## Examples

### Basic Gallery

```html
<div class="row">
	<div class="col-md-4">
		<img src="gallery1.jpg" class="img-fluid" data-lightbox="gallery" alt="Gallery Image 1">
	</div>
	<div class="col-md-4">
		<img src="gallery2.jpg" class="img-fluid" data-lightbox="gallery" alt="Gallery Image 2">
	</div>
	<div class="col-md-4">
		<img src="gallery3.jpg" class="img-fluid" data-lightbox="gallery" alt="Gallery Image 3">
	</div>
</div>
```

### Gallery with Thumbnails and Captions

```html
<img src="image1.jpg"
	 data-lightbox="portfolio"
	 data-lightbox-thumbnails="true"
	 data-lightbox-caption="Beautiful landscape photography"
	 alt="Landscape">

<img src="image2.jpg"
	 data-lightbox="portfolio"
	 data-lightbox-thumbnails="true"
	 data-lightbox-caption="Urban architecture detail"
	 alt="Architecture">
```

### High-Zoom Product Images

```html
<img src="product1.jpg"
	 data-lightbox="products"
	 data-lightbox-max-zoom="5"
	 data-lightbox-zoom-step="0.25"
	 data-lightbox-caption="Product Detail View"
	 alt="Product">
```

### Slideshow Gallery

```html
<img src="slide1.jpg"
	 data-lightbox="slideshow"
	 data-lightbox-slideshow="true"
	 data-lightbox-slideshow-speed="4000"
	 alt="Slide 1">

<img src="slide2.jpg"
	 data-lightbox="slideshow"
	 data-lightbox-slideshow="true"
	 data-lightbox-slideshow-speed="4000"
	 alt="Slide 2">
```

### Programmatic Usage

```javascript
// Initialize with callbacks
const lightbox = new ImageLightbox({
	onOpen: (image, index) => {
		console.log('Opened image:', image.src, 'at index:', index);
	},
	onNavigate: (image, index) => {
		console.log('Navigated to:', image.src);
	},
	onZoom: (zoomLevel) => {
		console.log('Zoom level:', zoomLevel);
	}
});

// Open specific gallery programmatically
document.getElementById('open-gallery').addEventListener('click', () => {
	lightbox.open('[data-lightbox="gallery"]', 0);
});
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## Dependencies

- Bootstrap 5.3+ (CSS and JS)
- Modern browser with ES6 support

## License

MIT License