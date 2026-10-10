import 'package:flutter/foundation.dart';

/// Catalog of craftable items with their loot point costs.
class CraftableItem {
  final String key;
  final String displayName;
  final int lootCost;
  final String description;

  const CraftableItem({
    required this.key,
    required this.displayName,
    required this.lootCost,
    required this.description,
  });

  static const List<CraftableItem> catalog = [
    CraftableItem(
      key: 'foam_shield',
      displayName: 'Escudo de Espuma',
      lootCost: 250,
      description: 'Reduce el impacto de exposición a brechas.',
    ),
    CraftableItem(
      key: 'dea_adrenaline',
      displayName: 'Adrenalina DEA',
      lootCost: 500,
      description: 'Recupera 30 puntos de estabilidad mental.',
    ),
    CraftableItem(
      key: 'recon_drone',
      displayName: 'Dron de Reconocimiento',
      lootCost: 800,
      description: 'Revela nodos de misión en un radio de 500 metros.',
    ),
  ];

  static CraftableItem? byKey(String key) {
    for (final item in catalog) {
      if (item.key == key) return item;
    }
    return null;
  }
}

/// Immutable record of an item the operator has crafted.
@immutable
class CraftedItem {
  final String id;
  final String itemKey;
  final String displayName;
  final int lootCost;
  final DateTime craftedAt;

  const CraftedItem({
    required this.id,
    required this.itemKey,
    required this.displayName,
    required this.lootCost,
    required this.craftedAt,
  });

  factory CraftedItem.fromJson(Map<String, dynamic> json) {
    return CraftedItem(
      id: json['id'] as String,
      itemKey: json['item_key'] as String,
      displayName: json['display_name'] as String,
      lootCost: (json['loot_cost'] as num).toInt(),
      craftedAt: DateTime.parse(json['crafted_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'item_key': itemKey,
        'display_name': displayName,
        'loot_cost': lootCost,
        'crafted_at': craftedAt.toIso8601String(),
      };
}
