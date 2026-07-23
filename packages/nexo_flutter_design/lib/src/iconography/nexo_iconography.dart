import 'package:flutter/material.dart';

/// Icon metrics and semantics policy for the foundation.
///
/// V1 does not certify a Web icon font/package. Flutter therefore uses Material
/// Symbols for foundation controls; product mappings are audited component by
/// component in Component Parity rather than guessed here.
abstract final class NexoIconography {
  static const small = 16.0;
  static const standard = 20.0;
  static const touch = 22.0;
  static const prominent = 24.0;

  /// Decorative icons are excluded; functional icons require a localized label.
  static Widget icon(
    IconData data, {
    String? semanticLabel,
    double size = standard,
    Color? color,
  }) {
    final icon = Icon(
      data,
      size: size,
      color: color,
      semanticLabel: semanticLabel,
    );
    return semanticLabel == null ? ExcludeSemantics(child: icon) : icon;
  }
}
