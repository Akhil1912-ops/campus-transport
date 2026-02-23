import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'config.dart';
import 'driver_channel.dart';

class DriverScreen extends StatefulWidget {
  const DriverScreen({super.key});

  @override
  State<DriverScreen> createState() => _DriverScreenState();
}

class _DriverScreenState extends State<DriverScreen> {
  final DriverChannel _channel = DriverChannel();
  bool _connected = false;
  bool _isDriving = false;
  String _route = 'blue';
  String _status = 'Ready';
  String? _error;
  Position? _lastPosition;
  StreamSubscription<Position>? _positionSubscription;
  Timer? _updateTimer;

  @override
  void initState() {
    super.initState();
    _channel.onConnected = (c) => setState(() => _connected = c);
    _channel.onBuggyRegistered = (_) => setState(() {});
    _connect();
  }

  Future<void> _connect() async {
    try {
      await _channel.connect();
    } catch (e) {
      setState(() => _error = 'Could not connect: $e');
    }
  }

  @override
  void dispose() {
    _stopDriving();
    _channel.disconnect();
    super.dispose();
  }

  void _stopDriving() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
    _updateTimer?.cancel();
    _updateTimer = null;
    setState(() {
      _isDriving = false;
      _status = 'Stopped';
      _lastPosition = null;
      _error = null;
    });
  }

  Future<void> _startDriving() async {
    setState(() {
      _error = null;
      _status = 'Getting location…';
    });

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      setState(() {
        _error = 'Location permission denied';
        _status = 'Ready';
      });
      return;
    }

    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() {
        _error = 'Please enable location services';
        _status = 'Ready';
      });
      return;
    }

    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      );
      _channel.registerBuggy(
        position.latitude,
        position.longitude,
        _route,
      );
      setState(() {
        _lastPosition = position;
        _status = 'Connecting…';
        _isDriving = true;
      });

      _positionSubscription = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
        ),
      ).listen((position) {
        if (mounted) {
          setState(() {
            _lastPosition = position;
            if (_status != 'Driving') _status = 'Driving';
          });
        }
      });

      void sendUpdate() {
        final pos = _lastPosition;
        if (pos != null) {
          _channel.sendLocationUpdate(pos.latitude, pos.longitude, _route);
        }
      }
      sendUpdate();
      _updateTimer = Timer.periodic(locationUpdateInterval, (_) => sendUpdate());
      setState(() => _status = 'Driving');
    } catch (e) {
      setState(() {
        _error = e.toString();
        _status = 'Ready';
      });
    }
  }

  void _onRouteChanged(String route) {
    setState(() => _route = route);
    if (_isDriving && _lastPosition != null) {
      _channel.sendLocationUpdate(
        _lastPosition!.latitude,
        _lastPosition!.longitude,
        route,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (_error != null) _buildError(),
                    _buildRouteSelector(),
                    _buildStatusCard(),
                    const SizedBox(height: 32),
                    _buildMainButton(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Buggy Driver',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Campus Transport',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[400],
            ),
          ),
          if (!_connected) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.3),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.amber[700],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Connecting…',
                    style: TextStyle(color: Colors.amber[700], fontSize: 13),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildError() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        _error!,
        style: const TextStyle(color: Color(0xFFfca5a5), fontSize: 14),
      ),
    );
  }

  Widget _buildRouteSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Current route',
          style: TextStyle(fontSize: 13, color: Colors.grey[400]),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _RouteButton(
                label: 'Route A (Blue)',
                isSelected: _route == 'blue',
                color: const Color(0xFF2563eb),
                onTap: () => _onRouteChanged('blue'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _RouteButton(
                label: 'Route B (Red)',
                isSelected: _route == 'red',
                color: const Color(0xFFdc2626),
                onTap: () => _onRouteChanged('red'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildStatusCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1f2937),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Status',
            style: TextStyle(fontSize: 13, color: Colors.grey[400]),
          ),
          const SizedBox(height: 4),
          Text(
            _status,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Colors.white,
            ),
          ),
          if (_channel.buggyId != null) ...[
            const SizedBox(height: 8),
            Text(
              'ID: ${_channel.buggyId}',
              style: TextStyle(fontSize: 11, color: Colors.grey[500]),
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (_lastPosition != null) ...[
            const SizedBox(height: 4),
            Text(
              '${_lastPosition!.latitude.toStringAsFixed(5)}, '
              '${_lastPosition!.longitude.toStringAsFixed(5)}',
              style: TextStyle(fontSize: 11, color: Colors.grey[500]),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMainButton() {
    if (_isDriving) {
      return ElevatedButton(
        onPressed: _stopDriving,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFdc2626),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: const Text(
          'Stop driving',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
      );
    }
    return ElevatedButton(
      onPressed: _connected ? _startDriving : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: _connected ? const Color(0xFF16a34a) : Colors.grey[700],
        foregroundColor: Colors.white,
        disabledBackgroundColor: Colors.grey[700],
        padding: const EdgeInsets.symmetric(vertical: 18),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      child: const Text(
        'Start driving',
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _RouteButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final Color color;
  final VoidCallback onTap;

  const _RouteButton({
    required this.label,
    required this.isSelected,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? color : const Color(0xFF374151),
          borderRadius: BorderRadius.circular(12),
          border: isSelected ? Border.all(color: color.withOpacity(0.6), width: 2) : null,
        ),
        child: Center(
          child: Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}
