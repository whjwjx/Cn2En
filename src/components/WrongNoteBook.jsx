import { useState, useEffect } from 'react';
import { getWrongNotes, removeFromWrongNotes, clearWrongNotes } from '../utils/wrongNotes';

function WrongNoteBook({ items, onSelectItem }) {
  const [wrongNotes, setWrongNotes] = useState({ wrong_ids: [], added_at: {} });

  useEffect(() => {
    const loadWrongNotes = async () => {
      const notes = await getWrongNotes();
      setWrongNotes(notes);
    };
    loadWrongNotes();
  }, []);

  const handleRemove = async itemId => {
    const updated = await removeFromWrongNotes(itemId);
    setWrongNotes(updated);
  };

  const handleClearAll = async () => {
    if (window.confirm('确定要清空错题本吗？')) {
      await clearWrongNotes();
      setWrongNotes({ wrong_ids: [], added_at: {} });
    }
  };

  const wrongItems = items.filter(item => wrongNotes.wrong_ids.includes(item.id));

  const formatDate = isoString => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">错题本</h2>
        {wrongItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
          >
            清空全部
          </button>
        )}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        共 {wrongItems.length} 道错题
      </div>

      {wrongItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-lg mb-2">📝</p>
          <p className="text-gray-500 dark:text-gray-400">错题本为空</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">练习或刷题时答错的题目可以手动加入</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {wrongItems.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-red-300 dark:hover:border-red-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 dark:text-gray-200 mb-1">{item.zh_text}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{item.en_standard || item.en_optimized}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                    加入时间：{formatDate(wrongNotes.added_at[item.id])}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onSelectItem(item.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    练习
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                  >
                    移除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WrongNoteBook;
