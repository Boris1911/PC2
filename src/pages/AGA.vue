<template>
  <q-page class="q-pa-md bg-page">
    <div class="card-container">
      <h2 class="title-blue">Análisis de Grafos y Agrupación usando SVD</h2>
      <div class="q-mb-md">
        <q-input
          v-model="matrixInput"
          type="textarea"
          label="Matriz de adyacencia (separa filas por coma y columnas por espacio, ej: 0 1 1, 1 0 1, 1 1 0)"
          autogrow
          filled
          class="q-mb-md"
        />
        <q-btn class="btn-main" label="Analizar grafo" @click="analyzeGraph" />
        <q-btn class="btn-accent q-ml-sm" label="Grafo de ejemplo" @click="loadExample" />
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
      <div ref="graphContainer" style="height: 400px; width: 100%; border: 1px solid #e3eaf3;"></div>
    </div>
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
  '0 1 1 0 0 0 0 0 0, 1 0 1 1 0 0 0 0 0, 1 1 0 1 1 0 0 0, 0 1 1 0 1 1 0 0 0, 0 0 1 1 0 1 1 0 0, 0 0 0 1 1 0 1 1 0, 0 0 0 0 1 1 0 1 1, 0 0 0 0 0 1 1 0 1, 0 0 0 0 0 0 1 1 0',
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
  if (!Array.isArray(matrix) || matrix.length === 0) {
    error.value = 'La matriz ingresada no es válida.';
    return;
  }
  try {
    const comms = getCommunitiesFromSVD(matrix);
    communities.value = comms;
    visualizeGraph(matrix, comms);
  } catch (e) {
    error.value = 'Error al analizar la matriz: ' + e.message;
  }
}
</script>

<style>
.bg-page {
  background: #f5f8fa;
}
.card-container {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(33, 150, 243, 0.07);
  padding: 40px 28px;
  max-width: 700px;
  margin: 0 auto;
}
.title-blue {
  color: #1976D2;
  margin-bottom: 18px;
}
.btn-main {
  background: #1976D2;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px 0 rgba(25, 118, 210, 0.10);
}
.btn-accent {
  background: #e3f2fd;
  color: #1976D2;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px 0 rgba(33, 150, 243, 0.10);
}
.btn-main:hover, .btn-accent:hover {
  filter: brightness(0.97);
}
</style>
