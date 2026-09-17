import {
  ReactNode, createContext, useContext, useState, useCallback, useEffect,
} from 'react';
import { evolis, EVOLISEvidence } from '../core/EVOLIS';
import { moralNode, MoralEvaluation } from '../core/MoralNode';
import { geminiService } from '../core/GeminiService';
import { TCREIResponse } from '../core/TCREIBridge';
import { perceptionEngine, PerceptionData } from '../core/PerceptionEngine';
import { syncManager, SyncTransport } from '../core/SyncManager';
import { voiceManager } from '../services/VoiceManager';
import { storageService } from '../services/StorageService';
import { PowerMode } from '../core/PowerManager';
import { bioSoftware, BioProtocol, BioSession } from '../core/BioSoftwareInterface';
import { bacterialGuardian, GuardianStatus } from '../core/BacterialGuardian';
import { usbService, PortStatus } from '../services/USBService';
import { contextGovernor } from '../core/ContextGovernor';
import { selfPerceptionLoop } from '../core/SelfPerceptionLoop';
import { identityManager } from '../core/IdentityManager';
import { deviceSensorManager, type AvailableSensor } from '../core/DeviceSensorManager';
import { cognitiveLoadManager, CognitiveMode } from '../core/CognitiveLoadManager';
import { adaptiveUIMode, AdaptiveUIMode } from '../core/AdaptiveUIMode';
import { fieldLogManager, FieldLogEntry } from '../core/FieldLogManager';
import { buildPipelineManager, BuildStatus, BuildResult, BuildType } from '../core/BuildPipelineManager';

export type ModuleName =
  | 'vision' | 'seguridad' | 'movimiento' | 'juego'
  | 'aprendizaje' | 'impacto' | 'silencio' | 'evidencia' | 'bio' | 'guardian'
  | 'identidad' | 'autopercepcion' | 'cognitivo' | 'bitacora';

export type UiMode = 'vision' | 'sentinel';

export interface AppState {
  activeModule: ModuleName;
  voiceEnabled: boolean;
  humanVeto: boolean;
  powerMode: PowerMode;
  syncTransport: SyncTransport;
  lastResponse: TCREIResponse | null;
  lastPerception: PerceptionData | null;
  lastMoralEval: MoralEvaluation | null;
  evidenceCount: number;
  geminiRemote: boolean;
  worldEnabled: boolean;
  isPassiveListening: boolean;
  bioEnabled: boolean;
  bioActiveProtocol: BioProtocol | null;
  bioCurrentSession: BioSession | null;
  bioSessions: BioSession[];
  bioReframe: string | null;
  isBacterialGuardianActive: boolean;
  guardianStatus: GuardianStatus | null;
  usbPorts: Map<string, PortStatus>;
  availableSensors: AvailableSensor[];
  uiMode: UiMode;
  cognitiveLoad: 'low' | 'medium' | 'high';
  cognitiveMode: CognitiveMode;
  uiDetailMode: AdaptiveUIMode;
  fieldLogEntries: FieldLogEntry[];
  buildStatus: BuildStatus;
  currentBuild: BuildResult | null;
  cameraActive: boolean;
  sensorsConnected: boolean;
}

interface AppContextValue extends AppState {
  setModule: (module: ModuleName) => void;
  toggleVoice: () => void;
  toggleHumanVeto: () => void;
  setPowerMode: (mode: PowerMode) => void;
  setSyncTransport: (transport: SyncTransport) => void;
  processCommand: (command: string, perception?: PerceptionData) => Promise<void>;
  setGeminiRemote: (enabled: boolean, apiKey?: string) => void;
  toggleGeminiRemote: () => void;
  toggleWorldConnection: () => void;
  setLastPerception: (perception: PerceptionData) => void;
  togglePassiveListening: () => void;
  exportData: () => Promise<void>;
  getEvidence: () => EVOLISEvidence[];
  toggleBio: () => void;
  startBioSession: (protocol: BioProtocol) => void;
  stopBioSession: () => void;
  getBioReframe: () => void;
  activateGuardian: () => void;
  deactivateGuardian: () => void;
  refreshSensors: () => AvailableSensor[];
  setUiMode: (mode: UiMode) => void;
  setUiDetailMode: (mode: AdaptiveUIMode) => void;
  setCognitiveMode: (mode: CognitiveMode) => void;
  setCognitiveLoad: (load: 'low' | 'medium' | 'high') => void;
  resetCognitiveLoad: () => void;
  addFieldMarker: (label: string) => void;
  exportFieldLog: () => Promise<void>;
  triggerBuild: (type: BuildType) => Promise<void>;
  optimizeBuildForLowEnd: () => void;
  toggleCamera: (active?: boolean) => void;
  setSensorsConnected: (connected: boolean) => void;
  priorityLevel: 'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE';
  setPriorityLevel: (level: 'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE') => void;
  sentinelAlertActive: boolean;
  setSentinelAlertActive: (active: boolean) => void;
  spatialAudioEnabled: boolean;
  setSpatialAudioEnabled: (enabled: boolean) => void;
  perimeterConfig: { cameras: string[]; zones: Array<{ name: string; active: boolean }> };
  setPerimeterConfig: (config: { cameras: string[]; zones: Array<{ name: string; active: boolean }> }) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
    let savedGemini = false;
    let savedWorld = false;
    let savedApiKey = '';
    try {
      savedGemini = localStorage.getItem('sentra_gemini_enabled') === 'true';
      savedWorld = localStorage.getItem('sentra_world_enabled') === 'true';
      savedApiKey = localStorage.getItem('sentra_gemini_api_key') ?? '';
    } catch { /* localStorage unavailable */ }

