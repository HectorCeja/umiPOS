import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';
import '../core/models.dart';
import 'bootstrap.dart';
import 'pos_controller.dart';
import 'productive_coordinator.dart';

class NexoPosApp extends StatelessWidget {
  const NexoPosApp({
    required this.testHarness,
    this.controller,
    this.coordinator,
    super.key,
  });
  final PosController? controller;
  final bool testHarness;
  final ProductivePosCoordinator? coordinator;
  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    theme: NexoTheme.dark(),
    locale: const Locale('es'),
    supportedLocales: const [Locale('es'), Locale('en')],
    localizationsDelegates: const [
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
      GlobalCupertinoLocalizations.delegate,
    ],
    home: testHarness
        ? PosOperationalScreen(controller: controller!)
        : coordinator == null
        ? const _BlockedEnrollment()
        : ProductivePosRoot(coordinator: coordinator!),
  );
}

class _BlockedEnrollment extends StatelessWidget {
  const _BlockedEnrollment();
  @override
  Widget build(BuildContext context) => const _ProductiveFrame(
    helpTitle: 'Enrolamiento de terminal',
    helpBody:
        'Solicita un enlace temporal a una persona administradora. Sin identidad de dispositivo validada, NEXO bloquea caja, ventas y pagos.',
    child: NexoEmptyState(
      title: 'Enrolamiento requerido',
      description:
          'El backend actual no publica un contrato de enrolamiento de terminal. La operación permanece bloqueada para evitar una identidad de dispositivo falsa.',
      primaryAction: NexoButton(
        label: 'Reintentar verificación',
        onPressed: null,
      ),
    ),
  );
}

class ProductivePosRoot extends StatefulWidget {
  const ProductivePosRoot({required this.coordinator, super.key});
  final ProductivePosCoordinator coordinator;
  @override
  State<ProductivePosRoot> createState() => _ProductivePosRootState();
}

class _ProductivePosRootState extends State<ProductivePosRoot> {
  @override
  void initState() {
    super.initState();
    widget.coordinator.addListener(_refresh);
    widget.coordinator.bootstrap();
  }

  void _refresh() => setState(() {});

  @override
  void dispose() {
    widget.coordinator.removeListener(_refresh);
    widget.coordinator.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final coordinator = widget.coordinator;
    if (coordinator.busy || coordinator.route == PosBootstrapRoute.booting) {
      return const _ProductiveFrame(
        child: Center(
          child: NexoSpinner(size: 28, semanticLabel: 'Preparando NEXO POS'),
        ),
      );
    }
    return switch (coordinator.route) {
      PosBootstrapRoute.enrollmentRequired => _EnrollmentScreen(coordinator),
      PosBootstrapRoute.authentication => _LoginScreen(coordinator),
      PosBootstrapRoute.branchRequired => _BranchScreen(coordinator),
      PosBootstrapRoute.cashSessionRequired => _CashOpenScreen(coordinator),
      PosBootstrapRoute.operational => PosOperationalScreen(
        controller: coordinator.operational!,
        coordinator: coordinator,
      ),
      PosBootstrapRoute.deviceRevoked => const _ProductiveFrame(
        helpTitle: 'Terminal revocada',
        helpBody:
            'Contacta a una persona administradora. No intentes enrolar otra identidad ni borres la evidencia local.',
        child: NexoEmptyState(
          title: 'Terminal revocada',
          description:
              'La terminal fue revocada. Las operaciones nuevas están bloqueadas y la evidencia local se conserva.',
        ),
      ),
      _ => _ProductiveFrame(
        helpTitle: 'Operación restringida',
        helpBody:
            'Revisa la conexión, el estado de la terminal y la sesión. Reintenta únicamente la verificación segura.',
        child: NexoEmptyState(
          title: 'Operación restringida',
          description:
              coordinator.failure?.safeMessage ??
              'NEXO no pudo validar el contexto operativo.',
          primaryAction: NexoButton(
            label: 'Reintentar',
            onPressed: coordinator.bootstrap,
          ),
        ),
      ),
    };
  }
}

