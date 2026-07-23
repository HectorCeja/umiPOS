import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../states/nexo_states.dart';
import '../theme/nexo_theme.dart';
import '../tokens/generated/nexo_tokens.g.dart';
import 'feedback.dart';
import 'primitives.dart';

enum NexoButtonVariant {
  primary,
  secondary,
  tertiary,
  ghost,
  danger,
  icon,
  floating,
  command,
}

enum NexoIconButtonVariant { standard, subtle, surface, danger, selected }

enum NexoTextFieldKind {
  text,
  email,
  password,
  number,
  currency,
  search,
  multiline,
}

class NexoButton extends StatelessWidget {
  const NexoButton({
    required this.label,
    this.onPressed,
    this.variant = NexoButtonVariant.primary,
    this.size = NexoControlSize.medium,
    this.leading,
    this.trailing,
    this.loading = false,
    this.success = false,
    this.semanticLabel,
    this.autofocus = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final NexoButtonVariant variant;
  final NexoControlSize size;
  final Widget? leading;
  final Widget? trailing;
  final bool loading;
  final bool success;
  final String? semanticLabel;
  final bool autofocus;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !loading;
    final (background, foreground, border) = switch (variant) {
      NexoButtonVariant.primary => (
        NexoV1Colors.violet,
        NexoV1Colors.text,
        NexoV1Colors.violet,
      ),
      NexoButtonVariant.danger => (
        NexoV1Colors.danger,
        NexoV1Colors.canvas,
        NexoV1Colors.danger,
      ),
      NexoButtonVariant.secondary ||
      NexoButtonVariant.command ||
      NexoButtonVariant.floating => (
        context.nexoColors.surfaceRaised,
        NexoV1Colors.text,
        context.nexoColors.borderStrong,
      ),
      NexoButtonVariant.tertiary || NexoButtonVariant.icon => (
        context.nexoColors.surfaceInteractive,
        NexoV1Colors.text,
        context.nexoColors.borderSubtle,
      ),
      NexoButtonVariant.ghost => (
        Colors.transparent,
        NexoV1Colors.muted,
        Colors.transparent,
      ),
    };
    final child = Stack(
      alignment: Alignment.center,
      children: [
        Opacity(
          opacity: loading ? 0 : 1,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (success) ...[
                const Icon(Icons.check, size: 18),
                const SizedBox(width: 8),
              ] else if (leading != null) ...[
                leading!,
                const SizedBox(width: 8),
              ],
              Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
              if (trailing != null) ...[const SizedBox(width: 8), trailing!],
            ],
          ),
        ),
        if (loading) const NexoSpinner(size: 18, semanticLabel: 'Cargando'),
      ],
    );
    return Semantics(
      button: true,
      enabled: enabled,
      label: semanticLabel ?? label,
      value: loading ? 'Cargando' : (success ? 'Completado' : null),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          minHeight: 44,
          minWidth: variant == NexoButtonVariant.icon ? 44 : 0,
        ),
        child: TextButton(
          autofocus: autofocus,
          onPressed: enabled ? onPressed : null,
          style: ButtonStyle(
            minimumSize: WidgetStatePropertyAll(
              Size(
                variant == NexoButtonVariant.icon ? 44 : 0,
                size.visualHeight,
              ),
            ),
            padding: WidgetStatePropertyAll(size.padding),
            foregroundColor: WidgetStateProperty.resolveWith(
              (states) => states.contains(WidgetState.disabled)
                  ? NexoV1Colors.faint
                  : foreground,
            ),
            backgroundColor: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.disabled)) {
                return context.nexoColors.surfaceInteractive.withValues(
                  alpha: .5,
                );
              }
              if (states.contains(WidgetState.pressed)) {
                return background.withValues(alpha: .76);
              }
              if (states.contains(WidgetState.hovered)) {
                return variant == NexoButtonVariant.primary
                    ? NexoV1Colors.violetHover
                    : background.withValues(alpha: .9);
              }
              return background;
            }),
            overlayColor: WidgetStatePropertyAll(
              NexoV1Colors.blue.withValues(alpha: .10),
            ),
            side: WidgetStateProperty.resolveWith(
              (states) => BorderSide(
                color: states.contains(WidgetState.focused)
                    ? NexoV1Colors.blue
                    : border,
                width: states.contains(WidgetState.focused) ? 2 : 1,
              ),
            ),
            shape: WidgetStatePropertyAll(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(
                  context.nexoMetrics.radius[2],
                ),
              ),
            ),
            textStyle: WidgetStatePropertyAll(
              Theme.of(context).textTheme.labelLarge,
            ),
            mouseCursor: WidgetStateMouseCursor.clickable,
          ),
          child: child,
        ),
      ),
    );
  }
}

