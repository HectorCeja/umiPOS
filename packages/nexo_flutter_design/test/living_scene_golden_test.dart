import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  for (final variant in NexoLivingSceneVariant.values) {
    testWidgets('golden scene ${variant.name}', (tester) async {
      await tester.binding.setSurfaceSize(const Size(800, 600));
      await tester.pumpWidget(_Golden(variant: variant));
      await tester.pump();
      await expectLater(
        find.byType(NexoLivingScene),
        matchesGoldenFile('goldens/scene.${variant.name}.800x600.png'),
      );
      await tester.binding.setSurfaceSize(null);
    });
  }
}

class _Golden extends StatelessWidget {
  const _Golden({required this.variant});
  final NexoLivingSceneVariant variant;
  @override
  Widget build(BuildContext context) => MaterialApp(
    theme: NexoTheme.dark(),
    home: NexoLivingScene(
      variant: variant,
      quality: NexoQualityMode.high,
      deterministicProgress: .37,
      child: Align(
        alignment: Alignment.topLeft,
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: NexoSurface(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(variant.name, style: const TextStyle(fontSize: 28)),
            ),
          ),
        ),
      ),
    ),
  );
}
