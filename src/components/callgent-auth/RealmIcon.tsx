/** Realm icon */
import { Globe, Lock } from "lucide-react";

export default function RealmIcon({ shared }: { shared: boolean }) {
  return shared ? (
    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30 flex items-center justify-center">
      <Globe size={14} />
    </div>
  ) : (
    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30 flex items-center justify-center">
      <Lock size={14} />
    </div>
  );
}