class NexoIconButton extends StatelessWidget {
  const NexoIconButton({
    required this.icon,
    required this.label,
    this.onPressed,
    this.variant = NexoIconButtonVariant.standard,
    this.selected = false,
    this.badge,
    super.key,
  });
  final IconData icon;
  final String label;
  final VoidCallback? onPressed;
  final NexoIconButtonVariant variant;
  final bool selected;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    final foreground = variant == NexoIconButtonVariant.danger
        ? NexoV1Colors.danger
        : NexoV1Colors.text;
    final background = switch (variant) {
      NexoIconButtonVariant.subtle => Colors.transparent,
      NexoIconButtonVariant.danger => NexoV1Colors.danger.withValues(
        alpha: .12,
      ),
      NexoIconButtonVariant.selected => NexoV1Colors.violet.withValues(
        alpha: .18,
      ),
      _ => context.nexoColors.surfaceInteractive,
    };
    final button = IconButton(
      tooltip: label,
      onPressed: onPressed,
      icon: Icon(icon, size: 20),
      style: ButtonStyle(
        minimumSize: const WidgetStatePropertyAll(Size.square(44)),
        fixedSize: const WidgetStatePropertyAll(Size.square(44)),
        foregroundColor: WidgetStatePropertyAll(foreground),
        backgroundColor: WidgetStatePropertyAll(background),
        side: WidgetStateProperty.resolveWith(
          (states) => BorderSide(
            color: states.contains(WidgetState.focused)
                ? NexoV1Colors.blue
                : (variant == NexoIconButtonVariant.subtle
                      ? Colors.transparent
                      : context.nexoColors.borderSubtle),
            width: states.contains(WidgetState.focused) ? 2 : 1,
          ),
        ),
        shape: WidgetStatePropertyAll(
          RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(context.nexoMetrics.radius[2]),
          ),
        ),
      ),
    );
    return NexoTooltip(
      message: label,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Semantics(
            button: true,
            label: label,
            selected: selected,
            child: ExcludeSemantics(child: button),
          ),
          if (badge != null)
            Positioned(
              right: -3,
              top: -3,
              child: NexoBadge(
                label: badge!,
                tone: NexoTone.danger,
                compact: true,
              ),
            ),
        ],
      ),
    );
  }
}

class NexoTextField extends StatefulWidget {
  const NexoTextField({
    required this.label,
    this.controller,
    this.kind = NexoTextFieldKind.text,
    this.placeholder,
    this.helperText,
    this.errorText,
    this.prefix,
    this.suffix,
    this.leadingIcon,
    this.trailingAction,
    this.onChanged,
    this.onSubmitted,
    this.readOnly = false,
    this.enabled = true,
    this.loading = false,
    this.autofillHints,
    this.keyboardType,
    this.inputFormatters,
    this.focusNode,
    this.maxLines,
    super.key,
  });
  final String label;
  final TextEditingController? controller;
  final NexoTextFieldKind kind;
  final String? placeholder, helperText, errorText, prefix, suffix;
  final IconData? leadingIcon;
  final Widget? trailingAction;
  final ValueChanged<String>? onChanged, onSubmitted;
  final bool readOnly, enabled, loading;
  final Iterable<String>? autofillHints;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final FocusNode? focusNode;
  final int? maxLines;

