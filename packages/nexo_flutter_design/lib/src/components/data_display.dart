import 'package:flutter/material.dart';

import '../theme/nexo_theme.dart';
import '../tokens/generated/nexo_tokens.g.dart';
import 'controls.dart';
import 'feedback.dart';
import 'primitives.dart';

enum NexoCardVariant {
  content,
  interactive,
  kpi,
  status,
  product,
  insight,
  empty,
  chart,
}

class NexoCard extends StatelessWidget {
  const NexoCard({
    required this.body,
    this.header,
    this.footer,
    this.actions,
    this.variant = NexoCardVariant.content,
    this.selected = false,
    this.loading = false,
    this.disabled = false,
    this.onTap,
    this.semanticLabel,
    super.key,
  });
  final Widget body;
  final Widget? header, footer, actions;
  final NexoCardVariant variant;
  final bool selected, loading, disabled;
  final VoidCallback? onTap;
  final String? semanticLabel;
  @override
  Widget build(BuildContext context) {
    final interactive = onTap != null && !disabled;
    final content = Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (header != null || actions != null)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (header != null) Expanded(child: header!),
                if (actions != null) actions!,
              ],
            ),
          if (header != null || actions != null) const SizedBox(height: 16),
          if (loading)
            const NexoSkeleton(width: double.infinity, height: 72)
          else
            body,
          if (footer != null) ...[const SizedBox(height: 18), footer!],
        ],
      ),
    );
    return Semantics(
      container: true,
      button: interactive,
      enabled: !disabled,
      selected: selected,
      label: semanticLabel,
      child: Opacity(
        opacity: disabled ? .55 : 1,
        child: NexoSurface(
          variant: selected
              ? NexoSurfaceVariant.selected
              : (variant == NexoCardVariant.interactive || interactive
                    ? NexoSurfaceVariant.interactive
                    : NexoSurfaceVariant.standard),
          child: interactive
              ? InkWell(
                  onTap: onTap,
                  canRequestFocus: true,
                  mouseCursor: SystemMouseCursors.click,
                  borderRadius: BorderRadius.circular(
                    context.nexoMetrics.radius[3],
                  ),
                  child: content,
                )
              : content,
        ),
      ),
    );
  }
}

enum NexoTrendDirection { positive, negative, neutral }

class NexoKpiCard extends StatelessWidget {
  const NexoKpiCard({
    required this.label,
    this.value,
    this.detail,
    this.trendLabel,
    this.trend = NexoTrendDirection.neutral,
    this.icon,
    this.loading = false,
    this.error,
    this.empty = false,
    super.key,
  });
  final String label;
  final String? value, detail, trendLabel, error;
  final NexoTrendDirection trend;
  final IconData? icon;
  final bool loading, empty;
  @override
  Widget build(BuildContext context) {
    final announced = [
      label,
      value,
      trendLabel,
      detail,
      error,
    ].whereType<String>().join('. ');
    return NexoCard(
      variant: NexoCardVariant.kpi,
      loading: loading,
      semanticLabel: announced,
      header: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, color: NexoV1Colors.cyan),
            const SizedBox(width: 8),
          ],
          Text(label, style: Theme.of(context).textTheme.labelLarge),
        ],
      ),
      body: error != null
          ? NexoInlineNotice(tone: NexoTone.danger, title: error!)
          : empty
          ? Text('—', style: Theme.of(context).textTheme.headlineMedium)
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value ?? '—',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontFeatures: const [FontFeature.tabularFigures()],
                  ),
                ),
                if (trendLabel != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        trend == NexoTrendDirection.positive
                            ? Icons.trending_up
                            : trend == NexoTrendDirection.negative
                            ? Icons.trending_down
                            : Icons.trending_flat,
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Text(trendLabel!),
                    ],
                  ),
                ],
                if (detail != null) ...[
                  const SizedBox(height: 6),
                  Text(detail!, style: Theme.of(context).textTheme.bodyMedium),
                ],
              ],
            ),
    );
  }
}

