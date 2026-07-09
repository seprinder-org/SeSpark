<script lang="ts">
  /**
   * HyperLink - Port of OrcaSlicer's HyperLink widget.
   * A clickable hyperlink styled text.
   */

  export let href: string = '#';
  export let text: string = '';
  export let color: string = '#0066cc';
  export let hoverColor: string = '#004499';
  export let underline: boolean = true;
  export let className: string = '';

  // Events
  export let onclick: ((e: MouseEvent) => void) | undefined = undefined;

  function handleClick(e: MouseEvent) {
    if (onclick) {
      e.preventDefault();
      onclick(e);
    }
  }
</script>

<a
  class="hyperlink {className}"
  {href}
  target="_blank"
  rel="noopener noreferrer"
  on:click={handleClick}
  style="
    --hl-color: {color};
    --hl-hover-color: {hoverColor};
    --hl-underline: {underline ? 'underline' : 'none'};
  "
>
  {text}
  <slot />
</a>

<style>
  .hyperlink {
    color: var(--hl-color);
    text-decoration: var(--hl-underline);
    cursor: pointer;
    font-size: inherit;
    transition: color 0.15s ease;
  }

  .hyperlink:hover {
    color: var(--hl-hover-color);
  }

  .hyperlink:visited {
    color: #551a8b;
  }
</style>
