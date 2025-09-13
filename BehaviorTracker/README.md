# BehaviorTracker Component

A comprehensive vanilla JavaScript component for tracking user interactions to help distinguish between human users and bots.

## Features

- Mouse movement tracking with velocity and acceleration analysis
- Touch and swipe gesture detection
- Click pattern analysis
- Keyboard interaction monitoring
- Page load timing analysis
- Behavioral scoring system for bot detection

## Configuration Options

```javascript
const options = {
	// Tracking intervals (milliseconds)
	mouseTrackingInterval: 50,
	touchTrackingInterval: 50,

	// Analysis thresholds
	minMouseMovements: 5,
	minInteractionTime: 2000,
	suspiciousLinearityThreshold: 0.95,

	// Scoring weights
	mouseWeight: 0.25,
	touchWeight: 0.20,
	clickWeight: 0.20,
	keyboardWeight: 0.20,
	timingWeight: 0.15,

	// Bot detection thresholds
	botScoreThreshold: 0.3,
	humanScoreThreshold: 0.7,

	// Event callbacks
	onScoreUpdate: null,
	onBotDetected: null,
	onHumanDetected: null,

	// Debug options
	debug: false,
	logEvents: false
};
```

## Usage

```javascript
// Basic initialization
const tracker = new BehaviorTracker();
tracker.start();

// With custom options
const customTracker = new BehaviorTracker({
	debug: true,
	botScoreThreshold: 0.25,
	onScoreUpdate: (score) => console.log('Current score:', score),
	onBotDetected: (data) => console.log('Bot detected!', data),
	onHumanDetected: (data) => console.log('Human detected!', data)
});

// Get current analysis
const analysis = tracker.getAnalysis();
console.log('Behavior analysis:', analysis);

// Stop tracking
tracker.stop();
```

## Analysis Metrics

### Mouse Behavior
- Movement velocity and acceleration
- Path linearity analysis
- Click timing patterns
- Hover behavior

### Touch Behavior
- Swipe patterns and velocities
- Touch pressure variations
- Multi-touch capabilities
- Natural gesture patterns

### Keyboard Behavior
- Typing rhythm analysis
- Key press intervals
- Natural pauses and corrections

### Timing Analysis
- Page interaction delays
- Response time patterns
- Consistency analysis

## Bot Detection Indicators

### High Bot Probability
- Perfectly linear mouse movements
- Consistent timing intervals
- Lack of natural pauses
- Missing touch events on mobile
- Immediate interactions after page load

### High Human Probability
- Natural movement curves and variations
- Irregular timing patterns
- Natural pauses and corrections
- Appropriate touch gestures
- Contextual interaction patterns

## API Methods

- `start()` - Begin tracking user behavior
- `stop()` - Stop all tracking
- `getAnalysis()` - Get current behavioral analysis
- `getScore()` - Get current bot/human score (0-1)
- `reset()` - Reset all tracking data
- `isBot()` - Boolean check if current behavior suggests bot
- `isHuman()` - Boolean check if current behavior suggests human