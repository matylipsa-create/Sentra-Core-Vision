import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../config/accessibility_theme.dart';

/// Interactive node map HUD for the Sentra Core processing graph.
///
/// The graph is intentionally precomputed as a fixed set of nodes and
/// connections to keep the paint path deterministic and avoid unnecessary
/// per-frame object churn.
class NodeHud extends StatefulWidget {
  const NodeHud({super.key});

  @override
  State<NodeHud> createState() => _NodeHudState();
}

class _NodeHudState extends State<NodeHud> {
  late final List<_NodeState> _nodes;
  int? _selectedIndex;

  @override
  void initState() {
    super.initState();
    _nodes = const [
      _NodeState(
        id: 'EVOLIS',
        label: 'EVOLIS',
        status: 'ética',
        x: 0.28,
        y: 0.26,
        radius: 28,
        color: Color(0xFF69F0AE),
      ),
      _NodeState(
        id: 'Cognitive',
        label: 'CVI',
        status: 'carga',
        x: 0.58,
        y: 0.22,
        radius: 22,
        color: Color(0xFFFFEB3B),
      ),
      _NodeState(
        id: 'Sensors',
        label: 'SENSORS',
        status: 'mitigación',
        x: 0.42,
        y: 0.46,
        radius: 24,
        color: Color(0xFF80D8FF),
      ),
      _NodeState(
        id: 'Camera',
        label: 'CAM',
        status: 'visión',
        x: 0.72,
        y: 0.52,
        radius: 24,
        color: Color(0xFFE1BEE7),
      ),
      _NodeState(
        id: 'AirGap',
        label: 'AIR',
        status: 'offline',
        x: 0.56,
        y: 0.72,
        radius: 25,
        color: Color(0xFFFFB74D),
      ),
      _NodeState(
        id: 'TTS',
        label: 'A11Y',
        status: 'voz',
        x: 0.23,
        y: 0.72,
        radius: 22,
        color: Color(0xFFB39DDB),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final size = constraints.biggest;
        final nodes = _nodes.map((node) {
          final x = node.x * size.width;
          final y = node.y * size.height;
          return _NodeState(
            id: node.id,
            label: node.label,
            status: node.status,
            x: x,
            y: y,
            radius: node.radius,
            color: node.color,
          );
        }).toList(growable: false);

        return Semantics(
          container: true,
          label: 'HUD de nodos de Sentra Core. Arrastra para mover los nodos y selecciona un módulo para revisar su estado.',
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapDown: (details) => _selectNearestNode(details.localPosition),
            onPanStart: (details) => _selectNearestNode(details.localPosition),
            onPanUpdate: (details) {
              final index = _selectedIndex;
              if (index == null) return;
              final selected = nodes[index];
              final nextX = (selected.x + details.delta.dx).clamp(
                selected.radius,
                size.width - selected.radius,
              );
              final nextY = (selected.y + details.delta.dy).clamp(
                selected.radius,
                size.height - selected.radius,
              );
              setState(() {
                _nodes[index] = _NodeState(
                  id: selected.id,
                  label: selected.label,
                  status: selected.status,
                  x: nextX / size.width,
                  y: nextY / size.height,
                  radius: selected.radius,
                  color: selected.color,
                );
              });
            },
            child: CustomPaint(
              painter: _NodeHudPainter(nodes, _selectedIndex),
              size: size,
            ),
          ),
        );
      },
    );
  }

  void _selectNearestNode(Offset position) {
    double nearestDistance = double.infinity;
    int? nearestIndex;

    for (var index = 0; index < _nodes.length; index++) {
      final node = _nodes[index];
      final dx = position.dx - (node.x * 320);
      final dy = position.dy - (node.y * 220);
      final distance = math.sqrt(dx * dx + dy * dy);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }

    if (nearestIndex != null && nearestDistance < 44) {
      setState(() => _selectedIndex = nearestIndex);
    }
  }
}

class _NodeHudPainter extends CustomPainter {
  _NodeHudPainter(this.nodes, this.selectedIndex);

  final List<_NodeState> nodes;
  final int? selectedIndex;

