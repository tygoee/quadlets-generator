<script setup lang="ts">
import { inject } from 'vue';
import CodeMirror from './CodeMirror.vue';

const props = defineProps<{
  types: Record<string, { name: string; map: Record<string, string>; required: string[] }>;
}>();

const values = defineModel<Record<string, string | string[]>>({ required: true });
const id = inject<number>('id');
</script>

<template>
  <div class="output-section">
    <div class="output-options">
      <label :for="`output-type-${id}`">Output type</label>
      <select :id="`output-type-${id}`">
        <option :value="name" v-for="[name, entry] in Object.entries(props.types)" :key="name">
          {{ entry.name }}
        </option>
      </select>
    </div>
    <CodeMirror :map="props.types['quadlets']!.map" :required="props.types['quadlets']!.required" v-model="values" />
  </div>
</template>

<style>
.output-section {
  display: flex;
  flex-direction: column;

  overflow-y: auto;
}

.output-section > * {
  margin: 10px;
}

.output-options {
  display: flex;
  flex-direction: row;
}

.output-options > * {
  flex: 1;
}

.code-mirror {
  height: 100%;
  overflow-y: auto;
}

.code-mirror > div {
  height: 100%;
}
</style>