  @override
  State<NexoTextField> createState() => _NexoTextFieldState();
}

class _NexoTextFieldState extends State<NexoTextField> {
  bool obscure = true;
  @override
  Widget build(BuildContext context) {
    final password = widget.kind == NexoTextFieldKind.password;
    final keyboard =
        widget.keyboardType ??
        switch (widget.kind) {
          NexoTextFieldKind.email => TextInputType.emailAddress,
          NexoTextFieldKind.number || NexoTextFieldKind.currency =>
            const TextInputType.numberWithOptions(decimal: true),
          NexoTextFieldKind.multiline => TextInputType.multiline,
          _ => TextInputType.text,
        };
    final trailing = widget.loading
        ? const Padding(
            padding: EdgeInsets.all(12),
            child: NexoSpinner(size: 16, semanticLabel: 'Cargando'),
          )
        : password
        ? NexoIconButton(
            icon: obscure
                ? Icons.visibility_outlined
                : Icons.visibility_off_outlined,
            label: obscure ? 'Mostrar contraseña' : 'Ocultar contraseña',
            onPressed: () => setState(() => obscure = !obscure),
            variant: NexoIconButtonVariant.subtle,
          )
        : widget.trailingAction;
    return Semantics(
      textField: true,
      enabled: widget.enabled,
      readOnly: widget.readOnly,
      child: TextField(
        controller: widget.controller,
        focusNode: widget.focusNode,
        readOnly: widget.readOnly,
        enabled: widget.enabled,
        obscureText: password && obscure,
        keyboardType: keyboard,
        autofillHints: widget.autofillHints,
        inputFormatters: widget.inputFormatters,
        onChanged: widget.onChanged,
        onSubmitted: widget.onSubmitted,
        minLines: widget.kind == NexoTextFieldKind.multiline ? 3 : 1,
        maxLines: password
            ? 1
            : (widget.maxLines ??
                  (widget.kind == NexoTextFieldKind.multiline ? 6 : 1)),
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
          fontFeatures:
              widget.kind == NexoTextFieldKind.number ||
                  widget.kind == NexoTextFieldKind.currency
              ? const [FontFeature.tabularFigures()]
              : null,
        ),
        decoration: InputDecoration(
          labelText: widget.label,
          hintText: widget.placeholder,
          helperText: widget.helperText,
          errorText: widget.errorText,
          prefixText: widget.prefix,
          suffixText: widget.suffix,
          prefixIcon: widget.leadingIcon == null
              ? null
              : Icon(widget.leadingIcon),
          suffixIcon: trailing,
        ),
      ),
    );
  }
}

class NexoSearchField extends StatelessWidget {
  const NexoSearchField({
    required this.label,
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.loading = false,
    this.shortcutHint,
    this.compact = false,
    this.focusNode,
    super.key,
  });
  final String label;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged, onSubmitted;
  final bool loading, compact;
  final String? shortcutHint;
  final FocusNode? focusNode;
  @override
  Widget build(BuildContext context) => NexoTextField(
    label: label,
    controller: controller,
    focusNode: focusNode,
    kind: NexoTextFieldKind.search,
    leadingIcon: Icons.search,
    loading: loading,
    suffix: shortcutHint,
    onChanged: onChanged,
    onSubmitted: onSubmitted,
    trailingAction: controller == null || controller!.text.isEmpty
        ? null
        : NexoIconButton(
            icon: Icons.close,
            label: 'Limpiar',
            onPressed: controller!.clear,
            variant: NexoIconButtonVariant.subtle,
          ),
  );
}

