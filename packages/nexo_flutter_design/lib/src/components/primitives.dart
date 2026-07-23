import 'dart:ui';

import 'package:flutter/material.dart';

import '../foundation/nexo_foundation.dart';
import '../theme/nexo_theme.dart';
import '../tokens/generated/nexo_tokens.g.dart';

enum NexoControlSize { compact, small, medium, large }

enum NexoTone {
  neutral,
  info,
  success,
  warning,
  danger,
  offline,
  syncing,
  restricted,
}

enum NexoSurfaceVariant {
  canvas,
  standard,
  elevated,
  glass,
  interactive,
  selected,
  muted,
  modal,
  floating,
}

extension NexoControlSizeMetrics on NexoControlSize {
  double get visualHeight => switch (this) {
    NexoControlSize.compact => 36,
    NexoControlSize.small => 40,
    NexoControlSize.medium => 44,
    NexoControlSize.large => 52,
  };
  EdgeInsets get padding => switch (this) {
    NexoControlSize.compact => const EdgeInsets.symmetric(
      horizontal: 12,
      vertical: 6,
    ),
    NexoControlSize.small => const EdgeInsets.symmetric(
      horizontal: 14,
      vertical: 8,
    ),
    NexoControlSize.medium => const EdgeInsets.symmetric(
      horizontal: 18,
      vertical: 10,
    ),
    NexoControlSize.large => const EdgeInsets.symmetric(
      horizontal: 22,
      vertical: 13,
    ),
  };
  double get iconSize => switch (this) {
    NexoControlSize.compact => 16,
    NexoControlSize.small => 18,
    NexoControlSize.medium => 20,
    NexoControlSize.large => 22,
  };
}

class NexoSurface extends StatelessWidget {
  const NexoSurface({
    required this.child,
    this.variant = NexoSurfaceVariant.standard,
    this.padding,
    this.borderRadius,
    this.glowColor,
    this.semanticLabel,
    this.clipBehavior = Clip.antiAlias,
    super.key,
  });

  final Widget child;
  final NexoSurfaceVariant variant;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  final Color? glowColor;
  final String? semanticLabel;
  final Clip clipBehavior;

  @override
  Widget build(BuildContext context) {
    final colors = context.nexoColors;
    final metrics = context.nexoMetrics;
    final preferences = NexoVisualPreferences.of(context);
    final radius = borderRadius ?? BorderRadius.circular(metrics.radius[3]);
    final background = switch (variant) {
      NexoSurfaceVariant.canvas => NexoV1Colors.canvas,
      NexoSurfaceVariant.elevated ||
      NexoSurfaceVariant.modal ||
      NexoSurfaceVariant.floating => colors.surfaceRaised,
      NexoSurfaceVariant.interactive ||
      NexoSurfaceVariant.selected => colors.surfaceInteractive,
      NexoSurfaceVariant.muted => colors.canvasDeep,
      _ => NexoV1Colors.surface,
    };
    final shadows = switch (variant) {
      NexoSurfaceVariant.modal ||
      NexoSurfaceVariant.floating => metrics.shadows[4],
      NexoSurfaceVariant.elevated => metrics.shadows[2],
      _ => const <BoxShadow>[],
    };
    Widget result = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: variant == NexoSurfaceVariant.glass
            ? background.withValues(alpha: .82)
            : background,
        borderRadius: radius,
        border: Border.all(
          color: variant == NexoSurfaceVariant.selected
              ? NexoV1Colors.violet
              : colors.borderSubtle,
        ),
        boxShadow: [
          ...shadows,
          if (glowColor != null && preferences.expensiveEffectsEnabled)
            BoxShadow(color: glowColor!.withValues(alpha: .18), blurRadius: 36),
        ],
      ),
      clipBehavior: clipBehavior,
      child: child,
    );
    if (variant == NexoSurfaceVariant.glass &&
        preferences.expensiveEffectsEnabled) {
      result = ClipRRect(
        borderRadius: radius,
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: metrics.blur[0],
            sigmaY: metrics.blur[0],
          ),
          child: result,
        ),
      );
    }
    return Semantics(container: true, label: semanticLabel, child: result);
  }
}

class NexoDivider extends StatelessWidget {
  const NexoDivider({
    this.axis = Axis.horizontal,
    this.inset = 0,
    this.label,
    super.key,
  });
  final Axis axis;
  final double inset;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final line = Container(
      color: context.nexoColors.borderSubtle,
      width: axis == Axis.vertical ? 1 : null,
      height: axis == Axis.horizontal ? 1 : null,
    );
    if (label == null) {
      return Padding(
        padding: axis == Axis.horizontal
            ? EdgeInsets.symmetric(horizontal: inset)
            : EdgeInsets.symmetric(vertical: inset),
        child: line,
      );
    }
    return Row(
      children: [
        Expanded(child: line),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(label!, style: Theme.of(context).textTheme.labelSmall),
        ),
        Expanded(child: line),
      ],
    );
  }
}

class NexoTooltip extends StatelessWidget {
  const NexoTooltip({required this.message, required this.child, super.key});
  final String message;
  final Widget child;
  @override
  Widget build(BuildContext context) => Tooltip(
    message: message,
    textStyle: Theme.of(
      context,
    ).textTheme.labelSmall?.copyWith(color: NexoV1Colors.text),
    decoration: BoxDecoration(
      color: context.nexoColors.surfaceRaised,
      border: Border.all(color: context.nexoColors.borderStrong),
      borderRadius: BorderRadius.circular(context.nexoMetrics.radius[2]),
    ),
    child: child,
  );
}
