/// Backend URL - change for your setup.
/// Local: use your computer's IP, e.g. http://192.168.1.5:4000 (same WiFi required).
/// Production: use your Render URL, e.g. https://campus-transport-backend.onrender.com
const String backendUrl = 'http://192.168.56.1:4000';

String get socketUrl {
  final base = backendUrl.replaceFirst('http://', 'ws://').replaceFirst('https://', 'wss://');
  return '$base/socket/websocket';
}

const String channelName = 'transport:app';
const Duration locationUpdateInterval = Duration(seconds: 15);
