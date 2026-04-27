function Header({
  currentIndex,
  itemsLength,
  mode,
  currentItem,
  showList,
  onToggleList,
  onSelectItem,
  onShuffle,
}) {
  const isManageMode = mode === 'manage';

  return (
    <div className="flex justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
      <span>
        题目 {currentIndex + 1} / {itemsLength}
      </span>
      {!isManageMode && (
        <div className="relative">
          <button onClick={onToggleList} className="text-blue-500 hover:underline">
            选择题目 ▼
          </button>
          {showList && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-80 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              {currentItem &&
                itemsLength > 0 &&
                Array.from({ length: itemsLength }, (_, idx) => {
                  const item = {
                    id: idx + 1,
                    zh_text: itemsLength > 0 ? `题目 ${idx + 1}` : '',
                  };
                  return (
                    <button
                      key={idx}
                      onClick={() => onSelectItem(idx)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                        idx === currentIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">{idx + 1}.</span>
                      {item.zh_text}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}
      {!isManageMode && (
        <button onClick={onShuffle} className="text-blue-500 hover:underline">
          重新打乱
        </button>
      )}
    </div>
  );
}

export default Header;
