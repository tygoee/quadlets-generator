<script setup lang="ts">
import { inject, ref } from 'vue';

const props = defineProps<{
  option: string;
  name: string;
  pattern?: string;
  modelValue?: string | string[];
}>();

const slots = defineSlots<{
  invalid: never;
  description: never;
  info: never;
}>();

const emit = defineEmits(['update:modelValue']);

const id = inject<number>('id');
const inputId = `option-${props.option}-${id}`;
const showInfo = ref<boolean>(false);

function changeValue(value: string) {
  if (typeof props.pattern === 'undefined') {
    emit('update:modelValue', value);
    return;
  }

  if (value === '' || new RegExp(`^${props.pattern}$`).test(value)) emit('update:modelValue', value);
}
</script>

<template>
  <div class="option">
    <div class="label">
      <label :for="inputId">{{ props.name }}</label>
      <button
        :id="`${inputId}-info-toggle`"
        class="info-toggle"
        type="button"
        aria-label="More information"
        :aria-controls="`${inputId}-info`"
        :aria-expanded="showInfo"
        v-if="slots.info"
        @click="showInfo = !showInfo"
      >
        &#9432;
      </button>
    </div>
    <div class="inputs">
      <input
        :id="inputId"
        type="text"
        :value="props.modelValue"
        size="1"
        :pattern="props.pattern"
        :aria-describedby="slots.description ? `${inputId}-description` : undefined"
        @input="changeValue(($event.target as HTMLInputElement).value)"
      />
    </div>
    <small class="invalid-description"
      ><slot name="invalid"
        >Must start with a letter or number, and only contain letters, numbers, underscores, dots and hyphens</slot
      ></small
    >
    <small :id="`${inputId}-description`" class="description" v-if="slots.description">
      <slot name="description"></slot>
    </small>
    <p
      :id="`${inputId}-info`"
      class="info"
      :aria-labelledby="`${inputId}-info-toggle`"
      v-show="showInfo"
      v-if="slots.info"
    >
      <slot name="info"></slot>
    </p>
  </div>
</template>

<style>
.option {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 5px;
  margin: 15px 10px;

  button,
  select,
  input {
    align-self: start;
    border: 2px solid var(--body-color-secondary);
  }

  .label {
    display: flex;
    gap: 5px;
  }

  .info-toggle,
  .info-toggle:hover {
    padding: 0 0;
    border: none;
    cursor: pointer;
    background-color: var(--body-color);
  }

  .inputs {
    display: flex;
    gap: 5px;
  }

  .inputs * {
    flex: 1;
  }

  .inputs:has(input:invalid)::after {
    content: '\26A0'; /* &#9888 */
  }

  .invalid-description {
    display: block;
    grid-column: 1 / 3;
    color: red;
  }

  .inputs:has(input:valid) + .invalid-description {
    display: none;
  }

  .description {
    color: var(--text-color-dimmed);
    font-style: italic;
  }

  .description,
  .info {
    grid-column: 1 / 3;
  }
}
</style>
