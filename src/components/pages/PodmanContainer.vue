<script setup lang="ts">
import { provide, ref, watch } from 'vue';
import Page from '../ResourcePage.vue';
import ResourceOption from '../ResourceOption.vue';
import ResourceOutput from '../ResourceOutput.vue';

const props = defineProps<{
  resource: Resource;
}>();

const resource = props.resource;
provide('id', resource.id);

const inputs = ['name', 'image'] as const;

const quadlets: Record<(typeof inputs)[number], string> = {
  name: 'ContainerName',
  image: 'Image',
} as const;

resource.placeholder = 'Unnamed container';
const values = ref<Record<string, string | string[]>>({ name: '' });
for (const option of Object.keys(inputs)) {
  values.value[option] ??= '';
}

watch(
  () => values.value.name,
  (val?: string | string[]) => {
    if (typeof val === 'string') resource.name = val;
  },
);
</script>

<template>
  <Page :resource="resource" :tabs="{ general: 'General', networking: 'Networking' }">
    <template #tab-general>
      <fieldset>
        <ResourceOption option="name" name="Name" v-model="values.name" pattern="[a-zA-Z0-9][a-zA-Z0-9_.\-]*">
          <template #invalid>
            Must start with a letter or number and must only contain letters, numbers, underscores, dots and hyphens
          </template>
          <template #description>The container name</template>
          <template #info>The container name is used to reference the container</template>
        </ResourceOption>
        <ResourceOption option="image" name="Image / FQIN" v-model="values.image"></ResourceOption>
      </fieldset>
      <fieldset></fieldset>
    </template>
    <template #tab-networking>Networking</template>
    <template #output>
      <ResourceOutput
        :types="{ quadlets: { name: 'Quadlets', map: quadlets, required: ['image'] } }"
        v-model="values"
      ></ResourceOutput>
    </template>
  </Page>
</template>
