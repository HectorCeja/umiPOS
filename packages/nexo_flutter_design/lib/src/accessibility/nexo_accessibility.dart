import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

/// Certified minimum target from `--nexo-touch-target` (2.75rem at 16px).
const nexoMinimumInteractiveExtent = 44.0;

/// Gives a control a minimum semantic and hit-test target without shrinking text.
class NexoAccessibleTarget extends StatelessWidget {
  const NexoAccessibleTarget({required this.child, this.label, super.key});

  final Widget child;
  final String? label;

  @override
  Widget build(BuildContext context) => Semantics(
    label: label,
    container: true,
    child: ConstrainedBox(
      constraints: const BoxConstraints(
        minWidth: nexoMinimumInteractiveExtent,
        minHeight: nexoMinimumInteractiveExtent,
      ),
      child: Center(
        child: label == null ? child : ExcludeSemantics(child: child),
      ),
    ),
  );
}

/// Announces an asynchronous operational state without encoding it by color only.
void announceNexoState(BuildContext context, String message) {
  SemanticsService.sendAnnouncement(
    View.of(context),
    message,
    TextDirection.ltr,
  );
}
