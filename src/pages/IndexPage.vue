<template>
  <q-page class="flex flex-center bg-page">
    <div class="column q-gutter-md card-container">
      <q-btn class="btn-main" label="Descomposición en Valores Singulares (SVD)" @click="goToSVD" />
      <q-btn class="btn-accent" label="Análisis de grafos y agrupación" @click="goToAGA" />
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

<style>
.bg-page {
  background: #f5f8fa;
}
.card-container {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(33, 150, 243, 0.07);
  padding: 48px 32px;
  min-width: 320px;
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
