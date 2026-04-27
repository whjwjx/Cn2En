import { useState, useEffect, useRef } from 'react';
import { checkAnswer } from '../utils/answerChecker';
import { addToWrongNotes, removeFromWrongNotes } from '../utils/wrongNotes';
import { analyzeChineseCoverageWithAI, generateErrorExplanation } from '../services/ai';

function PracticeMode({ currentItem, onNext, onPrev, onComplete, settings }) {
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInWrong, setIsInWrong] = useState(false);
  const [chineseAnalysis, setChineseAnalysis] = useState(null);
  const [aiHintLoading, setAiHintLoading] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showHintOnText, setShowHintOnText] = useState(false);
  const [showCheckResult, setShowCheckResult] = useState(false);
  const [errorExplanation, setErrorExplanation] = useState(null);
  const [errorExplanationLoading, setErrorExplanationLoading] = useState(false);
  const inputRef = useRef(null);
  const lastInputTime = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    const loadWrongStatus = async () => {
      if (currentItem?.id) {
        const { isInWrongNotes } = await import('../utils/wrongNotes');
        const inWrong = await isInWrongNotes(currentItem.id);
        setIsInWrong(inWrong);
      }
    };
    loadWrongStatus();
  }, [currentItem]);

  useEffect(() => {
    setShowTimer(settings?.timer_enabled !== false);

    setUserInput('');
    setResult(null);
    setShowResult(false);
    setShowHintOnText(false);
    setShowCheckResult(false);
    setChineseAnalysis(null);
    setShowEnglish(false);
    setErrorExplanation(null);
    lastInputTime.current = Date.now();
    inputRef.current?.focus();
  }, [currentItem, settings]);

  useEffect(() => {
    if (startTime && !showResult) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, showResult]);

  const generateHint = async () => {
    if (!currentItem || !userInput.trim()) return;

    setAiHintLoading(true);
    setShowCheckResult(false);
    setResult(null);
    setShowResult(false);
    try {
      const targetEnglish = currentItem.en_optimized || currentItem.en_standard;
      const analysis = await analyzeChineseCoverageWithAI(
        currentItem.zh_text,
        userInput,
        targetEnglish
      );
      setChineseAnalysis(analysis);
      setShowHintOnText(true);
    } catch (error) {
      console.error('生成提示失败:', error);
    } finally {
      setAiHintLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userInput.trim() || !currentItem) return;

    const targetEnglish = currentItem.en_optimized || currentItem.en_standard;
    const checkResult = checkAnswer(userInput, targetEnglish);
    setResult(checkResult);
    setShowResult(true);
    setShowHintOnText(false);
    setShowCheckResult(true);
    setTotalCount(prev => prev + 1);

    if (checkResult.isCorrect) {
      setChineseAnalysis(null);
      setErrorExplanation(null);
      setShowCheckResult(false);
      setStreak(prev => prev + 1);
      setCorrectCount(prev => prev + 1);
      if (isInWrong) {
        await removeFromWrongNotes(currentItem.id);
        setIsInWrong(false);
      }
      if (onComplete) {
        onComplete(true);
      }
      setTimeout(() => {
        handleNext();
      }, 600);
    } else {
      setStreak(0);
      setErrorExplanationLoading(true);
      try {
        const targetEnglish = currentItem.en_optimized || currentItem.en_standard;
        const [analysis, explanation] = await Promise.all([
          analyzeChineseCoverageWithAI(currentItem.zh_text, userInput, targetEnglish),
          generateErrorExplanation(currentItem.zh_text, userInput, targetEnglish),
        ]);
        setChineseAnalysis(analysis);
        setErrorExplanation(explanation);
      } catch (error) {
        console.error('生成错误解释失败:', error);
        setErrorExplanation(null);
      } finally {
        setErrorExplanationLoading(false);
      }
      if (!isInWrong) {
        await addToWrongNotes(currentItem.id);
        setIsInWrong(true);
      }
      if (onComplete) {
        onComplete(false);
      }
    }
  };

  const handleNext = () => {
    setUserInput('');
    setResult(null);
    setShowResult(false);
    setShowHintOnText(false);
    setShowCheckResult(false);
    setChineseAnalysis(null);
    setShowEnglish(false);
    setErrorExplanation(null);
    setStartTime(Date.now());
    setElapsedTime(0);
    lastInputTime.current = Date.now();
    onNext();
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !showResult) {
      e.preventDefault();
      if (e.ctrlKey) {
        handleSubmit();
      } else {
        generateHint();
      }
    }
  };

  const handleInputChange = e => {
    setUserInput(e.target.value);
    setShowHintOnText(false);
    setShowCheckResult(false);
    setShowResult(false);
  };

  const renderChineseHint = () => {
    if (!chineseAnalysis || !chineseAnalysis.segments || chineseAnalysis.segments.length === 0) {
      if (chineseAnalysis?.hint) {
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">💡</span>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">{chineseAnalysis.hint}</div>
            </div>
          </div>
        );
      }
      return null;
    }

    return (
      <div className="text-lg leading-relaxed">
        {chineseAnalysis.segments.map((segment, index) => (
          <span
            key={index}
            className={`px-1 py-0.5 rounded ${
              segment.covered
                ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
            }`}
            title={segment.reason || ''}
          >
            {segment.text}
          </span>
        ))}
      </div>
    );
  };

  const formatTime = ms => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const correctRate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="text-orange-500 font-medium text-base">
              🔥 连续 {streak} 题正确
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400">正确率 {correctRate}%</span>
          {showTimer && startTime && (
            <span className="text-gray-500 dark:text-gray-400 font-mono">{formatTime(elapsedTime)}</span>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
        {showHintOnText && chineseAnalysis?.segments?.length > 0 ? (
          <div className="text-xl leading-relaxed">
            {chineseAnalysis.segments.map((segment, index) => (
              <span
                key={index}
                className={`px-1 py-0.5 rounded ${
                  segment.covered
                    ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                    : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                }`}
                title={segment.reason || ''}
              >
                {segment.text}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-2xl font-medium text-gray-800 dark:text-white leading-relaxed">
            「{currentItem.zh_text}」
          </p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            const newShowEnglish = !showEnglish;
            setShowEnglish(newShowEnglish);
            if (!newShowEnglish) {
              setUserInput('');
            }
          }}
          className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
        >
          {showEnglish ? '👁 隐藏英文' : '👁 显示英文'}
        </button>
        <button
          onClick={generateHint}
          disabled={!userInput.trim() || aiHintLoading || showResult}
          className="text-yellow-500 hover:text-yellow-600 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {aiHintLoading ? '🤔 分析中...' : '💡 提示'}
        </button>
      </div>

      {showEnglish && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-lg text-gray-700 dark:text-gray-300 italic">
            {currentItem.en_standard}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入你的英文翻译..."
          className="w-full h-32 p-4 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl focus:border-blue-500 focus:ring-0 resize-none text-lg text-gray-800 dark:text-white"
        />

        {!showResult || !showCheckResult ? (
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            回车提示 · Ctrl+回车检查
          </button>
        ) : (
          <div
            className={`p-4 rounded-xl border-2 ${
              result.isCorrect
                ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-lg font-medium ${result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {result.isCorrect ? '✓ 正确！' : '✗ 错误'}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {correctCount} / {totalCount}
              </span>
            </div>

            {!result.isCorrect && (
              <div className="space-y-3">
                {errorExplanationLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <span className="text-gray-400">AI 分析中...</span>
                  </div>
                ) : errorExplanation ? (
                  <>
                    {errorExplanation.errorDetails && errorExplanation.errorDetails.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">错误分析：</div>
                        {errorExplanation.errorDetails.map((detail, index) => (
                          <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-red-500 font-medium">✗ {detail.userText}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-green-600 dark:text-green-400 font-medium">✓ {detail.correctText}</span>
                            </div>
                            {detail.explanation && (
                              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{detail.explanation}</div>
                            )}
                            {detail.grammarTip && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1 mb-1">
                                📝 语法: {detail.grammarTip}
                              </div>
                            )}
                            {detail.memoryTip && (
                              <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded px-2 py-1">
                                🧠 助记: {detail.memoryTip}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {errorExplanation.missingContent && errorExplanation.missingContent.length > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">遗漏内容：</span>
                        <span className="text-orange-500">{errorExplanation.missingContent.join('、')}</span>
                      </div>
                    )}
                    {errorExplanation.learningPoints && errorExplanation.learningPoints.length > 0 && (
                      <div className="text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="text-green-600 dark:text-green-400 font-medium mb-1">💡 记住这个知识点：</div>
                        {errorExplanation.learningPoints.map((point, index) => (
                          <div key={index} className="text-gray-600 dark:text-gray-300">{point}</div>
                        ))}
                      </div>
                    )}
                    {errorExplanation.encouragement && (
                      <div className="text-sm text-center text-yellow-600 dark:text-yellow-400 italic">
                        {errorExplanation.encouragement}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">中文含义覆盖情况：</div>
                    {renderChineseHint()}
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      已覆盖 {chineseAnalysis?.coveredCount || 0} / {chineseAnalysis?.totalCount || 0}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">标准答案：</div>
              <div className="text-lg text-gray-800 dark:text-gray-200">{currentItem.en_optimized || currentItem.en_standard}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          上一题
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-xl hover:bg-gray-900 dark:hover:bg-gray-300 transition-colors font-medium"
        >
          下一题
        </button>
      </div>
    </div>
  );
}

export default PracticeMode;
