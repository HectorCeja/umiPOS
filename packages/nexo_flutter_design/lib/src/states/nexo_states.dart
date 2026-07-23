import 'package:flutter/material.dart';

import '../tokens/generated/nexo_tokens.g.dart';

/// Shared operational states; widgets pair color with icon, copy and semantics.
enum NexoSemanticState {
  success,
  warning,
  danger,
  info,
  neutral,
  pending,
  syncing,
  offline,
  stale,
  restricted,
  disabled,
  loading,
}

@immutable
class NexoStateVisual {
  const NexoStateVisual({
    required this.foreground,
    required this.background,
    required this.border,
    required this.icon,
    required this.semanticKey,
  });

  final Color foreground;
  final Color background;
  final Color border;
  final IconData icon;
  final String semanticKey;
}

/// Resolves states exclusively from certified V1 colors.
abstract final class NexoStates {
  static NexoStateVisual resolve(NexoSemanticState state) {
    final (color, icon) = switch (state) {
      NexoSemanticState.success => (
        NexoV1Colors.mint,
        Icons.check_circle_outline,
      ),
      NexoSemanticState.warning || NexoSemanticState.stale => (
        NexoV1Colors.warning,
        Icons.warning_amber_rounded,
      ),
      NexoSemanticState.danger => (NexoV1Colors.danger, Icons.error_outline),
      NexoSemanticState.info ||
      NexoSemanticState.syncing => (NexoV1Colors.blue, Icons.info_outline),
      NexoSemanticState.offline => (
        NexoV1Colors.warning,
        Icons.cloud_off_outlined,
      ),
      NexoSemanticState.restricted => (NexoV1Colors.faint, Icons.lock_outline),
      NexoSemanticState.pending ||
      NexoSemanticState.loading => (NexoV1Colors.cyan, Icons.schedule),
      NexoSemanticState.neutral ||
      NexoSemanticState.disabled => (NexoV1Colors.faint, Icons.circle_outlined),
    };
    return NexoStateVisual(
      foreground: color,
      background: color.withValues(alpha: .10),
      border: color.withValues(alpha: .34),
      icon: icon,
      semanticKey: 'state.${state.name}',
    );
  }
}
