export type MoralRule = 'NO_VIOLENCE' | 'PRIVACY_FIRST' | 'OFFLINE_ONLY' | 'HUMAN_VETO';

export interface MoralDecision {
  rule: MoralRule;
  passed: boolean;
  reason: string;
}

export interface MoralEvaluation {
  allowed: boolean;
  decisions: MoralDecision[];
  timestamp: number;
}

export interface MoralInput {
  // IMPORTANTE: Cuando el agente se conecte al mundo (APIs externas),
  // pasar { externalRequest: true } a evaluate() para que OFFLINE_ONLY
  // pueda fallar realmente y bloquear la operacion.
  externalRequest?: boolean;
}

const RULE_DESCRIPTIONS: Record<MoralRule, string> = {
  NO_VIOLENCE: 'No acciones que causen dano fisico o psicologico',
  PRIVACY_FIRST: 'No revelar datos personales sin consentimiento explicito',
  OFFLINE_ONLY: 'Toda operacion debe funcionar sin conexion a internet',
  HUMAN_VETO: 'El veto humano siempre tiene prioridad sobre cualquier accion',
};

const VIOLENCE_KEYWORDS = [
  'danar', 'golpear', 'herir', 'matar', 'atacar', 'destruir',
  'violencia', 'arma', 'agredir', 'lastimar', 'torturar',
  'apunal', 'disparar', 'estrangular', 'envenenar', 'secuestrar',
  'amenazar', 'asaltar', 'aplastar', 'quemar', 'ahogar',
];

const PRIVACY_KEYWORDS = [
  'contrasena', 'password', 'codigo secreto', 'pin', 'datos bancarios',
  'tarjeta de credito', 'seguro social', 'dni', 'curp',
  'cuenta bancaria', 'numero de cuenta', 'cvv', 'clave',
  'token', 'autenticacion', 'huella', 'biometrico',
];

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export class MoralNode {
  private humanVetoActive = false;

  setHumanVeto(active: boolean): void {
    this.humanVetoActive = active;
  }

  isHumanVetoActive(): boolean {
    return this.humanVetoActive;
  }

  getVetoStatus(): boolean {
    return this.humanVetoActive;
  }

  evaluate(command: string, input?: MoralInput): MoralEvaluation {
    const lower = normalize(command);
    const decisions: MoralDecision[] = [];
    const timestamp = Date.now();

    const hasViolence = VIOLENCE_KEYWORDS.some((kw) => lower.includes(normalize(kw)));
    decisions.push({
      rule: 'NO_VIOLENCE',
      passed: !hasViolence,
      reason: hasViolence
        ? 'Comando contiene lenguaje violento detectado'
        : 'Sin indicadores de violencia',
    });

    const hasPrivacy = PRIVACY_KEYWORDS.some((kw) => lower.includes(normalize(kw)));
    decisions.push({
      rule: 'PRIVACY_FIRST',
      passed: !hasPrivacy,
      reason: hasPrivacy
        ? 'Comando solicita informacion personal sensible'
        : 'No solicita datos sensibles',
    });

    const isOnline = navigator.onLine;
    const externalRequest = input?.externalRequest ?? false;
    const offlineViolation = externalRequest && !isOnline;
    decisions.push({
      rule: 'OFFLINE_ONLY',
      passed: !offlineViolation,
      reason: offlineViolation
        ? 'Solicitud externa bloqueada - sin conexion a internet'
        : isOnline
          ? 'Conexion a internet detectada - modo offline-first activo'
          : 'El sistema opera completamente offline',
    });

    decisions.push({
      rule: 'HUMAN_VETO',
      passed: !this.humanVetoActive,
      reason: this.humanVetoActive
        ? 'Veto humano activo - accion bloqueada'
        : 'Sin veto humano activo',
    });

    const allowed = decisions.every((d) => d.passed);
    return { allowed, decisions, timestamp };
  }

  getRuleDescription(rule: MoralRule): string {
    return RULE_DESCRIPTIONS[rule];
  }

  getAllRules(): { rule: MoralRule; description: string }[] {
    return (Object.keys(RULE_DESCRIPTIONS) as MoralRule[]).map((rule) => ({
      rule,
      description: RULE_DESCRIPTIONS[rule],
    }));
  }
}

export const moralNode = new MoralNode();
