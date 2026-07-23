import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../tokens/generated/nexo_tokens.g.dart';
import 'model.dart';

class NexoAuroraPainter extends CustomPainter {
  const NexoAuroraPainter({required this.progress, required this.policy});
  final double progress;
  final NexoScenePolicy policy;

  @override
  void paint(Canvas canvas, Size size) {
    final phase = policy.effects.animateAurora ? progress * math.pi * 2 : 0.0;
    final colors = [
      NexoV1Colors.violet,
      NexoV1Colors.blue,
      NexoV1Colors.cyan,
      NexoV1Colors.pink,
    ];
    for (var i = 0; i < policy.effects.auroraCount; i++) {
      final x =
          size.width * (.2 + i * .23) + math.sin(phase + i) * size.width * .025;
      final y =
          size.height * (.18 + (i.isEven ? .12 : .42)) +
          math.cos(phase * .8 + i) * size.height * .02;
      final radius = size.shortestSide * (.34 + i * .035);
      canvas.drawCircle(
        Offset(x, y),
        radius,
        Paint()
          ..shader = RadialGradient(
            colors: [
              colors[i].withValues(alpha: policy.highContrast ? .08 : .18),
              colors[i].withValues(alpha: 0),
            ],
          ).createShader(Rect.fromCircle(center: Offset(x, y), radius: radius)),
      );
    }
  }

  @override
  bool shouldRepaint(covariant NexoAuroraPainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.policy != policy;
}

class NexoTrailPainter extends CustomPainter {
  const NexoTrailPainter({required this.progress, required this.count});
  final double progress;
  final int count;
  @override
  void paint(Canvas canvas, Size size) {
    for (var i = 0; i < count; i++) {
      final p = (progress + i * .43) % 1;
      final start = Offset(
        size.width * (.08 + p * .72),
        size.height * (.76 - i * .17),
      );
      canvas.drawLine(
        start,
        start + Offset(size.width * .14, -size.height * .045),
        Paint()
          ..color = NexoV1Colors.cyan.withValues(alpha: .07)
          ..strokeWidth = 1.2
          ..strokeCap = StrokeCap.round,
      );
    }
  }

  @override
  bool shouldRepaint(covariant NexoTrailPainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.count != count;
}

class NexoSceneMaskOverlay extends StatelessWidget {
  const NexoSceneMaskOverlay({
    required this.mask,
    required this.highContrast,
    super.key,
  });
  final NexoSceneMask mask;
  final bool highContrast;
  @override
  Widget build(BuildContext context) {
    final strength = highContrast
        ? .88
        : switch (mask) {
            NexoSceneMask.cinematic => .50,
            NexoSceneMask.operational => .60,
            NexoSceneMask.concentrated => .68,
            NexoSceneMask.abstract => .42,
            NexoSceneMask.focused => .76,
          };
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [
            NexoV1Colors.canvas.withValues(alpha: .94),
            NexoV1Colors.canvas.withValues(alpha: strength),
            NexoV1Colors.canvas.withValues(alpha: .26),
          ],
          stops: const [0, .54, 1],
        ),
      ),
    );
  }
}
