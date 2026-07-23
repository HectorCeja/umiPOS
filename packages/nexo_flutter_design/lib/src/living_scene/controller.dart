import 'package:flutter/foundation.dart';
import 'package:flutter/scheduler.dart';

import 'model.dart';

class NexoSceneController extends ChangeNotifier {
  NexoSceneController([this._variant = NexoLivingSceneVariant.dashboard]);
  NexoLivingSceneVariant _variant;
  NexoLivingSceneVariant? _previous;
  int _transitionGeneration = 0;
  bool _active = true;
  NexoLivingSceneVariant get variant => _variant;
  NexoLivingSceneVariant? get previous => _previous;
  bool get active => _active;
  int get transitionGeneration => _transitionGeneration;

  void setVariant(NexoLivingSceneVariant value) {
    if (value == _variant) return;
    _previous = _variant;
    _variant = value;
    _transitionGeneration += 1;
    notifyListeners();
  }

  void completeTransition(int generation) {
    if (generation != _transitionGeneration || _previous == null) return;
    _previous = null;
    notifyListeners();
  }

  void setActive(bool value) {
    if (_active == value) return;
    _active = value;
    notifyListeners();
  }
}

class NexoSceneClock extends ChangeNotifier {
  NexoSceneClock({TickerProvider? vsync, this.deterministicProgress}) {
    if (vsync != null && deterministicProgress == null) {
      _ticker = vsync.createTicker(_tick);
    }
  }
  final double? deterministicProgress;
  Ticker? _ticker;
  Duration _elapsed = Duration.zero;
  bool get isTicking => _ticker?.isTicking ?? false;
  double get progress =>
      deterministicProgress ??
      ((_elapsed.inMicroseconds % const Duration(seconds: 59).inMicroseconds) /
          const Duration(seconds: 59).inMicroseconds);
  void _tick(Duration elapsed) {
    _elapsed = elapsed;
    notifyListeners();
  }

  void start() {
    if (_ticker != null && !_ticker!.isActive) _ticker!.start();
  }

  void stop() {
    _ticker?.stop();
  }

  @override
  void dispose() {
    _ticker?.dispose();
    super.dispose();
  }
}
