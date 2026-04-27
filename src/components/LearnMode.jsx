import { useState, useEffect } from 'react';
import { generateEnglish, optimizeEnglish } from '../services/ai';

function LearnMode({ currentItem, onNext, onPrev, onLearn }) {
  const [aiEnglish, setAiEnglish] = useState(null);
  const [scene, setScene] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [learned, setLearned] = useState(false);
  const [segments, setSegments] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState(null);
  const [hasNewOptimization, setHasNewOptimization] = useState(false);

  const [hasStartedAI, setHasStartedAI] = useState(false);

  useEffect(() => {
    setLearned(currentItem.learned || false);
    setSegments(currentItem.segments || []);
    setScene(currentItem.scene || '');
    setExplanation(currentItem.explanation || '');
    setOptimizeResult(null);
    setHasNewOptimization(false);
    setHasStartedAI(false);

    if (currentItem.en_optimized) {
      setAiEnglish(currentItem.en_optimized);
      setHasStartedAI(true);
    } else if (currentItem.en_standard) {
      setAiEnglish(currentItem.en_standard);
    } else {
      setAiEnglish(null);
    }
  }, [currentItem]);

  const handleStartAI = () => {
    setHasStartedAI(true);
    if (!currentItem.en_standard) {
      handleGenerate();
    } else {
      handleOptimize(currentItem.en_standard);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsOptimizing(false);
    setOptimizeResult(null);
    setHasNewOptimization(false);
    try {
      const result = await generateEnglish(currentItem.zh_text);
      setAiEnglish(result.en_text);
      setScene(result.scene || '');
      setExplanation(result.explanation || '');
      if (result.segments && result.segments.length > 0) {
        setSegments(result.segments);
      }
    } catch (error) {
      console.error('生成英文失败:', error);
    }
    setIsGenerating(false);
  };

  const handleOptimize = async (englishText) => {
    setIsOptimizing(true);
    setOptimizeResult(null);
    setHasNewOptimization(false);
    try {
      const result = await optimizeEnglish(currentItem.zh_text, englishText);
      setOptimizeResult(result);
      if (result.optimized) {
        setAiEnglish(result.optimized);
        setHasNewOptimization(true);
      }
    } catch (error) {
      console.error('优化英文失败:', error);
    }
    setIsOptimizing(false);
  };

  const handleReoptimize = () => {
    const textToOptimize = aiEnglish || currentItem.en_standard;
    if (textToOptimize) {
      handleOptimize(textToOptimize);
    }
  };

  const handleAdopt = () => {
    setLearned(true);
    setHasNewOptimization(false);
    if (onLearn) {
      onLearn(currentItem.id, {
        en_optimized: aiEnglish,
        learned: true,
        learn_count: (currentItem.learn_count || 0) + 1,
        last_learned: new Date().toISOString(),
        segments,
        scene,
        explanation,
      });
    }
  };

  const getRegenerateText = () => {
    if (!currentItem.en_standard) return '重新生成';
    if (currentItem.en_optimized) return '重新优化';
    return '重新分析';
  };

  const handleRegenerate = () => {
    if (!currentItem.en_standard) {
      handleGenerate();
    } else {
      handleReoptimize();
    }
  };

  const highlightSegments = () => {
    if (!segments || segments.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {segments.map((segment, i) => (
          <span
            key={i}
            className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
          >
            {segment}
          </span>
        ))}
      </div>
    );
  };

  const showOriginal = currentItem.en_standard && aiEnglish !== currentItem.en_standard && currentItem.en_optimized;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span>{learned ? '✓ 已学习' : '待学习'}</span>
        <span>学习 {(currentItem.learn_count || 0)} 次</span>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
        <p className="text-2xl font-medium text-gray-800 dark:text-white leading-relaxed">
          「{currentItem.zh_text}」
        </p>
      </div>

      {!hasStartedAI && !currentItem.en_standard ? (
        <div className="text-center py-8">
          <button
            onClick={handleStartAI}
            className="px-8 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium text-lg"
          >
            开始 AI 生成
          </button>
        </div>
      ) : !hasStartedAI && currentItem.en_standard ? (
        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 space-y-4">
          <div className="text-center">
            <div className="text-sm text-gray-400 dark:text-gray-500 mb-1">原文</div>
            <p className="text-xl text-gray-800 dark:text-white leading-relaxed">{currentItem.en_standard}</p>
          </div>
          <div className="text-center pt-4">
            <button
              onClick={handleStartAI}
              className="px-8 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium text-lg"
            >
              开始 AI 分析
            </button>
          </div>
        </div>
      ) : isGenerating ? (
        <div className="text-center py-8">
          <span className="text-gray-500 dark:text-gray-400 text-lg">✨ AI 正在生成...</span>
        </div>
      ) : (
        <>
          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 space-y-4">
            {scene && (
              <div className="text-center">
                <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                  💬 {scene}
                </span>
              </div>
            )}

            {showOriginal && (
              <div className="text-center">
                <div className="text-sm text-gray-400 dark:text-gray-500 mb-1">原文</div>
                <p className="text-gray-500 dark:text-gray-400 line-through text-lg">{currentItem.en_standard}</p>
              </div>
            )}

            <div className="text-center">
              <div className="text-sm text-gray-400 dark:text-gray-500 mb-1">
                {showOriginal ? '优化后' : (currentItem.en_standard ? (currentItem.en_optimized ? '当前' : '分析中') : 'AI 生成')}
              </div>
              <p className="text-xl text-gray-800 dark:text-white leading-relaxed">{aiEnglish}</p>
            </div>

            {explanation && (
              <div className="text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">{explanation}</span>
              </div>
            )}

            {isOptimizing && (
              <div className="text-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">✨ AI 分析优化中...</span>
              </div>
            )}

            {optimizeResult && !optimizeResult.isGood && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-sm">
                <div className="text-yellow-700 dark:text-yellow-400 font-medium mb-1">💡 优化建议</div>
                <div className="text-gray-600 dark:text-gray-300">{optimizeResult.reason}</div>
                {optimizeResult.suggestions && optimizeResult.suggestions.length > 0 && (
                  <div className="mt-2">
                    {optimizeResult.suggestions.map((s, i) => (
                      <div key={i} className="text-gray-500 dark:text-gray-400">• {s}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {optimizeResult && optimizeResult.isGood && (
              <div className="text-center">
                <span className="text-green-600 dark:text-green-400 text-sm">✓ 当前表达已经很地道</span>
              </div>
            )}
          </div>

          {!learned ? (
            <div className="flex gap-4">
              <button
                onClick={handleRegenerate}
                disabled={isGenerating || isOptimizing}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
              >
                {getRegenerateText()}
              </button>
              <button
                onClick={handleAdopt}
                disabled={!aiEnglish || isGenerating || isOptimizing}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                采纳
              </button>
            </div>
          ) : hasNewOptimization ? (
            <div className="flex gap-4">
              <button
                onClick={handleRegenerate}
                disabled={isGenerating || isOptimizing}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
              >
                {getRegenerateText()}
              </button>
              <button
                onClick={handleAdopt}
                disabled={!aiEnglish || isGenerating || isOptimizing}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                更新
              </button>
            </div>
          ) : (
            <button
              onClick={handleRegenerate}
              disabled={isGenerating || isOptimizing}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
            >
              {getRegenerateText()}
            </button>
          )}

          {learned && segments.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">拆分练习</div>
              {highlightSegments()}
            </div>
          )}
        </>
      )}

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          上一题
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-xl hover:bg-gray-900 dark:hover:bg-gray-300 transition-colors font-medium"
        >
          下一题
        </button>
      </div>
    </div>
  );
}

export default LearnMode;
