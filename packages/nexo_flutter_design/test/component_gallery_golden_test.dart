import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  const cases = <(String, Size, double, bool, bool)>[
    ('phone.390x844', Size(390, 844), 1, false, false),
    ('tablet.768x1024', Size(768, 1024), 1, false, false),
    ('terminal.800x600', Size(800, 600), 1, false, false),
    ('desktop.1280x720', Size(1280, 720), 1, false, false),
    ('text-scale-2.390x844', Size(390, 844), 2, true, false),
    ('reduced-motion.768x1024', Size(768, 1024), 1, true, false),
    ('high-contrast.800x600', Size(800, 600), 1, true, true),
    ('touch-density.1280x720', Size(1280, 720), 1, false, false),
  ];
  for (final entry in cases) {
    testWidgets('component gallery ${entry.$1}', (tester) async {
      tester.view.devicePixelRatio = 1;
      tester.view.physicalSize = entry.$2;
      addTearDown(tester.view.reset);
      await tester.pumpWidget(
        _GalleryApp(
          textScale: entry.$3,
          reduceMotion: entry.$4,
          highContrast: entry.$5,
        ),
      );
      await tester.pump();
      await expectLater(
        find.byType(_GalleryApp),
        matchesGoldenFile('goldens/components.${entry.$1}.png'),
      );
    });
  }
}

class _GalleryApp extends StatelessWidget {
  const _GalleryApp({
    required this.textScale,
    required this.reduceMotion,
    required this.highContrast,
  });
  final double textScale;
  final bool reduceMotion, highContrast;
  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    theme: NexoTheme.dark(reducedMotion: reduceMotion),
    locale: const Locale('es', 'MX'),
    home: MediaQuery(
      data: MediaQueryData(
        textScaler: TextScaler.linear(textScale),
        disableAnimations: reduceMotion,
        highContrast: highContrast,
      ),
      child: const Scaffold(body: _Gallery()),
    ),
  );
}

class _Gallery extends StatelessWidget {
  const _Gallery();
  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    padding: const EdgeInsets.all(20),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const NexoPageHeader(
          eyebrow: 'Component Library',
          title: 'NEXO Flutter',
          subtitle: 'Fixtures visuales deterministas · sin datos productivos',
        ),
        const SizedBox(height: 20),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: const [
            NexoButton(label: 'Primario'),
            NexoButton(
              label: 'Secundario',
              variant: NexoButtonVariant.secondary,
            ),
            NexoButton(label: 'Peligro', variant: NexoButtonVariant.danger),
            NexoButton(label: 'Cargando', loading: true),
            NexoIconButton(icon: Icons.search, label: 'Buscar'),
          ],
        ),
        const SizedBox(height: 20),
        const NexoToolbar(
          title: 'Productos',
          search: NexoSearchField(label: 'Buscar'),
          actions: [NexoButton(label: 'Crear producto')],
        ),
        const SizedBox(height: 20),
        Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            const SizedBox(
              width: 280,
              child: NexoKpiCard(
                label: 'Ventas',
                value: r'$12,480',
                trendLabel: '+8.4 %',
                trend: NexoTrendDirection.positive,
              ),
            ),
            SizedBox(
              width: 280,
              child: NexoProductTile(
                name: 'Café de origen',
                secondaryLabel: 'Fixture visual',
                price: r'$85.00',
                status: 'Disponible',
              ),
            ),
            const SizedBox(
              width: 280,
              child: NexoInlineNotice(
                tone: NexoTone.offline,
                title: 'Sin conexión',
                body: 'Los cambios se conservarán localmente.',
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        const Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            NexoBadge(label: 'Disponible', tone: NexoTone.success),
            NexoBadge(label: 'Pendiente', tone: NexoTone.warning),
            NexoBadge(label: 'Restringido', tone: NexoTone.restricted),
            NexoChip(label: 'Seleccionado', selected: true),
          ],
        ),
        const SizedBox(height: 20),
        const NexoEmptyState(
          title: 'Sin resultados',
          description: 'Ajusta los filtros para continuar.',
          size: NexoEmptyStateSize.inline,
        ),
      ],
    ),
  );
}
