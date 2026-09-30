export type ImprovementFormat = 'json' | 'csv';

export interface MejoraItem {
  categoria: string;
  descripcion: string;
  accionSugerida: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
}

export interface ReporteMejorasPayload {
  modulo: string;
  version: string;
  timestamp: string;
  recomendaciones: MejoraItem[];
}

export const generarInformeMejoras = (): ReporteMejorasPayload => ({
  modulo: 'Sentra Visión',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  recomendaciones: [
    {
      categoria: 'UI/UX',
      descripcion: 'Disposición de menús y temas visuales (verde táctico / azul ciberpunk).',
      accionSugerida: 'Implementar accesos directos o gestos personalizados para cambio rápido.',
      prioridad: 'Media',
    },
    {
      categoria: 'Telemetría',
      descripcion: 'Monitoreo en tiempo real de sensores (acelerómetro, giroscopio, GPS, calidad de aire).',
      accionSugerida: 'Añadir filtros avanzados y alertas gráficas ante umbrales críticos.',
      prioridad: 'Alta',
    },
    {
      categoria: 'Exportación de Datos',
      descripcion: 'Ampliación de los formatos de control basados en registros.',
      accionSugerida: 'Asegurar soporte nativo para descarga estructurada en JSON y CSV desde el servicio actual.',
      prioridad: 'Alta',
    },
  ],
});

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function downloadImprovementReport(format: ImprovementFormat): void {
  const report = generarInformeMejoras();
  const content = format === 'json'
    ? JSON.stringify(report, null, 2)
    : [
      ['categoria', 'descripcion', 'accionSugerida', 'prioridad'],
      ...report.recomendaciones.map(({ categoria, descripcion, accionSugerida, prioridad }) => [
        categoria,
        descripcion,
        accionSugerida,
        prioridad,
      ]),
    ].map((row) => row.map(escapeCsv).join(',')).join('\r\n');

  const blob = new Blob([content], {
    type: format === 'json' ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sentra-reporte-mejoras-${Date.now()}.${format}`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}