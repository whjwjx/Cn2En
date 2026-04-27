export function extractChineseUnits(zhText) {
  if (!zhText) return [];

  const units = [];
  const cleaned = zhText.trim();

  const parts = cleaned.split(/([，。！？、；：""''（）《》【】""''『』]|\s+)/);

  for (const part of parts) {
    if (!part || /^[，。！？、；：""''（）《》【】""''『』\s]+$/.test(part)) continue;

    const trimmed = part.trim();
    if (!trimmed) continue;

    const chars = trimmed.length;

    if (chars <= 4) {
      units.push({ text: trimmed, isWhole: true });
    } else {
      for (let i = 0; i < chars; i += 2) {
        const chunk = trimmed.slice(i, Math.min(i + 4, chars));
        if (chunk.length >= 2) {
          units.push({ text: chunk, isWhole: false });
        }
      }
    }
  }

  return units;
}

export function analyzeChineseCoverage(zhText, userInput, standardEnglish) {
  if (!zhText || !userInput) return { units: [], coveredCount: 0, totalCount: 0 };

  const units = extractChineseUnits(zhText);
  const userLower = userInput.toLowerCase();
  const standardLower = standardEnglish.toLowerCase();

  const result = units.map(unit => {
    const matched = checkUnitCoverage(unit.text, userLower, standardLower);
    return { ...unit, covered: matched };
  });

  const coveredCount = result.filter(u => u.covered).length;

  return { units: result, coveredCount, totalCount: result.length };
}

function checkUnitCoverage(chineseUnit, userInput, standardEnglish) {
  const keyWords = getKeyWordsForUnit(chineseUnit);

  if (keyWords.length > 0) {
    return keyWords.some(kw => userInput.includes(kw.toLowerCase()));
  }

  const synonyms = getSynonymsForUnit(chineseUnit);
  if (synonyms.length > 0) {
    const standardMatch = synonyms.some(syn => standardEnglish.includes(syn.toLowerCase()));
    if (standardMatch) {
      return synonyms.some(syn => userInput.includes(syn.toLowerCase()));
    }
  }

  return false;
}

function getKeyWordsForUnit(unit) {
  const mapping = {
    '人工智能': ['ai', 'artificial intelligence', 'artificial'],
    '正在': ['is', 'are', 'am', "'s", 'bei'],
    '改变': ['change', 'changing', 'changing'],
    '我们': ['we', 'our', 'us'],
    '生活': ['life', 'living', 'lives', 'life'],
    '方式': ['way', 'ways', 'how'],
    '学习': ['learn', 'learning', 'study', 'studying'],
    '编程': ['programming', 'program', 'code', 'coding'],
    '语言': ['language', 'languages'],
    '喜欢': ['like', 'enjoy', 'love', 'prefer'],
    '非常': ['very', 'really', 'extremely', 'quite'],
    '有趣': ['interesting', 'fun', 'exciting', 'fascinating'],
    '一口气': ['one', 'sitting', 'breath', 'without stopping', 'at once'],
    '读完': ['read', 'finish', 'finished', 'completed'],
    '天气': ['weather'],
    '真好': ['nice', 'good', 'great', 'wonderful', 'lovely'],
    '散步': ['walk', 'stroll', 'walking'],
    '每天': ['every day', 'daily', 'each day', 'everyday'],
    '早上': ['morning', 'mornings', 'am'],
    '咖啡': ['coffee'],
    '一杯': ['cup', 'a cup', 'one cup'],
    '问题': ['problem', 'question', 'issue'],
    '很难': ['difficult', 'hard', 'tough', 'challenging'],
    '需要': ['need', 'needs', 'require', 'requires'],
    '时间': ['time'],
    '思考': ['think', 'thinking', 'consider'],
    '朋友': ['friend', 'friends'],
    '住在': ['live', 'lives', 'living', 'reside'],
    '纽约': ['new york', 'ny'],
    '准备': ['prepare', 'preparing', 'preparation', 'get ready'],
    '明天': ['tomorrow', "tomorrow's"],
    '演讲': ['speech', 'presentation', 'talk'],
    '公司': ['company', 'companies', 'firm'],
    '去年': ['last year', 'last-year'],
    '实现': ['achieve', 'achieved', 'realize', 'realized', 'accomplish'],
    '业绩': ['revenue', 'performance', 'profit', 'results', 'growth'],
    '翻倍': ['double', 'doubled', 'increase'],
    '英语': ['english'],
    '耐心': ['patience', 'patient'],
    '坚持': ['persistence', 'persistent', 'perseverance', 'keep', 'stick'],
    '周末': ['weekend'],
    '计划': ['plan', 'plans', 'planning'],
  };

  for (const [key, words] of Object.entries(mapping)) {
    if (unit.includes(key)) {
      return words;
    }
  }

  return [];
}

function getSynonymsForUnit(_unit) {
  return [];
}