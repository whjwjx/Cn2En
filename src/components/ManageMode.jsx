import { useState } from 'react';
import { translateToEnglish, generateSentencesByTopic } from '../services/ai';
import WrongNoteBook from './WrongNoteBook';
import Settings from './Settings';

function ManageMode({ items, onSave, onImport, onRequestDelete, onSelectItem }) {
  const [subMode, setSubMode] = useState('materials');
  const [editIndex, setEditIndex] = useState(null);
  const [editZh, setEditZh] = useState('');
  const [editEn, setEditEn] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newZh, setNewZh] = useState('');
  const [newEn, setNewEn] = useState('');
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [isAiAdding, setIsAiAdding] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(10);
  const [aiGenerated, setAiGenerated] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleAiTranslate = async () => {
    if (!newZh.trim()) return;
    setIsTranslating(true);
    setTranslationError('');
    try {
      const result = await translateToEnglish(newZh.trim());
      setNewEn(result);
    } catch (error) {
      setTranslationError(error.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleStartEdit = index => {
    setEditIndex(index);
    setEditZh(items[index].zh_text);
    setEditEn(items[index].en_standard);
  };

  const handleSaveEdit = () => {
    if (!editZh.trim() || !editEn.trim()) return;
    onSave(editIndex, { zh_text: editZh.trim(), en_standard: editEn.trim() });
    setEditIndex(null);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditZh('');
    setEditEn('');
  };

  const handleAdd = () => {
    if (!newZh.trim() || !newEn.trim()) return;
    onSave(-1, { zh_text: newZh.trim(), en_standard: newEn.trim() });
    setNewZh('');
    setNewEn('');
    setIsAdding(false);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    onImport(importText);
    setImportText('');
    setIsImporting(false);
  };

  const handleToggleSelect = id => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    onRequestDelete(Array.from(selectedIds));
  };

  const handleSelectFromWrong = itemId => {
    const index = items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      onSelectItem(index);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    setAiError('');
    try {
      const sentences = await generateSentencesByTopic(aiTopic.trim(), aiCount);
      if (sentences.length === 0) {
        setAiError('生成失败，请重试');
      } else {
        setAiGenerated(sentences);
      }
    } catch (error) {
      setAiError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveGenerated = index => {
    setAiGenerated(prev => prev.filter((_, i) => i !== index));
  };

  const handleAiAdd = () => {
    if (aiGenerated.length === 0) return;
    const importText = aiGenerated.map(s => `${s.zh}|${s.en}`).join('\n');
    onImport(importText);
    setAiTopic('');
    setAiGenerated([]);
    setIsAiAdding(false);
  };

  const handleCancelAiAdd = () => {
    setIsAiAdding(false);
    setAiTopic('');
    setAiGenerated([]);
    setAiError('');
  };

  const renderSubNav = () => (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => setSubMode('materials')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          subMode === 'materials'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
        }`}
      >
        材料
      </button>
      <button
        onClick={() => setSubMode('wrongnotes')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          subMode === 'wrongnotes'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
        }`}
      >
        错题本
      </button>
      <button
        onClick={() => setSubMode('settings')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          subMode === 'settings'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
        }`}
      >
        设置
      </button>
    </div>
  );

  if (subMode === 'wrongnotes') {
    return (
      <div>
        {renderSubNav()}
        <WrongNoteBook items={items} onSelectItem={handleSelectFromWrong} />
      </div>
    );
  }

  if (subMode === 'settings') {
    return (
      <div>
        {renderSubNav()}
        <Settings />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderSubNav()}

      <div className="flex gap-4 mb-4 items-center">
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          + 添加
        </button>
        {!isImporting && !isAiAdding && (
          <button
            onClick={() => setIsImporting(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            导入
          </button>
        )}
        {!isImporting && !isAiAdding && (
          <button
            onClick={() => setIsAiAdding(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            AI 添加
          </button>
        )}
        {items.length > 0 && (
          <div className="flex gap-4 items-center ml-auto">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={selectedIds.size === items.length && items.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4"
              />
              全选
            </label>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                删除 ({selectedIds.size})
              </button>
            )}
          </div>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 border border-gray-300 dark:border-gray-600">
          <h3 className="font-medium text-gray-700 dark:text-gray-200">添加材料</h3>
          <textarea
            value={newZh}
            onChange={e => setNewZh(e.target.value)}
            placeholder="中文内容"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg resize-none text-gray-800 dark:text-gray-200"
            rows={2}
          />
          <div className="flex items-center gap-2">
            <textarea
              value={newEn}
              onChange={e => setNewEn(e.target.value)}
              placeholder="英文内容"
              className="flex-1 w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg resize-none text-gray-800 dark:text-gray-200"
              rows={2}
            />
            <button
              onClick={handleAiTranslate}
              disabled={!newZh.trim() || isTranslating}
              className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              {isTranslating ? '翻译中...' : 'AI 翻译'}
            </button>
          </div>
          {translationError && <p className="text-red-500 text-sm">{translationError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              保存
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewZh('');
                setNewEn('');
              }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {isImporting && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 border border-gray-300 dark:border-gray-600">
          <h3 className="font-medium text-gray-700 dark:text-gray-200">批量导入</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">格式：中文 | 英文（一行一条，中英文用 | 分隔）</p>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="我喜欢学习新的编程语言。| I enjoy learning new programming languages.
天气真好，我们去散步吧。| The weather is nice. Let's go for a walk."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg resize-none text-sm text-gray-800 dark:text-gray-200"
            rows={5}
          />
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              导入
            </button>
            <button
              onClick={() => {
                setIsImporting(false);
                setImportText('');
              }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {isAiAdding && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 border border-gray-300 dark:border-gray-600">
          <h3 className="font-medium text-gray-700 dark:text-gray-200">AI 添加句子</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={aiTopic}
              onChange={e => setAiTopic(e.target.value)}
              placeholder="输入主题，如：职场商务英语、日常购物、旅游出行"
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">数量：</span>
              <input
                type="number"
                value={aiCount}
                onChange={e => setAiCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 10)))}
                min="1"
                max="20"
                className="w-16 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 text-center"
              />
            </div>
            <button
              onClick={handleAiGenerate}
              disabled={!aiTopic.trim() || isGenerating}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isGenerating ? '生成中...' : '生成'}
            </button>
          </div>
          {aiError && <p className="text-red-500 text-sm">{aiError}</p>}

          {aiGenerated.length > 0 && (
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  预览（{aiGenerated.length} 条，可删除不满意的内容）
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {aiGenerated.map((sentence, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 dark:text-gray-200 text-sm">{sentence.zh}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{sentence.en}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveGenerated(index)}
                      className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-sm flex-shrink-0"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAiAdd}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  导入全部 ({aiGenerated.length} 条)
                </button>
                <button
                  onClick={handleCancelAiAdd}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-gray-800 border rounded-lg p-4 ${
              selectedIds.has(item.id)
                ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {editIndex === index ? (
              <div className="space-y-3">
                <textarea
                  value={editZh}
                  onChange={e => setEditZh(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded resize-none text-gray-800 dark:text-gray-200"
                  rows={2}
                />
                <textarea
                  value={editEn}
                  onChange={e => setEditEn(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded resize-none text-gray-800 dark:text-gray-200"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => handleToggleSelect(item.id)}
                  className="mt-1 w-4 h-4 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 dark:text-gray-200 mb-1">{item.zh_text}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{item.en_standard}</p>
                  {item.learned && (
                    <span className="inline-block mt-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                      已学习
                    </span>
                  )}
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleStartEdit(index)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => onRequestDelete(item.id)}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">暂无材料，请添加或导入</p>
      )}
    </div>
  );
}

export default ManageMode;
