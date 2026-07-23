import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('foundation palette and surfaces are deterministic', (
    tester,
  ) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(800, 600);
    addTearDown(tester.view.reset);
    await tester.pumpWidget(const _FoundationPreview());
    await expectLater(
      find.byType(_FoundationPreview),
      matchesGoldenFile('goldens/foundation.dark.800x600.png'),
    );
  });
}

class _FoundationPreview extends StatelessWidget {
  const _FoundationPreview();

  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    theme: NexoTheme.dark(reducedMotion: true),
    locale: const Locale('es', 'MX'),
    home: Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('NEXO', style: NexoTheme.dark().textTheme.headlineLarge),
            const SizedBox(height: 24),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: const [
                _Swatch(NexoV1Colors.violet),
                _Swatch(NexoV1Colors.blue),
                _Swatch(NexoV1Colors.cyan),
                _Swatch(NexoV1Colors.mint),
                _Swatch(NexoV1Colors.warning),
                _Swatch(NexoV1Colors.danger),
              ],
            ),
            const SizedBox(height: 32),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: NexoV1Colors.surface,
                border: Border.all(color: NexoV1Colors.line),
                borderRadius: BorderRadius.circular(16.8),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Control operativo'),
                  SizedBox(height: 8),
                  Text('Superficie, jerarquía y estado semántico.'),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _Swatch extends StatelessWidget {
  const _Swatch(this.color);
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    width: 96,
    height: 64,
    decoration: BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(12),
    ),
  );
}