class _ProductiveFrame extends StatelessWidget {
  const _ProductiveFrame({
    required this.child,
    this.helpTitle = 'Ayuda de NEXO POS',
    this.helpBody =
        'Sigue la instrucción visible. NEXO bloquea operaciones financieras cuando falta contexto seguro.',
  });
  final Widget child;
  final String helpTitle;
  final String helpBody;
  @override
  Widget build(BuildContext context) => NexoLivingScene(
    variant: NexoLivingSceneVariant.focused,
    child: Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 620),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const NexoBrand(variant: NexoBrandVariant.compact),
                  const SizedBox(height: 24),
                  NexoCard(body: child),
                ],
              ),
            ),
          ),
        ),
      ),
      floatingActionButton: Semantics(
        label: 'Abrir ayuda de $helpTitle',
        button: true,
        child: FloatingActionButton.small(
          onPressed: () => _showPosHelp(context, helpTitle, helpBody),
          tooltip: 'Ayuda',
          child: const Icon(Icons.help_outline),
        ),
      ),
    ),
  );
}

class _EnrollmentScreen extends StatefulWidget {
  const _EnrollmentScreen(this.coordinator);
  final ProductivePosCoordinator coordinator;
  @override
  State<_EnrollmentScreen> createState() => _EnrollmentScreenState();
}

class _EnrollmentScreenState extends State<_EnrollmentScreen> {
  final payload = TextEditingController();
  @override
  void dispose() {
    payload.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => _ProductiveFrame(
    helpTitle: 'Enrolamiento de terminal',
    helpBody:
        'Usa el enlace temporal emitido por una persona administradora. El enlace define la organización y solo puede utilizarse una vez.',
    child: NexoFormSection(
      title: 'Enrolar terminal',
      description:
          'Escanea o pega el enlace temporal emitido por un administrador. La organización proviene del payload firmado, no de un selector local.',
      fields: [
        NexoTextField(
          label: 'Enlace de enrolamiento',
          controller: payload,
          autofillHints: const [AutofillHints.oneTimeCode],
        ),
        if (widget.coordinator.failure != null)
          NexoInlineNotice(
            tone: NexoTone.danger,
            title: 'No fue posible enrolar',
            body: widget.coordinator.failure!.safeMessage,
          ),
      ],
      actions: [
        NexoButton(
          label: 'Enrolar terminal',
          onPressed: () {
            final uri = Uri.tryParse(payload.text.trim());
            final organization = uri?.queryParameters['organization'];
            final token = uri?.queryParameters['token'];
            if (organization == null || token == null) return;
            widget.coordinator.enroll(organization: organization, token: token);
          },
        ),
      ],
    ),
  );
}

class _LoginScreen extends StatefulWidget {
  const _LoginScreen(this.coordinator);
  final ProductivePosCoordinator coordinator;
  @override
  State<_LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<_LoginScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => _ProductiveFrame(
    helpTitle: 'Inicio de sesión',
    helpBody:
        'Usa tu cuenta personal. La sesión de usuario y la identidad de esta terminal se validan por separado.',
    child: NexoFormSection(
      title: 'Inicia sesión en NEXO',
      description:
          'La sesión se valida junto con la identidad de esta terminal.',
      fields: [
        NexoTextField(
          label: 'Correo electrónico',
          controller: email,
          keyboardType: TextInputType.emailAddress,
          autofillHints: const [AutofillHints.username],
        ),
        NexoTextField(
          label: 'Contraseña',
          controller: password,
          kind: NexoTextFieldKind.password,
          autofillHints: const [AutofillHints.password],
        ),
        if (widget.coordinator.failure != null)
          NexoInlineNotice(
            tone: NexoTone.danger,
            title: 'No fue posible iniciar sesión',
            body: widget.coordinator.failure!.safeMessage,
          ),
      ],
      actions: [
        NexoButton(
          label: 'Entrar a NEXO',
          onPressed: () => widget.coordinator.login(email.text, password.text),
        ),
      ],
    ),
  );
}

class _BranchScreen extends StatelessWidget {
  const _BranchScreen(this.coordinator);
  final ProductivePosCoordinator coordinator;
  @override
  Widget build(BuildContext context) => _ProductiveFrame(
    helpTitle: 'Seleccionar sucursal',
    helpBody:
        'Elige únicamente una sucursal autorizada para esta terminal. Catálogo, caja y ventas usarán ese contexto.',
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Selecciona una sucursal',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        for (final branch in coordinator.availableBranches)
          NexoListTile(
            title: branch['name']?.toString() ?? 'Sucursal',
            subtitle: branch['status']?.toString(),
            onTap: () => coordinator.selectBranch(branch['id'].toString()),
          ),
      ],
    ),
  );
}

