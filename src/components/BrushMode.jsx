import { useState, useEffect, useRef } from 'react';
import { checkAnswer } from '../utils/answerChecker';
import { addToWrongNotes, removeFromWrongNotes, isInWrongNotes } from '../utils/wrongNotes';

function BrushMode({ currentItem, onNext, onPrev, onComplete, settings }) {
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInWrong, setIsInWrong] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setShowTimer(settings?.timer_enabled !== false);
  }, [settings]);

  useEffect(() => {
    const loadWrongStatus = async () => {
      if (currentItem?.id) {
        const inWrong = await isInWrongNotes(currentItem.id);
        setIsInWrong(inWrong);
      }
    };
    loadWrongStatus();
  }, [currentItem]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentItem]);

  useEffect(() => {
    if (startTime && !showResult && showTimer) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, showResult, showTimer]);

  useEffect(() => {
    setUserInput('');
    setResult(null);
    setShowResult(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, [currentItem]);

  const handleSubmit = async () => {
    if (!userInput.trim() || !currentItem) return;

    const targetEnglish = currentItem.en_optimized || currentItem.en_standard;
    const checkResult = checkAnswer(userInput, targetEnglish);
    setResult(checkResult);
    setShowResult(true);
    setTotalCount(prev => prev + 1);

    if (checkResult.isCorrect) {
      setStreak(prev => prev + 1);
      if (isInWrong) {
        await removeFromWrongNotes(currentItem.id);
        setIsInWrong(false);
      }
      if (onComplete) {
        onComplete(true);
      }
    } else {
      setStreak(0);
      if (!isInWrong) {
        await addToWrongNotes(currentItem.id);
        setIsInWrong(true);
      }
      if (onComplete) {
        onComplete(false);
      }
    }

    setHistory(prev => [
      { id: currentItem.id, isCorrect: checkResult.isCorrect },
      ...prev.slice(0, 19),
    ]);

    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleNext = () => {
    setUserInput('');
    setResult(null);
    setShowResult(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    onNext();
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !showResult) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const highlightResult = () => {
    if (!result || !userInput) return null;

    const targetEnglish = currentItem.en_optimized || currentItem.en_standard;
    const standard = targetEnglish;
    const standardWords = standard.split(/\s+/);
    const userWords = userInput.split(/\s+/);

    const elements = [];
    let userIdx = 0;

    for (let i = 0; i < standardWords.length; i++) {
      const sWord = standardWords[i].toLowerCase().replace(/[.,!?;:'"()-]/g, '');
      const uWord = userWords[userIdx]?.toLowerCase().replace(/[.,!?;:'"()-]/g, '');

      if (uWord === sWord) {
        elements.push(
          <span key={i} className="bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-0.5 rounded">
            {standardWords[i]}
          </span>
        );
        userIdx++;
      } else {
        elements.push(
          <span key={i} className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 px-0.5 rounded">
            {standardWords[i]}
          </span>
        );
      }
      elements.push(' ');
    }

    if (userWords.length > standardWords.length) {
      for (let i = standardWords.length; i < userWords.length; i++) {
        elements.push(
          <span key={`extra-${i}`} className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 px-0.5 rounded">
            {userWords[i]}
          </span>
        );
        elements.push(' ');
      }
    }

    return elements;
  };

  const formatTime = ms => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-1.5">
          {history.slice(0, 10).map((h, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${h.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}
            />
          ))}
          {history.length > 10 && (
            <span className="text-gray-400 text-xs ml-1">+{history.length - 10}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span className="text-orange-500 font-medium text-base">
              🔥 {streak}
            </span>
          )}
          {showTimer && <span className="text-gray-500 dark:text-gray-400 font-mono">{formatTime(elapsedTime)}</span>}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
        <p className="text-2xl font-medium text-gray-800 dark:text-white leading-relaxed">
          「{currentItem.zh_text}」
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入英文，回车提交..."
          className="w-full h-32 p-4 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl focus:border-blue-500 focus:ring-0 resize-none text-lg text-gray-800 dark:text-white"
          disabled={showResult}
        />

        {showResult && (
          <div
            className={`p-4 rounded-xl border-2 transition-all ${
              result.isCorrect
                ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 animate-pulse'
                : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-lg font-bold ${result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {result.isCorrect ? '✓' : '✗'}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {totalCount} 题
              </span>
            </div>
            {!result.isCorrect && (
              <div className="text-lg text-gray-800 dark:text-gray-200 mt-2 leading-relaxed">
                {highlightResult()}
              </div>
            )}
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

export default BrushMode;
