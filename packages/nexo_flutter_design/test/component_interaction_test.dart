import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

Widget harness(Widget child, {double textScale = 1}) => MaterialApp(
  theme: NexoTheme.dark(reducedMotion: true),
  locale: const Locale('es', 'MX'),
  home: MediaQuery(
    data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
    child: Scaffold(
      body: Center(child: SizedBox(width: 640, child: child)),
    ),
  ),
);

void main() {
  testWidgets(
    'button activates with keyboard and loading prevents activation',
    (tester) async {
      var presses = 0;
      await tester.pumpWidget(
        harness(
          NexoButton(
            label: 'Continuar',
            autofocus: true,
            onPressed: () => presses++,
          ),
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      expect(presses, 1);
      await tester.pumpWidget(
        harness(
          NexoButton(
            label: 'Continuar',
            loading: true,
            onPressed: () => presses++,
          ),
        ),
      );
      await tester.tap(find.byType(NexoButton));
      expect(presses, 1);
      expect(find.byType(NexoSpinner), findsOneWidget);
    },
  );

  testWidgets('icon button exposes label and minimum target', (tester) async {
    await tester.pumpWidget(
      harness(const NexoIconButton(icon: Icons.close, label: 'Cerrar')),
    );
    expect(find.bySemanticsLabel('Cerrar'), findsWidgets);
    final size = tester.getSize(find.byType(NexoIconButton));
    expect(size.width, greaterThanOrEqualTo(44));
    expect(size.height, greaterThanOrEqualTo(44));
  });

  testWidgets(
    'text field announces validation and toggles password visibility',
    (tester) async {
      await tester.pumpWidget(
        harness(
          const NexoTextField(
            label: 'Contraseña',
            kind: NexoTextFieldKind.password,
            errorText: 'Campo requerido',
          ),
        ),
      );
      expect(find.text('Campo requerido'), findsOneWidget);
      final before = tester
          .widget<EditableText>(find.byType(EditableText))
          .obscureText;
      await tester.tap(find.byIcon(Icons.visibility_outlined));
      await tester.pump();
      final after = tester
          .widget<EditableText>(find.byType(EditableText))
          .obscureText;
      expect((before, after), (true, false));
    },
  );

  testWidgets('selection controls report changes', (tester) async {
    bool? checked = false;
    bool switched = false;
    String radio = 'Uno';
    Set<String> selected = {'Uno'};
    await tester.pumpWidget(
      harness(
        StatefulBuilder(
          builder: (context, setState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              NexoCheckbox(
                value: checked,
                label: 'Opción',
                onChanged: (value) => setState(() => checked = value),
              ),
              NexoSwitch(
                value: switched,
                label: 'Activo',
                onChanged: (value) => setState(() => switched = value),
              ),
              NexoRadio<String>(
                value: 'Dos',
                groupValue: radio,
                label: 'Radio dos',
                onChanged: (value) => setState(() => radio = value!),
              ),
              NexoSegmentedControl<String>(
                options: const ['Uno', 'Dos'],
                labelOf: (value) => value,
                selected: selected,
                onSelectionChanged: (value) => setState(() => selected = value),
              ),
            ],
          ),
        ),
      ),
    );
    await tester.tap(find.text('Opción'));
    await tester.tap(find.text('Activo'));
    await tester.tap(find.text('Radio dos'));
    await tester.tap(find.text('Dos'));
    expect(checked, true);
    expect(switched, true);
    expect(radio, 'Dos');
    expect(selected, {'Dos'});
  });

  testWidgets('select supports a long label and selection', (tester) async {
    String? selected;
    final focus = FocusNode();
    addTearDown(focus.dispose);
    await tester.pumpWidget(
      harness(
        StatefulBuilder(
          builder: (context, setState) => NexoSelect<String>(
            label: 'Sucursal',
            items: const [
              'Sucursal Plaza del Sol',
              'Unidad Paseo de la Reforma',
            ],
            itemLabel: (item) => item,
            value: selected,
            focusNode: focus,
            onChanged: (value) => setState(() => selected = value),
          ),
        ),
      ),
    );
    focus.requestFocus();
    await tester.pump();
    await tester.tap(find.byIcon(Icons.expand_more));
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(selected, 'Unidad Paseo de la Reforma');
  });

  testWidgets('product tile and empty state actions are observable', (
    tester,
  ) async {
    var tile = 0;
    var empty = 0;
    await tester.pumpWidget(
      harness(
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 260,
              child: NexoProductTile(
                name: 'Café de origen',
                price: r'$85.00',
                onTap: () => tile++,
              ),
            ),
            NexoEmptyState(
              title: 'Sin resultados',
              description: 'Ajusta la búsqueda.',
              size: NexoEmptyStateSize.inline,
              primaryAction: NexoButton(
                label: 'Reintentar',
                onPressed: () => empty++,
              ),
            ),
          ],
        ),
      ),
    );
    await tester.tap(find.text('Café de origen'));
    await tester.tap(find.text('Reintentar'));
    expect((tile, empty), (1, 1));
  });

  testWidgets('table sorts and selects rows', (tester) async {
    String? sorted;
    int? selected;
    await tester.pumpWidget(
      harness(
        NexoTable<String>(
          caption: 'Productos',
          columns: [
            NexoTableColumn(label: 'Nombre', cell: Text.new),
            NexoTableColumn(
              label: 'Estado',
              cell: (value) => const Text('Disponible'),
            ),
          ],
          rows: const ['Café'],
          onSort: (column, _) => sorted = column,
          onRowTap: (index) => selected = index,
        ),
      ),
    );
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.tap(find.text('Nombre'));
    expect(sorted, 'Nombre');
    expect(selected, 0);
  });

  testWidgets('toolbar wraps without overflow and text scales to 200%', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      harness(
        NexoToolbar(
          title: 'Catálogo',
          search: const NexoSearchField(label: 'Buscar'),
          actions: const [NexoButton(label: 'Crear producto')],
        ),
        textScale: 2,
      ),
    );
    expect(tester.takeException(), isNull);
    expect(find.text('Crear producto'), findsOneWidget);
  });
}