class _CashOpenScreen extends StatefulWidget {
  const _CashOpenScreen(this.coordinator);
  final ProductivePosCoordinator coordinator;
  @override
  State<_CashOpenScreen> createState() => _CashOpenScreenState();
}

class _CashOpenScreenState extends State<_CashOpenScreen> {
  final amount = TextEditingController(text: '0');
  String? registerId;
  @override
  void dispose() {
    amount.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (registerId == null &&
        widget.coordinator.availableRegisters.isNotEmpty) {
      registerId = widget.coordinator.availableRegisters.first['id']
          ?.toString();
    }
    return _ProductiveFrame(
      helpTitle: 'Apertura de caja',
      helpBody:
          'Selecciona la caja asignada e indica el fondo inicial en centavos. El backend valida terminal, sucursal y permiso antes de abrir.',
      child: NexoFormSection(
        title: 'Abrir caja',
        description:
            'El backend validará terminal, sucursal, permiso e idempotencia.',
        fields: [
          NexoSelect<String>(
            label: 'Caja registradora',
            value: registerId,
            items: widget.coordinator.availableRegisters
                .map((register) => register['id'].toString())
                .toList(),
            itemLabel: (id) {
              final register = widget.coordinator.availableRegisters.firstWhere(
                (candidate) => candidate['id'].toString() == id,
              );
              return register['name']?.toString() ?? 'Caja';
            },
            onChanged: (value) => setState(() => registerId = value),
          ),
          NexoTextField(
            label: 'Fondo inicial en centavos',
            controller: amount,
            keyboardType: TextInputType.number,
          ),
          if (widget.coordinator.failure != null)
            NexoInlineNotice(
              tone: NexoTone.danger,
              title: 'No fue posible abrir caja',
              body: widget.coordinator.failure!.safeMessage,
            ),
        ],
        actions: [
          NexoButton(
            label: 'Abrir caja',
            onPressed: registerId == null
                ? null
                : () => widget.coordinator.openCash(
                    registerId: registerId!,
                    opening: Money(int.tryParse(amount.text) ?? 0),
                  ),
          ),
        ],
      ),
    );
  }
}

class PosOperationalScreen extends StatefulWidget {
  const PosOperationalScreen({
    required this.controller,
    this.coordinator,
    super.key,
  });
  final PosController controller;
  final ProductivePosCoordinator? coordinator;
  @override
  State<PosOperationalScreen> createState() => _PosOperationalScreenState();
}