class NexoSelect<T> extends StatelessWidget {
  const NexoSelect({
    required this.label,
    required this.items,
    required this.itemLabel,
    this.value,
    this.onChanged,
    this.enabled = true,
    this.searchable = false,
    this.errorText,
    this.loading = false,
    this.focusNode,
    super.key,
  });
  final String label;
  final List<T> items;
  final String Function(T) itemLabel;
  final T? value;
  final ValueChanged<T?>? onChanged;
  final bool enabled, searchable, loading;
  final FocusNode? focusNode;
  final String? errorText;
  @override
  Widget build(BuildContext context) => DropdownMenu<T>(
    label: Text(label),
    enabled: enabled && !loading,
    initialSelection: value,
    enableFilter: searchable,
    enableSearch: searchable,
    expandedInsets: EdgeInsets.zero,
    errorText: errorText,
    focusNode: focusNode,
    requestFocusOnTap: true,
    trailingIcon: loading
        ? const NexoSpinner(size: 16, semanticLabel: 'Cargando')
        : const Icon(Icons.expand_more),
    selectedTrailingIcon: const Icon(Icons.expand_less),
    dropdownMenuEntries: items
        .map(
          (item) => DropdownMenuEntry<T>(value: item, label: itemLabel(item)),
        )
        .toList(),
    onSelected: onChanged,
  );
}

class NexoCheckbox extends StatelessWidget {
  const NexoCheckbox({
    required this.value,
    required this.label,
    this.description,
    this.onChanged,
    this.error = false,
    super.key,
  });
  final bool? value;
  final String label;
  final String? description;
  final ValueChanged<bool?>? onChanged;
  final bool error;
  @override
  Widget build(BuildContext context) => Material(
    type: MaterialType.transparency,
    child: CheckboxListTile(
      value: value,
      tristate: true,
      onChanged: onChanged,
      title: Text(label),
      subtitle: description == null ? null : Text(description!),
      controlAffinity: ListTileControlAffinity.leading,
      side: BorderSide(
        color: error ? NexoV1Colors.danger : context.nexoColors.borderStrong,
      ),
      contentPadding: EdgeInsets.zero,
    ),
  );
}

class NexoRadio<T> extends StatelessWidget {
  const NexoRadio({
    required this.value,
    required this.groupValue,
    required this.label,
    this.description,
    this.onChanged,
    super.key,
  });
  final T value, groupValue;
  final String label;
  final String? description;
  final ValueChanged<T?>? onChanged;
  @override
  Widget build(BuildContext context) => RadioGroup<T>(
    groupValue: groupValue,
    onChanged: onChanged ?? (_) {},
    child: RadioListTile<T>(
      value: value,
      enabled: onChanged != null,
      title: Text(label),
      subtitle: description == null ? null : Text(description!),
      contentPadding: EdgeInsets.zero,
    ),
  );
}

class NexoSwitch extends StatelessWidget {
  const NexoSwitch({
    required this.value,
    required this.label,
    this.description,
    this.onChanged,
    this.loading = false,
    super.key,
  });
  final bool value, loading;
  final String label;
  final String? description;
  final ValueChanged<bool>? onChanged;
  @override
  Widget build(BuildContext context) => SwitchListTile(
    value: value,
    onChanged: loading ? null : onChanged,
    title: Text(label),
    subtitle: description == null ? null : Text(description!),
    secondary: loading
        ? const NexoSpinner(size: 16, semanticLabel: 'Cargando')
        : null,
    contentPadding: EdgeInsets.zero,
  );
}

class NexoSegmentedControl<T> extends StatelessWidget {
  const NexoSegmentedControl({
    required this.options,
    required this.labelOf,
    required this.selected,
    required this.onSelectionChanged,
    this.iconOf,
    this.disabled = const {},
    this.compact = false,
    super.key,
  });
  final List<T> options;
  final String Function(T) labelOf;
  final IconData? Function(T)? iconOf;
  final Set<T> selected, disabled;
  final ValueChanged<Set<T>> onSelectionChanged;
  final bool compact;
  @override
  Widget build(BuildContext context) {
    assert(options.length >= 2 && options.length <= 5);
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SegmentedButton<T>(
        segments: options.map((value) {
          final icon = iconOf?.call(value);
          return ButtonSegment<T>(
            value: value,
            label: Text(labelOf(value)),
            icon: icon == null ? null : Icon(icon),
            enabled: !disabled.contains(value),
          );
        }).toList(),
        selected: selected,
        onSelectionChanged: onSelectionChanged,
        style: ButtonStyle(
          visualDensity: compact
              ? VisualDensity.compact
              : VisualDensity.standard,
        ),
      ),
    );
  }
}

