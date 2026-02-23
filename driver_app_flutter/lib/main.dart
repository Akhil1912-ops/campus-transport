import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'driver_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF111827),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const DriverApp());
}

class DriverApp extends StatelessWidget {
  const DriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Buggy Driver',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366f1),
          brightness: Brightness.dark,
          primary: const Color(0xFF6366f1),
        ),
        useMaterial3: true,
      ),
      debugShowCheckedModeBanner: false,
      home: const DriverScreen(),
    );
  }
}
