<script lang="ts">
  /**
   * Button - Port of OrcaSlicer's Button widget.
   *
   * Styles:
   *   - Regular (default), Confirm (green/blue), Alert (red/orange), Disabled
   *
   * Types:
   *   - Compact:   Font10, FullyRounded, for spaces with less areas
   *   - Window:    Font12, FullyRounded, for regular buttons in windows
   *   - Choice:    Font14, Semi-Rounded, for dialog/window choice buttons
   *   - Parameter: Font14, Semi-Rounded, for buttons near parameter boxes
   *   - Icon:      Semi-Rounded, for buttons that only has icons (16x16)
   *   - Expanded:  Font14, Semi-Rounded, for full length buttons
   */

  export let label: string = '';
  export let icon: string = '';
  export let inactiveIcon: string = '';
  export let iconSize: number = 16;
  export let style: 'regular' | 'confirm' | 'alert' | 'disabled' = 'regular';
  export let type: 'compact' | 'window' | 'choice' | 'parameter' | 'icon' | 'expanded' = 'window';
  export let disabled: boolean = false;
  export let selected: boolean = true;
  export let value: boolean = false;
  export let center: boolean = true;
  export let vertical: boolean = false;
  export let padding: string = '';
  export let minWidth: string = '';
  export let minHeight: string = '';
  export let fullWidth: boolean = false;
  export let className: string = '';
  export let btnId: string = '';

  // Events
  export let onclick: ((e: MouseEvent) => void) | undefined = undefined;

  const typeConfig: Record<string, { fontSize: string; borderRadius: string; padding: string }> = {
    compact:   { fontSize: '10px', borderRadius: '999px', padding: '4px 12px' },
    window:    { fontSize: '12px', borderRadius: '999px', padding: '8px 20px' },
    choice:    { fontSize: '14px', borderRadius: '8px',    padding: '10px 24px' },
    parameter: { fontSize: '14px', borderRadius: '8px',    padding: '8px 16px' },
    icon:      { fontSize: '0',    borderRadius: '8px',    padding: '6px' },
    expanded:  { fontSize: '14px', borderRadius: '8px',    padding: '10px 16px' },
  };

  const styleColors: Record<string, { bg: string; hoverBg: string; activeBg: string; text: string; border: string }> = {
    regular:  { bg: '#f5f5f5', hoverBg: '#e8e8e8', activeBg: '#d0d0d0', text: '#333333', border: '#d0d0d0' },
    confirm:  { bg: '#007bff', hoverBg: '#0056b3', activeBg: '#004080', text: '#ffffff', border: '#007bff' },
    alert:    { bg: '#dc3545', hoverBg: '#b02a37', activeBg: '#842029', text: '#ffffff', border: '#dc3545' },
    disabled: { bg: '#e0e0e0', hoverBg: '#e0e0e0', activeBg: '#e0e0e0', text: '#999999', border: '#cccccc' },
  };

  $: cfg = typeConfig[type] || typeConfig.window;
  $: colors = styleColors[disabled ? 'disabled' : style] || styleColors.regular;
  $: resolvedIcon = disabled && inactiveIcon ? inactiveIcon : icon;

  function handleClick(e: MouseEvent | KeyboardEvent) {
    if (disabled) return;
    if (onclick) onclick(e as MouseEvent);
  }
</script>

<button
  class="btn btn-{style} btn-{type} {className}"
  {disabled}
  data-selected={selected}
  data-value={value}
  id={btnId}
  style="
    --btn-font-size: {cfg.fontSize};
    --btn-radius: {cfg.borderRadius};
    --btn-padding: {padding || cfg.padding};
    --btn-bg: {colors.bg};
    --btn-hover-bg: {colors.hoverBg};
    --btn-active-bg: {colors.activeBg};
    --btn-text: {colors.text};
    --btn-border: {colors.border};
    --btn-min-width: {minWidth};
    --btn-min-height: {minHeight};
    --btn-icon-size: {iconSize}px;
    --btn-full-width: {fullWidth ? '100%' : 'auto'};
    --btn-center: {center ? 'center' : 'flex-start'};
    --btn-flex-dir: {vertical ? 'column' : 'row'};
  "
  on:click={handleClick}
  on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }}
>
  {#if resolvedIcon}
    <span class="btn-icon">
      <img src={resolvedIcon} alt="" width={iconSize} height={iconSize} />
    </span>
  {/if}
  {#if label && type !== 'icon'}
    <span class="btn-label">{label}</span>
  {/if}
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: var(--btn-center);
    flex-direction: var(--btn-flex-dir);
    gap: 6px;
    font-size: var(--btn-font-size);
    font-family: inherit;
    font-weight: 500;
    border-radius: var(--btn-radius);
    padding: var(--btn-padding);
    min-width: var(--btn-min-width);
    min-height: var(--btn-min-height);
    width: var(--btn-full-width);
    background: var(--btn-bg);
    color: var(--btn-text);
    border: 1px solid var(--btn-border);
    cursor: pointer;
    outline: none;
    transition: background 0.15s ease, box-shadow 0.15s ease;
    box-sizing: border-box;
    white-space: nowrap;
    user-select: none;
  }

  .btn:hover:not(:disabled) {
    background: var(--btn-hover-bg);
  }

  .btn:active:not(:disabled) {
    background: var(--btn-active-bg);
  }

  .btn:focus-visible {
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.4);
  }

  .btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .btn-icon img {
    display: block;
  }

  .btn-label {
    line-height: 1;
  }
</style>
