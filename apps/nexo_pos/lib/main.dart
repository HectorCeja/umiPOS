import 'package:flutter/widgets.dart';
import 'app/pos_app.dart';
import 'app/productive_coordinator.dart';
import 'app/pos_controller.dart';
import 'core/api.dart';
import 'core/local_database.dart';
import 'core/models.dart';
import 'core/security.dart';
import 'testing/fake_pos_api.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  const harness = bool.fromEnvironment('NEXO_TEST_HARNESS');
  if (harness) {
    final cart = PosCart(
      localId: 'fixture-cart',
      organizationId: 'fixture-organization',
      branchId: 'fixture-branch',
      deviceId: 'fixture-device',
      userId: 'fixture-user',
      idempotencySeed: 'fixture-stable-seed',
    );
    final controller = PosController(api: FakePosApi(), cart: cart)
      ..cash = CashSessionStatus.open;
    runApp(NexoPosApp(testHarness: true, controller: controller));
    return;
  }

  const environmentName = String.fromEnvironment(
    'NEXO_ENVIRONMENT',
    defaultValue: 'production',
  );
  const baseUrl = String.fromEnvironment(
    'NEXO_API_BASE_URL',
    defaultValue: 'https://api.nexo.invalid',
  );
  final secureStore = PlatformSecureStore();
  final environment = PosEnvironment(
    name: environmentName,
    baseUri: Uri.parse(baseUrl),
    production: environmentName == 'production',
  );
  environment.validate();
  final coordinator = ProductivePosCoordinator(
    api: OpenApiPosClient(environment, secureStore: secureStore),
    secureStore: secureStore,
    database: await PosLocalDatabase.open(),
  );
  runApp(NexoPosApp(testHarness: false, coordinator: coordinator));
}
