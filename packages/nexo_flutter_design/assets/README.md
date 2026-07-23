# Flutter asset contract

Part 1 ships only the two frozen typography families. Instrument Sans Variable and Manrope Variable come from the official Google Fonts repository under OFL-1.1; hashes and license paths live in `manifest.json`.

Future entries require a stable kebab-case name, source, license, SHA-256, logical role, dimensions/DPR variants and fallback. Images are decoded/pre-cached by the owning renderer, not imported from Web paths at runtime.
