import 'package:phoenix_socket/phoenix_socket.dart';
import 'config.dart';

class DriverChannel {
  PhoenixSocket? _socket;
  PhoenixChannel? _channel;
  void Function(bool) onConnected = (_) {};
  void Function(String) onBuggyRegistered = (_) {};

  bool get isConnected => _socket?.isConnected ?? false;
  String? _buggyId;
  String? get buggyId => _buggyId;

  Future<void> connect() async {
    if (_socket != null) return;
    _socket = PhoenixSocket(socketUrl);
    await _socket!.connect();
    _channel = _socket!.addChannel(topic: channelName);

    _channel!.messages.listen((message) {
      final event = message.event?.value;
      final payload = message.payload as Map<String, dynamic>?;
      if (event == 'buggy_registered' && payload != null) {
        _buggyId = payload['id'] as String?;
        onBuggyRegistered(_buggyId ?? '');
      }
    });

    await _channel!.join().future;
    onConnected(true);
  }

  void disconnect() {
    _channel?.leave();
    _socket?.close();
    _socket = null;
    _channel = null;
    _buggyId = null;
    onConnected(false);
  }

  void registerBuggy(double lat, double lng, String route) {
    _channel?.push('register_buggy', {'lat': lat, 'lng': lng, 'route': route});
  }

  void sendLocationUpdate(double lat, double lng, [String? route]) {
    final payload = <String, dynamic>{'type': 'buggy', 'lat': lat, 'lng': lng};
    if (route != null) payload['route'] = route;
    _channel?.push('location_update', payload);
  }
}
