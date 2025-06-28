<template>
  <q-layout view="lHh Lpr lFf" class="bg-page">
    <q-header elevated>
      <q-toolbar class="justify-center">
        <q-btn v-if="$route.path !== '/'" flat no-caps class="text-white q-mr-md" label="Atrás" @click="goBack" />
        <q-toolbar-title class="text-center">
          Descomposición Matricial SVD
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const $route = useRoute();
function goBack() {
  router.back();
}
</script>

<style>
.bg-page {
  background: #b0b8c1 !important;
}
</style>
