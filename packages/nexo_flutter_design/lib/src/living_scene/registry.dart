import 'model.dart';

abstract final class NexoArtworkRegistry {
  static const _abstract = NexoArtworkDefinition(
    id: NexoArtworkId.abstract,
    assetPath: '',
    sha256: '',
    width: 1408,
    height: 768,
    intensity: .10,
    crop: NexoArtworkCrop(
      desktop: NexoFocalPoint(.78, .48),
      tablet: NexoFocalPoint(.74, .50),
      mobile: NexoFocalPoint(.68, .50),
    ),
    mask: NexoSceneMask.abstract,
    isAbstract: true,
  );
  static const womanHome = NexoArtworkDefinition(
    id: NexoArtworkId.womanPos,
    assetPath: 'packages/nexo_flutter_design/assets/artwork/womanpos.png',
    sha256: '3b106ed3f9f947213ab6118e0a9e55c1019bb2cbb9bdf8edfcd0a26555fa629e',
    width: 1408,
    height: 768,
    intensity: .44,
    crop: NexoArtworkCrop(
      desktop: NexoFocalPoint(.74, .48),
      tablet: NexoFocalPoint(.70, .50),
      mobile: NexoFocalPoint(.66, .48),
    ),
    mask: NexoSceneMask.cinematic,
  );
  static const products = NexoArtworkDefinition(
    id: NexoArtworkId.products,
    assetPath: 'packages/nexo_flutter_design/assets/artwork/products.jpeg',
    sha256: 'c77b9f79e74501c126f77bd2477d9a2c614445f58fdb1e17a8cd69587b3bf662',
    width: 1408,
    height: 768,
    intensity: .36,
    crop: NexoArtworkCrop(
      desktop: NexoFocalPoint(.74, .48),
      tablet: NexoFocalPoint(.70, .50),
      mobile: NexoFocalPoint(.66, .48),
    ),
    mask: NexoSceneMask.concentrated,
  );
  static const inventory = NexoArtworkDefinition(
    id: NexoArtworkId.inventory,
    assetPath: 'packages/nexo_flutter_design/assets/artwork/inventory.jpeg',
    sha256: 'f981549c0fd871bb2b08f23266b620997dfe3bf72324461dfbba13bbb5b04164',
    width: 1408,
    height: 768,
    intensity: .38,
    crop: NexoArtworkCrop(
      desktop: NexoFocalPoint(.78, .50),
      tablet: NexoFocalPoint(.72, .50),
      mobile: NexoFocalPoint(.68, .48),
    ),
    mask: NexoSceneMask.concentrated,
  );
  static const analytics = NexoArtworkDefinition(
    id: NexoArtworkId.analytics,
    assetPath: 'packages/nexo_flutter_design/assets/artwork/analytics.jpeg',
    sha256: '0088673b4ca9611b9ff861c41a5cf6696c348ec1df8189a5075f0e39213b1526',
    width: 1408,
    height: 768,
    intensity: .42,
    crop: NexoArtworkCrop(
      desktop: NexoFocalPoint(.72, .46),
      tablet: NexoFocalPoint(.68, .48),
      mobile: NexoFocalPoint(.64, .46),
    ),
    mask: NexoSceneMask.cinematic,
  );

  static const Map<NexoLivingSceneVariant, NexoArtworkDefinition> all = {
    NexoLivingSceneVariant.login: _abstract,
    NexoLivingSceneVariant.home: womanHome,
    NexoLivingSceneVariant.dashboard: _abstract,
    NexoLivingSceneVariant.onboarding: _abstract,
    NexoLivingSceneVariant.catalog: products,
    NexoLivingSceneVariant.products: products,
    NexoLivingSceneVariant.inventory: inventory,
    NexoLivingSceneVariant.sales: NexoArtworkDefinition(
      id: NexoArtworkId.womanPos,
      assetPath: 'packages/nexo_flutter_design/assets/artwork/womanpos.png',
      sha256:
          '3b106ed3f9f947213ab6118e0a9e55c1019bb2cbb9bdf8edfcd0a26555fa629e',
      width: 1408,
      height: 768,
      intensity: .44,
      crop: NexoArtworkCrop(
        desktop: NexoFocalPoint(.82, .52),
        tablet: NexoFocalPoint(.76, .50),
        mobile: NexoFocalPoint(.70, .50),
      ),
      mask: NexoSceneMask.operational,
    ),
    NexoLivingSceneVariant.cash: NexoArtworkDefinition(
      id: NexoArtworkId.womanPos,
      assetPath: 'packages/nexo_flutter_design/assets/artwork/womanpos.png',
      sha256:
          '3b106ed3f9f947213ab6118e0a9e55c1019bb2cbb9bdf8edfcd0a26555fa629e',
      width: 1408,
      height: 768,
      intensity: .44,
      crop: NexoArtworkCrop(
        desktop: NexoFocalPoint(.68, .54),
        tablet: NexoFocalPoint(.66, .52),
        mobile: NexoFocalPoint(.62, .50),
      ),
      mask: NexoSceneMask.operational,
    ),
    NexoLivingSceneVariant.reports: analytics,
    NexoLivingSceneVariant.team: _abstract,
    NexoLivingSceneVariant.profile: _abstract,
    NexoLivingSceneVariant.settings: _abstract,
    NexoLivingSceneVariant.command: _abstract,
    NexoLivingSceneVariant.focused: _abstract,
    NexoLivingSceneVariant.minimal: _abstract,
  };

  static NexoArtworkDefinition forVariant(NexoLivingSceneVariant variant) =>
      all[variant]!;
  static Iterable<String> get figurativeAssets => all.values
      .where((item) => !item.isAbstract)
      .map((item) => item.assetPath)
      .toSet();
}

NexoSceneViewport nexoSceneViewportFor(double width, double height) {
  if (width <= 600) return NexoSceneViewport.mobile;
  if (width <= 1024 && height <= 700) return NexoSceneViewport.terminal;
  if (width <= 1024) return NexoSceneViewport.tablet;
  return NexoSceneViewport.desktop;
}
