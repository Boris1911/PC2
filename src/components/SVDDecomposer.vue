<template>
  <q-card class="q-pa-lg q-mx-auto" style="max-width: 600px;">
    <q-card-section>
      <div class="text-h6">Descomposición en Valores Singulares (SVD)</div>
      <div class="q-mt-md row items-center q-gutter-md">
        <q-input
          v-model.number="rows"
          type="number"
          min="1"
          label="Filas"
          style="width: 100px;"
        />
        <q-input
          v-model.number="cols"
          type="number"
          min="1"
          label="Columnas"
          style="width: 120px;"
        />
        <q-btn color="primary" label="Crear matriz" @click="createMatrix" />
      </div>
      <div v-if="matrix.length" class="q-mt-md">
        <div class="q-mb-sm">Ingresa los valores de la matriz:</div>
        <div class="column q-gutter-sm">
          <div v-for="(row, i) in matrix" :key="i" class="row q-gutter-sm">
            <q-input
              v-for="(val, j) in row"
              :key="j"
              v-model.number="matrix[i][j]"
              type="number"
              dense
              style="width: 70px;"
              :label="i === 0 ? `Col ${j+1}` : ''"
            />
          </div>
        </div>
        <div class="q-mt-md flex flex-center">
          <q-btn color="primary" label="Calcular SVD" @click="handleSVD" />
        </div>
      </div>
    </q-card-section>
    <q-separator v-if="result" />
    <q-card-section v-if="result">
      <div class="text-subtitle1">Matriz U</div>
      <pre>{{ formatMatrix(result.U) }}</pre>
      <div class="text-subtitle1">Σ (valores singulares)</div>
      <pre>{{ formatMatrix(result.S) }}</pre>
      <div class="text-subtitle1">Matriz Vᵗ</div>
      <pre>{{ formatMatrix(result.V) }}</pre>
    </q-card-section>
    <q-card-section v-if="error">
      <q-banner dense class="bg-red-2 text-red-10">{{ error }}</q-banner>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue';
import { SVD } from 'ml-matrix';

const rows = ref(2);
const cols = ref(2);
const matrix = ref([]);
const error = ref('');
const result = ref(null);

function createMatrix() {
  error.value = '';
  result.value = null;
  if (rows.value < 1 || cols.value < 1) {
    error.value = 'Las dimensiones deben ser mayores a cero.';
    return;
  }
  matrix.value = Array.from({ length: rows.value }, () => Array(cols.value).fill(0));
}

function handleSVD() {
  error.value = '';
  result.value = null;
  if (!matrix.value.length || !matrix.value[0].length) {
    error.value = 'Primero crea la matriz.';
    return;
  }
  // Validar que todos los valores sean números
  for (let i = 0; i < matrix.value.length; i++) {
    for (let j = 0; j < matrix.value[0].length; j++) {
      if (typeof matrix.value[i][j] !== 'number' || isNaN(matrix.value[i][j])) {
        error.value = `Valor inválido en la posición (${i+1}, ${j+1}).`;
        return;
      }
    }
  }
  try {
    const svd = new SVD(matrix.value);
    result.value = {
      U: svd.leftSingularVectors.to2DArray(),
      S: svd.diagonal,
      V: svd.rightSingularVectors.transpose().to2DArray(),
    };
  } catch {
    error.value = 'No se pudo calcular la SVD. Verifica que la matriz sea válida.';
  }
}

function formatMatrix(mat) {
  if (!mat) return '';
  if (Array.isArray(mat[0])) {
    return mat.map(row => row.join('\t')).join('\n');
  }
  return mat.join('\t');
}
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
