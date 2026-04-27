const AI_CONFIG = {
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  baseUrl: import.meta.env.VITE_AI_BASE_URL || 'https://apix.namoq.com/v1',
  model: import.meta.env.VITE_AI_MODEL || 'MiniMax-M2.7-highspeed',
};

export async function chat(messages, options = {}) {
  const {
    apiKey = AI_CONFIG.apiKey,
    baseUrl = AI_CONFIG.baseUrl,
    model = AI_CONFIG.model,
  } = options;

  if (!apiKey) {
    throw new Error('API key 未配置');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function translateToEnglish(chineseText, options = {}) {
  const systemPrompt =
    '你是一个专业的英文翻译。请将用户给出的中文准确翻译成英文，只返回翻译结果，不要解释。';
  const userPrompt = chineseText;

  return chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    options
  );
}

export async function generateEnglish(chineseText, options = {}) {
  const systemPrompt = `你是一个英语教师。用户给出中文句子，你需要：

1. 翻译成自然、地道的英文
2. 根据句子结构，将其拆分成几个有意义的片段（按逗号、连词、从句等自然停顿点切分）
3. 给出一句简短的场景说明

请按以下JSON格式返回：
{
  "en_text": "英文翻译",
  "scene": "场景说明（一句简短的话）",
  "explanation": "简要的词汇或语法讲解（可选）",
  "segments": ["片段1", "片段2", "片段3"]
}

规则：
- segments 数量控制在 2-5 个
- 每个片段语义相对完整
- 只返回JSON，不要有其他文字`;

  const userPrompt = `中文句子：${chineseText}`;

  const response = await chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    options
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      en_text: response,
      scene: '',
      explanation: '',
      segments: [],
    };
  } catch {
    return {
      en_text: response,
      scene: '',
      explanation: '',
      segments: [],
    };
  }
}

export async function optimizeEnglish(chineseText, currentEnglish, options = {}) {
  const systemPrompt = `你是一个英语教师。用户给出了一个中文句子和对应的英文翻译。

请分析这个英文翻译：
1. 是否准确表达了中文的意思？
2. 是否有语法错误或表达不自然的地方？
3. 是否有更地道或更简洁的表达方式？

请按以下JSON格式返回：
{
  "isGood": true或false,
  "optimized": "优化后的英文（如果有更好的表达）",
  "suggestions": ["建议1", "建议2"],
  "reason": "优化原因说明"
}

规则：
- 如果当前英文已经很好，isGood设为true，optimized设为null
- 只返回JSON，不要有其他文字`;

  const userPrompt = `中文：${chineseText}
当前英文：${currentEnglish}`;

  const response = await chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    options
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      isGood: true,
      optimized: null,
      suggestions: [],
      reason: response,
    };
  } catch {
    return {
      isGood: true,
      optimized: null,
      suggestions: [],
      reason: response,
    };
  }
}

export async function checkEnglishAnswer(originalText, userAnswer, options = {}) {
  const systemPrompt = `你是一个英语教师。请检查用户的英文翻译是否准确。
原文：${originalText}
标准答案：${options.standardAnswer || '未知'}

请按以下JSON格式返回分析结果：
{
  "isCorrect": true或false,
  "correctParts": ["正确的词或短语1", "正确的词或短语2"],
  "missingParts": ["缺失的意思1", "缺失的意思2"],
  "wrongParts": [{"userText": "用户写的错误内容", "shouldBe": "应该如何表达", "reason": "错误原因"}],
  "feedback": "整体反馈"
}

规则：
- correctParts: 用户答案中正确表达了原文意思的部分
- missingParts: 用户答案中遗漏的原文关键意思
- wrongParts: 用户答案中表达不准确或错误的部分
- 只返回JSON，不要有其他文字`;

  const userPrompt = `用户答案：${userAnswer}`;

  const response = await chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    options
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      isCorrect: false,
      correctParts: [],
      missingParts: [],
      wrongParts: [],
      feedback: response,
    };
  } catch {
    return {
      isCorrect: false,
      correctParts: [],
      missingParts: [],
      wrongParts: [],
      feedback: response,
    };
  }
}

