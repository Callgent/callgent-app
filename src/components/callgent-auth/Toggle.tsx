/** Toggle switch */
export default function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex items-center justify-between gap-4 w-full sm:w-auto"
    >
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>

      <span
        className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors ${
          checked ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked
              ? "translate-x-5 dark:bg-black"
              : "translate-x-0 dark:bg-white"
          }`}
        />
      </span>
    </button>
  );
}
