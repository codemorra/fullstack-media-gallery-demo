/**
 * Shared visibility field for image uploads and metadata editing.
 */

import { useEffect, useId, useRef, useState } from 'react';
import type { GalleryItem } from '../lib/api.ts';

type VisibilitySelectProps = {
  value: GalleryItem['visibility'];
  onChange: (value: GalleryItem['visibility']) => void;
  disabled?: boolean;
};

const options = [
  { value: 'private', label: 'Private — only you' },
  { value: 'public', label: 'Public — everyone' },
] as const;

/**
 * Renders a styled select-only combobox with keyboard navigation.
 * Focus stays on the trigger while aria-activedescendant identifies the option.
 * Escape cancels the choice; Enter, Space, or Tab confirms it.
 *
 * @param props - The controlled visibility field settings.
 * @param props.value - The currently selected visibility.
 * @param props.onChange - Receives the selected visibility.
 * @param props.disabled - Disables the field during a pending request.
 * @returns A labelled visibility dropdown with a matching light/dark options panel.
 */
function VisibilitySelect({
  value,
  onChange,
  disabled = false,
}: VisibilitySelectProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const isExpanded = isOpen && !disabled;

  useEffect(() => {
    if (!isExpanded) return;

    function handleOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick);
    return () =>
      document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isExpanded]);

  /**
   * Commits the highlighted option without submitting the surrounding form.
   *
   * @param index - The index of the selected visibility option.
   */
  function selectOption(index: number) {
    onChange(options[index].value);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef}>
      <span className="field-label" id={`${id}-label`}>
        Visibility
      </span>
      <div className="relative mt-2">
        <input
          type="hidden"
          name="visibility"
          value={value}
          disabled={disabled}
        />
        <button
          id={id}
          type="button"
          role="combobox"
          className="field mt-0 flex items-center justify-between gap-3 text-left"
          aria-labelledby={`${id}-label`}
          aria-haspopup="listbox"
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? `${id}-options` : undefined}
          aria-activedescendant={
            isExpanded ? `${id}-option-${activeIndex}` : undefined
          }
          disabled={disabled}
          aria-describedby={`${id}-description`}
          onClick={() => {
            setActiveIndex(selectedIndex);
            setIsOpen(!isExpanded);
          }}
          onBlur={() => setIsOpen(false)}
          onKeyDown={(event) => {
            // Escape closes only the options panel, not the surrounding modal.
            if (event.key === 'Escape' && isExpanded) {
              event.preventDefault();
              event.stopPropagation();
              setIsOpen(false);
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              const step = event.key === 'ArrowDown' ? 1 : -1;
              setActiveIndex(
                isExpanded
                  ? (activeIndex + step + options.length) % options.length
                  : selectedIndex,
              );
              setIsOpen(true);
            } else if (event.key === 'Home' || event.key === 'End') {
              event.preventDefault();
              setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
              setIsOpen(true);
            } else if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              if (isExpanded) selectOption(activeIndex);
              else {
                setActiveIndex(selectedIndex);
                setIsOpen(true);
              }
            } else if (event.key === 'Tab' && isExpanded) {
              selectOption(activeIndex);
            }
          }}
        >
          <span>{options[selectedIndex].label}</span>
          <svg
            aria-hidden="true"
            className={`size-4 shrink-0 text-slate-500 transition-transform dark:text-slate-400 motion-reduce:transition-none ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {isExpanded && (
          <div
            id={`${id}-options`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="absolute top-full right-0 left-0 z-20 mt-2 space-y-1 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-sm ${index === activeIndex ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-200'}`}
                onPointerMove={() => setActiveIndex(index)}
                // Keep DOM focus on the combobox while choosing an option.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(index)}
              >
                {option.label}
                {option.value === value && (
                  <svg
                    aria-hidden="true"
                    className="size-4 shrink-0 text-indigo-600 dark:text-indigo-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <p
        id={`${id}-description`}
        className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400"
      >
        Private images are only visible to you. Public images appear in the
        gallery and can be viewed without signing in.
      </p>
    </div>
  );
}

export default VisibilitySelect;
