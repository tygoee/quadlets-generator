<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';
import { isDark } from '@/theme';

import { EditorView, basicSetup } from 'codemirror';
import { linter, type Diagnostic } from '@codemirror/lint';
import { Compartment } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { generate, parseDocument } from 'systemd-parser';

const props = defineProps<{
  map: Record<string, string>;
  required: string[];
}>();

const values = defineModel<Record<string, string | string[]>>({ required: true });

const codeMirrorRef = useTemplateRef<HTMLOutputElement>('code-mirror');

let view: EditorView | null = null;

// Used for automatically changing theme
const themeCompartment = new Compartment();
const lightTheme = EditorView.theme({}, { dark: false });
const darkTheme = oneDark;

onMounted(() => {
  const input = generate({
    Unit: { Description: ['Podman container'] },
    Container: Object.fromEntries(props.required.map((value: string) => [props.map[value], ['']])),
    Service: { Restart: ['on-failure'] },
    Install: { WantedBy: ['multi-user.target default.target'] },
  });

  const doc = parseDocument(input);

  const lint = linter(
    (editor) => {
      const diagnostics: Diagnostic[] = [];

      doc.options.warnFunc = (
        message: string,
        severity: 'hint' | 'info' | 'warning' | 'error',
        location: [number, number, number],
      ) => {
        diagnostics.push({
          from: editor.state.doc.line(location[0]).from,
          to: editor.state.doc.line(location[0]).to,
          severity: 'warning',
          message: message,
        });
      };

      doc.content = editor.state.doc.toString();

      return diagnostics;
    },
    { delay: 0 },
  );

  view = new EditorView({
    parent: codeMirrorRef.value!,
    doc: input,
    extensions: [basicSetup, lint, themeCompartment.of(isDark.value ? darkTheme : lightTheme)],
  });

  watch(isDark, (val) => view?.dispatch({ effects: themeCompartment.reconfigure(val ? darkTheme : lightTheme) }));

  for (const key in values.value) {
    watch(
      () => values.value[key],
      (val) => {
        if (typeof val === 'string') {
          console.log(props.map[key]);
          if (!val && !props.required.includes(key)) {
            doc.remove('Container', props.map[key]!);
          } else {
            doc.set('Container', props.map[key]!, val);
          }
          console.log(doc.content);
          view?.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: doc.content },
          });
        }
      },
    );
  }
});

onBeforeUnmount(() => {
  view?.destroy();
});
</script>

<template>
  <div ref="code-mirror" class="code-mirror"></div>
</template>