    const effectiveKey = savedApiKey || envApiKey;
    const geminiOn = savedGemini || (!savedApiKey && !!envApiKey);

    if (effectiveKey) geminiService.setApiKey(effectiveKey);
    geminiService.setRemoteEnabled(geminiOn && !!effectiveKey);
    geminiService.setWorldConnected(savedWorld);

    let savedBio = false;
    try {
      savedBio = localStorage.getItem('sentra_bio_enabled') === 'true';
    } catch { /* localStorage unavailable */ }
    bioSoftware.setEnabled(savedBio);

    let savedCognitiveLoad: 'low' | 'medium' | 'high' = cognitiveLoadManager.getLoadLevel();
    try {
      const rawLoad = localStorage.getItem('sentra_cognitive_load');
      if (rawLoad === 'low' || rawLoad === 'medium' || rawLoad === 'high') savedCognitiveLoad = rawLoad;
    } catch { /* localStorage unavailable */ }

    let savedDetailMode: AdaptiveUIMode = adaptiveUIMode.getMode();
    try {
      const rawMode = localStorage.getItem('sentra_ui_detail_mode');
      if (rawMode === 'smooth' || rawMode === 'analytical' || rawMode === 'silent') savedDetailMode = rawMode;
    } catch { /* localStorage unavailable */ }

    let savedCamera = false;
    try {
      savedCamera = localStorage.getItem('sentra_camera_active') === 'true';
    } catch { /* localStorage unavailable */ }

