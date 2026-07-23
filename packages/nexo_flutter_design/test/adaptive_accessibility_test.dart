import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

void main() {
  test('breakpoint selection follows certified thresholds', () {
    expect(
      NexoAdaptiveInfo.fromSize(const Size(390, 844)).windowClass,
      NexoWindowClass.phone,
    );
    expect(
      NexoAdaptiveInfo.fromSize(const Size(768, 1024)).windowClass,
      NexoWindowClass.largeTablet,
    );
    expect(
      NexoAdaptiveInfo.fromSize(const Size(1024, 600)).usesDrawer,
      isFalse,
    );
    expect(
      NexoAdaptiveInfo.fromSize(const Size(1024, 600)).compactHeight,
      isTrue,
    );
    expect(
      NexoAdaptiveInfo.fromSize(const Size(1280, 720)).pointerParallaxAllowed,
      isTrue,
    );
  });

  testWidgets(
    'accessible target remains at least 44 logical pixels at 200% text',
    (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: NexoTheme.dark(),
          home: const MediaQuery(
            data: MediaQueryData(textScaler: TextScaler.linear(2)),
            child: Scaffold(
              body: NexoAccessibleTarget(label: 'Acción', child: Text('OK')),
            ),
          ),
        ),
      );
      final size = tester.getSize(find.byType(NexoAccessibleTarget));
      expect(size.width, greaterThanOrEqualTo(nexoMinimumInteractiveExtent));
      expect(size.height, greaterThanOrEqualTo(nexoMinimumInteractiveExtent));
      expect(
        tester.getSemantics(find.byType(NexoAccessibleTarget)),
        matchesSemantics(label: 'Acción', textDirection: TextDirection.ltr),
      );
    },
  );

  testWidgets('system reduced motion selects a single preference API', (
    tester,
  ) async {
    late NexoVisualPreferences preferences;
    await tester.pumpWidget(
      MediaQuery(
        data: const MediaQueryData(disableAnimations: true),
        child: Builder(
          builder: (context) {
            preferences = NexoVisualPreferences.of(context);
            return const SizedBox();
          },
        ),
      ),
    );
    expect(preferences.reduceMotion, isTrue);
    expect(preferences.ambientMotionEnabled, isFalse);
  });
}
