import 'package:flutter/widgets.dart';

/// Breakpoints translated only from certified Web thresholds.
abstract final class NexoBreakpoints {
  static const compact = 520.0;
  static const mobile = 640.0;
  static const tablet = 768.0;
  static const desktop = 1024.0;
  static const operationalGrid = 1180.0;
}

enum NexoWindowClass {
  phone,
  smallTablet,
  largeTablet,
  compactDesktop,
  desktop,
}

@immutable
class NexoAdaptiveInfo {
  const NexoAdaptiveInfo({
    required this.windowClass,
    required this.compactHeight,
    required this.orientation,
  });

  final NexoWindowClass windowClass;
  final bool compactHeight;
  final Orientation orientation;

  bool get usesDrawer =>
      windowClass.index < NexoWindowClass.compactDesktop.index;
  bool get pointerParallaxAllowed =>
      windowClass.index >= NexoWindowClass.compactDesktop.index;

  static NexoAdaptiveInfo fromSize(Size size) {
    final width = size.width;
    final windowClass = switch (width) {
      <= NexoBreakpoints.compact => NexoWindowClass.phone,
      <= NexoBreakpoints.mobile => NexoWindowClass.smallTablet,
      <= NexoBreakpoints.tablet => NexoWindowClass.largeTablet,
      <= NexoBreakpoints.desktop => NexoWindowClass.compactDesktop,
      _ => NexoWindowClass.desktop,
    };
    return NexoAdaptiveInfo(
      windowClass: windowClass,
      compactHeight: size.height <= 600,
      orientation: width >= size.height
          ? Orientation.landscape
          : Orientation.portrait,
    );
  }
}

enum NexoDensityProfile { desktop, touch, compact }

@immutable
class NexoDensity {
  const NexoDensity._({
    required this.controlHeight,
    required this.minimumTarget,
    required this.rowHeight,
    required this.cardPadding,
    required this.iconSize,
  });

  final double controlHeight;
  final double minimumTarget;
  final double rowHeight;
  final double cardPadding;
  final double iconSize;

  static const desktop = NexoDensity._(
    controlHeight: 44,
    minimumTarget: 44,
    rowHeight: 44,
    cardPadding: 24,
    iconSize: 20,
  );
  static const touch = NexoDensity._(
    controlHeight: 52,
    minimumTarget: 52,
    rowHeight: 52,
    cardPadding: 24,
    iconSize: 22,
  );
  static const compact = NexoDensity._(
    controlHeight: 36,
    minimumTarget: 44,
    rowHeight: 36,
    cardPadding: 20,
    iconSize: 18,
  );

  static NexoDensity select({
    required NexoAdaptiveInfo adaptive,
    required TargetPlatform platform,
    bool hasPointer = false,
  }) {
    if (adaptive.compactHeight && hasPointer) {
      return compact;
    }
    if (hasPointer &&
        {
          TargetPlatform.windows,
          TargetPlatform.macOS,
          TargetPlatform.linux,
        }.contains(platform)) {
      return desktop;
    }
    return touch;
  }
}
