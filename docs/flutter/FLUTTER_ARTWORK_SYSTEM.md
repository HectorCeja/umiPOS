# Flutter Artwork System

`NexoArtworkRegistry` is the only runtime source. Definitions include typed ID, package path, SHA-256, source dimensions, intensity, crop, mask and abstract status. Assets are packaged offline and synchronized from the certified repository files by `tool/sync-artwork.mjs`; `--check` fails on source or output drift.

Rendering uses `Image.asset`, `ColorFiltered`, normalized focal alignment, controlled opacity and a mask overlay. Artwork is decorative, cached by Flutter's image cache, gapless during replacement and never fetched over the network. The project records ownership as NEXO project-approved; no external license assertion is invented.
