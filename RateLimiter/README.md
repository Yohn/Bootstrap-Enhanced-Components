# RateLimiter

A sophisticated client-side rate limiting component for Bootstrap 5.3 that manages API calls with configurable limits, queuing, priorities, and backoff strategies.

## Features

- **Flexible Rate Limiting**: Configure maximum requests per time window
- **Request Queuing**: Queue excess requests for later execution
- **Priority System**: Handle requests with different priority levels
- **Backoff Strategies**: Implement exponential backoff when limits are hit
- **Multiple Storage Options**: Memory, localStorage, or sessionStorage
- **Visual Feedback**: Bootstrap-styled status indicators and progress bars
- **Event System**: Comprehensive event handling for rate limit states

## Installation

Include the RateLimiter JavaScript and SCSS files in your Bootstrap 5.3 project:

```html
<link href="scss/ratelimiter.scss" rel="stylesheet">
<script src="js/RateLimiter.js"></script>
```

## Basic Usage

```javascript
const rateLimiter = new RateLimiter({
	maxRequests: 10,
	windowSize: 60000, // 1 minute
	queueRequests: true
});

// Make a rate-limited request
rateLimiter.makeRequest(() => {
	return fetch('/api/data');
}).then(response => {
	console.log('Request completed:', response);
}).catch(error => {
	console.error('Request failed:', error);
});
```

## Configuration Options

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxRequests` | number | 10 | Maximum requests per window |
| `windowSize` | number | 60000 | Time window in milliseconds |
| `queueRequests` | boolean | true | Queue excess requests |
| `priority` | object | `{high: 1, normal: 5, low: 10}` | Request priority levels |
| `backoffStrategy` | string | 'exponential' | Backoff strategy ('exponential', 'linear', 'fixed') |
| `storage` | string | 'memory' | Storage type ('memory', 'localStorage', 'sessionStorage') |

### Advanced Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `identifier` | string | 'default' | Unique identifier for this rate limiter |
| `maxQueueSize` | number | 100 | Maximum queued requests |
| `baseBackoffDelay` | number | 1000 | Base delay for backoff in ms |
| `maxBackoffDelay` | number | 30000 | Maximum backoff delay in ms |
| `retryAttempts` | number | 3 | Maximum retry attempts |
| `enableMetrics` | boolean | true | Enable performance metrics |
| `debug` | boolean | false | Enable debug logging |

### UI Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showStatus` | boolean | true | Show status indicator |
| `showProgress` | boolean | true | Show progress bar |
| `showQueue` | boolean | true | Show queue information |
| `statusContainer` | string | null | Container selector for status UI |
| `theme` | string | 'primary' | Bootstrap theme color |

## Priority Levels

Configure request priorities to ensure important requests are processed first:

```javascript
const rateLimiter = new RateLimiter({
	priority: {
		critical: 1,    // Highest priority
		high: 2,
		normal: 5,      // Default priority
		low: 8,
		background: 10  // Lowest priority
	}
});

// Make high priority request
rateLimiter.makeRequest(() => fetch('/api/urgent-data'), {
	priority: 'high'
});
```

## Backoff Strategies

### Exponential Backoff (Default)
Delays increase exponentially: 1s, 2s, 4s, 8s, etc.

### Linear Backoff
Delays increase linearly: 1s, 2s, 3s, 4s, etc.

### Fixed Backoff
Fixed delay between retries.

## Storage Options

### Memory Storage (Default)
Rate limit data stored in memory, cleared on page refresh.

### localStorage
Persistent storage across browser sessions:

```javascript
const rateLimiter = new RateLimiter({
	storage: 'localStorage',
	identifier: 'myApp'
});
```

### sessionStorage
Storage persists for the browser session:

```javascript
const rateLimiter = new RateLimiter({
	storage: 'sessionStorage',
	identifier: 'myApp'
});
```

## Events

The RateLimiter dispatches various events:

```javascript
rateLimiter.on('limitExceeded', (data) => {
	console.log('Rate limit exceeded:', data);
});

rateLimiter.on('requestQueued', (data) => {
	console.log('Request queued:', data);
});

rateLimiter.on('requestProcessed', (data) => {
	console.log('Request processed:', data);
});

rateLimiter.on('backoffTriggered', (data) => {
	console.log('Backoff triggered:', data);
});

rateLimiter.on('windowReset', (data) => {
	console.log('Window reset:', data);
});
```

## Methods

### Core Methods

- `makeRequest(requestFn, options)` - Make a rate-limited request
- `getStatus()` - Get current rate limiter status
- `getRemainingRequests()` - Get remaining requests in current window
- `getQueueLength()` - Get current queue length
- `clearQueue()` - Clear the request queue
- `reset()` - Reset rate limiter state

### Metrics Methods

- `getMetrics()` - Get performance metrics
- `exportMetrics()` - Export metrics as JSON
- `clearMetrics()` - Clear metrics data

## Examples

### Basic API Rate Limiting

```javascript
const apiLimiter = new RateLimiter({
	maxRequests: 100,
	windowSize: 3600000, // 1 hour
	queueRequests: true,
	storage: 'localStorage',
	identifier: 'api'
});

async function fetchUserData(userId) {
	return apiLimiter.makeRequest(() =>
		fetch(`/api/users/${userId}`)
	);
}
```

### Multiple Priority Levels

```javascript
const limiter = new RateLimiter({
	maxRequests: 20,
	windowSize: 60000,
	priority: {
		critical: 1,
		normal: 5,
		background: 10
	}
});

// Critical request (processed first)
limiter.makeRequest(() => fetch('/api/critical'), {
	priority: 'critical'
});

// Background request (processed last)
limiter.makeRequest(() => fetch('/api/analytics'), {
	priority: 'background'
});
```

### Custom Backoff Strategy

```javascript
const limiter = new RateLimiter({
	maxRequests: 5,
	windowSize: 60000,
	backoffStrategy: 'exponential',
	baseBackoffDelay: 2000,
	maxBackoffDelay: 60000
});
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

MIT License