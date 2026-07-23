import 'package:flutter/widgets.dart';

/// Rendering quality contract prepared for the future LivingScene implementation.
enum NexoQualityMode { high, balanced, reduced, static }

/// Input profile without changing NEXO's visual identity.
enum NexoInputMode { touch, pointer, hybrid }

/// Platform-neutral runtime preferences consumed by visual primitives.
@immutable
class NexoVisualPreferences {
  const NexoVisualPreferences({
    required this.reduceMotion,
    required this.reduceTransparency,
    required this.highContrast,
    required this.quality,
  });

  final bool reduceMotion;
  final bool reduceTransparency;
  final bool highContrast;
  final NexoQualityMode quality;

  /// Reads system accessibility preferences once per inherited dependency update.
  factory NexoVisualPreferences.of(
    BuildContext context, {
    NexoQualityMode quality = NexoQualityMode.balanced,
  }) {
    final media = MediaQuery.maybeOf(context);
    return NexoVisualPreferences(
      reduceMotion: media?.disableAnimations ?? false,
      reduceTransparency: media?.accessibleNavigation ?? false,
      highContrast: media?.highContrast ?? false,
      quality: quality,
    );
  }

  bool get ambientMotionEnabled =>
      !reduceMotion && quality != NexoQualityMode.static;
  bool get expensiveEffectsEnabled =>
      !reduceTransparency &&
      (quality == NexoQualityMode.high || quality == NexoQualityMode.balanced);
}

/// Lifecycle policy for future ambient renderers; it owns no animation loop.
class NexoVisualLifecycleObserver with WidgetsBindingObserver {
  NexoVisualLifecycleObserver(this.onActiveChanged);

  final ValueChanged<bool> onActiveChanged;

  void attach() => WidgetsBinding.instance.addObserver(this);
  void detach() => WidgetsBinding.instance.removeObserver(this);

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    onActiveChanged(state == AppLifecycleState.resumed);
  }
}
