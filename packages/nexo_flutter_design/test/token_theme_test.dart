import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

void main() {
  test('frozen V1 palette exposes certified values', () {
    expect(NexoV1Colors.canvas, const Color(0xFF070912));
    expect(NexoV1Colors.violet, const Color(0xFF8068FF));
    expect(NexoV1Colors.line, const Color(0x14FFFFFF));
    expect(NexoMetrics.dark.spacing, const [4, 8, 12, 16, 24, 32]);
    expect(
      NexoMotion.standardMotion.standard,
      const Duration(milliseconds: 220),
    );
  });

  test('theme extensions copy and interpolate without losing values', () {
    final theme = NexoTheme.dark();
    final colors = theme.extension<NexoColors>()!;
    final metrics = theme.extension<NexoMetrics>()!;
    final motion = theme.extension<NexoMotion>()!;
    expect(colors.copyWith().canvasDeep, colors.canvasDeep);
    expect(
      colors
          .lerp(colors.copyWith(surfaceRaised: NexoV1Colors.blue), .5)
          .surfaceRaised,
      isNot(colors.surfaceRaised),
    );
    expect(metrics.copyWith().sidebarWidth, 216);
    expect(
      metrics.lerp(metrics.copyWith(sidebarWidth: 220), .5).sidebarWidth,
      218,
    );
    expect(motion.copyWith().emphasized, NexoV1Motion.emphasized);
  });

  test('dark ThemeData maps semantic states and accessibility defaults', () {
    final theme = NexoTheme.dark();
    expect(theme.brightness, Brightness.dark);
    expect(theme.colorScheme.error, NexoV1Colors.danger);
    expect(theme.materialTapTargetSize, MaterialTapTargetSize.padded);
    expect(theme.scaffoldBackgroundColor, NexoV1Colors.canvas);
    expect(NexoColors.dark.chartPalette, hasLength(5));
    for (final state in NexoSemanticState.values) {
      final visual = NexoStates.resolve(state);
      expect(visual.semanticKey, 'state.${state.name}');
      expect(visual.foreground.a, greaterThan(0));
    }
  });
}
