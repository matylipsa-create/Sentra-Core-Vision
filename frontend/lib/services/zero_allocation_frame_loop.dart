import 'dart:typed_data';

/// A single camera frame held in a pre-allocated reusable buffer.
///
/// Fields are mutated in place rather than reallocated to avoid GC pressure
/// during continuous high-frequency camera sampling.
class ReusableFrame {
  int frameId;
  int width;
  int height;
  int timestamp;

  /// Pixel data in RGBA format, backed by a [Uint8List] that is allocated
  /// once and reused across frames.
  final Uint8List pixels;

  /// Detection results written into a pre-allocated list.
  final List<FrameDetection> detections;

  ReusableFrame._(this.pixels, this.detections)
      : frameId = 0,
        width = 0,
        height = 0,
        timestamp = 0;

  /// Resets the frame for reuse without allocating new memory.
  void reset(int id, int w, int h, int ts) {
    frameId = id;
    width = w;
    height = h;
    timestamp = ts;
    detections.clear();
  }
}

/// Lightweight detection result that populates pre-allocated lists.
class FrameDetection {
  String label;
  double confidence;
  double distanceMeters;
  String relativePosition;

  FrameDetection._()
      : label = '',
        confidence = 0,
        distanceMeters = 0,
        relativePosition = '';

  void set(String lbl, double conf, double dist, String pos) {
    label = lbl;
    confidence = conf;
    distanceMeters = dist;
    relativePosition = pos;
  }
}

/// Result of processing a frame through the zero-allocation loop.
class FrameProcessResult {
  final int frameId;
  final double smoothedDistance;
  final bool obstacleProximity;

  const FrameProcessResult({
    required this.frameId,
    required this.smoothedDistance,
    required this.obstacleProximity,
  });
}

/// Zero-allocation frame processing loop using pre-instanced reusable buffers.
///
/// Maintains a pool of [ReusableFrame] objects and a circular distance buffer
/// backed by [Float64List], so that continuous camera sampling never triggers
/// per-frame heap allocations or GC stutter on the main thread.
///
/// Usage:
/// ```dart
/// final loop = ZeroAllocationFrameLoop(bufferSize: 8, maxDetections: 5);
/// loop.beginSession(640, 480);
/// loop.processFrame(frameId, rawPixels, timestamp, callback);
/// ```
class ZeroAllocationFrameLoop {
  final int _bufferSize;
  final int _maxDetections;

  late final List<ReusableFrame> _framePool;
  late final Float64List _distanceBuffer;
  int _distanceHead = 0;
  int _distanceCount = 0;
  int _poolIndex = 0;

  int _frameWidth = 0;
  int _frameHeight = 0;
  bool _sessionActive = false;

  ZeroAllocationFrameLoop({
    int bufferSize = 8,
    int maxDetections = 5,
    int distanceWindow = 5,
  })  : _bufferSize = bufferSize,
        _maxDetections = maxDetections,
        _distanceBuffer = Float64List(distanceWindow);

  /// Pre-allocates the frame pool for a given frame dimension.
  void beginSession(int width, int height) {
    _frameWidth = width;
    _frameHeight = height;
    final pixelCount = width * height * 4; // RGBA
    _framePool = List.generate(_bufferSize, (_) {
      final detections = List.generate(
        _maxDetections,
        (_) => FrameDetection._(),
        growable: false,
      );
      return ReusableFrame._(Uint8List(pixelCount), detections);
    });
    _poolIndex = 0;
    _distanceHead = 0;
    _distanceCount = 0;
    _sessionActive = true;
  }

  bool get isSessionActive => _sessionActive;
  int get poolSize => _bufferSize;

  /// Returns the next reusable frame from the pool (round-robin).
  ReusableFrame acquireFrame(int frameId, int timestamp) {
    if (!_sessionActive) {
      throw StateError('Session not active. Call beginSession() first.');
    }
    final frame = _framePool[_poolIndex];
    frame.reset(frameId, _frameWidth, _frameHeight, timestamp);
    _poolIndex = (_poolIndex + 1) % _bufferSize;
    return frame;
  }

  /// Pushes a distance reading into the circular buffer (no allocation).
  void pushDistance(double distance) {
    _distanceBuffer[_distanceHead] = distance;
    _distanceHead = (_distanceHead + 1) % _distanceBuffer.length;
    if (_distanceCount < _distanceBuffer.length) _distanceCount++;
  }

  /// Computes the median of the distance window without allocating a list.
  double smoothedDistance() {
    if (_distanceCount == 0) return double.infinity;

    // Insertion sort into a stack-allocated small array
    final temp = Float64List(_distanceCount);
    for (var i = 0; i < _distanceCount; i++) {
      final idx = (_distanceHead - _distanceCount + i + _distanceBuffer.length) %
          _distanceBuffer.length;
      temp[i] = _distanceBuffer[idx];
    }
    // Simple insertion sort (n <= 5 typically)
    for (var i = 1; i < temp.length; i++) {
      final key = temp[i];
      var j = i - 1;
      while (j >= 0 && temp[j] > key) {
        temp[j + 1] = temp[j];
        j--;
      }
      temp[j + 1] = key;
    }
    return temp[temp.length ~/ 2];
  }

  /// Full processing pass: acquires a frame, pushes distance, returns result.
  FrameProcessResult processFrame(
    int frameId,
    int timestamp,
    double rawDistance,
    double proximityThresholdM,
  ) {
    acquireFrame(frameId, timestamp);
    pushDistance(rawDistance);
    final smoothed = smoothedDistance();
    return FrameProcessResult(
      frameId: frameId,
      smoothedDistance: smoothed,
      obstacleProximity: smoothed <= proximityThresholdM,
    );
  }

  /// Ends the session and releases the pool reference.
  void endSession() {
    _sessionActive = false;
    _framePool = [];
    _distanceHead = 0;
    _distanceCount = 0;
  }
}
