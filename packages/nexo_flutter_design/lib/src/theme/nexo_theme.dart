import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart';

import '../adaptive/nexo_adaptive.dart';
import '../tokens/generated/nexo_tokens.g.dart';

/// Semantic surface and state colors beyond Material's ColorScheme.
@immutable
class NexoColors extends ThemeExtension<NexoColors> {
  const NexoColors({
    required this.canvasDeep,
    required this.surfaceRaised,
    required this.surfaceInteractive,
    required this.textTertiary,
    required this.borderSubtle,
    required this.borderStrong,
    required this.offline,
    required this.syncing,
    required this.restricted,
    required this.chartPalette,
  });

  final Color canvasDeep;
  final Color surfaceRaised;
  final Color surfaceInteractive;
  final Color textTertiary;
  final Color borderSubtle;
  final Color borderStrong;
  final Color offline;
  final Color syncing;
  final Color restricted;
  final List<Color> chartPalette;

  static const dark = NexoColors(
    canvasDeep: NexoV1Colors.canvas2,
    surfaceRaised: NexoV1Colors.surfaceRaised,
    surfaceInteractive: NexoV1Colors.surfaceInteractive,
    textTertiary: NexoV1Colors.faint,
    borderSubtle: NexoV1Colors.line,
    borderStrong: NexoV1Colors.lineStrong,
    offline: NexoV1Colors.warning,
    syncing: NexoV1Colors.cyan,
    restricted: NexoV1Colors.faint,
    // V1 has no separate chart tokens; this typed view reuses its certified accents.
    chartPalette: [
      NexoV1Colors.violet,
      NexoV1Colors.blue,
      NexoV1Colors.cyan,
      NexoV1Colors.pink,
      NexoV1Colors.mint,
    ],
  );

  @override
  NexoColors copyWith({
    Color? canvasDeep,
    Color? surfaceRaised,
    Color? surfaceInteractive,
    Color? textTertiary,
    Color? borderSubtle,
    Color? borderStrong,
    Color? offline,
    Color? syncing,
    Color? restricted,
    List<Color>? chartPalette,
  }) => NexoColors(
    canvasDeep: canvasDeep ?? this.canvasDeep,
    surfaceRaised: surfaceRaised ?? this.surfaceRaised,
    surfaceInteractive: surfaceInteractive ?? this.surfaceInteractive,
    textTertiary: textTertiary ?? this.textTertiary,
    borderSubtle: borderSubtle ?? this.borderSubtle,
    borderStrong: borderStrong ?? this.borderStrong,
    offline: offline ?? this.offline,
    syncing: syncing ?? this.syncing,
    restricted: restricted ?? this.restricted,
    chartPalette: chartPalette ?? this.chartPalette,
  );

  @override
  NexoColors lerp(covariant NexoColors? other, double t) {
    if (other == null) return this;
    return copyWith(
      canvasDeep: Color.lerp(canvasDeep, other.canvasDeep, t),
      surfaceRaised: Color.lerp(surfaceRaised, other.surfaceRaised, t),
      surfaceInteractive: Color.lerp(
        surfaceInteractive,
        other.surfaceInteractive,
        t,
      ),
      textTertiary: Color.lerp(textTertiary, other.textTertiary, t),
      borderSubtle: Color.lerp(borderSubtle, other.borderSubtle, t),
      borderStrong: Color.lerp(borderStrong, other.borderStrong, t),
      offline: Color.lerp(offline, other.offline, t),
      syncing: Color.lerp(syncing, other.syncing, t),
      restricted: Color.lerp(restricted, other.restricted, t),
      chartPalette: List.generate(
        chartPalette.length,
        (index) =>
            Color.lerp(chartPalette[index], other.chartPalette[index], t)!,
      ),
    );
  }
}

/// Exact public spacing/radius/blur/depth contract from V1.
@immutable
class NexoMetrics extends ThemeExtension<NexoMetrics> {
  const NexoMetrics({
    required this.spacing,
    required this.radius,
    required this.blur,
    required this.shadows,
    required this.sidebarWidth,
    required this.topbarHeight,
  });

  final List<double> spacing;
  final List<double> radius;
  final List<double> blur;
  final List<List<BoxShadow>> shadows;
  final double sidebarWidth;
  final double topbarHeight;

