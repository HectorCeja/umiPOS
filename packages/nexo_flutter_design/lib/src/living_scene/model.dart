import 'package:flutter/widgets.dart';

import '../foundation/nexo_foundation.dart';

enum NexoLivingSceneVariant {
  login,
  home,
  dashboard,
  onboarding,
  catalog,
  products,
  inventory,
  sales,
  cash,
  reports,
  team,
  profile,
  settings,
  command,
  focused,
  minimal,
}

enum NexoArtworkId { womanPos, products, inventory, analytics, abstract }

enum NexoSceneMask { cinematic, operational, concentrated, abstract, focused }

enum NexoSceneViewport { mobile, tablet, desktop, terminal }

@immutable
class NexoFocalPoint {
  const NexoFocalPoint(this.x, this.y)
    : assert(x >= 0 && x <= 1),
      assert(y >= 0 && y <= 1);
  final double x;
  final double y;
  Alignment get alignment => Alignment(x * 2 - 1, y * 2 - 1);
}

@immutable
class NexoArtworkCrop {
  const NexoArtworkCrop({
    required this.desktop,
    required this.tablet,
    required this.mobile,
    NexoFocalPoint? terminal,
  }) : terminal = terminal ?? desktop;
  final NexoFocalPoint desktop, tablet, mobile, terminal;
  NexoFocalPoint forViewport(NexoSceneViewport viewport) => switch (viewport) {
    NexoSceneViewport.mobile => mobile,
    NexoSceneViewport.tablet => tablet,
    NexoSceneViewport.desktop => desktop,
    NexoSceneViewport.terminal => terminal,
  };
}

@immutable
class NexoArtworkDefinition {
  const NexoArtworkDefinition({
    required this.id,
    required this.assetPath,
    required this.sha256,
    required this.width,
    required this.height,
    required this.intensity,
    required this.crop,
    required this.mask,
    this.isAbstract = false,
  });
  final NexoArtworkId id;
  final String assetPath, sha256;
  final int width, height;
  final double intensity;
  final NexoArtworkCrop crop;
  final NexoSceneMask mask;
  final bool isAbstract;
  double get aspectRatio => width / height;
}

@immutable
class NexoSceneEffects {
  const NexoSceneEffects({
    required this.auroraCount,
    required this.particleCount,
    required this.trailCount,
    required this.blurSigma,
    required this.animateAurora,
    required this.kenBurns,
    required this.softDrift,
    required this.pointerParallax,
    required this.crossfade,
  });
  final int auroraCount, particleCount, trailCount;
  final double blurSigma;
  final bool animateAurora, kenBurns, softDrift, pointerParallax, crossfade;
  bool get hasAmbientMotion =>
      animateAurora || kenBurns || softDrift || trailCount > 0;
}

@immutable
class NexoScenePolicy {
  const NexoScenePolicy({
    required this.quality,
    required this.effects,
    required this.reduceMotion,
    required this.reduceTransparency,
    required this.highContrast,
  });
  final NexoQualityMode quality;
  final NexoSceneEffects effects;
  final bool reduceMotion, reduceTransparency, highContrast;

  factory NexoScenePolicy.resolve({
    required NexoQualityMode requested,
    required NexoVisualPreferences preferences,
    required bool precisePointer,
    required bool lifecycleActive,
  }) {
    final motionAllowed =
        lifecycleActive &&
        !preferences.reduceMotion &&
        requested != NexoQualityMode.static;
    final base = switch (requested) {
      NexoQualityMode.high => const NexoSceneEffects(
        auroraCount: 4,
        particleCount: 14,
        trailCount: 2,
        blurSigma: 42,
        animateAurora: true,
        kenBurns: true,
        softDrift: true,
        pointerParallax: true,
        crossfade: true,
      ),
      NexoQualityMode.balanced => const NexoSceneEffects(
        auroraCount: 3,
        particleCount: 8,
        trailCount: 1,
        blurSigma: 28,
        animateAurora: true,
        kenBurns: true,
        softDrift: true,
        pointerParallax: true,
        crossfade: true,
      ),
      NexoQualityMode.reduced => const NexoSceneEffects(
        auroraCount: 2,
        particleCount: 0,
        trailCount: 0,
        blurSigma: 8,
        animateAurora: false,
        kenBurns: false,
        softDrift: false,
        pointerParallax: false,
        crossfade: false,
      ),
      NexoQualityMode.static => const NexoSceneEffects(
        auroraCount: 2,
        particleCount: 0,
        trailCount: 0,
        blurSigma: 0,
        animateAurora: false,
        kenBurns: false,
        softDrift: false,
        pointerParallax: false,
        crossfade: false,
      ),
    };
    final effects = NexoSceneEffects(
      auroraCount: base.auroraCount,
      particleCount: motionAllowed ? base.particleCount : 0,
      trailCount: motionAllowed ? base.trailCount : 0,
      blurSigma: preferences.reduceTransparency ? 0 : base.blurSigma,
      animateAurora: motionAllowed && base.animateAurora,
      kenBurns: motionAllowed && base.kenBurns,
      softDrift: motionAllowed && base.softDrift,
      pointerParallax: motionAllowed && precisePointer && base.pointerParallax,
      crossfade: !preferences.reduceMotion && base.crossfade,
    );
    return NexoScenePolicy(
      quality: requested,
      effects: effects,
      reduceMotion: preferences.reduceMotion,
      reduceTransparency: preferences.reduceTransparency,
      highContrast: preferences.highContrast,
    );
  }
}
