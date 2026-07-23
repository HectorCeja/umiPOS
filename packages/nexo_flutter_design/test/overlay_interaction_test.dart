import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

void main() {
  Widget app(Widget child) => MaterialApp(
    theme: NexoTheme.dark(reducedMotion: true),
    home: Scaffold(body: child),
  );

  testWidgets(
    'dialog traps interaction, closes with Escape and restores focus',
    (tester) async {
      final focus = FocusNode();
      addTearDown(focus.dispose);
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) => TextButton(
              focusNode: focus,
              autofocus: true,
              onPressed: () => showNexoDialog<void>(
                context: context,
                builder: (_) => const NexoDialog(
                  title: 'Confirmación',
                  content: Text('Contenido'),
                ),
              ),
              child: const Text('Abrir'),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Abrir'));
      await tester.pumpAndSettle();
      expect(find.text('Confirmación'), findsOneWidget);
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(find.text('Confirmación'), findsNothing);
      expect(focus.hasFocus, isTrue);
    },
  );

  testWidgets('adaptive sheet opens and closes', (tester) async {
    await tester.pumpWidget(
      app(
        Builder(
          builder: (context) => NexoButton(
            label: 'Panel',
            onPressed: () => showNexoSheet<void>(
              context: context,
              title: 'Filtros',
              child: const Text('Contenido'),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('Panel'));
    await tester.pumpAndSettle();
    expect(find.text('Filtros'), findsOneWidget);
    await tester.tap(find.byIcon(Icons.close).last);
    await tester.pumpAndSettle();
    expect(find.text('Filtros'), findsNothing);
  });

  testWidgets('popover menu selects using keyboard', (tester) async {
    String? selection;
    await tester.pumpWidget(
      app(
        Center(
          child: NexoPopoverMenu<String>(
            anchor: const Padding(
              padding: EdgeInsets.all(12),
              child: Text('Acciones'),
            ),
            items: const [
              NexoMenuItem(value: 'edit', label: 'Editar'),
              NexoMenuItem(
                value: 'delete',
                label: 'Eliminar',
                destructive: true,
              ),
            ],
            onSelected: (value) => selection = value,
          ),
        ),
      ),
    );
    await tester.tap(find.text('Acciones'));
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(selection, isNotNull);
  });

  testWidgets('tabs expose selected state and change', (tester) async {
    var selected = 0;
    await tester.pumpWidget(
      app(
        StatefulBuilder(
          builder: (context, setState) => NexoTabs(
            items: const [
              NexoTabItem(label: 'Todos'),
              NexoTabItem(label: 'Favoritos'),
            ],
            index: selected,
            onChanged: (value) => setState(() => selected = value),
          ),
        ),
      ),
    );
    await tester.tap(find.text('Favoritos'));
    expect(selected, 1);
  });
}
