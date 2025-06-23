// src/utils/parseMatrix.js
// Función para convertir el texto del textarea en una matriz numérica
export function parseMatrix(input) {
  if (!input || typeof input !== 'string') return { error: 'Entrada vacía o inválida.' };
  const rows = input.trim().split(',');
  const matrix = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].trim().split(/\s+/).map(Number);
    if (row.some(isNaN)) {
      return { error: `Fila ${i + 1} contiene valores no numéricos.` };
    }
    matrix.push(row);
  }
  // Validar que todas las filas tengan la misma longitud
  const cols = matrix[0].length;
  if (!matrix.every(r => r.length === cols)) {
    return { error: 'Todas las filas deben tener la misma cantidad de columnas.' };
  }
  return { matrix };
}
