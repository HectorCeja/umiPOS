import 'package:flutter/material.dart';
import 'package:nexo_flutter_design/nexo_flutter_design.dart';

void main() => runApp(const ComponentShowcase());

class ComponentShowcase extends StatelessWidget {
  const ComponentShowcase({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'NEXO Flutter Component Library',
    debugShowCheckedModeBanner: false,
    theme: NexoTheme.dark(),
    home: const _ShowcasePage(),
  );
}

class _ShowcasePage extends StatelessWidget {
  const _ShowcasePage();
  @override
  Widget build(BuildContext context) {
    final sceneName = Uri.base.queryParameters['scene'];
    final scene =
        NexoLivingSceneVariant.values
            .where((item) => item.name == sceneName)
            .firstOrNull ??
        NexoLivingSceneVariant.home;
    final qualityName = Uri.base.queryParameters['quality'];
    final quality =
        NexoQualityMode.values
            .where((item) => item.name == qualityName)
            .firstOrNull ??
        NexoQualityMode.balanced;
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 520,
                child: NexoLivingScene(
                  variant: scene,
                  quality: quality,
                  child: const Padding(
                    padding: EdgeInsets.all(32),
                    child: NexoPageHeader(
                      eyebrow: 'Flutter Design Parity · Part 3',
                      title: 'LivingScene and Motion',
                      subtitle:
                          'Fixture visual: artwork, auroras, masks y quality modes.',
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const NexoPageHeader(
                eyebrow: 'Flutter Design Parity · Part 2',
                title: 'Component Library',
                subtitle:
                    'Showcase foundation · fixtures visuales no productivos',
              ),
              const SizedBox(height: 28),
              const _Section(
                title: 'Buttons and states',
                child: Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    NexoButton(label: 'Primary'),
                    NexoButton(
                      label: 'Secondary',
                      variant: NexoButtonVariant.secondary,
                    ),
                    NexoButton(
                      label: 'Danger',
                      variant: NexoButtonVariant.danger,
                    ),
                    NexoButton(label: 'Loading', loading: true),
                    NexoIconButton(icon: Icons.settings, label: 'Configurar'),
                  ],
                ),
              ),
              const _Section(
                title: 'Inputs and selection',
                child: Column(
                  children: [
                    NexoTextField(label: 'Nombre del producto'),
                    SizedBox(height: 12),
                    NexoSearchField(label: 'Buscar'),
                    NexoCheckbox(value: true, label: 'Inventariable'),
                    NexoSwitch(value: true, label: 'Disponible'),
                  ],
                ),
              ),
              _Section(
                title: 'Surfaces, states and cards',
                child: Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: const [
                    SizedBox(
                      width: 280,
                      child: NexoKpiCard(
                        label: 'Venta neta',
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
                    SizedBox(
                      width: 280,
                      child: NexoInlineNotice(
                        tone: NexoTone.offline,
                        title: 'Sin conexión',
                        body: 'Estado visual de foundation.',
                      ),
                    ),
                  ],
                ),
              ),
              const _Section(
                title: 'Empty and loading',
                child: NexoEmptyState(
                  title: 'Sin resultados',
                  description: 'Ajusta los filtros para continuar.',
                  size: NexoEmptyStateSize.inline,
                ),
              ),
              _Section(
                title: 'Dialogs, sheets and menus',
                child: Builder(
                  builder: (context) => Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      NexoButton(
                        label: 'Abrir diálogo',
                        onPressed: () => showNexoDialog<void>(
                          context: context,
                          builder: (_) => const NexoDialog(
                            title: 'Confirmar acción',
                            content: Text('Contenido visual de prueba.'),
                          ),
                        ),
                      ),
                      NexoButton(
                        label: 'Abrir panel',
                        variant: NexoButtonVariant.secondary,
                        onPressed: () => showNexoSheet<void>(
                          context: context,
                          title: 'Filtros',
                          child: const Text('Panel adaptable.'),
                        ),
                      ),
                      NexoPopoverMenu<String>(
                        anchor: const Padding(
                          padding: EdgeInsets.all(12),
                          child: Text('Abrir menú'),
                        ),
                        items: const [
                          NexoMenuItem(value: 'edit', label: 'Editar'),
                          NexoMenuItem(
                            value: 'delete',
                            label: 'Eliminar',
                            destructive: true,
                          ),
                        ],
                        onSelected: (_) {},
                      ),
                    ],
                  ),
                ),
              ),
              _Section(
                title: 'Table and toolbar',
                child: Column(
                  children: [
                    const NexoToolbar(
                      title: 'Catálogo',
                      search: NexoSearchField(label: 'Buscar'),
                      actions: [NexoButton(label: 'Crear producto')],
                    ),
                    const SizedBox(height: 12),
                    NexoTable<String>(
                      caption: 'Productos de muestra',
                      columns: [
                        NexoTableColumn(label: 'Nombre', cell: Text.new),
                        NexoTableColumn(
                          label: 'Estado',
                          cell: (_) => const NexoBadge(
                            label: 'Disponible',
                            tone: NexoTone.success,
                          ),
                        ),
                      ],
                      rows: const ['Café', 'Té', 'Pan'],
                    ),
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

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});
  final String title;
  final Widget child;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 32),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 14),
        child,
      ],
    ),
  );
}
