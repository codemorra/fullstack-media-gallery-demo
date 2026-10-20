/**
 * Shared visibility field for image uploads and metadata editing.
 */

import { useId } from 'react';
import type { GalleryItem } from '../lib/api.ts';

type VisibilitySelectProps = {
  value: GalleryItem['visibility'];
  onChange: (value: GalleryItem['visibility']) => void;
  disabled?: boolean;
};

/**
 * Renders a consistently styled native select with an accessible description.
 *
 * @param props - The controlled visibility field settings.
 * @param props.value - The currently selected visibility.
 * @param props.onChange - Receives the selected visibility.
 * @param props.disabled - Disables the field during a pending request.
 * @returns A labelled visibility dropdown with native keyboard support.
 */
function VisibilitySelect({
  value,
  onChange,
  disabled = false,
}: VisibilitySelectProps) {
  const id = useId();

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        Visibility
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          name="visibility"
          className="field mt-0 appearance-none pr-10"
          value={value}
          onChange={(event) =>
            onChange(event.target.value as GalleryItem['visibility'])
          }
          disabled={disabled}
          aria-describedby={`${id}-description`}
        >
          <option value="private">Private — only you</option>
          <option value="public">Public — everyone</option>
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
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
