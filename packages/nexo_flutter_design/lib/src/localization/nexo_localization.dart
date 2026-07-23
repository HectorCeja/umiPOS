import 'package:flutter/widgets.dart';

/// Locale contract for foundation widgets. Product copy remains in ARB files.
abstract final class NexoLocalization {
  static const spanishMexico = Locale('es', 'MX');
  static const english = Locale('en');
  static const supportedLocales = [spanishMexico, english];

  /// Components must use ambient directionality; RTL is future-ready, not certified.
  static TextDirection directionOf(BuildContext context) =>
      Directionality.of(context);
}
