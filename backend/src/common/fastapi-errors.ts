/**
 * El `detail` de un error de FastAPI puede ser un string simple (cuando el
 * bot-engine lanza HTTPException con un mensaje) o una lista de objetos de
 * error de Pydantic (cuando falla la validacion automatica del body, ej.
 * {"msg": "...", "loc": [...], ...}). Normaliza ambos casos a un string
 * legible para el cliente.
 */
export function extractErrorMessage(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item === 'object' && 'msg' in item ? String(item.msg) : null))
      .filter((msg): msg is string => Boolean(msg));
    if (messages.length > 0) {
      return messages.join('; ');
    }
  }
  return 'Solicitud invalida';
}
