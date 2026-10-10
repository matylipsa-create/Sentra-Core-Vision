/// Entrada de evidencia EVOLIS.

class HashChainEntry {
  final int index;
  final String hash;
  final String previousHash;
  final int timestamp;
  final String data;

  const HashChainEntry({
    required this.index,
    required this.hash,
    required this.previousHash,
    required this.timestamp,
    required this.data,
  });

  factory HashChainEntry.fromJson(Map<String, dynamic> json) {
    return HashChainEntry(
      index: json['index'] as int? ?? 0,
      hash: json['hash'] as String? ?? '',
      previousHash: json['previousHash'] as String? ?? '',
      timestamp: json['timestamp'] as int? ?? 0,
      data: json['data'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'index': index,
        'hash': hash,
        'previousHash': previousHash,
        'timestamp': timestamp,
        'data': data,
      };
}

class EvidenceEntry {
  final String id;
  final HashChainEntry entry;
  final String module;
  final String action;

  const EvidenceEntry({
    required this.id,
    required this.entry,
    required this.module,
    required this.action,
  });

  factory EvidenceEntry.fromJson(Map<String, dynamic> json) {
    return EvidenceEntry(
      id: json['id'] as String? ?? '',
      entry: HashChainEntry.fromJson(json['entry'] as Map<String, dynamic>? ?? {}),
      module: json['module'] as String? ?? '',
      action: json['action'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'entry': entry.toJson(),
        'module': module,
        'action': action,
      };
}
