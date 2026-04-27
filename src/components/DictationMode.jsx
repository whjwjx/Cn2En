import { useState } from 'react';
import { checkEnglishAnswer } from '../services/ai';

function DictationMode({ currentItem, onNext, onPrev }) {
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showZhHint, setShowZhHint] = useState(false);

  const handleCheck = async () => {
    if (!userInput.trim()) return;
    setIsChecking(true);
    setShowZhHint(false);
    try {
      const checkResult = await checkEnglishAnswer(currentItem.zh_text, userInput, {
        standardAnswer: currentItem.en_standard,
      });
      setResult({
        ...checkResult,
        standard: currentItem.en_standard,
        userText: userInput,
      });
    } catch (error) {
      setResult({
        isCorrect: false,
        correctParts: [],
        missingParts: [],
        wrongParts: [],
        feedback: `检查失败: ${error.message}`,
        userText: userInput,
        standard: currentItem.en_standard,
      });
    }
    setIsChecking(false);
  };

  const handleClear = () => {
    setUserInput('');
    setResult(null);
    setShowZhHint(false);
  };

  const highlightUserText = () => {
    if (!result) return null;

    const { userText, correctParts = [], wrongParts = [] } = result;
    if (!userText) return null;

    const words = userText.split(/(\s+|[.,!?;:'"()-])/);
    const correctLower = correctParts.map(p => p.toLowerCase());
    const wrongTexts = wrongParts.map(w => w.userText.toLowerCase());

    return words.map((word, i) => {
      const wordLower = word.toLowerCase();
      const isCorrect = correctLower.some(cp => wordLower.includes(cp) || cp.includes(wordLower));
      const isWrong = wrongTexts.some(wp => wordLower.includes(wp) || wp.includes(wordLower));

      if (isCorrect) {
        return (
          <span key={i} className="bg-green-200 text-green-800 px-1 rounded">
            {word}
          </span>
        );
      }
      if (isWrong) {
        return (
          <span key={i} className="bg-red-200 text-red-800 px-1 rounded">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  const highlightZhText = () => {
    if (!result) return null;

    const zhText = currentItem.zh_text;
    const { correctParts = [], missingParts = [] } = result;

    const chars = zhText.split('');
    const allMeaningParts = [...correctParts, ...missingParts];

    const matchedIndices = new Set();
    let hasMatch = false;

    allMeaningParts.forEach(part => {
      const partChars = part.replace(/[^\u4e00-\u9fa5]/g, '').split('');
      if (partChars.length === 0) return;

      for (let i = 0; i < chars.length; i++) {
        let match = true;
        for (let j = 0; j < Math.min(partChars.length, 6); j++) {
          if (chars[i + j] !== partChars[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          hasMatch = true;
          for (let j = 0; j < Math.min(partChars.length, 6); j++) {
            matchedIndices.add(i + j);
          }
        }
      }
    });

    if (!hasMatch) {
      return (
        <span>
          <span className="text-gray-800">{zhText}</span>
          <div className="mt-3 text-left">
            {missingParts.length > 0 && (
              <div>
                <span className="text-sm text-orange-600 font-medium">遗漏的意思：</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {missingParts.map((part, i) => (
                    <span key={i} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </span>
      );
    }

    return chars.map((char, i) => {
      if (matchedIndices.has(i)) {
        const isCorrect = correctParts.some(cp => cp.includes(char) || char.includes(cp));
        if (isCorrect) {
          return (
            <span key={i} className="bg-green-200 text-green-800 border-b-2 border-green-400">
              {char}
            </span>
          );
        }
        return (
          <span key={i} className="bg-orange-200 text-orange-800 border-b-2 border-orange-400">
            {char}
          </span>
        );
      }
      return char;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <div className="flex justify-between items-start mb-4">
          <div></div>
          {result && (result.correctParts?.length > 0 || result.missingParts?.length > 0) && (
            <button
              onClick={() => setShowZhHint(!showZhHint)}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded hover:bg-yellow-200 transition-colors"
            >
              {showZhHint ? '收起提示' : '查看提示'}
            </button>
          )}
        </div>
        <p className="text-2xl font-medium text-gray-800 leading-relaxed">
          {showZhHint ? highlightZhText() : `「${currentItem.zh_text}」`}
        </p>
        {showZhHint && (
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <span>
              <span className="bg-green-200 text-green-700 px-2 py-0.5 rounded">绿色</span> = 已表达
            </span>
            <span>
              <span className="bg-orange-200 text-orange-700 px-2 py-0.5 rounded">橙色</span> = 遗漏
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <textarea
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={e => {
            if (e.ctrlKey && e.key === 'Enter') {
              e.preventDefault();
              handleCheck();
            }
          }}
          placeholder="在这里输入你的英文..."
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <div className="flex gap-4">
          <button
            onClick={handleClear}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            清空输入
          </button>
          <button
            onClick={handleCheck}
            disabled={!userInput.trim() || isChecking}
            className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? '检查中...' : 'AI对照检查'}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">你的答案</h3>
            <p className="text-xl text-gray-800 leading-relaxed">{highlightUserText()}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">对照分析</h3>
            {result.isCorrect ? (
              <p className="text-green-600 font-medium">✓ 正确！翻译准确。</p>
            ) : (
              <div className="space-y-3">
                {result.correctParts && result.correctParts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-1">✓ 正确的表达</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.correctParts.map((part, i) => (
                        <span
                          key={i}
                          className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.wrongParts && result.wrongParts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-1">✗ 错误的表达</h4>
                    <div className="space-y-2">
                      {result.wrongParts.map((item, i) => (
                        <div
                          key={i}
                          className="bg-red-50 border border-red-200 rounded p-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="line-through text-red-500">{item.userText}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-green-600">{item.shouldBe}</span>
                          </div>
                          {item.reason && <p className="text-gray-600 mt-1">{item.reason}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.missingParts && result.missingParts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-orange-600 mb-1">△ 遗漏的意思</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missingParts.map((part, i) => (
                        <span
                          key={i}
                          className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {result.feedback && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-700 text-sm">{result.feedback}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-600 mb-2">标准答案</h3>
            <p className="text-gray-800">{result.standard}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          上一题
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          下一题
        </button>
      </div>
    </div>
  );
}

export default DictationMode;
