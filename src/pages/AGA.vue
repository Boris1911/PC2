<template>
  <q-page class="q-pa-md">
    <h2>Análisis de Grafos y Agrupación usando SVD</h2>
    <div class="q-mb-md">
      <q-input
        v-model="matrixInput"
        type="textarea"
        label="Matriz de adyacencia (separa filas por coma y columnas por espacio, ej: 0 1 1, 1 0 1, 1 1 0)"
        autogrow
        filled
        class="q-mb-md"
      />
      <q-btn color="primary" label="Analizar grafo" @click="analyzeGraph" />
      <q-btn color="secondary" label="Grafo de ejemplo" @click="loadExample" class="q-ml-sm" />
    </div>
    <div v-if="error" class="text-negative q-mb-md">{{ error }}</div>
    <div v-if="communities.length">
      <p><b>Agrupaciones encontradas (por color):</b></p>
      <ul>
        <li v-for="(group, idx) in communities" :key="idx">
          Comunidad {{ idx + 1 }}: Nodos {{ group.join(', ') }}
        </li>
      </ul>
    </div>
    <div ref="graphContainer" style="height: 400px; width: 100%; border: 1px solid #ccc;"></div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { SVD, Matrix } from 'ml-matrix';
import { Network } from 'vis-network/standalone';
import { parseMatrix } from '../utils/parseMatrix';

const graphContainer = ref(null);
const error = ref('');
const communities = ref([]);
const matrixInput = ref('');
let network = null;

const exampleGraphs = [
  // 1. Dos triángulos desconectados
  '0 1 1 0 0 0, 1 0 1 0 0 0, 1 1 0 0 0 0, 0 0 0 0 1 1, 0 0 0 1 0 1, 0 0 0 1 1 0',
  // 2. Un ciclo de 6 nodos
  '0 1 0 0 0 1, 1 0 1 0 0 0, 0 1 0 1 0 0, 0 0 1 0 1 0, 0 0 0 1 0 1, 1 0 0 0 1 0',
  // 3. Grafo bipartito completo K3,3
  '0 0 0 1 1 1, 0 0 0 1 1 1, 0 0 0 1 1 1, 1 1 1 0 0 0, 1 1 1 0 0 0, 1 1 1 0 0 0',
  // 4. Grafo de 7 nodos, estrella
  '0 1 1 1 1 1 1, 1 0 0 0 0 0 0, 1 0 0 0 0 0 0, 1 0 0 0 0 0 0, 1 0 0 0 0 0 0, 1 0 0 0 0 0 0, 1 0 0 0 0 0 0',
  // 5. Grafo de 8 nodos, dos cuadrados conectados
  '0 1 0 1 0 0 0 0, 1 0 1 0 0 0 0 0, 0 1 0 1 0 0 0 0, 1 0 1 0 1 0 0 0, 0 0 0 1 0 1 0 1, 0 0 0 0 1 0 1 0, 0 0 0 0 0 1 0 1, 0 0 0 0 1 0 1 0',
  // 6. Grafo de 9 nodos, cuadrado con diagonales
  '0 1 1 0 0 0 0 0 0, 1 0 1 1 0 0 0 0 0, 1 1 0 1 1 0 0 0 0, 0 1 1 0 1 1 0 0 0, 0 0 1 1 0 1 1 0 0, 0 0 0 1 1 0 1 1 0, 0 0 0 0 1 1 0 1 1, 0 0 0 0 0 1 1 0 1, 0 0 0 0 0 0 1 1 0',
  // 7. Grafo de 10 nodos, dos comunidades conectadas por un puente
  '0 1 1 1 0 0 0 0 0 0, 1 0 1 1 0 0 0 0 0 0, 1 1 0 1 0 0 0 0 0 0, 1 1 1 0 1 0 0 0 0 0, 0 0 0 1 0 1 1 1 0 0, 0 0 0 0 1 0 1 1 1 0, 0 0 0 0 1 1 0 1 1 0, 0 0 0 0 1 1 1 0 1 1, 0 0 0 0 0 1 1 1 0 1, 0 0 0 0 0 0 0 1 1 0',
  // 8. Grafo de 10 nodos, anillo
  '0 1 0 0 0 0 0 0 0 1, 1 0 1 0 0 0 0 0 0 0, 0 1 0 1 0 0 0 0 0 0, 0 0 1 0 1 0 0 0 0 0, 0 0 0 1 0 1 0 0 0 0, 0 0 0 0 1 0 1 0 0 0, 0 0 0 0 0 1 0 1 0 0, 0 0 0 0 0 0 1 0 1 0, 0 0 0 0 0 0 0 1 0 1, 1 0 0 0 0 0 0 0 1 0',
  // 9. Grafo de 10 nodos, grafo completo
  '0 1 1 1 1 1 1 1 1 1, 1 0 1 1 1 1 1 1 1 1, 1 1 0 1 1 1 1 1 1 1, 1 1 1 0 1 1 1 1 1 1, 1 1 1 1 0 1 1 1 1 1, 1 1 1 1 1 0 1 1 1 1, 1 1 1 1 1 1 0 1 1 1, 1 1 1 1 1 1 1 0 1 1, 1 1 1 1 1 1 1 1 0 1, 1 1 1 1 1 1 1 1 1 0',
  // 10. Grafo de 10 nodos, árbol binario
  '0 1 1 0 0 0 0 0 0 0, 1 0 0 1 1 0 0 0 0 0, 1 0 0 0 0 1 1 0 0 0, 0 1 0 0 0 0 0 1 1 0, 0 1 0 0 0 0 0 0 0 1, 0 0 1 0 0 0 0 0 0 0, 0 0 1 0 0 0 0 0 0 0, 0 0 0 1 0 0 0 0 0 0, 0 0 0 1 0 0 0 0 0 0, 0 0 0 0 1 0 0 0 0 0'
];