  static const dark = NexoMetrics(
    spacing: [4, 8, 12, 16, 24, 32],
    radius: [6, 8, 12, 16.8, 22.4, 30, 999],
    blur: [18, 28, 50],
    shadows: [
      [
        BoxShadow(
          color: Color(0x2902040C),
          offset: Offset(0, 1),
          blurRadius: 2,
        ),
      ],
      [
        BoxShadow(
          color: Color(0x2E02040C),
          offset: Offset(0, 8),
          blurRadius: 24,
        ),
      ],
      [
        BoxShadow(
          color: Color(0x3D02040C),
          offset: Offset(0, 18),
          blurRadius: 44,
        ),
      ],
      [
        BoxShadow(
          color: Color(0x5202040C),
          offset: Offset(0, 28),
          blurRadius: 72,
        ),
      ],
      [
        BoxShadow(
          color: Color(0x7502040C),
          offset: Offset(0, 42),
          blurRadius: 110,
        ),
      ],
      [BoxShadow(color: Color(0x3D8068FF), blurRadius: 42)],
    ],
    sidebarWidth: 216,
    topbarHeight: 72,
  );

  double get space1 => spacing[0];
  double get space2 => spacing[1];
  double get space3 => spacing[2];
  double get space4 => spacing[3];
  double get space5 => spacing[4];
  double get space6 => spacing[5];

  @override
  NexoMetrics copyWith({
    List<double>? spacing,
    List<double>? radius,
    List<double>? blur,
    List<List<BoxShadow>>? shadows,
    double? sidebarWidth,
    double? topbarHeight,
  }) => NexoMetrics(
    spacing: spacing ?? this.spacing,
    radius: radius ?? this.radius,
    blur: blur ?? this.blur,
    shadows: shadows ?? this.shadows,
    sidebarWidth: sidebarWidth ?? this.sidebarWidth,
    topbarHeight: topbarHeight ?? this.topbarHeight,
  );

  @override
  NexoMetrics lerp(covariant NexoMetrics? other, double t) {
    if (other == null) return this;
    List<double> doubles(List<double> a, List<double> b) =>
        List.generate(a.length, (i) => lerpDouble(a[i], b[i], t)!);
    return copyWith(
      spacing: doubles(spacing, other.spacing),
      radius: doubles(radius, other.radius),
      blur: doubles(blur, other.blur),
      shadows: List.generate(
        shadows.length,
        (i) => BoxShadow.lerpList(shadows[i], other.shadows[i], t)!,
      ),
      sidebarWidth: lerpDouble(sidebarWidth, other.sidebarWidth, t),
      topbarHeight: lerpDouble(topbarHeight, other.topbarHeight, t),
    );
  }
}

/// Interaction timing, including the single reduced-motion policy.
@immutable
class NexoMotion extends ThemeExtension<NexoMotion> {
  const NexoMotion({
    required this.instant,
    required this.fast,
    required this.normal,
    required this.standard,
    required this.slow,
    required this.scene,
    required this.standardCurve,
    required this.emphasized,
    required this.decelerate,
    required this.accelerate,
    required this.spring,
  });

  final Duration instant, fast, normal, standard, slow, scene;
  final Curve standardCurve, emphasized, decelerate, accelerate, spring;

  static const standardMotion = NexoMotion(
    instant: Duration(milliseconds: 80),
    fast: Duration(milliseconds: 100),
    normal: Duration(milliseconds: 180),
    standard: Duration(milliseconds: 220),
    slow: Duration(milliseconds: 320),
    scene: Duration(seconds: 30),
    standardCurve: Cubic(.2, 0, 0, 1),
    emphasized: NexoV1Motion.emphasized,
    decelerate: Cubic(.16, 1, .3, 1),
    accelerate: Cubic(.4, 0, 1, 1),
    spring: Cubic(.2, .8, .2, 1),
  );
  static const reduced = NexoMotion(
    instant: Duration.zero,
    fast: Duration.zero,
    normal: Duration.zero,
    standard: Duration.zero,
    slow: Duration.zero,
    scene: Duration.zero,
    standardCurve: Curves.linear,
    emphasized: Curves.linear,
    decelerate: Curves.linear,
    accelerate: Curves.linear,
    spring: Curves.linear,
  );

  @override
  NexoMotion copyWith({
    Duration? instant,
    Duration? fast,
    Duration? normal,
    Duration? standard,
    Duration? slow,
    Duration? scene,
    Curve? standardCurve,
    Curve? emphasized,
    Curve? decelerate,
    Curve? accelerate,
    Curve? spring,
  }) => NexoMotion(
    instant: instant ?? this.instant,
    fast: fast ?? this.fast,
    normal: normal ?? this.normal,
    standard: standard ?? this.standard,
    slow: slow ?? this.slow,
    scene: scene ?? this.scene,
    standardCurve: standardCurve ?? this.standardCurve,
    emphasized: emphasized ?? this.emphasized,
    decelerate: decelerate ?? this.decelerate,
    accelerate: accelerate ?? this.accelerate,
    spring: spring ?? this.spring,
  );

