import 'package:flutter/material.dart';

import '../tokens/generated/nexo_tokens.g.dart';

enum NexoBrandVariant { full, compact, mark }

/// Authoritative Flutter rendering of the NEXO wordmark.
class NexoBrand extends StatelessWidget {
  const NexoBrand({
    super.key,
    this.variant = NexoBrandVariant.full,
    this.semanticLabel = 'NEXO',
  });

  final NexoBrandVariant variant;
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final size = switch (variant) {
      NexoBrandVariant.full => 40.0,
      NexoBrandVariant.compact => 25.0,
      NexoBrandVariant.mark => 32.0,
    };
    final content = variant == NexoBrandVariant.mark
        ? const Text('X')
        : Text.rich(
            TextSpan(
              children: [
                const TextSpan(text: 'NE'),
                TextSpan(
                  text: 'X',
                  style: TextStyle(
                    color: NexoV1Colors.violet,
                    fontSize: size * 1.16,
                  ),
                ),
                const TextSpan(text: 'O'),
              ],
            ),
          );
    return Semantics(
      image: true,
      label: semanticLabel,
      child: ExcludeSemantics(
        child: DefaultTextStyle.merge(
          style: TextStyle(
            fontFamily: 'Instrument Sans',
            color: NexoV1Colors.text,
            fontSize: size,
            fontWeight: FontWeight.w600,
            letterSpacing: variant == NexoBrandVariant.mark ? 0 : size * .13,
            height: 1,
          ),
          child: content,
        ),
      ),
    );
  }
}
