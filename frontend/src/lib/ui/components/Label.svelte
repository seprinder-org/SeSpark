<script lang="ts">
  /**
   * Label - Port of OrcaSlicer's Label widget.
   *
   * Supports:
   *   - Head font sizes: 48, 32, 24, 20, 18, 16, 15, 14, 13, 12, 11, 10
   *   - Body font sizes: 16, 15, 14, 13, 12, 11, 10, 9, 8
   *   - Hyperlink style (LB_HYPERLINK)
   *   - Auto word wrap (LB_AUTO_WRAP)
   *   - Propagate mouse events (LB_PROPAGATE_MOUSE_EVENT)
   */

  export let text: string = '';
  export let variant: 'head' | 'body' = 'body';
  export let size: number = 14;
  export let bold: boolean = false;
  export let color: string = '';
  export let hyperlink: boolean = false;
  export let autoWrap: boolean = false;
  export let propagateMouse: boolean = false;
  export let className: string = '';
  export let element: 'span' | 'div' | 'label' | 'p' = 'span';
  export let htmlFor: string = '';

  $: fontSize = `${size}px`;
  $: fontWeight = bold ? '700' : '400';
  $: tag = hyperlink ? 'a' : element;

  function handleClick(e: MouseEvent) {
    if (propagateMouse) {
      // Let parent handle it
    }
  }
</script>

<svelte:element
  this={tag}
  class="label label-{variant}-{size} {className}"
  class:hyperlink
  class:auto-wrap={autoWrap}
  style="
    --label-font-size: {fontSize};
    --label-font-weight: {fontWeight};
    --label-color: {color};
  "
  on:click={hyperlink ? undefined : handleClick}
  {...hyperlink ? { href: '#', target: '_blank', rel: 'noopener' } : {}}
>
  {text}
  <slot />
</svelte:element>

<style>
  .label {
    font-size: var(--label-font-size);
    font-weight: var(--label-font-weight);
    color: var(--label-color);
    line-height: 1.4;
    margin: 0;
    padding: 0;
  }

  .label.hyperlink {
    color: #0066cc;
    text-decoration: underline;
    cursor: pointer;
  }

  .label.hyperlink:hover {
    color: #004499;
  }

  .label.auto-wrap {
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
  }

  /* Head variants */
  .label.head-48 { font-size: 48px; font-weight: 700; }
  .label.head-32 { font-size: 32px; font-weight: 700; }
  .label.head-24 { font-size: 24px; font-weight: 700; }
  .label.head-20 { font-size: 20px; font-weight: 600; }
  .label.head-18 { font-size: 18px; font-weight: 600; }
  .label.head-16 { font-size: 16px; font-weight: 600; }
  .label.head-15 { font-size: 15px; font-weight: 600; }
  .label.head-14 { font-size: 14px; font-weight: 600; }
  .label.head-13 { font-size: 13px; font-weight: 600; }
  .label.head-12 { font-size: 12px; font-weight: 600; }
  .label.head-11 { font-size: 11px; font-weight: 600; }
  .label.head-10 { font-size: 10px; font-weight: 600; }

  /* Body variants */
  .label.body-16 { font-size: 16px; font-weight: 400; }
  .label.body-15 { font-size: 15px; font-weight: 400; }
  .label.body-14 { font-size: 14px; font-weight: 400; }
  .label.body-13 { font-size: 13px; font-weight: 400; }
  .label.body-12 { font-size: 12px; font-weight: 400; }
  .label.body-11 { font-size: 11px; font-weight: 400; }
  .label.body-10 { font-size: 10px; font-weight: 400; }
  .label.body-9  { font-size: 9px;  font-weight: 400; }
  .label.body-8  { font-size: 8px;  font-weight: 400; }
</style>
