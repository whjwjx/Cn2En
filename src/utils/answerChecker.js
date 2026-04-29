export function normalizeText(text) {
  return text.trim();
}

export function extractPunctuation(text) {
  const punctuationRegex = /([.,!?;:'"()-])/g;
  const parts = text.split(punctuationRegex);
  const punctuation = [];
  parts.forEach((part, i) => {
    if (punctuationRegex.test(part)) {
      punctuation.push({ char: part, index: i });
    }
    punctuationRegex.lastIndex = 0;
  });
  return punctuation;
}

export function checkAnswer(userText, standardText) {
  const errors = [];

  const userNormalized = normalizeText(userText);
  const standardNormalized = normalizeText(standardText);

  if (userNormalized.toLowerCase() === standardNormalized.toLowerCase()) {
    return { isCorrect: true, errors: [], userText };
  }

  const userPunct = extractPunctuation(userNormalized);
  const standardPunct = extractPunctuation(standardNormalized);

  const standardPunctChars = standardPunct.map(p => p.char);
  const userPunctChars = userPunct.map(p => p.char);

  standardPunctChars.forEach((char, i) => {
    if (userPunctChars[i] !== char) {
      errors.push({
        type: 'punctuation',
        error: userPunctChars[i] || '',
        suggestion: char,
        reason: `标点符号建议: '${userPunctChars[i] || '缺少'}' → '${char}'（AI会智能判断是否合理）`,
        isBlocking: false,
      });
    }
  });

  userPunctChars.forEach((char, i) => {
    if (standardPunctChars[i] !== char) {
      if (!standardPunctChars.includes(char)) {
        errors.push({
          type: 'punctuation',
          error: char,
          suggestion: '',
          reason: `标点符号建议: '${char}'（AI会智能判断是否合理）`,
          isBlocking: false,
        });
      }
    }
  });

  const userLastChar = userNormalized.slice(-1);
  const standardLastChar = standardNormalized.slice(-1);
  const endPunctuationSet = new Set(['.', '!', '?']);

  if (endPunctuationSet.has(standardLastChar)) {
    if (userLastChar !== standardLastChar) {
      if (endPunctuationSet.has(userLastChar)) {
        const existingError = errors.find(
          e => e.type === 'punctuation' && e.suggestion === standardLastChar
        );
        if (!existingError) {
          errors.push({
            type: 'punctuation',
            error: userLastChar,
            suggestion: standardLastChar,
            reason: `句尾标点建议: '${userLastChar}' → '${standardLastChar}'（AI会智能判断）`,
            isBlocking: false,
          });
        }
      } else {
        errors.push({
          type: 'punctuation',
          error: '',
          suggestion: standardLastChar,
          reason: `句尾标点建议: 可加 '${standardLastChar}'（AI会智能判断）`,
          isBlocking: false,
        });
      }
    }
  } else if (endPunctuationSet.has(userLastChar)) {
    errors.push({
      type: 'punctuation',
      error: userLastChar,
      suggestion: '',
      reason: `句尾标点建议: '${userLastChar}'（AI会智能判断是否合理）`,
      isBlocking: false,
    });
  }

  if (/\s{2,}/.test(userNormalized)) {
    errors.push({
      type: 'space',
      error: userNormalized.match(/\s{2,}/)[0],
      suggestion: ' ',
      reason: `多余的空格`,
    });
  }

  if (userNormalized !== userNormalized.trim()) {
    errors.push({
      type: 'space',
      error: '',
      suggestion: '',
      reason: `多余的首尾空格`,
    });
  }

  const userWords = userNormalized
    .replace(/[.,!?;:'"()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0);
  const standardWords = standardNormalized
    .replace(/[.,!?;:'"()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0);

  const maxLen = Math.max(userWords.length, standardWords.length);

  for (let i = 0; i < maxLen; i++) {
    const userWord = userWords[i] ? userWords[i].toLowerCase() : null;
    const standardWord = standardWords[i] ? standardWords[i].toLowerCase() : null;

    if (userWord === null && standardWord !== null) {
      errors.push({
        type: 'missing',
        error: '',
        suggestion: standardWords[i],
        reason: `第 ${i + 1} 个位置漏了: ${standardWords[i]}`,
      });
    } else if (userWord !== null && standardWord === null) {
      errors.push({
        type: 'extra',
        error: userWords[i],
        suggestion: '',
        reason: `第 ${i + 1} 个位置多了: ${userWords[i]}`,
      });
    } else if (userWord !== standardWord) {
      const combinedNext = standardWords
        .slice(i, i + 2)
        .join(' ')
        .toLowerCase();
      if (userWord === combinedNext) {
        errors.push({
          type: 'missingSpace',
          error: userWords[i],
          suggestion: `${standardWords[i]} ${standardWords[i + 1]}`,
          reason: `第 ${i + 1} 个位置缺少空格`,
        });
      } else {
        errors.push({
          type: 'wrong',
          error: userWords[i],
          suggestion: standardWords[i],
          reason: `第 ${i + 1} 个位置应为: ${standardWords[i]}`,
        });
      }
    }
  }

  if (
    userNormalized[0] &&
    userNormalized[0] === userNormalized[0].toLowerCase() &&
    /[a-z]/.test(userNormalized[0])
  ) {
    errors.push({
      type: 'capitalization',
      error: userNormalized[0],
      suggestion: userNormalized[0].toUpperCase(),
      reason: '句首字母应大写',
    });
  }

  return {
    isCorrect: false,
    errors,
    userText,
  };
}
