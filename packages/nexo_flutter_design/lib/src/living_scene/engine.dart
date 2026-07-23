import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../foundation/nexo_foundation.dart';
import '../tokens/generated/nexo_tokens.g.dart';
import 'controller.dart';
import 'layers.dart';
import 'model.dart';
import 'registry.dart';

/// Canonical, domain-free Flutter translation of the certified LivingScene.
class NexoLivingScene extends StatefulWidget {
  const NexoLivingScene({
    required this.variant,
    required this.child,
    this.quality,
    this.preferences,
    this.controller,
    this.deterministicProgress,
    this.precisePointer = false,
    super.key,
  });
  final NexoLivingSceneVariant variant;
  final Widget child;
  final NexoQualityMode? quality;
  final NexoVisualPreferences? preferences;
  final NexoSceneController? controller;
  final double? deterministicProgress;
  final bool precisePointer;

  @override
  State<NexoLivingScene> createState() => _NexoLivingSceneState();
}

class _NexoLivingSceneState extends State<NexoLivingScene>
    with SingleTickerProviderStateMixin {
  late final NexoSceneController _internalController;
  late NexoSceneClock _clock;
  late final NexoVisualLifecycleObserver _lifecycle;
  Offset _pointer = Offset.zero;
  bool _active = true;
  Timer? _transitionTimer;

  NexoSceneController get _controller =>
      widget.controller ?? _internalController;

  @override
  void initState() {
    super.initState();
    _internalController = NexoSceneController(widget.variant);
    _clock = NexoSceneClock(
      vsync: this,
      deterministicProgress: widget.deterministicProgress,
    );
    _lifecycle = NexoVisualLifecycleObserver(_setActive)..attach();
    WidgetsBinding.instance.addPostFrameCallback((_) => _syncClock());
  }

  @override
  void didUpdateWidget(covariant NexoLivingScene oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.variant != widget.variant) {
      _controller.setVariant(widget.variant);
      final generation = _controller.transitionGeneration;
      final preferences =
          widget.preferences ??
          NexoVisualPreferences.of(
            context,
            quality: widget.quality ?? NexoQualityMode.balanced,
          );
      _transitionTimer?.cancel();
      _transitionTimer = Timer(
        preferences.reduceMotion
            ? Duration.zero
            : const Duration(milliseconds: 1600),
        () {
          if (mounted) _controller.completeTransition(generation);
        },
      );
    }
    if (oldWidget.deterministicProgress != widget.deterministicProgress) {
      _clock.dispose();
      _clock = NexoSceneClock(
        vsync: this,
        deterministicProgress: widget.deterministicProgress,
      );
    }
    _syncClock();
  }

  void _setActive(bool value) {
    if (!mounted || _active == value) return;
    setState(() => _active = value);
    _controller.setActive(value);
    _syncClock();
  }

  void _syncClock() {
    if (!mounted) return;
    final preferences =
        widget.preferences ??
        NexoVisualPreferences.of(
          context,
          quality: widget.quality ?? NexoQualityMode.balanced,
        );
    final policy = NexoScenePolicy.resolve(
      requested: widget.quality ?? preferences.quality,
      preferences: preferences,
      precisePointer: widget.precisePointer,
      lifecycleActive: _active,
    );
    policy.effects.hasAmbientMotion ? _clock.start() : _clock.stop();
  }

  @override
  void dispose() {
    _lifecycle.detach();
    _transitionTimer?.cancel();
    _clock.dispose();
    _internalController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final preferences =
        widget.preferences ??
        NexoVisualPreferences.of(
          context,
          quality: widget.quality ?? NexoQualityMode.balanced,
        );
    final policy = NexoScenePolicy.resolve(
      requested: widget.quality ?? preferences.quality,
      preferences: preferences,
      precisePointer: widget.precisePointer,
      lifecycleActive: _active,
    );
    return LayoutBuilder(
      builder: (context, constraints) {
        final viewport = nexoSceneViewportFor(
          constraints.maxWidth,
          constraints.maxHeight,
        );
        final parallaxAllowed =
            policy.effects.pointerParallax &&
            viewport == NexoSceneViewport.desktop;
        return MouseRegion(
          onHover: parallaxAllowed
              ? (event) => setState(
                  () => _pointer = Offset(
                    (event.localPosition.dx / constraints.maxWidth - .5) * 8,
                    (event.localPosition.dy / constraints.maxHeight - .5) * 5,
                  ),
                )
              : null,
          onExit: parallaxAllowed
              ? (_) => setState(() => _pointer = Offset.zero)
              : null,
          child: Stack(
            fit: StackFit.expand,
            children: [
              ExcludeSemantics(
                child: IgnorePointer(
                  child: RepaintBoundary(
                    child: AnimatedBuilder(
                      animation: Listenable.merge([_clock, _controller]),
                      builder: (context, _) => _SceneVisual(
                        variant: _controller.variant,
                        previous: _controller.previous,
                        viewport: viewport,
                        policy: policy,
                        progress: _clock.progress,
                        pointer: parallaxAllowed ? _pointer : Offset.zero,
                      ),
                    ),
                  ),
                ),
              ),
              RepaintBoundary(child: widget.child),
            ],
          ),
        );
      },
    );
  }
}

