export function getHint(errors, standardWords) {
  const missingCount = errors.filter(e => e.type === 'missing').length;
  const extraCount = errors.filter(e => e.type === 'extra').length;
  const wrongCount = errors.filter(e => e.type === 'wrong').length;
  const missingSpaceCount = errors.filter(e => e.type === 'missingSpace').length;
  const capitalizationCount = errors.filter(e => e.type === 'capitalization').length;
  const punctuationCount = errors.filter(e => e.type === 'punctuation').length;
  const spaceCount = errors.filter(e => e.type === 'space').length;

  return {
    level1: {
      text: getLevel1Hint(
        missingCount,
        extraCount,
        wrongCount,
        missingSpaceCount,
        capitalizationCount,
        punctuationCount,
        spaceCount
      ),
      used: false,
    },
    level2: {
      text: getLevel2Hint(errors, standardWords),
      used: false,
    },
    level3: {
      text: getLevel3Hint(errors),
      used: false,
    },
  };
}

function getLevel1Hint(missing, extra, wrong, missingSpace, capitalization, punctuation, space) {
  const parts = [];
  if (punctuation > 0) parts.push(`标点符号可能有问题`);
  if (space > 0) parts.push(`有多余空格`);
  if (missingSpace > 0) parts.push(`缺少 ${missingSpace} 个空格`);
  if (missing > 0) parts.push(`漏了 ${missing} 个单词`);
  if (extra > 0) parts.push(`多了 ${extra} 个单词`);
  if (wrong > 0) parts.push(`${wrong} 个单词位置或拼写不对`);
  if (capitalization > 0) parts.push(`句首字母可能需要大写`);
  return parts.length > 0 ? parts.join('，') : '没有发现明显错误';
}

function getLevel2Hint(errors, _standardWords) {
  const hints = [];
  const missingErrors = errors.filter(e => e.type === 'missing');
  const extraErrors = errors.filter(e => e.type === 'extra');
  const wrongErrors = errors.filter(e => e.type === 'wrong');
  const missingSpaceErrors = errors.filter(e => e.type === 'missingSpace');
  const punctuationErrors = errors.filter(e => e.type === 'punctuation');
  const spaceErrors = errors.filter(e => e.type === 'space');

  if (punctuationErrors.length > 0) {
    hints.push('请检查标点符号是否正确');
  }

  if (spaceErrors.length > 0) {
    hints.push('请检查空格是否正确（不要有多余空格）');
  }

  if (missingSpaceErrors.length > 0) {
    hints.push(`${missingSpaceErrors.length} 个位置缺少空格`);
  }

  if (missingErrors.length > 0) {
    hints.push(`${missingErrors.length} 个位置漏了单词`);
  }

  if (extraErrors.length > 0) {
    hints.push(`${extraErrors.length} 个位置多了单词`);
  }

  if (wrongErrors.length > 0) {
    hints.push(`${wrongErrors.length} 个单词位置或拼写不对`);
  }

  if (hints.length === 0) {
    return '请仔细检查';
  }
  return hints.join('，');
}

function getLevel3Hint(errors) {
  return errors
    .map(e => {
      if (e.type === 'missing')
        return `第 ${e.reason.match(/\d+/)[0]} 个位置: 漏了「${e.suggestion}」`;
      if (e.type === 'extra') return `第 ${e.reason.match(/\d+/)[0]} 个位置: 多了「${e.error}」`;
      if (e.type === 'wrong')
        return `第 ${e.reason.match(/\d+/)[0]} 个位置: 应为「${e.suggestion}」`;
      if (e.type === 'missingSpace')
        return `第 ${e.reason.match(/\d+/)[0]} 个位置: 「${e.error}」中间需要加空格`;
      if (e.type === 'capitalization') return `句首字母改为「${e.suggestion}」`;
      if (e.type === 'space') return '有多余空格，请删除多余空格';
      if (e.type === 'punctuation') {
        if (e.error && e.suggestion) return `标点 '${e.error}' 应改为 '${e.suggestion}'`;
        if (e.error) return `多余的标点 '${e.error}'`;
        if (e.suggestion) return `缺少标点 '${e.suggestion}'`;
      }
      return '';
    })
    .filter(Boolean)
    .join('，');
}
