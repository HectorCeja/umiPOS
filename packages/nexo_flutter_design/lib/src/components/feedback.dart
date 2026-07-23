import 'package:flutter/material.dart';

import '../foundation/nexo_foundation.dart';
import '../states/nexo_states.dart';
import '../theme/nexo_theme.dart';
import '../tokens/generated/nexo_tokens.g.dart';
import 'primitives.dart';

class NexoSpinner extends StatelessWidget {
  const NexoSpinner({
    this.size = 24,
    this.semanticLabel = 'Cargando',
    super.key,
  });
  final double size;
  final String semanticLabel;
  @override
  Widget build(BuildContext context) => Semantics(
    label: semanticLabel,
    liveRegion: true,
    child: SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: 2,
        color: NexoV1Colors.cyan,
        semanticsLabel: semanticLabel,
      ),
    ),
  );
}

class NexoProgress extends StatelessWidget {
  const NexoProgress({this.value, this.label = 'Progreso', super.key});
  final double? value;
  final String label;
  @override
  Widget build(BuildContext context) => LinearProgressIndicator(
    value: value,
    semanticsLabel: label,
    semanticsValue: value == null
        ? 'En progreso'
        : '${(value! * 100).round()}%',
    minHeight: 4,
    borderRadius: BorderRadius.circular(999),
  );
}

class NexoSkeleton extends StatefulWidget {
  const NexoSkeleton({
    required this.width,
    required this.height,
    this.radius = 12,
    super.key,
  });
  final double width, height, radius;
  @override
  State<NexoSkeleton> createState() => _NexoSkeletonState();
}

class _NexoSkeletonState extends State<NexoSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController controller;
  @override
  void initState() {
    super.initState();
    controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (NexoVisualPreferences.of(context).ambientMotionEnabled) {
      controller.repeat(reverse: true);
    } else {
      controller.stop();
    }
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: FadeTransition(
      opacity: Tween(begin: .45, end: .8).animate(controller),
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: context.nexoColors.surfaceInteractive,
          borderRadius: BorderRadius.circular(widget.radius),
        ),
      ),
    ),
  );
}

enum NexoEmptyStateSize { inline, compact, full }

class NexoEmptyState extends StatelessWidget {
  const NexoEmptyState({
    required this.title,
    required this.description,
    this.icon,
    this.illustration,
    this.primaryAction,
    this.secondaryAction,
    this.size = NexoEmptyStateSize.compact,
    super.key,
  });
  final String title, description;
  final IconData? icon;
  final Widget? illustration, primaryAction, secondaryAction;
  final NexoEmptyStateSize size;
  @override
  Widget build(BuildContext context) {
    final padding = switch (size) {
      NexoEmptyStateSize.inline => 16.0,
      NexoEmptyStateSize.compact => 24.0,
      NexoEmptyStateSize.full => 40.0,
    };
    return Semantics(
      container: true,
      label: '$title. $description',
      child: Padding(
        padding: EdgeInsets.all(padding),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (illustration != null)
              illustration!
            else if (icon != null)
              Icon(
                icon,
                size: size == NexoEmptyStateSize.full ? 48 : 32,
                color: NexoV1Colors.faint,
              ),
            SizedBox(height: padding / 2),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              description,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            if (primaryAction != null || secondaryAction != null) ...[
              const SizedBox(height: 20),
              Wrap(
                spacing: 12,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: [
                  if (primaryAction != null) primaryAction!,
                  if (secondaryAction != null) secondaryAction!,
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class NexoInlineNotice extends StatelessWidget {
  const NexoInlineNotice({
    required this.tone,
    required this.title,
    this.body,
    this.action,
    this.onDismiss,
    super.key,
  });
  final NexoTone tone;
  final String title;
  final String? body;
  final Widget? action;
  final VoidCallback? onDismiss;
  @override
  Widget build(BuildContext context) {
    final state = switch (tone) {
      NexoTone.success => NexoSemanticState.success,
      NexoTone.warning => NexoSemanticState.warning,
      NexoTone.danger => NexoSemanticState.danger,
      NexoTone.offline => NexoSemanticState.offline,
      NexoTone.restricted => NexoSemanticState.restricted,
      _ => NexoSemanticState.info,
    };
    final visual = NexoStates.resolve(state);
    return Semantics(
      liveRegion: tone == NexoTone.danger,
      container: true,
      label: '$title${body == null ? '' : '. $body'}',
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: visual.background,
          border: Border.all(color: visual.border),
          borderRadius: BorderRadius.circular(context.nexoMetrics.radius[2]),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(visual.icon, color: visual.foreground),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.labelLarge),
                  if (body != null) ...[
                    const SizedBox(height: 4),
                    Text(body!, style: Theme.of(context).textTheme.bodyMedium),
                  ],
                  if (action != null) ...[const SizedBox(height: 10), action!],
                ],
              ),
            ),
            if (onDismiss != null)
              IconButton(
                onPressed: onDismiss,
                icon: const Icon(Icons.close),
                tooltip: 'Cerrar',
              ),
          ],
        ),
      ),
    );
  }
}

class NexoToast extends StatelessWidget {
  const NexoToast({
    required this.tone,
    required this.message,
    this.action,
    this.persistent = false,
    super.key,
  });
  final NexoTone tone;
  final String message;
  final Widget? action;
  final bool persistent;
  @override
  Widget build(BuildContext context) => Semantics(
    liveRegion: true,
    label: message,
    child: NexoSurface(
      variant: NexoSurfaceVariant.floating,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            NexoStates.resolve(
              tone == NexoTone.danger
                  ? NexoSemanticState.danger
                  : NexoSemanticState.info,
            ).icon,
            size: 18,
          ),
          const SizedBox(width: 10),
          Flexible(child: Text(message)),
          if (action != null) ...[const SizedBox(width: 12), action!],
        ],
      ),
    ),
  );
}

@immutable
class NexoToastMessage {
  const NexoToastMessage({
    required this.id,
    required this.title,
    this.body,
    this.tone = NexoTone.info,
    this.timeout = const Duration(seconds: 5),
    this.persistent = false,
    this.actionLabel,
    this.onAction,
  });

  final String id;
  final String title;
  final String? body;
  final NexoTone tone;
  final Duration timeout;
  final bool persistent;
  final String? actionLabel;
  final VoidCallback? onAction;
}

/// Contract only; queue ownership belongs to the consuming application.
abstract interface class NexoToastQueue {
  void show(NexoToastMessage message);
  void dismiss(String id);
  void clear();
}

class NexoBlockingLoading extends StatelessWidget {
  const NexoBlockingLoading({required this.label, super.key});
  final String label;
  @override
  Widget build(BuildContext context) => ColoredBox(
    color: NexoV1Colors.canvas.withValues(alpha: .72),
    child: Center(
      child: NexoSurface(
        variant: NexoSurfaceVariant.modal,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const NexoSpinner(),
            const SizedBox(height: 12),
            Text(label),
          ],
        ),
      ),
    ),
  );
}