class NexoProductTile extends StatelessWidget {
  const NexoProductTile({
    required this.name,
    required this.price,
    this.image,
    this.secondaryLabel,
    this.status,
    this.badge,
    this.selected = false,
    this.disabled = false,
    this.unavailable = false,
    this.loading = false,
    this.onTap,
    super.key,
  });
  final String name, price;
  final ImageProvider? image;
  final String? secondaryLabel, status, badge;
  final bool selected, disabled, unavailable, loading;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) => NexoCard(
    variant: NexoCardVariant.product,
    selected: selected,
    disabled: disabled || unavailable,
    loading: loading,
    onTap: onTap,
    semanticLabel:
        '$name. $price${status == null ? '' : '. $status'}${unavailable ? '. No disponible' : ''}',
    body: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AspectRatio(
          aspectRatio: 4 / 3,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: context.nexoColors.canvasDeep,
              borderRadius: BorderRadius.circular(
                context.nexoMetrics.radius[2],
              ),
              image: image == null
                  ? null
                  : DecorationImage(image: image!, fit: BoxFit.cover),
            ),
            child: image == null
                ? const Center(
                    child: Icon(
                      Icons.inventory_2_outlined,
                      size: 34,
                      color: NexoV1Colors.faint,
                    ),
                  )
                : null,
          ),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: Text(
                name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            if (badge != null) NexoBadge(label: badge!, tone: NexoTone.info),
          ],
        ),
        if (secondaryLabel != null) ...[
          const SizedBox(height: 4),
          Text(secondaryLabel!, style: Theme.of(context).textTheme.bodyMedium),
        ],
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Text(
              price,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
            if (status != null)
              NexoBadge(
                label: status!,
                tone: unavailable ? NexoTone.restricted : NexoTone.success,
              ),
          ],
        ),
      ],
    ),
  );
}

class NexoListTile extends StatelessWidget {
  const NexoListTile({
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.status,
    this.onTap,
    this.selected = false,
    this.disabled = false,
    this.destructive = false,
    this.dense = false,
    super.key,
  });
  final String title;
  final String? subtitle, status;
  final Widget? leading, trailing;
  final VoidCallback? onTap;
  final bool selected, disabled, destructive, dense;
  @override
  Widget build(BuildContext context) => Semantics(
    button: onTap != null,
    selected: selected,
    enabled: !disabled,
    child: Material(
      type: MaterialType.transparency,
      child: ListTile(
        leading: leading,
        trailing:
            trailing ?? (status == null ? null : NexoBadge(label: status!)),
        title: Text(
          title,
          style: destructive ? TextStyle(color: NexoV1Colors.danger) : null,
        ),
        subtitle: subtitle == null ? null : Text(subtitle!),
        selected: selected,
        enabled: !disabled,
        dense: dense,
        onTap: disabled ? null : onTap,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.nexoMetrics.radius[2]),
        ),
        selectedTileColor: context.nexoColors.surfaceInteractive,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
    ),
  );
}

enum NexoAvatarSize { small, medium, large }

class NexoAvatar extends StatelessWidget {
  const NexoAvatar({
    required this.label,
    this.image,
    this.initials,
    this.status,
    this.size = NexoAvatarSize.medium,
    this.loading = false,
    super.key,
  });
  final String label;
  final ImageProvider? image;
  final String? initials;
  final NexoStatus? status;
  final NexoAvatarSize size;
  final bool loading;
  @override
  Widget build(BuildContext context) {
    final extent = switch (size) {
      NexoAvatarSize.small => 32.0,
      NexoAvatarSize.medium => 44.0,
      NexoAvatarSize.large => 64.0,
    };
    return Semantics(
      image: true,
      label: label,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          if (loading)
            NexoSkeleton(width: extent, height: extent, radius: extent / 2)
          else
            CircleAvatar(
              radius: extent / 2,
              foregroundImage: image,
              backgroundColor: context.nexoColors.surfaceInteractive,
              child: image == null
                  ? Text(initials ?? label.characters.first.toUpperCase())
                  : null,
            ),
          if (status != null)
            Positioned(
              right: -2,
              bottom: -2,
              child: NexoStatusIndicator(status: status!, label: status!.name),
            ),
        ],
      ),
    );
  }
}

enum NexoNumericTone { neutral, positive, negative }

class NexoNumericDisplay extends StatelessWidget {
  const NexoNumericDisplay({
    required this.formattedValue,
    required this.semanticValue,
    this.tone = NexoNumericTone.neutral,
    this.large = false,
    super.key,
  });
  final String formattedValue, semanticValue;
  final NexoNumericTone tone;
  final bool large;
  @override
  Widget build(BuildContext context) => Semantics(
    label: semanticValue,
    child: ExcludeSemantics(
      child: Text(
        formattedValue,
        style:
            (large
                    ? Theme.of(context).textTheme.headlineMedium
                    : Theme.of(context).textTheme.titleMedium)
                ?.copyWith(
                  fontFeatures: const [FontFeature.tabularFigures()],
                  color: tone == NexoNumericTone.positive
                      ? NexoV1Colors.mint
                      : tone == NexoNumericTone.negative
                      ? NexoV1Colors.danger
                      : NexoV1Colors.text,
                ),
      ),
    ),
  );
}

