/**
 * Uploader attribution shown below gallery images.
 */

type MediaAttributionProps = {
  username?: string;
};

/**
 * Shows who uploaded an image without claiming that they hold its copyright.
 *
 * @param props - The optional uploader username.
 * @param props.username - The uploader name returned by the backend, if available.
 * @returns The uploader details, or nothing for unassigned static samples.
 */
function MediaAttribution({ username }: MediaAttributionProps) {
  if (!username) return null;

  return (
    <p className="min-w-0 text-xs wrap-anywhere text-slate-500 dark:text-slate-400">
      Uploaded by {username}
    </p>
  );
}

export default MediaAttribution;
