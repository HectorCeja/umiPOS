import 'package:flutter/material.dart';

import '../adaptive/nexo_adaptive.dart';
import '../tokens/generated/nexo_tokens.g.dart';
import 'controls.dart';
import 'feedback.dart';
import 'primitives.dart';

class NexoTabItem {
  const NexoTabItem({required this.label, this.icon, this.badge});
  final String label;
  final IconData? icon;
  final String? badge;
}

class NexoTabs extends StatelessWidget {
  const NexoTabs({
    required this.items,
    required this.index,
    required this.onChanged,
    this.compact = false,
    super.key,
  }) : assert(items.length > 0);
  final List<NexoTabItem> items;
  final int index;
  final ValueChanged<int> onChanged;
  final bool compact;

  @override
  Widget build(BuildContext context) => DefaultTabController(
    length: items.length,
    initialIndex: index,
    child: TabBar(
      isScrollable: compact || items.length > 4,
      onTap: onChanged,
      tabs: items
          .map(
            (item) => Tab(
              icon: item.icon == null ? null : Icon(item.icon),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(item.label),
                  if (item.badge != null) ...[
                    const SizedBox(width: 7),
                    NexoBadge(label: item.badge!, compact: true),
                  ],
                ],
              ),
            ),
          )
          .toList(),
    ),
  );
}

class NexoToolbar extends StatelessWidget {
  const NexoToolbar({
    this.title,
    this.search,
    this.filters = const [],
    this.actions = const [],
    this.leading,
    this.selectionLabel,
    this.compact = false,
    super.key,
  });
  final String? title;
  final Widget? search;
  final List<Widget> filters;
  final List<Widget> actions;
  final Widget? leading;
  final String? selectionLabel;
  final bool compact;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final stacked = constraints.maxWidth < NexoBreakpoints.tablet;
      final heading = selectionLabel ?? title;
      final controls = <Widget>[
        if (search != null) search!,
        ...filters,
        ...actions,
      ];
      return Semantics(
        container: true,
        label: heading == null
            ? 'Barra de herramientas'
            : 'Barra de herramientas: $heading',
        child: NexoSurface(
          variant: NexoSurfaceVariant.muted,
          padding: EdgeInsets.all(compact ? 12 : 16),
          child: stacked
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (heading != null || leading != null)
                      Row(
                        children: [
                          if (leading != null) ...[
                            leading!,
                            const SizedBox(width: 10),
                          ],
                          if (heading != null)
                            Expanded(
                              child: Text(
                                heading,
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ),
                        ],
                      ),
                    if (controls.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Wrap(spacing: 10, runSpacing: 10, children: controls),
                    ],
                  ],
                )
              : Row(
                  children: [
                    if (leading != null) ...[
                      leading!,
                      const SizedBox(width: 10),
                    ],
                    if (heading != null) ...[
                      Text(
                        heading,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(width: 18),
                    ],
                    if (search != null)
                      Expanded(child: search!)
                    else
                      const Spacer(),
                    if (filters.isNotEmpty) ...[
                      const SizedBox(width: 12),
                      ...filters.expand(
                        (item) => [item, const SizedBox(width: 8)],
                      ),
                    ],
                    ...actions.expand(
                      (item) => [const SizedBox(width: 8), item],
                    ),
                  ],
                ),
        ),
      );
    },
  );
}

enum NexoPageHeaderVariant { operational, compact }

class NexoPageHeader extends StatelessWidget {
  const NexoPageHeader({
    required this.title,
    this.eyebrow,
    this.subtitle,
    this.status,
    this.actions = const [],
    this.variant = NexoPageHeaderVariant.operational,
    this.editorialSlot,
    super.key,
  });
  final String title;
  final String? eyebrow, subtitle;
  final Widget? status, editorialSlot;
  final List<Widget> actions;
  final NexoPageHeaderVariant variant;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final stacked = constraints.maxWidth < NexoBreakpoints.tablet;
      final text = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (eyebrow != null)
            Text(
              eyebrow!.toUpperCase(),
              style: Theme.of(
                context,
              ).textTheme.labelSmall?.copyWith(color: NexoV1Colors.cyan),
            ),
          if (eyebrow != null) const SizedBox(height: 7),
          Row(
            children: [
              Flexible(
                child: Text(
                  title,
                  style: variant == NexoPageHeaderVariant.compact
                      ? Theme.of(context).textTheme.headlineSmall
                      : Theme.of(context).textTheme.headlineMedium,
                ),
              ),
              if (status != null) ...[const SizedBox(width: 12), status!],
            ],
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 8),
            Text(subtitle!, style: Theme.of(context).textTheme.bodyLarge),
          ],
          if (editorialSlot != null) ...[
            const SizedBox(height: 16),
            editorialSlot!,
          ],
        ],
      );
      if (stacked || actions.isEmpty) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            text,
            if (actions.isNotEmpty) ...[
              const SizedBox(height: 16),
              Wrap(spacing: 10, runSpacing: 10, children: actions),
            ],
          ],
        );
      }
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: text),
          const SizedBox(width: 24),
          Wrap(spacing: 10, runSpacing: 10, children: actions),
        ],
      );
    },
  );
}

class NexoFormSection extends StatelessWidget {
  const NexoFormSection({
    required this.title,
    required this.fields,
    this.description,
    this.actions = const [],
    this.errorSummary,
    this.loading = false,
    this.disabled = false,
    this.columns = 1,
    super.key,
  });
  final String title;
  final String? description, errorSummary;
  final List<Widget> fields, actions;
  final bool loading, disabled;
  final int columns;

  @override
  Widget build(BuildContext context) => Semantics(
    container: true,
    label: title,
    enabled: !disabled,
    child: NexoSurface(
      variant: NexoSurfaceVariant.standard,
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          if (description != null) ...[
            const SizedBox(height: 6),
            Text(description!, style: Theme.of(context).textTheme.bodyMedium),
          ],
          if (errorSummary != null) ...[
            const SizedBox(height: 14),
            NexoInlineNotice(
              tone: NexoTone.danger,
              title: 'Revisa los campos',
              body: errorSummary,
            ),
          ],
          const SizedBox(height: 20),
          if (loading)
            const NexoSkeleton(width: double.infinity, height: 120)
          else
            LayoutBuilder(
              builder: (context, constraints) {
                final count = constraints.maxWidth >= NexoBreakpoints.tablet
                    ? columns.clamp(1, 2)
                    : 1;
                if (count == 1) {
                  return Column(
                    children: fields
                        .expand((field) => [field, const SizedBox(height: 16)])
                        .toList(),
                  );
                }
                return Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: fields
                      .map(
                        (field) => SizedBox(
                          width: (constraints.maxWidth - 16) / 2,
                          child: field,
                        ),
                      )
                      .toList(),
                );
              },
            ),
          if (actions.isNotEmpty) ...[
            const SizedBox(height: 20),
            Wrap(
              alignment: WrapAlignment.end,
              spacing: 10,
              runSpacing: 10,
              children: actions,
            ),
          ],
        ],
      ),
    ),
  );
}

class NexoFieldGroup extends StatelessWidget {
  const NexoFieldGroup({
    required this.children,
    this.label,
    this.compact = false,
    super.key,
  }) : assert(children.length > 0);
  final List<Widget> children;
  final String? label;
  final bool compact;
  @override
  Widget build(BuildContext context) => Semantics(
    container: true,
    label: label,
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children:
          children
              .expand(
                (child) => [
                  Expanded(child: child),
                  SizedBox(width: compact ? 8 : 12),
                ],
              )
              .toList()
            ..removeLast(),
    ),
  );
}
