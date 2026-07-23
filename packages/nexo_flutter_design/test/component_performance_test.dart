import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

Widget app(Widget child) => MaterialApp(
  theme: NexoTheme.dark(reducedMotion: true),
  home: Scaffold(body: child),
);

void main() {
  testWidgets('measured component rendering baselines', (tester) async {
    final results = <String, int>{};
    Future<void> measure(String name, Widget widget) async {
      final watch = Stopwatch()..start();
      await tester.pumpWidget(app(widget));
      await tester.pump();
      watch.stop();
      results[name] = watch.elapsedMicroseconds;
      expect(watch.elapsed, lessThan(const Duration(seconds: 10)));
    }

    await measure(
      'product_grid_100_us',
      GridView.count(
        crossAxisCount: 5,
        childAspectRatio: .62,
        children: List.generate(
          100,
          (index) => NexoProductTile(name: 'Producto $index', price: r'$85.00'),
        ),
      ),
    );
    await measure(
      'list_100_us',
      ListView(
        children: List.generate(
          100,
          (index) => NexoListTile(title: 'Elemento $index'),
        ),
      ),
    );
    await measure(
      'table_100_us',
      NexoTable<int>(
        caption: 'Fixture de rendimiento',
        columns: [
          NexoTableColumn(
            label: 'Producto',
            cell: (value) => Text('Producto $value'),
          ),
          NexoTableColumn(
            label: 'Cantidad',
            numeric: true,
            cell: (value) => Text('$value'),
          ),
        ],
        rows: List.generate(100, (index) => index),
      ),
    );
    await measure(
      'showcase_startup_us',
      const SingleChildScrollView(
        child: Column(
          children: [
            NexoButton(label: 'Acción'),
            NexoTextField(label: 'Campo'),
            NexoEmptyState(title: 'Vacío', description: 'Fixture'),
          ],
        ),
      ),
    );
    // Test output is captured verbatim in the Part 2 evidence report.
    // ignore: avoid_print
    print('NEXO_COMPONENT_PERF $results');
  });

  testWidgets('dialog and menu opening baseline', (tester) async {
    await tester.pumpWidget(
      app(
        Builder(
          builder: (context) => Row(
            children: [
              NexoButton(
                label: 'Dialog',
                onPressed: () => showNexoDialog<void>(
                  context: context,
                  builder: (_) => const NexoDialog(
                    title: 'Dialog',
                    content: Text('Fixture'),
                  ),
                ),
              ),
              NexoPopoverMenu<String>(
                anchor: const Text('Menu'),
                items: const [NexoMenuItem(value: 'one', label: 'Uno')],
                onSelected: (_) {},
              ),
            ],
          ),
        ),
      ),
    );
    final dialog = Stopwatch()..start();
    await tester.tap(find.text('Dialog'));
    await tester.pumpAndSettle();
    dialog.stop();
    await tester.tap(find.byIcon(Icons.close));
    await tester.pumpAndSettle();
    final menu = Stopwatch()..start();
    await tester.tap(find.text('Menu'));
    await tester.pumpAndSettle();
    menu.stop();
    expect(dialog.elapsed, lessThan(const Duration(seconds: 10)));
    expect(menu.elapsed, lessThan(const Duration(seconds: 10)));
    // ignore: avoid_print
    print(
      'NEXO_OVERLAY_PERF {dialog_open_us: ${dialog.elapsedMicroseconds}, menu_open_us: ${menu.elapsedMicroseconds}}',
    );
  });
}