class NexoChip extends StatelessWidget {
  const NexoChip({
    required this.label,
    this.tone = NexoTone.neutral,
    this.selected = false,
    this.onSelected,
    this.onDismissed,
    this.icon,
    super.key,
  });
  final String label;
  final NexoTone tone;
  final bool selected;
  final ValueChanged<bool>? onSelected;
  final VoidCallback? onDismissed;
  final IconData? icon;
  @override
  Widget build(BuildContext context) => FilterChip(
    label: Text(label),
    selected: selected,
    onSelected: onSelected,
    onDeleted: onDismissed,
    avatar: icon == null ? null : Icon(icon, size: 16),
    selectedColor: _toneColor(tone).withValues(alpha: .18),
    side: BorderSide(color: _toneColor(tone).withValues(alpha: .45)),
  );
}

class NexoBadge extends StatelessWidget {
  const NexoBadge({
    required this.label,
    this.tone = NexoTone.neutral,
    this.icon,
    this.compact = false,
    super.key,
  });
  final String label;
  final NexoTone tone;
  final IconData? icon;
  final bool compact;
  @override
  Widget build(BuildContext context) => Semantics(
    label: label,
    child: Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 6 : 9,
        vertical: compact ? 2 : 5,
      ),
      decoration: BoxDecoration(
        color: _toneColor(tone).withValues(alpha: .12),
        border: Border.all(color: _toneColor(tone).withValues(alpha: .38)),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: compact ? 11 : 14, color: _toneColor(tone)),
            const SizedBox(width: 5),
          ],
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(
                context,
              ).textTheme.labelSmall?.copyWith(color: _toneColor(tone)),
            ),
          ),
        ],
      ),
    ),
  );
}

enum NexoStatus { online, offline, syncing, warning, error, pending }

class NexoStatusIndicator extends StatelessWidget {
  const NexoStatusIndicator({
    required this.status,
    required this.label,
    this.pulse = false,
    super.key,
  });
  final NexoStatus status;
  final String label;
  final bool pulse;
  @override
  Widget build(BuildContext context) {
    final state = switch (status) {
      NexoStatus.online => NexoSemanticState.success,
      NexoStatus.offline => NexoSemanticState.offline,
      NexoStatus.syncing => NexoSemanticState.syncing,
      NexoStatus.warning => NexoSemanticState.warning,
      NexoStatus.error => NexoSemanticState.danger,
      NexoStatus.pending => NexoSemanticState.pending,
    };
    final visual = NexoStates.resolve(state);
    final motion = MediaQuery.disableAnimationsOf(context)
        ? Duration.zero
        : context.nexoMotion.slow;
    return Semantics(
      label: label,
      value: status.name,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedContainer(
            duration: motion,
            width: 9,
            height: 9,
            decoration: BoxDecoration(
              color: visual.foreground,
              shape: BoxShape.circle,
              boxShadow: pulse && motion != Duration.zero
                  ? [
                      BoxShadow(
                        color: visual.foreground.withValues(alpha: .3),
                        blurRadius: 8,
                        spreadRadius: 2,
                      ),
                    ]
                  : null,
            ),
          ),
          const SizedBox(width: 8),
          Text(label),
        ],
      ),
    );
  }
}

Color _toneColor(NexoTone tone) => switch (tone) {
  NexoTone.info => NexoV1Colors.blue,
  NexoTone.success => NexoV1Colors.mint,
  NexoTone.warning || NexoTone.offline => NexoV1Colors.warning,
  NexoTone.danger => NexoV1Colors.danger,
  NexoTone.syncing => NexoV1Colors.cyan,
  NexoTone.restricted || NexoTone.neutral => NexoV1Colors.faint,
};
