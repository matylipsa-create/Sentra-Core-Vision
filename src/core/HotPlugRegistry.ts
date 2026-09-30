export type PluginLifecycleState = 'registered' | 'activating' | 'active' | 'deactivating';

export interface HotPlugPlugin<Context = void> {
  id: string;
  version: string;
  activate: (context: Context) => void | Promise<void>;
  deactivate: (context: Context) => void | Promise<void>;
}

export interface PluginStatus {
  id: string;
  version: string;
  state: PluginLifecycleState;
  error?: string;
}

interface PluginEntry<Context> {
  plugin: HotPlugPlugin<Context>;
  state: PluginLifecycleState;
  error?: string;
}

export class HotPlugRegistry<Context = void> {
  private readonly plugins = new Map<string, PluginEntry<Context>>();
  private readonly loaders = new Map<string, () => Promise<HotPlugPlugin<Context>>>();
  private readonly loading = new Map<string, Promise<void>>();

  registerLoader(id: string, loader: () => Promise<HotPlugPlugin<Context>>): void {
    if (!id.trim()) throw new Error('Plugin id cannot be empty');
    if (this.plugins.has(id) || this.loaders.has(id)) throw new Error(`Plugin already registered: ${id}`);
    this.loaders.set(id, loader);
  }

  async load(id: string): Promise<void> {
    if (this.plugins.has(id)) return;
    const currentLoad = this.loading.get(id);
    if (currentLoad) return currentLoad;
    const loader = this.loaders.get(id);
    if (!loader) throw new Error(`Plugin loader not registered: ${id}`);

    const loadPromise = (async () => {
      const plugin = await loader();
      if (plugin.id !== id) throw new Error(`Plugin loader id mismatch: ${id}`);
      this.register(plugin);
    })();
    this.loading.set(id, loadPromise);
    try {
      await loadPromise;
    } finally {
      this.loading.delete(id);
    }
  }

  register(plugin: HotPlugPlugin<Context>): void {
    if (!plugin.id.trim()) throw new Error('Plugin id cannot be empty');
    if (this.plugins.has(plugin.id)) throw new Error(`Plugin already registered: ${plugin.id}`);
    this.plugins.set(plugin.id, { plugin, state: 'registered' });
  }

  async activate(id: string, context: Context): Promise<void> {
    if (!this.plugins.has(id) && this.loaders.has(id)) await this.load(id);
    const entry = this.requirePlugin(id);
    if (entry.state === 'active') return;
    if (entry.state === 'activating' || entry.state === 'deactivating') {
      throw new Error(`Plugin lifecycle transition in progress: ${id}`);
    }

    entry.state = 'activating';
    entry.error = undefined;
    try {
      await entry.plugin.activate(context);
      entry.state = 'active';
    } catch (error) {
      entry.state = 'registered';
      entry.error = error instanceof Error ? error.message : 'Plugin activation failed';
      throw error;
    }
  }

  async deactivate(id: string, context: Context): Promise<void> {
    const entry = this.requirePlugin(id);
    if (entry.state === 'registered') return;
    if (entry.state !== 'active') throw new Error(`Plugin lifecycle transition in progress: ${id}`);

    entry.state = 'deactivating';
    entry.error = undefined;
    try {
      await entry.plugin.deactivate(context);
      entry.state = 'registered';
    } catch (error) {
      entry.state = 'active';
      entry.error = error instanceof Error ? error.message : 'Plugin deactivation failed';
      throw error;
    }
  }

  async detach(id: string, context: Context): Promise<void> {
    const entry = this.plugins.get(id);
    if (!entry) {
      if (this.loaders.delete(id)) return;
      throw new Error(`Plugin not registered: ${id}`);
    }
    if (entry.state === 'active') await this.deactivate(id, context);
    this.plugins.delete(id);
    this.loaders.delete(id);
  }

  isActive(id: string): boolean {
    return this.plugins.get(id)?.state === 'active';
  }

  list(): PluginStatus[] {
    return Array.from(this.plugins.values(), ({ plugin, state, error }) => ({
      id: plugin.id,
      version: plugin.version,
      state,
      ...(error ? { error } : {}),
    }));
  }

  private requirePlugin(id: string): PluginEntry<Context> {
    const entry = this.plugins.get(id);
    if (!entry) throw new Error(`Plugin not registered: ${id}`);
    return entry;
  }
}