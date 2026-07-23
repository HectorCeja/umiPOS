import 'package:flutter/material.dart';

import '../foundation/nexo_foundation.dart';
import '../theme/nexo_theme.dart';

enum NexoEditorialRevealStage { critical, cards, editorial }

/// Route-entry reveal primitive. It never blocks pointer input.
class NexoEditorialReveal extends StatelessWidget {
  const NexoEditorialReveal({
    required this.child,
    this.stage = NexoEditorialRevealStage.editorial,
    this.preferences,
    super.key,
  });
  final Widget child;
  final NexoEditorialRevealStage stage;
  final NexoVisualPreferences? preferences;
  @override
  Widget build(BuildContext context) {
    final prefs = preferences ?? NexoVisualPreferences.of(context);
    if (prefs.reduceMotion) return child;
    final motion = Theme.of(context).extension<NexoMotion>()!;
    final delay = switch (stage) {
      NexoEditorialRevealStage.critical => Duration.zero,
      NexoEditorialRevealStage.cards => const Duration(milliseconds: 240),
      NexoEditorialRevealStage.editorial => const Duration(milliseconds: 900),
    };
    return _DelayedReveal(delay: delay, duration: motion.slow, child: child);
  }
}

class _DelayedReveal extends StatefulWidget {
  const _DelayedReveal({
    required this.delay,
    required this.duration,
    required this.child,
  });
  final Duration delay, duration;
  final Widget child;
  @override
  State<_DelayedReveal> createState() => _DelayedRevealState();
}

class _DelayedRevealState extends State<_DelayedReveal> {
  bool visible = false;
  @override
  void initState() {
    super.initState();
    Future<void>.delayed(widget.delay, () {
      if (mounted) setState(() => visible = true);
    });
  }

  @override
  Widget build(BuildContext context) => AnimatedOpacity(
    opacity: visible ? 1 : 0,
    duration: widget.duration,
    child: AnimatedSlide(
      offset: visible ? Offset.zero : const Offset(0, .035),
      duration: widget.duration,
      curve: Curves.easeOutCubic,
      child: widget.child,
    ),
  );
}
