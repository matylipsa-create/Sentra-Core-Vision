import { evolis } from './EVOLIS';
import { powerManager, PowerManager } from './PowerManager';
import { sensorPriorityManager, SensorPriorityManager } from './SensorPriorityManager';

const TRANSMISSION_THRESHOLD = 20;

export class EnergyAwareScheduler {
  constructor(
    private readonly power: PowerManager = powerManager,
    private readonly sensors: SensorPriorityManager = sensorPriorityManager,
  ) {}

  shouldTransmit(): boolean {
    return this.power.getEnergyBudget() > TRANSMISSION_THRESHOLD;
  }

  getTransmissionInterval(): number {
    return this.power.getEnergyBudget() > 80 ? 5 : 15;
  }

  prioritizeSensors(): string[] {
    return this.sensors.filterByEnergy(this.sensors.getOptionalSensors(), this.power.getEnergyBudget());
  }

  async recordEnergyCycle(mWh: number): Promise<void> {
    await evolis.record('power', 'energy_cycle', JSON.stringify({
      mWh,
      source: this.power.getEnergySource(),
      harvestedEnergy: this.power.getHarvestedEnergy(),
      energyBudget: this.power.getEnergyBudget(),
    }));
  }
}

export const energyAwareScheduler = new EnergyAwareScheduler();