class _PosOperationalScreenState extends State<PosOperationalScreen> {
  final search = TextEditingController();
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_refresh);
    widget.controller.loadCatalog();
  }

  void _refresh() => setState(() {});
  @override
  void dispose() {
    widget.controller.removeListener(_refresh);
    search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    final compact = MediaQuery.sizeOf(context).width < 900;
    return NexoLivingScene(
      variant: NexoLivingSceneVariant.sales,
      quality: NexoQualityMode.balanced,
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Column(
            children: [
              _StatusBar(controller: c, coordinator: widget.coordinator),
              Expanded(
                child: compact
                    ? _Compact(
                        c: c,
                        search: search,
                        fixture: widget.coordinator == null,
                      )
                    : Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: _Catalog(
                              c: c,
                              search: search,
                              fixture: widget.coordinator == null,
                            ),
                          ),
                          SizedBox(width: 390, child: _Cart(c: c)),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusBar extends StatelessWidget {
  const _StatusBar({required this.controller, this.coordinator});
  final PosController controller;
  final ProductivePosCoordinator? coordinator;
  @override
  Widget build(BuildContext context) => NexoSurface(
    variant: NexoSurfaceVariant.glass,
    child: Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: LayoutBuilder(
        builder: (context, constraints) => Row(
          children: [
            if (constraints.maxWidth >= 480)
              const NexoStatusIndicator(
                label: 'Caja abierta',
                status: NexoStatus.online,
              )
            else
              const NexoBadge(label: 'Caja', tone: NexoTone.success),
            if (constraints.maxWidth >= 600) ...[
              const SizedBox(width: 16),
              const Expanded(
                child: Text(
                  'Sucursal Centro · Terminal 01',
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ] else
              const Spacer(),
            NexoBadge(
              label: controller.connectivity == ConnectivityState.online
                  ? 'En línea'
                  : 'Sin conexión',
              tone: controller.connectivity == ConnectivityState.online
                  ? NexoTone.success
                  : NexoTone.offline,
            ),
            if (coordinator != null) ...[
              const SizedBox(width: 12),
              NexoIconButton(
                icon: Icons.monitor_heart_outlined,
                label: 'Diagnósticos',
                variant: NexoIconButtonVariant.subtle,
                onPressed: () => showNexoDialog<void>(
                  context: context,
                  builder: (_) => _Diagnostics(coordinator!),
                ),
              ),
              const SizedBox(width: 8),
              NexoButton(
                label: 'Cerrar caja',
                size: NexoControlSize.compact,
                variant: NexoButtonVariant.ghost,
                onPressed: () => showNexoDialog<void>(
                  context: context,
                  builder: (_) => _CashClose(coordinator!),
                ),
              ),
            ],
            const SizedBox(width: 8),
            NexoIconButton(
              icon: Icons.help_outline,
              label: 'Ayuda del punto de venta',
              variant: NexoIconButtonVariant.subtle,
              onPressed: () => showNexoDialog<void>(
                context: context,
                builder: (_) => const _PosOperationalHelp(),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _PosOperationalHelp extends StatelessWidget {
  const _PosOperationalHelp();

  @override
  Widget build(BuildContext context) => NexoDialog(
    title: 'Cómo operar NEXO POS',
    description: 'Guía segura para la venta y el cierre de turno.',
    content: const Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        NexoListTile(
          title: 'Venta',
          subtitle: 'Busca o escanea, agrega al carrito y revisa el total.',
        ),
        NexoListTile(
          title: 'Cobro',
          subtitle:
              'Confirma una sola vez. Un resultado desconocido bloquea otro cobro.',
        ),
        NexoListTile(
          title: 'Sin conexión',
          subtitle:
              'Catálogo y borrador siguen visibles; ventas y pagos quedan bloqueados.',
        ),
        NexoListTile(
          title: 'Recuperación y reintentos',
          subtitle:
              'Consulta el resultado autoritativo. NEXO nunca repite un pago automáticamente.',
        ),
        NexoListTile(
          title: 'Sincronización',
          subtitle: 'V1 no sincroniza comandos financieros offline.',
        ),
        NexoListTile(
          title: 'Venta suspendida',
          subtitle:
              'No implementada en POS V1; adminístrala desde la superficie autorizada.',
        ),
        NexoListTile(
          title: 'Cierre de turno',
          subtitle:
              'Cuenta el efectivo y usa Cerrar caja; el importe esperado proviene del backend.',
        ),
        NexoListTile(
          title: 'Error de dispositivo',
          subtitle:
              'Si la terminal está revocada, detén la operación y conserva la evidencia local.',
        ),
      ],
    ),
    actions: [
      NexoButton(label: 'Entendido', onPressed: () => Navigator.pop(context)),
    ],
  );
}

void _showPosHelp(BuildContext context, String title, String body) {
  showNexoDialog<void>(
    context: context,
    builder: (_) => NexoDialog(
      title: title,
      description: body,
      content: const SizedBox.shrink(),
      actions: [
        NexoButton(label: 'Entendido', onPressed: () => Navigator.pop(context)),
      ],
    ),
  );
}

class _Diagnostics extends StatefulWidget {
  const _Diagnostics(this.coordinator);
  final ProductivePosCoordinator coordinator;
  @override
  State<_Diagnostics> createState() => _DiagnosticsState();
}

class _DiagnosticsState extends State<_Diagnostics> {
  bool? printerHealthy;
  @override
  Widget build(BuildContext context) {
    final c = widget.coordinator;
    final values = c.diagnostics.snapshot(
      deviceStatus: c.deviceId == null ? 'unknown' : 'active',
      sessionStatus: c.userId == null ? 'unauthenticated' : 'authenticated',
      organizationId: c.organizationId,
      branchId: c.branchId,
      cashSessionId: c.cashSessionId,
      safeLastError: c.failure?.safeMessage,
    );
    return NexoDialog(
      title: 'Diagnósticos de terminal',
      description:
          'Información operativa sanitizada. No contiene credenciales.',
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final entry in values.entries)
            NexoListTile(
              title: entry.key,
              trailing: Text(entry.value?.toString() ?? '—'),
            ),
          if (printerHealthy != null)
            NexoInlineNotice(
              tone: printerHealthy! ? NexoTone.success : NexoTone.danger,
              title: printerHealthy!
                  ? 'Impresora disponible'
                  : 'Impresora no disponible',
              body: c.printer.name,
            ),
        ],
      ),
      actions: [
        NexoButton(
          label: 'Probar impresora',
          variant: NexoButtonVariant.secondary,
          onPressed: () async {
            final result = await c.printer.test();
            if (context.mounted) {
              setState(() => printerHealthy = result);
              _showPremiumToast(
                context,
                title: result
                    ? 'Impresora disponible'
                    : 'No pudimos conectar la impresora',
                body: result
                    ? 'La prueba terminó correctamente.'
                    : 'Revisa la conexión del dispositivo e intenta de nuevo.',
                tone: result ? NexoTone.success : NexoTone.danger,
              );
            }
          },
        ),
        NexoButton(label: 'Cerrar', onPressed: () => Navigator.pop(context)),
      ],
    );
  }
}

class _CashClose extends StatefulWidget {
  const _CashClose(this.coordinator);
  final ProductivePosCoordinator coordinator;
  @override
  State<_CashClose> createState() => _CashCloseState();
}

class _CashCloseState extends State<_CashClose> {
  final counted = TextEditingController();
  @override
  void initState() {
    super.initState();
    widget.coordinator.refreshCashSummary();
  }

  @override
  void dispose() {
    counted.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final summary = widget.coordinator.cashSummary;
    final expected = summary?['expectedAmountMinor']?.toString();
    return NexoDialog(
      title: 'Conteo y cierre de caja',
      description:
          'El importe esperado proviene del backend. El cierre es idempotente.',
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          NexoNumericDisplay(
            formattedValue: expected == null
                ? 'Consultando…'
                : _money(Money(int.tryParse(expected) ?? 0)),
            semanticValue: expected == null
                ? 'Consultando efectivo esperado'
                : 'Efectivo esperado ${_money(Money(int.tryParse(expected) ?? 0))}',
          ),
          const SizedBox(height: 16),
          NexoTextField(
            label: 'Efectivo contado en centavos',
            controller: counted,
            keyboardType: TextInputType.number,
          ),
          if (widget.coordinator.failure != null)
            NexoInlineNotice(
              tone: NexoTone.danger,
              title: 'No fue posible cerrar la caja',
              body: widget.coordinator.failure!.safeMessage,
            ),
        ],
      ),
      actions: [
        NexoButton(
          label: 'Cancelar',
          variant: NexoButtonVariant.ghost,
          onPressed: () => Navigator.pop(context),
        ),
        NexoButton(
          label: 'Contar y cerrar',
          loading: widget.coordinator.busy,
          onPressed: () async {
            await widget.coordinator.countAndCloseCash(
              counted: Money(int.tryParse(counted.text) ?? 0),
            );
            if (context.mounted && widget.coordinator.failure == null) {
              _showPremiumToast(
                context,
                title: 'Caja cerrada',
                body: 'El conteo quedó confirmado y sincronizado.',
                tone: NexoTone.success,
              );
              Navigator.pop(context);
            } else if (context.mounted && widget.coordinator.failure != null) {
              _showPremiumToast(
                context,
                title: 'No pudimos cerrar la caja',
                body: widget.coordinator.failure!.safeMessage,
                tone: NexoTone.danger,
              );
            }
          },
        ),
      ],
    );
  }
}

class _Catalog extends StatelessWidget {
  const _Catalog({
    required this.c,
    required this.search,
    required this.fixture,
  });
  final PosController c;
  final TextEditingController search;
  final bool fixture;
  @override
  Widget build(BuildContext context) {
    final q = search.text.toLowerCase();
    final items = c.catalog
        .where((p) => p.name.toLowerCase().contains(q) || p.barcode == q)
        .toList();
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          NexoToolbar(
            title: 'Punto de venta',
            search: SizedBox(
              width: 320,
              child: NexoSearchField(
                label: 'Buscar o escanear',
                controller: search,
                onChanged: (_) => c.refreshView(),
                onSubmitted: (value) {
                  if (c.scanBarcode(value)) search.clear();
                },
                shortcutHint: 'Enter',
              ),
            ),
            actions: fixture
                ? const [
                    NexoBadge(
                      label: 'Fixture de prueba',
                      tone: NexoTone.warning,
                    ),
                  ]
                : const [],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: GridView.builder(
              key: const Key('catalog-grid'),
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 280,
                mainAxisExtent: 390,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: items.length,
              itemBuilder: (_, i) {
                final p = items[i];
                return NexoProductTile(
                  name: p.name,
                  price: _money(p.price),
                  secondaryLabel: p.barcode,
                  status: 'Disponible',
                  onTap: () => c.cart.add(p),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _Cart extends StatelessWidget {
  const _Cart({required this.c});
  final PosController c;
  @override
  Widget build(BuildContext context) => NexoSurface(
    variant: NexoSurfaceVariant.elevated,
    child: Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Venta actual',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Expanded(
            child: c.cart.lines.isEmpty
                ? const NexoEmptyState(
                    title: 'Agrega productos',
                    description: 'Selecciona un producto o escanea su código.',
                    size: NexoEmptyStateSize.inline,
                  )
                : ListView(
                    children: c.cart.lines
                        .map(
                          (line) => NexoListTile(
                            title: line.product.name,
                            subtitle:
                                '${line.quantity} × ${_money(line.product.price)}',
                            trailing: Text(_money(line.subtotal)),
                            onTap: () => c.cart.setQuantity(
                              line.product.variantId,
                              line.quantity + 1,
                            ),
                          ),
                        )
                        .toList(),
                  ),
          ),
          const Divider(),
          NexoNumericDisplay(
            formattedValue: _money(c.cart.total),
            semanticValue: 'Total ${_money(c.cart.total)}',
            large: true,
          ),
          const SizedBox(height: 16),
          NexoButton(
            key: const Key('checkout-button'),
            label: 'Cobrar',
            onPressed: c.cart.lines.isEmpty
                ? null
                : () => showNexoDialog<void>(
                    context: context,
                    builder: (_) => _Checkout(c: c),
                  ),
          ),
        ],
      ),
    ),
  );
}

class _Checkout extends StatefulWidget {
  const _Checkout({required this.c});
  final PosController c;
  @override
  State<_Checkout> createState() => _CheckoutState();
}

class _CheckoutState extends State<_Checkout> {
  late final TextEditingController amount = TextEditingController(
    text: widget.c.cart.total.wireMinor,
  );
  final reference = TextEditingController();
  bool external = false;
  bool externalApproved = false;
  String externalMethod = 'CARD_EXTERNAL';
  @override
  void initState() {
    super.initState();
    widget.c.addListener(_refresh);
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    widget.c.removeListener(_refresh);
    amount.dispose();
    reference.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => NexoDialog(
    title: external ? 'Pago externo' : 'Cobro en efectivo',
    description:
        'El backend validará importes y finalizará con una llave idempotente estable.',
    content: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        NexoNumericDisplay(
          formattedValue: _money(widget.c.cart.total),
          semanticValue: 'Total ${_money(widget.c.cart.total)}',
          large: true,
        ),
        const SizedBox(height: 16),
        NexoSegmentedControl<bool>(
          options: const [false, true],
          labelOf: (value) => value ? 'Externo' : 'Efectivo',
          selected: {external},
          onSelectionChanged: (values) =>
              setState(() => external = values.first),
        ),
        const SizedBox(height: 16),
        if (!external)
          NexoTextField(
            label: 'Monto recibido en centavos',
            controller: amount,
            keyboardType: TextInputType.number,
          )
        else ...[
          const NexoInlineNotice(
            tone: NexoTone.warning,
            title: 'Confirmación externa requerida',
            body:
                'El pago debe estar aprobado en el proveedor externo antes de confirmarlo en NEXO.',
          ),
          const SizedBox(height: 12),
          NexoSelect<String>(
            label: 'Medio externo',
            value: externalMethod,
            items: const ['CARD_EXTERNAL', 'BANK_TRANSFER', 'OTHER'],
            itemLabel: (value) => switch (value) {
              'CARD_EXTERNAL' => 'Terminal bancaria externa',
              'BANK_TRANSFER' => 'Transferencia',
              _ => 'Otro medio autorizado',
            },
            onChanged: (value) =>
                setState(() => externalMethod = value ?? externalMethod),
          ),
          NexoTextField(label: 'Referencia no sensible', controller: reference),
          NexoCheckbox(
            value: externalApproved,
            label: 'Confirmo que el proveedor externo aprobó el pago',
            onChanged: (value) =>
                setState(() => externalApproved = value ?? false),
          ),
        ],
        if (widget.c.failure != null)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: NexoInlineNotice(
              tone: NexoTone.danger,
              title: 'No se completó',
              body: widget.c.failure!.safeMessage,
            ),
          ),
        if (widget.c.checkout == CheckoutStatus.completed) ...[
          const SizedBox(height: 12),
          NexoInlineNotice(
            tone: NexoTone.success,
            title: 'Venta completada',
            body:
                'Recibo ${widget.c.receiptId ?? 'autoritativo'} disponible. La impresión es independiente de la venta.',
          ),
        ],
      ],
    ),
    actions: [
      NexoButton(
        label: 'Cancelar',
        variant: NexoButtonVariant.ghost,
        onPressed: () => Navigator.pop(context),
      ),
      NexoButton(
        key: const Key('confirm-payment'),
        label: widget.c.checkout == CheckoutStatus.completed
            ? 'Imprimir copia'
            : 'Confirmar cobro',
        loading: widget.c.checkout == CheckoutStatus.processingPayment,
        onPressed: () async {
          if (widget.c.checkout == CheckoutStatus.completed) {
            await widget.c.printReceipt();
          } else if (external) {
            await widget.c.finalizeExternal(
              method: externalMethod,
              reference: reference.text,
              explicitlyConfirmed: externalApproved,
            );
          } else {
            await widget.c.finalizeCash(Money(int.tryParse(amount.text) ?? 0));
          }
          if (!context.mounted) return;
          _showPremiumToast(
            context,
            title: widget.c.failure == null
                ? 'Operación completada'
                : 'No pudimos completar la operación',
            body:
                widget.c.failure?.safeMessage ??
                'La venta y su recibo quedaron actualizados.',
            tone: widget.c.failure == null ? NexoTone.success : NexoTone.danger,
          );
        },
      ),
    ],
  );
}

void _showPremiumToast(
  BuildContext context, {
  required String title,
  required String body,
  required NexoTone tone,
}) {
  final messenger = ScaffoldMessenger.of(context);
  messenger
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: Colors.transparent,
        elevation: 0,
        content: NexoToast(
          tone: tone,
          message: '$title\n$body',
          action: IconButton(
            tooltip: 'Cerrar notificación',
            onPressed: messenger.hideCurrentSnackBar,
            icon: const Icon(Icons.close, size: 20),
          ),
        ),
      ),
    );
}

class _Compact extends StatelessWidget {
  const _Compact({
    required this.c,
    required this.search,
    required this.fixture,
  });
  final PosController c;
  final TextEditingController search;
  final bool fixture;
  @override
  Widget build(BuildContext context) => Stack(
    children: [
      _Catalog(c: c, search: search, fixture: fixture),
      Positioned(
        right: 16,
        bottom: 16,
        child: NexoButton(
          label: 'Carrito · ${_money(c.cart.total)}',
          variant: NexoButtonVariant.floating,
          onPressed: () => showNexoSheet<void>(
            context: context,
            title: 'Venta actual',
            child: SizedBox(height: 560, child: _Cart(c: c)),
          ),
        ),
      ),
    ],
  );
}

String _money(Money value) => NumberFormat.simpleCurrency(
  locale: 'es_MX',
  name: value.currency,
).format(value.minor / 100);