export async function analyzeChineseCoverageWithAI(zhText, userInput, standardEnglish, options = {}) {
  const systemPrompt = `你是一个英语翻译助手。请分析用户输入的英文对中文原文的覆盖情况。

中文原文：${zhText}
标准英文：${standardEnglish}
用户输入：${userInput}

请仔细对比用户输入和标准英文，标记出：
1. 正确翻译的部分（标绿色）
2. 翻译错误或拼写错误的部分（标红色）
3. 遗漏的部分（标红色）

请按以下JSON格式返回：
{
  "segments": [
    {"text": "中文原文片段", "covered": true或false, "reason": "正确原因或错误原因"}
  ],
  "coveredCount": 数字,
  "totalCount": 数字,
  "hint": "给用户的简洁提示"
}

重要规则：
- text 只返回中文原文片段，不要混入任何英文
- covered=true 表示该中文部分被正确翻译
- covered=false 表示该中文部分翻译错误或遗漏
- 只返回JSON，不要有其他文字`;

  const response = await chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `用户输入：${userInput}` },
    ],
    options
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      segments: [],
      coveredCount: 0,
      totalCount: 0,
      hint: '',
    };
  } catch {
    return {
      segments: [],
      coveredCount: 0,
      totalCount: 0,
      hint: '',
    };
  }
}

export async function generateErrorExplanation(zhText, userInput, standardEnglish, options = {}) {
  const systemPrompt = `你是一个热情的英语教师，正在帮助学生分析英文翻译中的错误。

原文（中文）：${zhText}
标准答案：${standardEnglish}
学生答案：${userInput}

请提供详细的学习反馈，按以下JSON格式返回：
{
  "errorTypes": ["语法错误"或"词汇错误"或"拼写错误"或"表达不当"或"缺失内容"],
  "errorDetails": [
    {
      "userText": "学生写的内容",
      "correctText": "正确表达",
      "explanation": "详细解释为什么错或为什么更好",
      "grammarTip": "涉及的语法点，如时态、主谓一致、介词使用等",
      "memoryTip": "助记方法或记忆技巧"
    }
  ],
  "missingContent": ["学生遗漏的内容1", "学生遗漏的内容2"],
  "learningPoints": ["学生可以从这次错误中学到的一个知识点"],
  "encouragement": "一句鼓励的话，让学生保持信心"
}

规则：
- 用中文回复
- 错误分析要具体，不要泛泛而谈
- explanation要解释清楚为什么错误和正确表达好在哪里
- grammarTip要简洁明了，适合学习者理解
- memoryTip要实用，能帮助学生记住
- encouragement要真诚积极
- 只返回JSON，不要有其他文字`;

  const response = await chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请分析这个翻译错误：` },
    ],
    options
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      errorTypes: [],
      errorDetails: [],
      missingContent: [],
      learningPoints: [],
      encouragement: '继续加油！你可以的！',
    };
  } catch {
    return {
      errorTypes: [],
      errorDetails: [],
      missingContent: [],
      learningPoints: [],
      encouragement: '继续加油！你可以的！',
    };
  }
}

export async function generateSentencesByTopic(topic, count = 10, options = {}) {
  const systemPrompt = `你是一个英语教师。根据用户给出的主题，生成相应数量的中英文对照句子。

主题：${topic}
数量：${count} 条

要求：
1. 句子要实用、地道，涵盖该主题的不同场景
2. 中文句子要自然流畅，符合日常表达习惯
3. 英文翻译要准确、自然、地道
4. 句子之间不要太相似，要有多样性

请按以下JSON格式返回：
{
  "sentences": [
    {"zh": "中文句子1", "en": "英文翻译1"},
    {"zh": "中文句子2", "en": "英文翻译2"}
  ]
}

规则：
- 只返回JSON，不要有任何其他文字
- sentences 数组长度要等于 ${count}`;

  const response = await chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请生成关于"${topic}"的 ${count} 个中英文对照句子` },
    ],
    options
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return data.sentences || [];
    }
    return [];
  } catch {
    return [];
  }
}

export default {
  chat,
  translateToEnglish,
  generateEnglish,
  optimizeEnglish,
  checkEnglishAnswer,
  analyzeChineseCoverageWithAI,
  generateErrorExplanation,
  generateSentencesByTopic,
};
