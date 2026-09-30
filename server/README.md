# Sentra Core API Server

Backend WebSocket + REST para el motor Sentra Core.

## Inicio rapido

```bash
cd server
npm install
npm start
```

El servidor escucha en el puerto 8080 (configurable via `SENTRA_PORT`) y enlaza por defecto a `127.0.0.1` (`SENTRA_HOST`).

- **WebSocket**: `ws://127.0.0.1:8080`
- **REST API**: `http://127.0.0.1:8080/api/...`

## Configuracion de produccion

- `SENTRA_API_TOKEN`: credencial bearer obligatoria para arrancar el servidor. Si no se define, el proceso termina. Como transición, acepta `SENTRA_PLUGIN_CONTROL_TOKEN` como fallback.
- `SENTRA_HOST`: dirección de bind; por defecto `127.0.0.1`. Un host no-loopback se rechaza salvo que se configure `SENTRA_TRUSTED_TLS_PROXY=true`.
- `SENTRA_TRUSTED_TLS_PROXY`: confirmación explícita de que un proxy inverso termina TLS delante del backend. No habilitarlo sin TLS y reglas de firewall que impidan el acceso directo al puerto Node.
- Frames WebSocket y cuerpos REST tienen un límite fijo de 64 KiB.
- `SENTRA_CORS_ORIGINS`: lista separada por comas de origenes HTTPS exactos autorizados. HTTP queda permitido solo para loopback.
- `SENTRA_PLUGIN_CONTROL_TOKEN`: segundo secreto para `attach_plugin`, `activate_plugin`, `deactivate_plugin` y `detach_plugin` por TCREI.
- `SENTRA_EVIDENCE_PATH`: ruta del diario EVOLIS JSONL. Por defecto se usa `server/data/evolis-audit.jsonl`.
- `SENTRA_EVIDENCE_KEY_PATH`: ruta de la clave EVOLIS; por defecto se guarda junto al diario con extension `.key.json`.

El backend no usa IndexedDB. El archivo de clave contiene la clave privada: restringe el acceso del sistema operativo y conserva una copia segura junto con el diario.

Solo `GET /api/status`, `GET /api/modules`, `query:get_status` y `query:get_modules` son públicos. Los demás endpoints REST y mensajes TCREI requieren bearer válido. Los clientes nativos pueden enviar `Authorization: Bearer <token>` en el handshake WebSocket; el navegador debe enviar primero `{"type":"auth","token":"..."}` y esperar `{"type":"auth","ok":true}` antes de enviar comandos. El panel de ajustes guarda el token del navegador en `sessionStorage`, no en el bundle.

Para controlar plugins se requiere además el segundo secreto en `payload.controlToken`.

## Sincronizacion air-gapped

El ID del nodo es `sentra:<SHA-256(clave pública SPKI)>`, por lo que se conserva aunque `localStorage` no esté disponible. En Master Engine, introduce el ID del nodo remoto y una frase de intercambio de al menos 12 caracteres. Exporta el delta cifrado como JSON, transfiere el archivo por el medio aislado y usa la misma frase en el nodo receptor para importarlo. El receptor comprueba AES-GCM, que el sourceId corresponda a una única clave pública, continuidad del hash EVOLIS y firmas antes de guardar el lote; los datos recibidos quedan separados de la cadena local.

Cada peer mantiene como máximo un lote exportado pendiente. Después de importar, exporta el acuse cifrado y devuélvelo al nodo origen. El origen exige que peerId, exportId, índice y hash coincidan con ese lote y que el hash/firmas continúen válidos en su cadena; solo entonces avanza el cursor. El próximo paquete contiene únicamente registros posteriores al acuse. Los archivos no contienen la frase de intercambio.

## Endpoints REST

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/status` | Estado global del sistema |
| GET | `/api/modules` | Lista de modulos disponibles |
| GET | `/api/evidence` | Cadena de evidencia EVOLIS (ultimas 50) |
| POST | `/api/evidence/verify` | Verificar integridad de la cadena |
| GET | `/api/bio/protocols` | Protocolos BioSoftware |
| GET | `/api/bio/state` | Estado actual de BioSoftware |
| GET | `/api/bio/stats` | Estadisticas de sesiones bio |
| GET | `/api/guardian/status` | Estado del Guardian Bacteriano |
| POST | `/api/command` | Procesar comando de texto |
| POST | `/api/settings` | Actualizar configuracion |

## WebSocket — Protocolo TCREI

Enviar mensajes JSON con la estructura:

```json
{
  "type": "command | query",
  "module": "vision | bio | evidencia | ...",
  "action": "process | get_status | start_session | ...",
  "payload": { ... },
  "timestamp": 1694123456789,
  "id": "uuid-v4"
}
```

El servidor responde con:

```json
{
  "type": "response",
  "id": "mismo-id",
  "ok": true,
  "data": { ... },
  "timestamp": 1694123456789
}
```

Los eventos push (bio.tick, guardian.alert, etc.) llegan sin `id`:

```json
{
  "type": "event",
  "event": "bio.tick",
  "data": { ... },
  "timestamp": 1694123456789
}
```
