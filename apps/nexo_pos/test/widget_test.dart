import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_pos/app/pos_app.dart';
import 'package:nexo_pos/app/pos_controller.dart';
import 'package:nexo_pos/core/models.dart';
import 'package:nexo_pos/testing/fake_pos_api.dart';

PosController controller({bool unknownPayment = false}) => PosController(
  api: FakePosApi(unknownPayment: unknownPayment),
  cart: PosCart(
    localId: 'fixture-cart',
    organizationId: 'fixture-organization',
    branchId: 'fixture-branch',
    deviceId: 'fixture-device',
    userId: 'fixture-user',
    idempotencySeed: 'fixture-seed',
  ),
);

void main() {
  testWidgets('production bootstrap blocks unsupported enrollment', (
    tester,
  ) async {
    await tester.pumpWidget(
      NexoPosApp(controller: controller(), testHarness: false),
    );
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Enrolamiento requerido'), findsOneWidget);
    expect(find.textContaining('no publica un contrato'), findsOneWidget);
  });

  testWidgets('enrollment help is discoverable and keyboard-safe', (
    tester,
  ) async {
    await tester.pumpWidget(
      NexoPosApp(controller: controller(), testHarness: false),
    );
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.byTooltip('Ayuda'));
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Enrolamiento de terminal'), findsOneWidget);
    expect(find.textContaining('enlace temporal'), findsOneWidget);
    await tester.tap(find.text('Entendido'));
    await tester.pump(const Duration(milliseconds: 400));
    expect(find.text('Enrolamiento de terminal'), findsNothing);
  });

  testWidgets(
    'operational help explains payment safety and deferred suspension',
    (tester) async {
      tester.view.physicalSize = const Size(1280, 720);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      await tester.pumpWidget(
        NexoPosApp(controller: controller(), testHarness: true),
      );
      await tester.pump(const Duration(milliseconds: 500));
      await tester.tap(find.byIcon(Icons.help_outline).last);
      await tester.pump(const Duration(milliseconds: 400));
      expect(find.text('Cómo operar NEXO POS'), findsOneWidget);
      expect(find.text('Cobro'), findsOneWidget);
      expect(find.text('Sin conexión'), findsOneWidget);
      expect(find.text('Venta suspendida'), findsOneWidget);
      expect(find.textContaining('No implementada en POS V1'), findsOneWidget);
    },
  );

  testWidgets('test harness loads catalog and cart', (tester) async {
    tester.view.physicalSize = const Size(1280, 720);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      NexoPosApp(controller: controller(), testHarness: true),
    );
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.byKey(const Key('catalog-grid')), findsOneWidget);
    await tester.tap(find.text('Café de origen').first);
    await tester.pump();
    expect(find.text('Venta actual'), findsOneWidget);
    expect(find.byKey(const Key('checkout-button')), findsOneWidget);
  });

  testWidgets('checkout dialog exposes keyboard-safe payment action', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1280, 720);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      NexoPosApp(controller: controller(), testHarness: true),
    );
    await tester.pump(const Duration(milliseconds: 500));
    await tester.tap(find.text('Café de origen').first);
    await tester.pump();
    await tester.tap(find.byKey(const Key('checkout-button')));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Cobro en efectivo'), findsOneWidget);
    expect(find.byKey(const Key('confirm-payment')), findsOneWidget);
  });

  testWidgets(
    'operational shell reflows on mobile without horizontal overflow',
    (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      await tester.pumpWidget(
        NexoPosApp(controller: controller(), testHarness: true),
      );
      await tester.pump(const Duration(milliseconds: 500));
      expect(tester.takeException(), isNull);
      expect(find.textContaining('Carrito'), findsOneWidget);
    },
  );

  testWidgets('text scale 200 percent remains operable', (tester) async {
    await tester.pumpWidget(
      MediaQuery(
        data: const MediaQueryData(textScaler: TextScaler.linear(2)),
        child: NexoPosApp(controller: controller(), testHarness: false),
      ),
    );
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Enrolamiento requerido'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