    return {
      activeModule: 'vision', voiceEnabled: true, humanVeto: false,
      powerMode: 'normal', syncTransport: 'offline',
      lastResponse: null, lastPerception: null, lastMoralEval: null,
      evidenceCount: 0, geminiRemote: geminiOn && !!effectiveKey,
      worldEnabled: savedWorld, isPassiveListening: false,
      bioEnabled: savedBio, bioActiveProtocol: null,
      bioCurrentSession: null, bioSessions: [], bioReframe: null,
      isBacterialGuardianActive: false, guardianStatus: null, usbPorts: new Map(),
      availableSensors: [],
      uiMode: 'vision',
      cognitiveLoad: savedCognitiveLoad,
      cognitiveMode: 'ASSIST',
      uiDetailMode: savedDetailMode,
      fieldLogEntries: [],
      buildStatus: 'idle',
      currentBuild: null,
      cameraActive: savedCamera,
      sensorsConnected: false,
    };
  });

  useEffect(() => {
    storageService.init().then(() => {
      storageService.getAllEvidence().then((entries) => {
        if (entries.length > 0) {
          evolis.importState(entries);
          setState((s) => ({ ...s, evidenceCount: entries.length }));
        }
      });
      identityManager.init().then(() => {
        if (!identityManager.verifyIdentityConsistency()) {
          identityManager.createIdentity(
            'Sentra Core',
            'Motor de IA soberano, offline-first, con veto humano y trazabilidad inalterable.',
            'directo', 'directo',
            ['soberania', 'offline-first', 'veto-humano', 'trazabilidad', 'accesibilidad']
          );
          identityManager.persistInitialIdentity();
        }
      });
      cognitiveLoadManager.init();
      fieldLogManager.init().then(() => {
        setState((s) => ({ ...s, fieldLogEntries: fieldLogManager.getRecentEntries(30) }));
      });
    });
  }, []);

  useEffect(() => {
    const unsub = bacterialGuardian.subscribe((status) => {
      const ports = new Map<string, PortStatus>();
      for (const dev of usbService.getDevices()) {
        const key = `${dev.vendorId}:${dev.productId}:${dev.serialNumber ?? 'unknown'}`;
        ports.set(key, usbService.getPortStatus(key));
      }
      setState((s) => ({
        ...s,
        guardianStatus: status,
        isBacterialGuardianActive: status.state !== 'dormant',
        usbPorts: ports,
      }));
    });
    return unsub;
  }, []);

  const setModule = useCallback((module: ModuleName) => {
    setState((s) => ({ ...s, activeModule: module }));
    voiceManager.speak(`Modulo ${module} activado`, 3);
  }, []);

  const toggleVoice = useCallback(() => {
    setState((s) => {
      const enabled = !s.voiceEnabled;
      voiceManager.setEnabled(enabled);
      return { ...s, voiceEnabled: enabled };
    });
  }, []);

  const toggleHumanVeto = useCallback(() => {
    setState((s) => {
      const veto = !s.humanVeto;
      moralNode.setHumanVeto(veto);
      if (veto) voiceManager.speak('Veto humano activado. Todas las acciones estan bloqueadas.', 1);
      else voiceManager.speak('Veto humano desactivado. Operacion normal.', 1);
      return { ...s, humanVeto: veto };
    });
  }, []);

  const setPowerMode = useCallback((mode: PowerMode) => {
    setState((s) => ({ ...s, powerMode: mode }));
  }, []);

  const setSyncTransport = useCallback((transport: SyncTransport) => {
    syncManager.setTransport(transport);
    setState((s) => ({ ...s, syncTransport: transport }));
  }, []);

  const setGeminiRemote = useCallback((enabled: boolean, apiKey?: string) => {
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
    if (enabled && apiKey) {
      geminiService.setApiKey(apiKey);
      geminiService.setRemoteEnabled(true);
      try { localStorage.setItem('sentra_gemini_enabled', 'true'); localStorage.setItem('sentra_gemini_api_key', apiKey); } catch { /* localStorage unavailable */ }
    } else if (enabled && envApiKey) {
      geminiService.setApiKey(envApiKey);
      geminiService.setRemoteEnabled(true);
      try { localStorage.setItem('sentra_gemini_enabled', 'true'); } catch { /* localStorage unavailable */ }
    } else {
      geminiService.setApiKey(envApiKey);
      geminiService.setRemoteEnabled(false);
      try { localStorage.setItem('sentra_gemini_enabled', 'false'); localStorage.removeItem('sentra_gemini_api_key'); } catch { /* localStorage unavailable */ }
    }
    setState((s) => ({ ...s, geminiRemote: enabled }));
  }, []);

  const toggleGeminiRemote = useCallback(() => {
    setState((s) => {
      const next = !s.geminiRemote;
      const envApiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
      const savedApiKey = (() => { try { return localStorage.getItem('sentra_gemini_api_key') ?? ''; } catch { return ''; } })();
      const effectiveKey = savedApiKey || envApiKey;
      if (next && effectiveKey) {
        geminiService.setApiKey(effectiveKey);
        geminiService.setRemoteEnabled(true);
      } else {
        geminiService.setRemoteEnabled(false);
      }
      try { localStorage.setItem('sentra_gemini_enabled', String(next)); } catch { /* localStorage unavailable */ }
      voiceManager.speak(next ? 'Gemini activado' : 'Gemini desactivado, modo local', 1);
      return { ...s, geminiRemote: next };
    });
  }, []);

  const toggleWorldConnection = useCallback(() => {
    setState((s) => {
      const next = !s.worldEnabled;
      geminiService.setWorldConnected(next);
      try { localStorage.setItem('sentra_world_enabled', String(next)); } catch { /* localStorage unavailable */ }
      voiceManager.speak(next ? 'Conexion al mundo activada' : 'Conexion al mundo desactivada, modo offline', 1);
      return { ...s, worldEnabled: next };
    });
  }, []);

  const processCommand = useCallback(async (command: string, perception?: PerceptionData) => {
    selfPerceptionLoop.recordAction('command');

    const lower = command.toLowerCase();
    if (lower.includes('como estas') || lower.includes('como te sientes') || lower.includes('estado del sistema')) {
      const report = selfPerceptionLoop.getSelfReport();
      const response = { text: report, confidence: 0.8, source: 'local' as const };
      await evolis.record('autopercepcion', 'self_report', command);
      const evidence = evolis.getEntries();
      await storageService.saveEvidence(evidence[evidence.length - 1]);
      setState((s) => ({ ...s, lastResponse: response, evidenceCount: evidence.length }));
      if (state.voiceEnabled) voiceManager.speak(response.text, 5);
      return;
    }

    const govDecision = contextGovernor.governContext(command, state.activeModule);
    if (govDecision.type === 'block') {
      voiceManager.speak(`Entrada bloqueada: ${govDecision.reason}`, 1);
      return;
    }
    const governedCommand = govDecision.processedInput || command;

    const eval_ = moralNode.evaluate(governedCommand, { externalRequest: state.worldEnabled });
    setState((s) => ({ ...s, lastMoralEval: eval_ }));
    if (!eval_.allowed) {
      const reason = eval_.decisions.find((d) => !d.passed)?.reason ?? 'Accion bloqueada';
      selfPerceptionLoop.recordAction('moral_block');
      voiceManager.speak(`Accion bloqueada: ${reason}`, 1);
      return;
    }
    const perceptionData = perception ?? state.lastPerception;
    const perceptionSummary = perceptionData
      ? perceptionEngine.summarize(perceptionData) : 'Sin percepcion activa';
    const response = await geminiService.query(state.activeModule, perceptionSummary, governedCommand);
    await evolis.record(state.activeModule, 'command', governedCommand);
    const evidence = evolis.getEntries();
    await storageService.saveEvidence(evidence[evidence.length - 1]);
    selfPerceptionLoop.recordAction('evidence');
    setState((s) => ({
      ...s, lastResponse: response, evidenceCount: evidence.length,
    }));
    if (state.voiceEnabled) voiceManager.speak(response.text, 5);
  }, [state.activeModule, state.lastPerception, state.voiceEnabled]);

  const setLastPerception = useCallback((perception: PerceptionData) => {
    setState((s) => ({ ...s, lastPerception: perception }));
  }, []);

  const togglePassiveListening = useCallback(() => {
    setState((s) => {
      const next = !s.isPassiveListening;
      try { localStorage.setItem('sentra_passive_listening', String(next)); } catch { /* localStorage unavailable */ }
      voiceManager.speak(next ? 'Escucha pasiva activada' : 'Escucha pasiva desactivada', 1);
      return { ...s, isPassiveListening: next };
    });
  }, []);

  const exportData = useCallback(async () => {
    await storageService.downloadExport();
  }, []);

  const getEvidence = useCallback(() => evolis.getEntries(), []);

  const toggleBio = useCallback(() => {
    setState((s) => {
      const next = !s.bioEnabled;
      bioSoftware.setEnabled(next);
      try { localStorage.setItem('sentra_bio_enabled', String(next)); } catch { /* localStorage unavailable */ }
      voiceManager.speak(next ? 'BioSoftware activado' : 'BioSoftware desactivado', 1);
      return { ...s, bioEnabled: next };
    });
  }, []);

  const startBioSession = useCallback((protocol: BioProtocol) => {
    const session = bioSoftware.startSession(protocol);
    if (session) {
      const def = bioSoftware.getProtocolDef(protocol);
      voiceManager.speak(`Sesion de ${def?.label ?? protocol} iniciada. Respira y sigue las indicaciones.`, 2);
    }
    setState((s) => ({
      ...s,
      bioActiveProtocol: protocol,
      bioCurrentSession: session,
    }));
  }, []);

  const stopBioSession = useCallback(() => {
    const session = bioSoftware.stopSession();
    if (session) {
      voiceManager.speak(`Sesion completada. Coherencia: ${Math.round(session.metrics.coherenceScore * 100)}%.`, 2);
    }
    const stats = bioSoftware.getState();
    setState((s) => ({
      ...s,
      bioActiveProtocol: null,
      bioCurrentSession: null,
      bioSessions: stats.sessions,
    }));
  }, []);

  const getBioReframe = useCallback(() => {
    const reframe = bioSoftware.getReframe();
    if (reframe) voiceManager.speak(reframe, 3);
    setState((s) => ({ ...s, bioReframe: reframe }));
  }, []);

  const activateGuardian = useCallback(() => {
    bacterialGuardian.activate();
    voiceManager.speak('Guardian bacteriano activado', 2);
  }, []);

  const deactivateGuardian = useCallback(() => {
    bacterialGuardian.deactivate();
    voiceManager.speak('Guardian bacteriano desactivado', 2);
  }, []);

  const refreshSensors = useCallback(() => deviceSensorManager.detectAvailableSensors(), []);

  const setUiMode = useCallback((mode: UiMode) => {
    setState((s) => ({ ...s, uiMode: mode }));
  }, []);

  const setUiDetailMode = useCallback((mode: AdaptiveUIMode) => {
    adaptiveUIMode.setMode(mode);
    try { localStorage.setItem('sentra_ui_detail_mode', mode); } catch { /* localStorage unavailable */ }
    setState((s) => ({ ...s, uiDetailMode: mode }));
  }, []);

  const setCognitiveMode = useCallback((mode: CognitiveMode) => {
    cognitiveLoadManager.setMode(mode);
    setState((s) => ({ ...s, cognitiveMode: mode, cognitiveLoad: cognitiveLoadManager.getLoadLevel() }));
  }, []);

  const setCognitiveLoad = useCallback((load: 'low' | 'medium' | 'high') => {
    try { localStorage.setItem('sentra_cognitive_load', load); } catch { /* localStorage unavailable */ }
    setState((s) => ({ ...s, cognitiveLoad: load }));
  }, []);

  const resetCognitiveLoad = useCallback(() => {
    cognitiveLoadManager.resetLoad();
    setState((s) => ({ ...s, cognitiveLoad: 'low', cognitiveMode: 'ASSIST', uiDetailMode: adaptiveUIMode.getMode() }));
  }, []);

  const addFieldMarker = useCallback((label: string) => {
    fieldLogManager.addMarker(label, null);
    setState((s) => ({ ...s, fieldLogEntries: fieldLogManager.getRecentEntries(30) }));
  }, []);

  const exportFieldLog = useCallback(async () => {
    await fieldLogManager.exportLog();
  }, []);

  const triggerBuild = useCallback(async (type: BuildType) => {
    setState((s) => ({ ...s, buildStatus: 'running' }));
    const result = await buildPipelineManager.triggerBuild(type);
    setState((s) => ({ ...s, buildStatus: result.status, currentBuild: result }));
  }, []);

  const optimizeBuildForLowEnd = useCallback(() => {
    buildPipelineManager.optimizeForLowEnd();
  }, []);

  const toggleCamera = useCallback((active?: boolean) => {
    setState((s) => {
      const next = active ?? !s.cameraActive;
      try { localStorage.setItem('sentra_camera_active', String(next)); } catch { /* localStorage unavailable */ }
      return { ...s, cameraActive: next };
    });
  }, []);

  const setSensorsConnected = useCallback((connected: boolean) => {
    setState((s) => ({ ...s, sensorsConnected: connected }));
  }, []);

  const [priorityLevel, setPriorityLevel] = useState<'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE'>('NAVIGATION');
  const [sentinelAlertActive, setSentinelAlertActive] = useState<boolean>(false);
  const [spatialAudioEnabled, setSpatialAudioEnabled] = useState<boolean>(true);
  const [perimeterConfig, setPerimeterConfig] = useState<{
    cameras: string[];
    zones: Array<{ name: string; active: boolean }>;
  }>({ cameras: [], zones: [] });

  useEffect(() => {
    const saved = localStorage.getItem('sentra:priority-state');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.priorityLevel) setPriorityLevel(p.priorityLevel);
        if (typeof p.sentinelAlertActive === 'boolean') setSentinelAlertActive(p.sentinelAlertActive);
        if (typeof p.spatialAudioEnabled === 'boolean') setSpatialAudioEnabled(p.spatialAudioEnabled);
        if (p.perimeterConfig) setPerimeterConfig(p.perimeterConfig);
      } catch { /* parse error */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'sentra:priority-state',
      JSON.stringify({ priorityLevel, sentinelAlertActive, spatialAudioEnabled, perimeterConfig })
    );
  }, [priorityLevel, sentinelAlertActive, spatialAudioEnabled, perimeterConfig]);

  const value: AppContextValue = {
    ...state, setModule, toggleVoice, toggleHumanVeto,
    setPowerMode, setSyncTransport, processCommand, setGeminiRemote,
    toggleGeminiRemote, toggleWorldConnection, setLastPerception,
    togglePassiveListening,
    exportData, getEvidence,
    toggleBio, startBioSession, stopBioSession, getBioReframe,
    activateGuardian, deactivateGuardian, refreshSensors,
    setUiMode, setUiDetailMode,
    setCognitiveMode, setCognitiveLoad, resetCognitiveLoad,
    addFieldMarker, exportFieldLog,
    triggerBuild, optimizeBuildForLowEnd,
    toggleCamera, setSensorsConnected,
    priorityLevel, setPriorityLevel,
    sentinelAlertActive, setSentinelAlertActive,
    spatialAudioEnabled, setSpatialAudioEnabled,
    perimeterConfig, setPerimeterConfig,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
