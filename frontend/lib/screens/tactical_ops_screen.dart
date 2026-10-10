import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/accessibility_theme.dart';
import '../models/crafted_item.dart';
import '../models/node_mission_model.dart';
import '../models/operator_mind_state.dart';
import '../services/crafting_service.dart';
import '../services/haptic_feedback_service.dart';
import '../services/node_mission_service.dart';
import '../services/operator_mind_manager.dart';
import '../widgets/accessible_button.dart';

/// Tactical Operations screen — operator state, missions, and crafting.
///
/// Displays three sections in a scrollable, fully-semantic layout:
/// 1. Operator Mind State (stability bar + mode indicator)
/// 2. Active Mission Nodes (list with breach intensity and distance)
/// 3. Crafting (loot points + catalog of craftable items)
///
/// All sections use high-contrast colors, large text, and Semantics labels
/// for TalkBack / VoiceOver / NVDA compatibility.
class TacticalOpsScreen extends StatefulWidget {
  const TacticalOpsScreen({super.key});

  @override
  State<TacticalOpsScreen> createState() => _TacticalOpsScreenState();
}

class _TacticalOpsScreenState extends State<TacticalOpsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OperatorMindManager>().loadState();
      context.read<NodeMissionService>().loadMissions();
      context.read<CraftingService>().loadInventory();
    });
  }

  @override
  Widget build(BuildContext context) {
    final mind = context.watch<OperatorMindManager>();
    final missions = context.watch<NodeMissionService>();
    final crafting = context.watch<CraftingService>();

    return Scaffold(
      backgroundColor: AccessibilityTheme.background,
      appBar: AppBar(
        title: const Text('Operaciones Tácticas'),
      ),
      body: SafeArea(
        child: Semantics(
          container: true,
          label:
              'Pantalla de operaciones tácticas. Estado mental del operador, misiones activas y crafteo de objetos.',
          child: ListView(
            padding: const EdgeInsets.symmetric(
              horizontal: AccessibilityTheme.space3,
              vertical: AccessibilityTheme.space2,
            ),
            children: [
              _MindStateSection(state: mind.state, isLoading: mind.isLoading),
              SizedBox(height: AccessibilityTheme.space3),
              _MissionsSection(
                missions: missions.activeMissions,
                isLoading: missions.isLoading,
                onComplete: _completeMission,
              ),
              SizedBox(height: AccessibilityTheme.space3),
              _CraftingSection(
                lootPoints: crafting.lootPoints,
                inventory: crafting.inventory,
                onCraft: _craftItem,
              ),
              SizedBox(height: AccessibilityTheme.space4),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _completeMission(String missionId) async {
    final haptic = context.read<HapticFeedbackService>();
    await haptic.playMorse('M');
    final missions = context.read<NodeMissionService>();
    await missions.completeMission(missionId);
    final mind = context.read<OperatorMindManager>();
    await mind.recover(15.0);
    context.read<CraftingService>().addLootPoints(300);
  }

  Future<void> _craftItem(String itemKey) async {
    final crafting = context.read<CraftingService>();
    final success = await crafting.produceItemInstant(itemKey);
    final haptic = context.read<HapticFeedbackService>();
    if (success) {
      await haptic.playMorse('C');
    } else {
      await haptic.playMorse('F');
    }
  }
}

// ─── Mind State Section ──────────────────────────────────────────────

class _MindStateSection extends StatelessWidget {
  final OperatorMindState state;
  final bool isLoading;

  const _MindStateSection({required this.state, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    final stabilityPercent = (state.stability / 100).clamp(0.0, 1.0);
    final barColor = state.isCritical
        ? AccessibilityTheme.error
        : state.isDistorted
            ? AccessibilityTheme.warning
            : AccessibilityTheme.success;
    final modeLabel = state.isDistorted
        ? 'Modo: Números Imaginarios'
        : 'Modo: Números Reales';

    return Semantics(
      container: true,
      label:
          'Estado mental del operador. Estabilidad: ${state.stability.round()} por ciento. $modeLabel.',
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space3),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Estado Mental del Operador',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              SizedBox(height: AccessibilityTheme.space2),
              if (isLoading)
                const Center(child: CircularProgressIndicator())
              else ...[
                _StabilityBar(
                  percent: stabilityPercent,
                  color: barColor,
                ),
                SizedBox(height: AccessibilityTheme.space2),
                Text(
                  'Estabilidad: ${state.stability.round()}%',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                SizedBox(height: AccessibilityTheme.space1),
                Text(
                  modeLabel,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: state.isDistorted
                        ? AccessibilityTheme.warning
                        : AccessibilityTheme.success,
                    height: 1.3,
                  ),
                ),
                if (state.isDistorted) ...[
                  SizedBox(height: AccessibilityTheme.space1),
                  Text(
                    'Percepción distorsionada. Compensación háptica activada.',
                    style: TextStyle(
                      fontSize: 18,
                      color: AccessibilityTheme.warning,
                      height: 1.4,
                    ),
                  ),
                ],
                SizedBox(height: AccessibilityTheme.space2),
                Text(
                  'Exposición acumulada: ${state.breachExposure.round()}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _StabilityBar extends StatelessWidget {
  final double percent;
  final Color color;

  const _StabilityBar({required this.percent, required this.color});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Barra de estabilidad al ${(percent * 100).round()} por ciento',
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
        child: LinearProgressIndicator(
          value: percent,
          minHeight: 24,
          backgroundColor: AccessibilityTheme.surfaceElevated,
          color: color,
        ),
      ),
    );
  }
}

// ─── Missions Section ─────────────────────────────────────────────────

class _MissionsSection extends StatelessWidget {
  final List<NodeMission> missions;
  final bool isLoading;
  final Future<void> Function(String missionId) onComplete;

  const _MissionsSection({
    required this.missions,
    required this.isLoading,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      label: 'Misiones activas. ${missions.length} misiones disponibles.',
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space3),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Nodos de Misión Activos',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              SizedBox(height: AccessibilityTheme.space2),
              if (isLoading)
                const Center(child: CircularProgressIndicator())
              else if (missions.isEmpty)
                Text(
                  'No hay misiones activas.',
                  style: Theme.of(context).textTheme.bodyLarge,
                )
              else
                ...missions.map((m) => _MissionCard(
                      mission: m,
                      onComplete: () => onComplete(m.id),
                    )),
            ],
          ),
        ),
      ),
    );
  }
}

class _MissionCard extends StatelessWidget {
  final NodeMission mission;
  final VoidCallback onComplete;

  const _MissionCard({required this.mission, required this.onComplete});

  @override
  Widget build(BuildContext context) {
    final timeLeft = mission.expiresAt.difference(DateTime.now());
    final hoursLeft = timeLeft.inHours;
    final intensityColor = mission.breachIntensity >= 7
        ? AccessibilityTheme.error
        : mission.breachIntensity >= 4
            ? AccessibilityTheme.warning
            : AccessibilityTheme.success;

    return Semantics(
      container: true,
      label:
          'Misión: ${mission.title}. Intensidad de brecha: ${mission.breachIntensity}. Tiempo restante: $hoursLeft horas.',
      child: Container(
        margin: const EdgeInsets.only(bottom: AccessibilityTheme.space2),
        padding: const EdgeInsets.all(AccessibilityTheme.space2),
        decoration: BoxDecoration(
          color: AccessibilityTheme.surface,
          borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
          border: Border.all(color: intensityColor, width: 2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              mission.title,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AccessibilityTheme.textHigh,
                height: 1.3,
              ),
            ),
            SizedBox(height: AccessibilityTheme.space1),
            Text(
              mission.description,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            SizedBox(height: AccessibilityTheme.space1),
            Text(
              'Intensidad: ${mission.breachIntensity}/10',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: intensityColor,
              ),
            ),
            SizedBox(height: AccessibilityTheme.space1),
            Text(
              'Expira en $hoursLeft horas',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            SizedBox(height: AccessibilityTheme.space2),
            AccessibleButton(
              label: 'Completar Misión',
              hint:
                  'Marca esta misión como completada, recupera estabilidad y gana puntos de botín.',
              isPrimary: true,
              onTap: onComplete,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Crafting Section ─────────────────────────────────────────────────

class _CraftingSection extends StatelessWidget {
  final int lootPoints;
  final List<CraftedItem> inventory;
  final Future<void> Function(String itemKey) onCraft;

  const _CraftingSection({
    required this.lootPoints,
    required this.inventory,
    required this.onCraft,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      label: 'Crafteo de objetos. Puntos de botín: $lootPoints.',
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(AccessibilityTheme.space3),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Crafteo Instantáneo',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              SizedBox(height: AccessibilityTheme.space1),
              Semantics(
                liveRegion: true,
                child: Text(
                  'Puntos de Botín: $lootPoints',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: AccessibilityTheme.primary,
                    height: 1.2,
                  ),
                ),
              ),
              SizedBox(height: AccessibilityTheme.space2),
              ...CraftableItem.catalog.map((item) {
                final canAfford = lootPoints >= item.lootCost;
                return _CraftableCard(
                  item: item,
                  canAfford: canAfford,
                  onCraft: () => onCraft(item.key),
                );
              }),
              if (inventory.isNotEmpty) ...[
                SizedBox(height: AccessibilityTheme.space2),
                Text(
                  'Inventario (${inventory.length})',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                SizedBox(height: AccessibilityTheme.space1),
                ...inventory.map((i) => _InventoryRow(item: i)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _CraftableCard extends StatelessWidget {
  final CraftableItem item;
  final bool canAfford;
  final VoidCallback onCraft;

  const _CraftableCard({
    required this.item,
    required this.canAfford,
    required this.onCraft,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      label:
          '${item.displayName}. Costo: ${item.lootCost} puntos. ${item.description}',
      child: Container(
        margin: const EdgeInsets.only(bottom: AccessibilityTheme.space2),
        padding: const EdgeInsets.all(AccessibilityTheme.space2),
        decoration: BoxDecoration(
          color: AccessibilityTheme.surface,
          borderRadius: BorderRadius.circular(AccessibilityTheme.borderRadius),
          border: Border.all(
            color: canAfford
                ? AccessibilityTheme.primary
                : AccessibilityTheme.surfaceElevated,
            width: 2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              item.displayName,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AccessibilityTheme.textHigh,
                height: 1.3,
              ),
            ),
            SizedBox(height: AccessibilityTheme.space1),
            Text(
              item.description,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            SizedBox(height: AccessibilityTheme.space1),
            Text(
              'Costo: ${item.lootCost} puntos',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: canAfford
                    ? AccessibilityTheme.primary
                    : AccessibilityTheme.textHigh.withValues(alpha: 0.5),
              ),
            ),
            SizedBox(height: AccessibilityTheme.space2),
            AccessibleButton(
              label: 'Craftear',
              hint: 'Crea ${item.displayName} gastando ${item.lootCost} puntos.',
              isPrimary: canAfford,
              onTap: canAfford ? onCraft : () {},
            ),
          ],
        ),
      ),
    );
  }
}

class _InventoryRow extends StatelessWidget {
  final CraftedItem item;

  const _InventoryRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '${item.displayName} en inventario',
      child: Padding(
        padding: const EdgeInsets.symmetric(
          vertical: AccessibilityTheme.space1,
        ),
        child: Row(
          children: [
            const Icon(Icons.check_circle,
                color: AccessibilityTheme.success, size: 28),
            SizedBox(width: AccessibilityTheme.space2),
            Expanded(
              child: Text(
                item.displayName,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
