import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/crafted_item.dart';
import 'event_bus.dart';
import 'supabase_tactical_client.dart';

/// Manages loot points and instant crafting of items.
///
/// Reads the crafted_item table from Supabase to persist crafted items.
/// Publishes [ItemCraftedEvent] on the event bus so the haptic / TTS
/// accessibility layer can announce successful crafting.
class CraftingService extends ChangeNotifier {
  final SentraEventBus _bus;
  final SupabaseTacticalClient _client;

  int _lootPoints;
  List<CraftedItem> _inventory = [];

  CraftingService({
    SentraEventBus? bus,
    SupabaseTacticalClient? client,
    int initialLootPoints = 1000,
  })  : _bus = bus ?? EventBusProvider.instance,
        _client = client ?? SupabaseTacticalClient(),
        _lootPoints = initialLootPoints;

  int get lootPoints => _lootPoints;
  List<CraftedItem> get inventory => List.unmodifiable(_inventory);

  /// Loads existing crafted items from Supabase.
  Future<void> loadInventory() async {
    try {
      final rows = await _client.select('crafted_item');
      _inventory = rows.map((r) => CraftedItem.fromJson(r)).toList();
      notifyListeners();
    } catch (_) {
      // Supabase not reachable — continue with empty inventory.
    }
  }

  /// Attempts to craft an item instantly. Returns true on success.
  Future<bool> produceItemInstant(String itemKey) async {
    final item = CraftableItem.byKey(itemKey);
    if (item == null) return false;
    if (_lootPoints < item.lootCost) return false;

    try {
      final row = await _client.insert('crafted_item', {
        'item_key': item.key,
        'display_name': item.displayName,
        'loot_cost': item.lootCost,
      });
      final crafted = CraftedItem.fromJson(row);
      _inventory = [..._inventory, crafted];
      _lootPoints -= item.lootCost;
      notifyListeners();
      _bus.publishWithClock((ts) => ItemCraftedEvent(
            item.key,
            item.displayName,
            item.lootCost,
            ts,
          ));
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Adds loot points (e.g. after completing a mission).
  void addLootPoints(int amount) {
    _lootPoints += amount;
    notifyListeners();
  }

  /// Removes a crafted item from the inventory (e.g. after using it).
  Future<void> removeItem(String itemId) async {
    try {
      await _client.delete('crafted_item', 'id=eq.$itemId');
      _inventory = _inventory.where((i) => i.id != itemId).toList();
      notifyListeners();
    } catch (_) {
      // Offline — remove locally only.
      _inventory = _inventory.where((i) => i.id != itemId).toList();
      notifyListeners();
    }
  }
}
