import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nexo_pos/app/pos_app.dart';
import 'package:nexo_pos/app/pos_controller.dart';
import 'package:nexo_pos/core/models.dart';
import 'package:nexo_pos/testing/fake_pos_api.dart';

PosController fixture() => PosController(
  api: FakePosApi(),
  cart: PosCart(
    localId: 'visual-fixture',
    organizationId: 'fixture-organization',
    branchId: 'fixture-branch',
    deviceId: 'fixture-device',
    userId: 'fixture-user',
    idempotencySeed: 'visual-seed',
  ),
)..cash = CashSessionStatus.open;

Future<void> render(
  WidgetTester tester, {
  required Size size,
  required bool harness,
  PosController? controller,
}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  await tester.pumpWidget(
    MediaQuery(
      data: MediaQueryData(size: size, disableAnimations: true),
      child: NexoPosApp(
        controller: controller ?? fixture(),
        testHarness: harness,
      ),
    ),
  );
  // Decode the operational artwork before taking a golden. Without this,
  // the first test that uses the asset captures the placeholder while later
  // tests capture the process-wide image cache.
  if (harness) {
    await tester.runAsync(
      () => precacheImage(
        const AssetImage(
          'packages/nexo_flutter_design/assets/artwork/womanpos.png',
        ),
        tester.element(find.byType(NexoPosApp)),
      ),
    );
  }
  await tester.pump(const Duration(milliseconds: 500));
}

void main() {
  tearDown(
    () => TestWidgetsFlutterBinding.ensureInitialized().platformDispatcher
        .clearAllTestValues(),
  );

  testWidgets('blocked production enrollment desktop', (tester) async {
    await render(tester, size: const Size(1280, 720), harness: false);
    await expectLater(
      find.byType(NexoPosApp),
      matchesGoldenFile('goldens/enrollment-blocked.1280x720.png'),
    );
  });

  testWidgets('operational fixture desktop', (tester) async {
    await render(tester, size: const Size(1280, 720), harness: true);
    await tester.pump(const Duration(milliseconds: 750));
    await expectLater(
      find.byType(NexoPosApp),
      matchesGoldenFile('goldens/operational.1280x720.png'),
    );
  });

  testWidgets('operational fixture mobile', (tester) async {
    await render(tester, size: const Size(390, 844), harness: true);
    await tester.pump(const Duration(milliseconds: 750));
    await expectLater(
      find.byType(NexoPosApp),
      matchesGoldenFile('goldens/operational.390x844.png'),
    );
  });

  testWidgets('operational contextual help desktop', (tester) async {
    await render(tester, size: const Size(1280, 720), harness: true);
    await tester.pump(const Duration(milliseconds: 750));
    await tester.tap(find.byIcon(Icons.help_outline).last);
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(milliseconds: 500));
    await expectLater(
      find.byType(Dialog),
      matchesGoldenFile('goldens/contextual-help.1280x720.png'),
    );
  });

  testWidgets('cash checkout desktop', (tester) async {
    await render(tester, size: const Size(1280, 720), harness: true);
    await tester.tap(find.text('Café de origen').first);
    await tester.pump();
    await tester.tap(find.byKey(const Key('checkout-button')));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.pump(const Duration(milliseconds: 500));
    await expectLater(
      find.byType(Dialog),
      matchesGoldenFile('goldens/checkout-cash.1280x720.png'),
    );
  });

  testWidgets('external tender desktop', (tester) async {
    await render(tester, size: const Size(1280, 720), harness: true);
    await tester.tap(find.text('Café de origen').first);
    await tester.pump();
    await tester.tap(find.byKey(const Key('checkout-button')));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Externo'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));
    await expectLater(
      find.byType(Dialog),
      matchesGoldenFile('goldens/external-tender.1280x720.png'),
    );
  });

  testWidgets('unknown payment recovery state', (tester) async {
    final controller = PosController(
      api: FakePosApi(unknownPayment: true),
      cart: PosCart(
        localId: 'unknown-fixture',
        organizationId: 'fixture-organization',
        branchId: 'fixture-branch',
        deviceId: 'fixture-device',
        userId: 'fixture-user',
        idempotencySeed: 'unknown-seed',
      ),
    )..cash = CashSessionStatus.open;
    await render(
      tester,
      size: const Size(1280, 720),
      harness: true,
      controller: controller,
    );
    await tester.tap(find.text('Café de origen').first);
    await tester.pump();
    await tester.tap(find.byKey(const Key('checkout-button')));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.byKey(const Key('confirm-payment')));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.pump(const Duration(milliseconds: 500));
    await expectLater(
      find.byType(Dialog),
      matchesGoldenFile('goldens/payment-unknown.1280x720.png'),
    );
  });

  testWidgets('completed receipt and reprint action', (tester) async {
    await render(tester, size: const Size(1280, 720), harness: true);
    await tester.tap(find.text('Café de origen').first);
    await tester.pump();
    await tester.tap(find.byKey(const Key('checkout-button')));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.byKey(const Key('confirm-payment')));
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pump(const Duration(milliseconds: 500));
    await expectLater(
      find.byType(Dialog),
      matchesGoldenFile('goldens/receipt-reprint.1280x720.png'),
    );
  });
}