  static const List<_Connection> _connections = [
    _Connection(0, 2),
    _Connection(0, 5),
    _Connection(1, 2),
    _Connection(1, 3),
    _Connection(2, 3),
    _Connection(2, 4),
    _Connection(3, 4),
    _Connection(4, 5),
    _Connection(0, 1),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final background = Paint()..color = AccessibilityTheme.background;
    canvas.drawRect(Offset.zero & size, background);

    final gridPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..style = PaintingStyle.stroke;
    for (var x = 0.0; x < size.width; x += 32) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (var y = 0.0; y < size.height; y += 32) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    final linePaint = Paint()
      ..color = AccessibilityTheme.primary.withValues(alpha: 0.45)
      ..strokeWidth = 2.2
      ..style = PaintingStyle.stroke;

    for (final connection in _connections) {
      final from = nodes[connection.fromIndex];
      final to = nodes[connection.toIndex];
      canvas.drawLine(
        Offset(from.x, from.y),
        Offset(to.x, to.y),
        linePaint,
      );
    }

    for (var i = 0; i < nodes.length; i++) {
      final node = nodes[i];
      final isSelected = i == selectedIndex;
      final glowPaint = Paint()
        ..color = node.color.withValues(alpha: isSelected ? 0.28 : 0.16)
        ..style = PaintingStyle.fill;
      final basePaint = Paint()
        ..color = node.color
        ..style = PaintingStyle.fill;
      final ringPaint = Paint()
        ..color = isSelected ? AccessibilityTheme.primary : Colors.white70
        ..style = PaintingStyle.stroke
        ..strokeWidth = isSelected ? 3 : 1.5;

      canvas.drawCircle(Offset(node.x, node.y), node.radius + 12, glowPaint);
      canvas.drawCircle(Offset(node.x, node.y), node.radius, basePaint);
      canvas.drawCircle(Offset(node.x, node.y), node.radius + 4, ringPaint);

      final labelPainter = TextPainter(
        text: TextSpan(
          text: node.label,
          style: TextStyle(
            color: isSelected ? AccessibilityTheme.primary : Colors.white,
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.1,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();

      final valuePainter = TextPainter(
        text: TextSpan(
          text: node.status,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 10,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();

      final textX = node.x - (labelPainter.width / 2);
      final textY = node.y + node.radius + 10;
      labelPainter.paint(canvas, Offset(textX, textY));
      valuePainter.paint(canvas, Offset(node.x - (valuePainter.width / 2), textY + 16));
    }
  }

  @override
  bool shouldRepaint(covariant _NodeHudPainter oldDelegate) {
    return oldDelegate.selectedIndex != selectedIndex ||
        oldDelegate.nodes.length != nodes.length ||
        oldDelegate.nodes.any((node) => !node.equals(nodes[oldDelegate.nodes.indexOf(node)]));
  }
}

class _Connection {
  const _Connection(this.fromIndex, this.toIndex);

  final int fromIndex;
  final int toIndex;
}

class _NodeState {
  const _NodeState({
    required this.id,
    required this.label,
    required this.status,
    required this.x,
    required this.y,
    required this.radius,
    required this.color,
  });

  final String id;
  final String label;
  final String status;
  final double x;
  final double y;
  final double radius;
  final Color color;

  bool equals(_NodeState other) {
    return id == other.id &&
        label == other.label &&
        status == other.status &&
        x == other.x &&
        y == other.y &&
        radius == other.radius &&
        color == other.color;
  }
}

class NodeHudScreen extends StatelessWidget {
  const NodeHudScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      appBar: AppBar(
        title: const Text('HUD de Nodos'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space3),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Semantics(
                container: true,
                label: 'Mapa de nodos de Sentra Core con módulos de análisis, cámara, voz y sincronización.',
                child: Container(
                  padding: const EdgeInsets.all(AccessibilityTheme.space2),
                  decoration: BoxDecoration(
                    color: AccessibilityTheme.surface,
                    borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
                    border: Border.all(color: AccessibilityTheme.primary, width: 2),
                  ),
                  child: const SizedBox(
                    height: 320,
                    child: NodeHud(),
                  ),
                ),
              ),
              SizedBox(height: AccessibilityTheme.space2),
              Text(
                'Flujo de procesamiento',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              SizedBox(height: AccessibilityTheme.space1),
              Text(
                'EVOLIS → mitigación sensorial → cámara → air-gap → accesibilidad',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              SizedBox(height: AccessibilityTheme.space2),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Volver'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
