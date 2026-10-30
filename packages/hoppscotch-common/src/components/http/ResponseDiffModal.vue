<template>
  <HoppSmartModal
    v-if="show"
    dialog
    :title="t('response.compare_title')"
    styles="sm:max-w-5xl"
    full-width-body
    @close="emit('hide-modal')"
  >
    <template #body>
      <div class="flex flex-col">
        <div
          class="grid grid-cols-2 border-b border-dividerLight text-tiny font-semibold text-secondaryLight"
        >
          <span class="px-4 py-2">{{ t("response.previous_run") }}</span>
          <span class="border-l border-dividerLight px-4 py-2">
            {{ t("response.latest_run") }}
          </span>
        </div>
        <div class="h-[32rem] overflow-auto">
          <div ref="diffEditor"></div>
        </div>
      </div>
    </template>
  </HoppSmartModal>
</template>

<script setup lang="ts">
import { MergeView } from "@codemirror/merge"
import { EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { onUnmounted, ref, watch } from "vue"
import { useI18n } from "@composables/i18n"
import { basicSetup, baseTheme } from "@helpers/editor/themes/baseTheme"

const t = useI18n()

const props = defineProps<{
  show: boolean
  previous: string
  latest: string
}>()

const emit = defineEmits<{
  (e: "hide-modal"): void
}>()

const diffEditor = ref<Element | null>(null)
let mergeView: MergeView | null = null

const readOnlyExtensions = [
  basicSetup,
  baseTheme,
  EditorState.readOnly.of(true),
  EditorView.editable.of(false),
]

const destroyMergeView = () => {
  mergeView?.destroy()
  mergeView = null
}

watch(diffEditor, (parent) => {
  destroyMergeView()

  if (!parent) return

  mergeView = new MergeView({
    a: { doc: props.previous, extensions: readOnlyExtensions },
    b: { doc: props.latest, extensions: readOnlyExtensions },
    parent,
    collapseUnchanged: { margin: 3, minSize: 6 },
  })
})

onUnmounted(destroyMergeView)
</script>