class NexoTableColumn<T> {
  const NexoTableColumn({
    required this.label,
    required this.cell,
    this.numeric = false,
    this.width,
  });
  final String label;
  final Widget Function(T) cell;
  final bool numeric;
  final double? width;
}

class NexoTable<T> extends StatelessWidget {
  const NexoTable({
    required this.caption,
    required this.columns,
    required this.rows,
    this.selectedRows = const {},
    this.onRowTap,
    this.loading = false,
    this.error,
    this.empty,
    this.compact = false,
    this.sortColumn,
    this.sortAscending = true,
    this.onSort,
    super.key,
  });
  final String caption;
  final List<NexoTableColumn<T>> columns;
  final List<T> rows;
  final Set<int> selectedRows;
  final ValueChanged<int>? onRowTap;
  final bool loading, compact, sortAscending;
  final String? error, sortColumn;
  final Widget? empty;
  final void Function(String, bool)? onSort;
  @override
  Widget build(BuildContext context) {
    if (loading) return const NexoSkeleton(width: double.infinity, height: 180);
    if (error != null) {
      return NexoInlineNotice(tone: NexoTone.danger, title: error!);
    }
    if (rows.isEmpty) {
      return empty ??
          NexoEmptyState(
            title: 'Sin resultados',
            description: caption,
            size: NexoEmptyStateSize.inline,
          );
    }
    final rowHeight = compact ? 40.0 : 48.0;
    return Semantics(
      container: true,
      label: caption,
      child: FocusTraversalGroup(
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: ConstrainedBox(
            constraints: const BoxConstraints(minWidth: 640),
            child: Table(
              defaultVerticalAlignment: TableCellVerticalAlignment.middle,
              border: TableBorder(
                horizontalInside: BorderSide(
                  color: context.nexoColors.borderSubtle,
                ),
              ),
              children: [
                TableRow(
                  decoration: BoxDecoration(
                    color: context.nexoColors.canvasDeep,
                  ),
                  children: columns.map((column) {
                    return InkWell(
                      onTap: onSort == null
                          ? null
                          : () => onSort!(
                              column.label,
                              sortColumn == column.label
                                  ? !sortAscending
                                  : true,
                            ),
                      child: SizedBox(
                        height: rowHeight,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          child: Align(
                            alignment: column.numeric
                                ? Alignment.centerRight
                                : Alignment.centerLeft,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  column.label,
                                  style: Theme.of(context).textTheme.labelLarge,
                                ),
                                if (sortColumn == column.label)
                                  Icon(
                                    sortAscending
                                        ? Icons.arrow_upward
                                        : Icons.arrow_downward,
                                    size: 14,
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                for (var index = 0; index < rows.length; index++)
                  TableRow(
                    decoration: BoxDecoration(
                      color: selectedRows.contains(index)
                          ? context.nexoColors.surfaceInteractive
                          : Colors.transparent,
                    ),
                    children: columns.map((column) {
                      return InkWell(
                        autofocus:
                            index == 0 && identical(column, columns.first),
                        onTap: onRowTap == null ? null : () => onRowTap!(index),
                        child: SizedBox(
                          height: rowHeight,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            child: Align(
                              alignment: column.numeric
                                  ? Alignment.centerRight
                                  : Alignment.centerLeft,
                              child: column.cell(rows[index]),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class NexoPagination extends StatelessWidget {
  const NexoPagination({
    required this.page,
    required this.pageCount,
    this.onPrevious,
    this.onNext,
    this.loading = false,
    this.compact = false,
    super.key,
  });
  final int page, pageCount;
  final VoidCallback? onPrevious, onNext;
  final bool loading, compact;
  @override
  Widget build(BuildContext context) => Semantics(
    container: true,
    label: 'Página $page de $pageCount',
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        NexoIconButton(
          icon: Icons.chevron_left,
          label: 'Página anterior',
          onPressed: page > 1 && !loading ? onPrevious : null,
        ),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: compact ? 8 : 14),
          child: loading
              ? const NexoSpinner(size: 16)
              : Text('$page / $pageCount'),
        ),
        NexoIconButton(
          icon: Icons.chevron_right,
          label: 'Página siguiente',
          onPressed: page < pageCount && !loading ? onNext : null,
        ),
      ],
    ),
  );
}
