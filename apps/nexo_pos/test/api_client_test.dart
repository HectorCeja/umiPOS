import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:nexo_pos/core/api.dart';
import 'package:nexo_pos/core/models.dart';
import 'package:nexo_pos/core/security.dart';

void main() {
  final environment = PosEnvironment(
    name: 'test',
    baseUri: Uri.parse('http://api.test/'),
    production: false,
  );

  test('device credential accompanies productive POS requests', () async {
    final store = MemorySecureStore();
    await store.write('device.credential', 'credential-id.secret');
    late http.Request observed;
    final client = OpenApiPosClient(
      environment,
      secureStore: store,
      client: MockClient((request) async {
        observed = request;
        return http.Response('{"items":[]}', 200);
      }),
    );

    await client.products('organization', 'branch');

    expect(
      observed.headers['x-nexo-device-credential'],
      'credential-id.secret',
    );
  });

  test('inactive device credential maps to a terminal revocation', () async {
    final store = MemorySecureStore();
    await store.write('device.credential', 'credential-id.secret');
    final client = OpenApiPosClient(
      environment,
      secureStore: store,
      client: MockClient(
        (_) async => http.Response(
          '{"message":"Device credential invalid or inactive"}',
          401,
        ),
      ),
    );

    await expectLater(
      client.currentDevice('organization'),
      throwsA(
        isA<PosFailure>().having(
          (error) => error.kind,
          'kind',
          PosErrorKind.deviceRevoked,
        ),
      ),
    );
  });

  test('bodyless commands do not advertise an empty JSON document', () async {
    final store = MemorySecureStore();
    late http.Request observed;
    final client = OpenApiPosClient(
      environment,
      secureStore: store,
      client: MockClient((request) async {
        observed = request;
        return http.Response('{}', 200);
      }),
    );

    await client.refreshSession();

    expect(observed.body, isEmpty);
    expect(observed.headers.containsKey('content-type'), isFalse);
  });
}
