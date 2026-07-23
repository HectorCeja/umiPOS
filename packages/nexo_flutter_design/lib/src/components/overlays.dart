import 'package:flutter/material.dart';

import '../states/nexo_states.dart';
import '../theme/nexo_theme.dart';
import 'controls.dart';
import 'primitives.dart';

enum NexoDialogSize { compact, standard, large }

class NexoDialog extends StatelessWidget {
  const NexoDialog({
    required this.title,
    required this.content,
    this.description,
    this.actions = const [],
    this.size = NexoDialogSize.standard,
    this.critical = false,
    this.loading = false,
    super.key,
  });

  final String title;
  final String? description;
  final Widget content;
  final List<Widget> actions;
  final NexoDialogSize size;
  final bool critical;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final maxWidth = switch (size) {
      NexoDialogSize.compact => 440.0,
      NexoDialogSize.standard => 600.0,
      NexoDialogSize.large => 840.0,
    };
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(24),
      child: NexoSurface(
        variant: NexoSurfaceVariant.modal,
        semanticLabel: title,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: maxWidth,
            maxHeight: MediaQuery.sizeOf(context).height - 48,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 22, 16, 14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: Theme.of(context).textTheme.titleLarge
                                ?.copyWith(
                                  color: critical
                                      ? NexoStates.resolve(
                                          NexoSemanticState.danger,
                                        ).foreground
                                      : null,
                                ),
                          ),
                          if (description != null) ...[
                            const SizedBox(height: 6),
                            Text(
                              description!,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ],
                      ),
                    ),
                    NexoIconButton(
                      icon: Icons.close,
                      label: 'Cerrar',
                      onPressed: loading
                          ? null
                          : () => Navigator.maybePop(context),
                      variant: NexoIconButtonVariant.subtle,
                    ),
                  ],
                ),
              ),
              const NexoDivider(),
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: content,
                ),
              ),
              if (actions.isNotEmpty) ...[
                const NexoDivider(),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Wrap(
                    alignment: WrapAlignment.end,
                    spacing: 12,
                    runSpacing: 10,
                    children: actions,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

Future<T?> showNexoDialog<T>({
  required BuildContext context,
  required WidgetBuilder builder,
  bool dismissible = true,
}) => showDialog<T>(
  context: context,
  barrierDismissible: dismissible,
  barrierLabel: 'Cerrar diálogo',
  builder: builder,
);

enum NexoSheetPlacement { adaptive, side, bottom }

class NexoSheet extends StatelessWidget {
  const NexoSheet({
    required this.child,
    this.title,
    this.placement = NexoSheetPlacement.adaptive,
    super.key,
  });
  final Widget child;
  final String? title;
  final NexoSheetPlacement placement;

  @override
  Widget build(BuildContext context) {
    final side =
        placement == NexoSheetPlacement.side ||
        (placement == NexoSheetPlacement.adaptive &&
            MediaQuery.sizeOf(context).width >= 768);
    return SafeArea(
      child: Align(
        alignment: side ? Alignment.centerRight : Alignment.bottomCenter,
        child: NexoSurface(
          variant: NexoSurfaceVariant.modal,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(context.nexoMetrics.radius[4]),
            topRight: side
                ? Radius.zero
                : Radius.circular(context.nexoMetrics.radius[4]),
            bottomLeft: side
                ? Radius.circular(context.nexoMetrics.radius[4])
                : Radius.zero,
          ),
          child: SizedBox(
            width: side ? 420 : double.infinity,
            height: side ? double.infinity : null,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (title != null)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 14, 10, 10),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            title!,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                        ),
                        NexoIconButton(
                          icon: Icons.close,
                          label: 'Cerrar',
                          onPressed: () => Navigator.maybePop(context),
                          variant: NexoIconButtonVariant.subtle,
                        ),
                      ],
                    ),
                  ),
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: child,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

Future<T?> showNexoSheet<T>({
  required BuildContext context,
  required Widget child,
  String? title,
  NexoSheetPlacement placement = NexoSheetPlacement.adaptive,
}) {
  final side =
      placement == NexoSheetPlacement.side ||
      (placement == NexoSheetPlacement.adaptive &&
          MediaQuery.sizeOf(context).width >= 768);
  if (!side) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => NexoSheet(
        title: title,
        placement: NexoSheetPlacement.bottom,
        child: child,
      ),
    );
  }
  return showGeneralDialog<T>(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Cerrar panel',
    transitionDuration: MediaQuery.disableAnimationsOf(context)
        ? Duration.zero
        : context.nexoMotion.standard,
    pageBuilder: (_, _, _) => NexoSheet(
      title: title,
      placement: NexoSheetPlacement.side,
      child: child,
    ),
    transitionBuilder: (_, animation, _, content) =>
        FadeTransition(opacity: animation, child: content),
  );
}

class NexoMenuItem<T> {
  const NexoMenuItem({
    required this.value,
    required this.label,
    this.icon,
    this.enabled = true,
    this.destructive = false,
    this.shortcut,
  });
  final T value;
  final String label;
  final IconData? icon;
  final bool enabled;
  final bool destructive;
  final String? shortcut;
}

class NexoPopoverMenu<T> extends StatelessWidget {
  const NexoPopoverMenu({
    required this.anchor,
    required this.items,
    required this.onSelected,
    this.tooltip,
    super.key,
  });
  final Widget anchor;
  final List<NexoMenuItem<T>> items;
  final ValueChanged<T> onSelected;
  final String? tooltip;

  @override
  Widget build(BuildContext context) => MenuAnchor(
    crossAxisUnconstrained: false,
    style: MenuStyle(
      backgroundColor: WidgetStatePropertyAll(context.nexoColors.surfaceRaised),
      side: WidgetStatePropertyAll(
        BorderSide(color: context.nexoColors.borderStrong),
      ),
      shape: WidgetStatePropertyAll(
        RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.nexoMetrics.radius[2]),
        ),
      ),
      padding: const WidgetStatePropertyAll(EdgeInsets.all(6)),
    ),
    menuChildren: items
        .map(
          (item) => MenuItemButton(
            onPressed: item.enabled ? () => onSelected(item.value) : null,
            autofocus: identical(item, items.first),
            leadingIcon: item.icon == null ? null : Icon(item.icon),
            trailingIcon: item.shortcut == null
                ? null
                : Text(
                    item.shortcut!,
                    style: Theme.of(context).textTheme.labelSmall,
                  ),
            style: item.destructive
                ? ButtonStyle(
                    foregroundColor: WidgetStatePropertyAll(
                      NexoStates.resolve(NexoSemanticState.danger).foreground,
                    ),
                  )
                : null,
            child: Text(item.label),
          ),
        )
        .toList(),
    builder: (context, controller, child) => NexoTooltip(
      message: tooltip ?? 'Abrir menú',
      child: Semantics(
        button: true,
        expanded: controller.isOpen,
        child: InkWell(
          borderRadius: BorderRadius.circular(context.nexoMetrics.radius[2]),
          onTap: controller.isOpen ? controller.close : controller.open,
          child: child,
        ),
      ),
    ),
    child: anchor,
  );
}