let exampleIndex = 0;

function loadExample() {
  matrixInput.value = exampleGraphs[exampleIndex];
  error.value = '';
  communities.value = [];
  if (network) network.destroy();
  exampleIndex = (exampleIndex + 1) % exampleGraphs.length;
}

function getCommunitiesFromSVD(A) {
  const svd = new SVD(new Matrix(A));
  const U = svd.leftSingularVectors;
  const secondVec = U.getColumn(1);
  const group1 = [], group2 = [];
  for (let i = 0; i < secondVec.length; i++) {
    if (secondVec[i] >= 0) group1.push(i);
    else group2.push(i);
  }
  return [group1, group2];
}

function visualizeGraph(A, communities) {
  const colors = ['#1976d2', '#e53935', '#43a047', '#fbc02d', '#8e24aa', '#00897b'];
  const nodes = A.map((_, i) => ({
    id: i,
    label: `Nodo ${i}`,
    color: colors[communities.findIndex(g => g.includes(i)) % colors.length]
  }));
  const edges = [];
  for (let i = 0; i < A.length; i++) {
    for (let j = i + 1; j < A.length; j++) {
      if (A[i][j]) edges.push({ from: i, to: j });
    }
  }
  if (network) network.destroy();
  network = new Network(graphContainer.value, { nodes, edges }, {
    nodes: { shape: 'dot', size: 20, font: { size: 16 } },
    edges: { width: 2 },
    physics: { enabled: true }
  });
}

function analyzeGraph() {
  error.value = '';
  if (!matrixInput.value.trim()) {
    error.value = 'Por favor ingresa una matriz de adyacencia.';
    return;
  }
  const { matrix, error: parseError } = parseMatrix(matrixInput.value);
  if (parseError) {
    error.value = parseError;
    return;
  }
  try {
    const comms = getCommunitiesFromSVD(matrix);
    communities.value = comms;
    visualizeGraph(matrix, comms);
  } catch (e) {
    error.value = 'Error en el análisis: ' + e.message;
  }
}
</script>

<style scoped>
</style>
