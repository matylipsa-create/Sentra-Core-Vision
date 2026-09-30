import { HotPlugRegistry, type HotPlugPlugin } from '../core/HotPlugRegistry';

export const pwaPluginRegistry = new HotPlugRegistry<void>();

registerPwaPluginLoader('vision', async () => {
	const { terminateOCR } = await import('../services/OCREngine');
	return { id: 'vision', version: '1.0.0', activate() {}, deactivate: () => terminateOCR() };
});
registerPwaPluginLoader('telemetry', async () => {
	const { sensorHub } = await import('../core/SensorHub');
	return {
		id: 'telemetry',
		version: '1.0.0',
		activate: () => sensorHub.startAll(),
		deactivate: () => sensorHub.stopAll(),
	};
});
registerPwaPluginLoader('security', async () => {
	const { bacterialGuardian } = await import('../core/BacterialGuardian');
	return {
		id: 'security',
		version: '1.0.0',
		activate: () => bacterialGuardian.activate(),
		deactivate: () => bacterialGuardian.deactivate(),
	};
});

export function registerPwaPluginLoader(
	id: string,
	loader: () => Promise<HotPlugPlugin<void>>,
): void {
	pwaPluginRegistry.registerLoader(id, loader);
}

export async function activatePwaPlugin(id: string): Promise<void> {
	await pwaPluginRegistry.activate(id, undefined);
}

export async function deactivatePwaPlugin(id: string): Promise<void> {
	await pwaPluginRegistry.deactivate(id, undefined);
}

export async function detachPwaPlugin(id: string): Promise<void> {
	await pwaPluginRegistry.detach(id, undefined);
}