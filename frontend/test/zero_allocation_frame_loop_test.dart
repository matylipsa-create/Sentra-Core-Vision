import 'package:flutter_test/flutter_test.dart';
import 'package:sentra_core/services/zero_allocation_frame_loop.dart';

void main() {
  group('ZeroAllocationFrameLoop', () {
    test('beginSession activates the loop', () {
      final loop = ZeroAllocationFrameLoop();
      expect(loop.isSessionActive, isFalse);
      loop.beginSession(640, 480);
      expect(loop.isSessionActive, isTrue);
    });

    test('acquireFrame returns a reusable frame with correct dimensions', () {
      final loop = ZeroAllocationFrameLoop();
      loop.beginSession(320, 240);
      final frame = loop.acquireFrame(1, 1000);
      expect(frame.frameId, 1);
      expect(frame.width, 320);
      expect(frame.height, 240);
      expect(frame.timestamp, 1000);
      expect(frame.pixels.length, 320 * 240 * 4);
    });

    test('acquireFrame cycles through pool without allocating new objects', () {
      final loop = ZeroAllocationFrameLoop(bufferSize: 4);
      loop.beginSession(64, 64);
      final f1 = loop.acquireFrame(1, 1000);
      final f2 = loop.acquireFrame(2, 2000);
      final f3 = loop.acquireFrame(3, 3000);
      final f4 = loop.acquireFrame(4, 4000);
      // 5th should reuse f1's slot
      final f5 = loop.acquireFrame(5, 5000);
      expect(f5, same(f1));
      expect(f5.frameId, 5);
    });

    test('detections list is pre-allocated and cleared on reset', () {
      final loop = ZeroAllocationFrameLoop(maxDetections: 3);
      loop.beginSession(64, 64);
      final frame = loop.acquireFrame(1, 1000);
      expect(frame.detections.length, 0); // cleared by reset
    });

    test('pushDistance and smoothedDistance work correctly', () {
      final loop = ZeroAllocationFrameLoop(distanceWindow: 5);
      loop.beginSession(64, 64);
      loop.pushDistance(2.0);
      loop.pushDistance(1.0);
      loop.pushDistance(3.0);
      expect(loop.smoothedDistance(), 2.0); // median of [1,2,3]
    });

    test('smoothedDistance returns infinity for empty buffer', () {
      final loop = ZeroAllocationFrameLoop();
      loop.beginSession(64, 64);
      expect(loop.smoothedDistance(), double.infinity);
    });

    test('processFrame integrates all steps', () {
      final loop = ZeroAllocationFrameLoop();
      loop.beginSession(64, 64);
      final result = loop.processFrame(1, 1000, 1.2, 1.5);
      expect(result.frameId, 1);
      expect(result.smoothedDistance, 1.2);
      expect(result.obstacleProximity, isTrue);
    });

    test('processFrame reports no proximity when distance exceeds threshold', () {
      final loop = ZeroAllocationFrameLoop();
      loop.beginSession(64, 64);
      final result = loop.processFrame(1, 1000, 3.0, 1.5);
      expect(result.obstacleProximity, isFalse);
    });

    test('endSession deactivates the loop', () {
      final loop = ZeroAllocationFrameLoop();
      loop.beginSession(64, 64);
      loop.endSession();
      expect(loop.isSessionActive, isFalse);
    });

    test('acquireFrame throws when no active session', () {
      final loop = ZeroAllocationFrameLoop();
      expect(() => loop.acquireFrame(1, 1000), throwsStateError);
    });
  });
}