  @override
  NexoMotion lerp(covariant NexoMotion? other, double t) =>
      t < .5 || other == null ? this : other;
}

/// Canonical dark ThemeData. No light theme is fabricated in V1.
abstract final class NexoTheme {
  static ThemeData dark({
    NexoDensity density = NexoDensity.desktop,
    bool reducedMotion = false,
  }) {
    const scheme = ColorScheme.dark(
      primary: NexoV1Colors.violet,
      onPrimary: NexoV1Colors.text,
      secondary: NexoV1Colors.blue,
      onSecondary: NexoV1Colors.canvas,
      error: NexoV1Colors.danger,
      onError: NexoV1Colors.canvas,
      surface: NexoV1Colors.surface,
      onSurface: NexoV1Colors.text,
      outline: NexoV1Colors.lineStrong,
      outlineVariant: NexoV1Colors.line,
    );
    final base = ThemeData(
      brightness: Brightness.dark,
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: NexoV1Colors.canvas,
      fontFamily: 'Manrope',
    );
    final text = base.textTheme.copyWith(
      displayLarge: const TextStyle(
        fontFamily: 'Instrument Sans',
        fontSize: 80,
        height: 1.02,
        fontWeight: FontWeight.w600,
        color: NexoV1Colors.text,
      ),
      headlineLarge: const TextStyle(
        fontFamily: 'Instrument Sans',
        fontSize: 48,
        height: 1.08,
        fontWeight: FontWeight.w600,
        color: NexoV1Colors.text,
      ),
      headlineMedium: const TextStyle(
        fontFamily: 'Instrument Sans',
        fontSize: 32,
        height: 1.15,
        fontWeight: FontWeight.w600,
        color: NexoV1Colors.text,
      ),
      titleLarge: const TextStyle(
        fontFamily: 'Instrument Sans',
        fontSize: 24,
        height: 1.2,
        fontWeight: FontWeight.w600,
        color: NexoV1Colors.text,
      ),
      titleMedium: const TextStyle(
        fontFamily: 'Instrument Sans',
        fontSize: 18,
        height: 1.3,
        fontWeight: FontWeight.w600,
        color: NexoV1Colors.text,
      ),
      bodyLarge: const TextStyle(
        fontSize: 16,
        height: 1.5,
        color: NexoV1Colors.text,
      ),
      bodyMedium: const TextStyle(
        fontSize: 14,
        height: 1.45,
        color: NexoV1Colors.muted,
      ),
      labelLarge: const TextStyle(
        fontSize: 14,
        height: 1.2,
        fontWeight: FontWeight.w600,
        color: NexoV1Colors.text,
      ),
      labelSmall: const TextStyle(
        fontSize: 12,
        height: 1.3,
        color: NexoV1Colors.faint,
      ),
    );
    return base.copyWith(
      textTheme: text,
      visualDensity: density == NexoDensity.compact
          ? VisualDensity.compact
          : VisualDensity.standard,
      materialTapTargetSize: MaterialTapTargetSize.padded,
      focusColor: NexoV1Colors.blue.withValues(alpha: .36),
      hoverColor: NexoV1Colors.surfaceInteractive,
      disabledColor: NexoV1Colors.faint.withValues(alpha: .55),
      dividerColor: NexoV1Colors.line,
      extensions: <ThemeExtension<dynamic>>[
        NexoColors.dark,
        NexoMetrics.dark,
        reducedMotion ? NexoMotion.reduced : NexoMotion.standardMotion,
      ],
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: NexoV1Colors.surfaceInteractive,
        constraints: BoxConstraints(minHeight: density.controlHeight),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: NexoV1Colors.line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: NexoV1Colors.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: NexoV1Colors.blue, width: 2),
        ),
      ),
    );
  }
}

extension NexoThemeAccess on BuildContext {
  NexoColors get nexoColors => Theme.of(this).extension<NexoColors>()!;
  NexoMetrics get nexoMetrics => Theme.of(this).extension<NexoMetrics>()!;
  NexoMotion get nexoMotion => Theme.of(this).extension<NexoMotion>()!;
}
