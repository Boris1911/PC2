<template>
  <q-page class="flex flex-center bg-page">
    <div class="column q-gutter-md card-container" style="max-width:600px; width:100vw;">
      <SVDDecomposer />
    </div>
  </q-page>
</template>

<script setup>
import SVDDecomposer from 'components/SVDDecomposer.vue';
</script>

<style>
.bg-page {
  background: #b0b8c1;
}
.card-container {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(33, 150, 243, 0.07);
  padding: 48px 32px;
  border: 1.5px solid #e3eaf3;
}
.q-btn {
  background: #1976D2;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px 0 rgba(25, 118, 210, 0.10);
}
.q-btn:hover {
  filter: brightness(0.97);
}
.q-field, .q-input, .q-field__control {
  background: #f7fafc !important;
  border-radius: 8px;
  border: 1px solid #e3eaf3 !important;
}
</style>
