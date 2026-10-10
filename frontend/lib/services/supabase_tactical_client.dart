import 'dart:convert';
import 'package:http/http.dart' as http;

import '../config/constants.dart';

/// Minimal Supabase REST client for the tactical ops tables.
///
/// Uses the PostgREST API (via the anon key) to read and write the
/// operator_mind_state, node_mission, and crafted_item tables.
/// Avoids adding a full Supabase SDK dependency to the Flutter project.
class SupabaseTacticalClient {
  final String _url;
  final String _anonKey;

  SupabaseTacticalClient()
      : _url = const String.fromEnvironment(
          'SUPABASE_URL',
          defaultValue: '',
        ),
        _anonKey = const String.fromEnvironment(
          'SUPABASE_ANON_KEY',
          defaultValue: '',
        );

  Map<String, String> get _headers => {
        'apikey': _anonKey,
        'Authorization': 'Bearer $_anonKey',
        'Content-Type': 'application/json',
      };

  /// Selects rows from a table.
  Future<List<Map<String, dynamic>>> select(String table) async {
    final res = await http.get(
      Uri.parse('$_url/rest/v1/$table'),
      headers: _headers,
    );
    if (res.statusCode != 200) {
      throw Exception('Supabase select failed: ${res.statusCode}');
    }
    final list = jsonDecode(res.body) as List;
    return list.cast<Map<String, dynamic>>();
  }

  /// Inserts a row and returns the inserted record.
  Future<Map<String, dynamic>> insert(
    String table,
    Map<String, dynamic> data,
  ) async {
    final res = await http.post(
      Uri.parse('$_url/rest/v1/$table'),
      headers: {
        ..._headers,
        'Prefer': 'return=representation',
      },
      body: jsonEncode(data),
    );
    if (res.statusCode != 201 && res.statusCode != 200) {
      throw Exception('Supabase insert failed: ${res.statusCode}');
    }
    final body = jsonDecode(res.body) as List;
    return body.first as Map<String, dynamic>;
  }

  /// Updates rows matching a filter and returns the updated records.
  Future<List<Map<String, dynamic>>> update(
    String table,
    Map<String, dynamic> data,
    String filter,
  ) async {
    final res = await http.patch(
      Uri.parse('$_url/rest/v1/$table?$filter'),
      headers: {
        ..._headers,
        'Prefer': 'return=representation',
      },
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) {
      throw Exception('Supabase update failed: ${res.statusCode}');
    }
    final body = jsonDecode(res.body) as List;
    return body.cast<Map<String, dynamic>>();
  }

  /// Deletes rows matching a filter.
  Future<void> delete(String table, String filter) async {
    final res = await http.delete(
      Uri.parse('$_url/rest/v1/$table?$filter'),
      headers: _headers,
    );
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception('Supabase delete failed: ${res.statusCode}');
    }
  }
}
