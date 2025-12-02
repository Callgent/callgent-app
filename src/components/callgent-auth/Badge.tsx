/** Badge indicator */
export default function Badge({ enabled }: { enabled: boolean }) {
  const styles = {
    true: "bg-green-50 text-green-700 border-green-200",
    false: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${
        enabled ? styles.true : styles.false
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          enabled ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}
