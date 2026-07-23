import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

void main() {
  const basePreferences = NexoVisualPreferences(
    reduceMotion: false,
    reduceTransparency: false,
    highContrast: false,
    quality: NexoQualityMode.high,
  );

  test('registry contains exactly the 16 certified variants', () {
    expect(NexoLivingSceneVariant.values, hasLength(16));
    expect(
      NexoArtworkRegistry.all.keys.toSet(),
      NexoLivingSceneVariant.values.toSet(),
    );
    expect(NexoArtworkRegistry.figurativeAssets, hasLength(4));
    expect(
      NexoArtworkRegistry.forVariant(NexoLivingSceneVariant.home).id,
      NexoArtworkId.womanPos,
    );
    expect(
      NexoArtworkRegistry.forVariant(NexoLivingSceneVariant.sales).id,
      NexoArtworkId.womanPos,
    );
    expect(
      NexoArtworkRegistry.forVariant(NexoLivingSceneVariant.cash).id,
      NexoArtworkId.womanPos,
    );
    expect(
      NexoArtworkRegistry.forVariant(NexoLivingSceneVariant.products).id,
      NexoArtworkId.products,
    );
    expect(
      NexoArtworkRegistry.forVariant(NexoLivingSceneVariant.inventory).id,
      NexoArtworkId.inventory,
    );
    expect(
      NexoArtworkRegistry.forVariant(NexoLivingSceneVariant.reports).id,
      NexoArtworkId.analytics,
    );
    for (final variant in [
      NexoLivingSceneVariant.profile,
      NexoLivingSceneVariant.settings,
      NexoLivingSceneVariant.team,
      NexoLivingSceneVariant.command,
    ]) {
      expect(NexoArtworkRegistry.forVariant(variant).isAbstract, isTrue);
    }
  });

  test('quality and accessibility policies are real and deterministic', () {
    final high = NexoScenePolicy.resolve(
      requested: NexoQualityMode.high,
      preferences: basePreferences,
      precisePointer: true,
      lifecycleActive: true,
    );
    expect(high.effects.kenBurns, isTrue);
    expect(high.effects.trailCount, 2);
    expect(high.effects.pointerParallax, isTrue);
    final reduced = NexoScenePolicy.resolve(
      requested: NexoQualityMode.reduced,
      preferences: basePreferences,
      precisePointer: true,
      lifecycleActive: true,
    );
    expect(reduced.effects.hasAmbientMotion, isFalse);
    final accessible = NexoScenePolicy.resolve(
      requested: NexoQualityMode.high,
      preferences: const NexoVisualPreferences(
        reduceMotion: true,
        reduceTransparency: true,
        highContrast: true,
        quality: NexoQualityMode.high,
      ),
      precisePointer: true,
      lifecycleActive: true,
    );
    expect(accessible.effects.hasAmbientMotion, isFalse);
    expect(accessible.effects.pointerParallax, isFalse);
    expect(accessible.effects.blurSigma, 0);
  });

  test('scene transition cancellation keeps only the newest generation', () {
    final controller = NexoSceneController(NexoLivingSceneVariant.home);
    controller.setVariant(NexoLivingSceneVariant.products);
    final stale = controller.transitionGeneration;
    controller.setVariant(NexoLivingSceneVariant.inventory);
    controller.completeTransition(stale);
    expect(controller.previous, NexoLivingSceneVariant.products);
    controller.completeTransition(controller.transitionGeneration);
    expect(controller.previous, isNull);
    controller.dispose();
  });

  testWidgets('decorative scene neither intercepts taps nor enters Semantics', (
    tester,
  ) async {
    var taps = 0;
    final semantics = tester.ensureSemantics();
    await tester.pumpWidget(
      MaterialApp(
        theme: NexoTheme.dark(),
        home: NexoLivingScene(
          variant: NexoLivingSceneVariant.home,
          deterministicProgress: .5,
          child: Center(
            child: NexoButton(label: 'Operar', onPressed: () => taps++),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Operar'));
    expect(taps, 1);
    expect(find.bySemanticsLabel('womanpos.png'), findsNothing);
    semantics.dispose();
  });

  testWidgets(
    'pointer policy never changes layout and touch does not require parallax',
    (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: NexoTheme.dark(),
          home: const SizedBox(
            width: 1280,
            height: 720,
            child: NexoLivingScene(
              variant: NexoLivingSceneVariant.products,
              precisePointer: true,
              deterministicProgress: .25,
              child: Text('Contenido'),
            ),
          ),
        ),
      );
      await tester.pump();
      final before = tester.getRect(find.text('Contenido'));
      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: const Offset(900, 300));
      await gesture.moveTo(const Offset(950, 340));
      await tester.pump();
      expect(tester.getRect(find.text('Contenido')), before);
      await gesture.removePointer();
    },
  );

  testWidgets('reduced motion editorial content is immediate', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: NexoTheme.dark(),
        home: const NexoEditorialReveal(
          preferences: NexoVisualPreferences(
            reduceMotion: true,
            reduceTransparency: false,
            highContrast: false,
            quality: NexoQualityMode.high,
          ),
          child: Text('Editorial'),
        ),
      ),
    );
    expect(find.text('Editorial'), findsOneWidget);
    final opacity = tester.widgetList<Opacity>(find.byType(Opacity));
    expect(opacity.where((item) => item.opacity == 0), isEmpty);
  });

  testWidgets('pooled scene clock pauses, resumes and disposes', (
    tester,
  ) async {
    final clock = NexoSceneClock(vsync: tester);
    clock.start();
    expect(clock.isTicking, isTrue);
    await tester.pump(const Duration(milliseconds: 16));
    final progress = clock.progress;
    clock.stop();
    expect(clock.isTicking, isFalse);
    await tester.pump(const Duration(seconds: 1));
    expect(clock.progress, progress);
    clock.start();
    expect(clock.isTicking, isTrue);
    clock.dispose();
    expect(clock.isTicking, isFalse);
  });
}
