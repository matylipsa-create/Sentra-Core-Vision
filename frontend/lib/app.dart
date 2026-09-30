import 'package:flutter/material.dart';
import 'config/theme.dart';
import 'services/sentra_client.dart';
import 'services/state_notifier.dart';
import 'screens/main_screen.dart';

/// Widget raiz de Sentra Core.
class SentraApp extends StatelessWidget {
  final SentraClient? client;
  final SentraStateNotifier? notifier;
  final String? apiToken;

  const SentraApp({super.key, this.client, this.notifier, this.apiToken});

  @override
  Widget build(BuildContext context) {
    final c = client ?? SentraClient(apiToken: apiToken);
    final n = notifier ?? SentraStateNotifier(c);

    return MaterialApp(
      title: 'Sentra Core',
      debugShowCheckedModeBanner: false,
      theme: SentraTheme.darkTheme,
      home: MainScreen(notifier: n, client: c),
    );
  }
}
