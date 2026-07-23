import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

void main() {
  testWidgets('measured LivingScene headless baselines', (tester) async {
    final results = <String, int>{};
    for (final mode in NexoQualityMode.values) {
      final watch = Stopwatch()..start();
      await tester.pumpWidget(
        MaterialApp(
          theme: NexoTheme.dark(),
          home: NexoLivingScene(
            variant: NexoLivingSceneVariant.home,
            quality: mode,
            deterministicProgress: .5,
            child: const SizedBox.expand(),
          ),
        ),
      );
      await tester.pump();
      watch.stop();
      results['${mode.name}_build_us'] = watch.elapsedMicroseconds;
    }
    final gridWatch = Stopwatch()..start();
    await tester.pumpWidget(
      MaterialApp(
        theme: NexoTheme.dark(),
        home: NexoLivingScene(
          variant: NexoLivingSceneVariant.products,
          quality: NexoQualityMode.balanced,
          deterministicProgress: .5,
          child: GridView.count(
            crossAxisCount: 4,
            childAspectRatio: .70,
            children: List.generate(
              100,
              (index) =>
                  NexoProductTile(name: 'Fixture $index', price: r'$0.00'),
            ),
          ),
        ),
      ),
    );
    await tester.pump();
    gridWatch.stop();
    results['product_grid_100_us'] = gridWatch.elapsedMicroseconds;
    // Headless build measurements are evidence only, never a GPU/raster p95 claim.
    // ignore: avoid_print
    print('NEXO_SCENE_PERF $results');
    expect(results.values.every((value) => value > 0), isTrue);
  });
}
