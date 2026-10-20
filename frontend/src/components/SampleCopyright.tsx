/**
 * Copyright overlay reserved for the six existing sample photos.
 */

type SampleCopyrightProps = {
  filePath: string;
};

/**
 * Places the known copyright notice over the bottom-right corner of a photo.
 * The surrounding image container must be positioned relatively.
 *
 * @param props - The displayed image filename.
 * @param props.filePath - Identifies the six sample photos with known attribution.
 * @returns A non-interactive copyright badge, or nothing for other uploads.
 */
function SampleCopyright({ filePath }: SampleCopyrightProps) {
  if (!/^sample_00[1-6]\.webp$/.test(filePath)) return null;

  return (
    <span className="pointer-events-none absolute right-2 bottom-2 rounded-sm bg-slate-950/65 px-2 py-1 text-[10px] leading-4 font-medium text-white backdrop-blur-sm">
      © Christopher Kranz
    </span>
  );
}

export default SampleCopyright;
