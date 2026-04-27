function ModeToggle({ currentMode, onModeChange }) {
  const tabs = [
    { id: 'learn', label: '学习', icon: '📖' },
    { id: 'practice', label: '练习', icon: '✍️' },
    { id: 'brush', label: '刷题', icon: '⚡' },
    { id: 'manage', label: '管理', icon: '⚙️' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onModeChange(tab.id)}
            className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-colors ${
              currentMode === tab.id
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ModeToggle;
