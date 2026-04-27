import { useState, useEffect } from 'react';
import { settingsAPI, databaseAPI, itemsAPI } from '../services/api';

const defaultSettings = {
  timer_enabled: true,
  difficulty_analysis: false,
  daily_goal: 20,
  theme: 'auto',
};

function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsList = await settingsAPI.getAll();
        
        const mergedSettings = { ...defaultSettings };
        
        const timerSetting = settingsList.find(s => s.key === 'timer_enabled');
        if (timerSetting !== undefined) {
          mergedSettings.timer_enabled = timerSetting?.value ?? defaultSettings.timer_enabled;
        }
        const difficultySetting = settingsList.find(s => s.key === 'difficulty_analysis');
        if (difficultySetting !== undefined) {
          mergedSettings.difficulty_analysis = difficultySetting?.value ?? defaultSettings.difficulty_analysis;
        }
        const goalSetting = settingsList.find(s => s.key === 'daily_goal');
        if (goalSetting !== undefined) {
          mergedSettings.daily_goal = goalSetting?.value ?? defaultSettings.daily_goal;
        }
        const themeSetting = settingsList.find(s => s.key === 'theme');
        if (themeSetting !== undefined) {
          mergedSettings.theme = themeSetting?.value ?? defaultSettings.theme;
        }
        
        setSettings(mergedSettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await settingsAPI.update(key, value);
    } catch (error) {
      console.error('Failed to update setting:', error);
    }

    if (key === 'theme') {
      const root = document.documentElement;
      if (value === 'dark') {
        root.classList.add('dark');
      } else if (value === 'light') {
        root.classList.remove('dark');
      } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  };

  const handleClearData = async () => {
    if (window.confirm('确定要清除所有数据吗？这将删除所有材料和设置。')) {
      try {
        await fetch('/api/database/clear', { method: 'POST' });
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear data:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const data = await databaseAPI.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cn2en_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('导出失败：' + error.message);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async e => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.items) {
          alert('无效的备份文件格式');
          return;
        }

        if (!window.confirm('导入将替换所有现有数据，确定继续吗？')) {
          return;
        }

        await databaseAPI.import(data);
        alert('导入成功！');
        window.location.reload();
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('导入失败：' + error.message);
      }
    };
    input.click();
  };

  if (isLoading) {
    return <div className="p-8 text-center dark:text-white">加载中...</div>;
  }

  return (
    <div className="space-y-8 pb-24">
      <h2 className="text-lg font-medium text-gray-800 dark:text-white">设置</h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">刷题设置</h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-gray-800 dark:text-gray-200">计时器</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">刷题时显示每题用时</p>
            </div>
            <button
              onClick={() => updateSetting('timer_enabled', !settings.timer_enabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.timer_enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.timer_enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-gray-800 dark:text-gray-200">每日目标</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">设置每日练习题数</p>
            </div>
            <select
              value={settings.daily_goal}
              onChange={e => updateSetting('daily_goal', Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-gray-200"
            >
              <option value={10}>10 题</option>
              <option value={20}>20 题</option>
              <option value={30}>30 题</option>
              <option value={50}>50 题</option>
              <option value={0}>无限制</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">练习设置</h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-gray-800 dark:text-gray-200">智能难度分析</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">练习时分析句子难度（实验性功能）</p>
            </div>
            <button
              onClick={() => updateSetting('difficulty_analysis', !settings.difficulty_analysis)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.difficulty_analysis ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.difficulty_analysis ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">外观</h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-gray-800 dark:text-gray-200">主题</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">选择应用外观</p>
            </div>
            <select
              value={settings.theme}
              onChange={e => updateSetting('theme', e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-gray-200"
            >
              <option value="auto">自动</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">数据管理</h3>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm"
            >
              导出数据
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-sm"
            >
              导入数据
            </button>
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm"
            >
              清除所有数据
            </button>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            导入会替换所有现有数据，建议先导出备份
          </p>
        </div>
      </div>

      <div className="text-center text-gray-400 dark:text-gray-500 text-sm pt-8">
        <p>Cn2En v1.0</p>
        <p className="mt-1">中译英智能学习平台</p>
      </div>
    </div>
  );
}

export default Settings;