class _SceneVisual extends StatelessWidget {
  const _SceneVisual({
    required this.variant,
    required this.previous,
    required this.viewport,
    required this.policy,
    required this.progress,
    required this.pointer,
  });
  final NexoLivingSceneVariant variant;
  final NexoLivingSceneVariant? previous;
  final NexoSceneViewport viewport;
  final NexoScenePolicy policy;
  final double progress;
  final Offset pointer;

  @override
  Widget build(BuildContext context) {
    final artwork = NexoArtworkRegistry.forVariant(variant);
    final drift = policy.effects.softDrift
        ? Offset(
            math.sin(progress * math.pi * 2) * 3,
            math.cos(progress * math.pi * 2) * 2,
          )
        : Offset.zero;
    return ColoredBox(
      color: NexoV1Colors.canvas,
      child: Stack(
        fit: StackFit.expand,
        children: [
          CustomPaint(
            painter: NexoAuroraPainter(progress: progress, policy: policy),
          ),
          if (!artwork.isAbstract)
            _Artwork(
              definition: artwork,
              viewport: viewport,
              policy: policy,
              progress: progress,
              offset: pointer + drift,
            ),
          if (previous != null && policy.effects.crossfade)
            Opacity(
              opacity: math.max(0, 1 - ((progress * 8) % 1)),
              child: _PreviousArtwork(
                variant: previous!,
                viewport: viewport,
                policy: policy,
              ),
            ),
          NexoSceneMaskOverlay(
            mask: artwork.mask,
            highContrast: policy.highContrast,
          ),
          if (policy.effects.trailCount > 0)
            CustomPaint(
              painter: NexoTrailPainter(
                progress: progress,
                count: policy.effects.trailCount,
              ),
            ),
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: const Alignment(.62, -.34),
                radius: 1.15,
                colors: [
                  NexoV1Colors.violet.withValues(alpha: .10),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PreviousArtwork extends StatelessWidget {
  const _PreviousArtwork({
    required this.variant,
    required this.viewport,
    required this.policy,
  });
  final NexoLivingSceneVariant variant;
  final NexoSceneViewport viewport;
  final NexoScenePolicy policy;
  @override
  Widget build(BuildContext context) {
    final artwork = NexoArtworkRegistry.forVariant(variant);
    return artwork.isAbstract
        ? const SizedBox.shrink()
        : _Artwork(
            definition: artwork,
            viewport: viewport,
            policy: policy,
            progress: 0,
            offset: Offset.zero,
          );
  }
}

class _Artwork extends StatelessWidget {
  const _Artwork({
    required this.definition,
    required this.viewport,
    required this.policy,
    required this.progress,
    required this.offset,
  });
  final NexoArtworkDefinition definition;
  final NexoSceneViewport viewport;
  final NexoScenePolicy policy;
  final double progress;
  final Offset offset;
  @override
  Widget build(BuildContext context) {
    final ken = policy.effects.kenBurns
        ? 1 + .02 * ((1 - math.cos(progress * math.pi * 2)) / 2)
        : 1.0;
    final opacity = policy.highContrast
        ? definition.intensity * .42
        : definition.intensity;
    return Opacity(
      opacity: opacity,
      child: Transform.translate(
        offset: offset,
        child: Transform.scale(
          scale: ken,
          child: ColorFiltered(
            colorFilter: const ColorFilter.matrix(<double>[
              .20,
              .08,
              .20,
              0,
              2,
              .08,
              .18,
              .48,
              0,
              5,
              .12,
              .22,
              .70,
              0,
              12,
              0,
              0,
              0,
              1,
              0,
            ]),
            child: Image.asset(
              definition.assetPath,
              fit: BoxFit.cover,
              alignment: definition.crop.forViewport(viewport).alignment,
              filterQuality: policy.quality == NexoQualityMode.high
                  ? FilterQuality.high
                  : FilterQuality.medium,
              gaplessPlayback: true,
            ),
          ),
        ),
      ),
    );
  }
}
