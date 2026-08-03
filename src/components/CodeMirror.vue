<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';
import { isDark } from '@/theme';

import { EditorView, basicSetup } from 'codemirror';
import { linter, type Diagnostic } from '@codemirror/lint';
import { Compartment } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { generate, parseDocument, Parser } from 'systemd-parser';

const props = defineProps<{
  map: Record<string, string>;
  required: string[];
}>();

const values = defineModel<Record<string, string | string[]>>({ required: true });

const codeMirrorRef = useTemplateRef<HTMLOutputElement>('code-mirror');

const invertedMap = Object.fromEntries(Object.entries(props.map).map(([key, value]) => [value, key]));
/** Stops the document from reparsing when editing */ let valueLock = false;

let view: EditorView | null = null;

// Used for automatically changing theme
const themeCompartment = new Compartment();
const lightTheme = EditorView.theme({}, { dark: false });
const darkTheme = oneDark;

// Changed the stroke width of the original
const warningSVG =
  "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='6' height='3'><path d='m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0' stroke='orange' fill='none' stroke-width='2'/></svg>\");";
const theme = EditorView.theme({
  '.cm-lintRange-warning': { backgroundImage: warningSVG },
  '.cm-lintRange-error': { backgroundImage: warningSVG },
});

/** Executes on every document change */
function systemdLinter(doc: Parser<void>) {
  return (editor: EditorView) => {
    const diagnostics: Diagnostic[] = [];

    doc.options.warnFunc = (
      message: string,
      severity: 'hint' | 'info' | 'warning' | 'error',
      location: [number, number, number],
    ) => {
      diagnostics.push({
        from: editor.state.doc.line(location[0]).from + location[1],
        to: editor.state.doc.line(location[0]).from + location[2],
        severity: severity,
        message: message,
      });
    };

    doc.content = editor.state.doc.toString();

    valueLock = true;

    for (const [, keys] of Object.entries(doc.output)) {
      for (const [key, vals] of Object.entries(keys)) {
        if (vals.length === 0) continue;

        const val = vals[vals.length - 1];
        values.value[invertedMap[key]!] = val!;
      }
    }

    valueLock = false;

    return diagnostics;
  };
}

onMounted(() => {
  const input = generate({
    Unit: { Description: ['Podman container'] },
    Container: Object.fromEntries(props.required.map((value: string) => [props.map[value], ['']])),
    Service: { Restart: ['on-failure'] },
    Install: { WantedBy: ['multi-user.target default.target'] },
  });

  const doc = parseDocument(input);

  const lint = linter(systemdLinter(doc), { delay: 0 });

  view = new EditorView({
    parent: codeMirrorRef.value!,
    doc: input,
    extensions: [basicSetup, lint, theme, themeCompartment.of(isDark.value ? darkTheme : lightTheme)],
  });

  watch(isDark, (val) => view?.dispatch({ effects: themeCompartment.reconfigure(val ? darkTheme : lightTheme) }));

  for (const key in values.value) {
    watch(
      () => values.value[key],
      (val) => {
        if (!valueLock && typeof val === 'string') {
          if (!val && !props.required.includes(key)) {
            doc.remove('Container', props.map[key]!);
          } else {
            doc.set('Container', props.map[key]!, val);
          }
          view?.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: doc.content },
          });
        }
        valueLock = false;
      },
      { flush: 'sync' },
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
