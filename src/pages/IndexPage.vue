<template>
  <q-page class="flex flex-center" style="height: 100vh;">
    <div class="column q-gutter-md">
      <q-btn color="primary" label="Descomposición en Valores Singulares (SVD)" @click="goToSVD" />
      <q-btn color="secondary" label="Análisis de grafos y agrupación" @click="goToAGA" />
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
function goToSVD() {
  router.push('/dvs-sdv');
}
function goToAGA() {
  router.push('/aga');
}
</script>
