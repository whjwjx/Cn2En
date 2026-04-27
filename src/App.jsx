import { useState, useEffect } from 'react';
import ConfirmDialog from './components/ConfirmDialog';
import ModeToggle from './components/ModeToggle';
import Header from './components/Header';
import LearnMode from './components/LearnMode';
import PracticeMode from './components/PracticeMode';
import BrushMode from './components/BrushMode';
import ManageMode from './components/ManageMode';
import { itemsAPI, settingsAPI, dailyStatsAPI } from './services/api';

const shuffleArray = arr => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function App() {
  const [mode, setMode] = useState('learn');
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showList, setShowList] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
  });
  const [theme, setTheme] = useState('auto');
  const [dailyStats, setDailyStats] = useState({ practiced: 0, correct: 0 });
  const [settings, setSettings] = useState({
    timer_enabled: true,
    difficulty_analysis: false,
    daily_goal: 20,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [itemsResponse, settingsList, statsResponse] = await Promise.all([
          itemsAPI.getAll({ limit: 1000 }),
          settingsAPI.getAll(),
          dailyStatsAPI.getToday(),
        ]);

        if (itemsResponse.length === 0) {
          const defaultItems = await itemsAPI.initDefault();
          setItems(shuffleArray(defaultItems));
        } else {
          setItems(shuffleArray(itemsResponse));
        }

        const settingsMap = {};
        settingsList.forEach(s => {
          settingsMap[s.key] = s.value;
        });

        const modeSetting = settingsMap.last_mode;
        if (modeSetting) {
          setMode(modeSetting);
        }

        const themeSetting = settingsMap.theme;
        if (themeSetting !== undefined) {
          setTheme(themeSetting);
        }

        const timerSetting = settingsMap.timer_enabled;
        const difficultySetting = settingsMap.difficulty_analysis;
        const goalSetting = settingsMap.daily_goal;

        setSettings({
          timer_enabled: timerSetting !== undefined ? timerSetting : true,
          difficulty_analysis: difficultySetting !== undefined ? difficultySetting : false,
          daily_goal: goalSetting !== undefined ? goalSetting : 20,
        });

        setDailyStats({
          practiced: statsResponse.practiced,
          correct: statsResponse.correct,
        });
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const saveMode = async () => {
      try {
        await settingsAPI.update('last_mode', mode);
      } catch (error) {
        console.error('Failed to save mode:', error);
      }
    };
    saveMode();
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const handleModeChange = newMode => {
    setMode(newMode);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  };

  const handleShuffle = () => {
    setItems(shuffleArray([...items]));
    setCurrentIndex(0);
  };

  const handleSelectItem = index => {
    setCurrentIndex(index);
    setShowList(false);
  };

  const handleLearn = async (id, data) => {
    try {
      await itemsAPI.update(id, data);
      const newItems = items.map(item => {
        if (item.id === id) {
          return { ...item, ...data };
        }
        return item;
      });
      setItems(newItems);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleSave = async (index, data) => {
    try {
      if (index === -1) {
        const newItem = await itemsAPI.create({
          zh_text: data.zh_text,
          en_standard: data.en_standard || '',
        });
        setItems([...items, newItem]);
      } else {
        const item = items[index];
        const updatedItem = await itemsAPI.update(item.id, data);
        const newItems = [...items];
        newItems[index] = { ...item, ...updatedItem };
        setItems(newItems);
      }
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleDelete = async ids => {
    try {
      const idsToDelete = Array.isArray(ids) ? ids : [ids];
      
      if (idsToDelete.length === 1) {
        await itemsAPI.delete(idsToDelete[0]);
      } else {
        await itemsAPI.bulkDelete(idsToDelete);
      }
      
      const newItems = items.filter(item => !idsToDelete.includes(item.id));
      setItems(newItems);
      if (currentIndex >= newItems.length) {
        setCurrentIndex(Math.max(0, newItems.length - 1));
      }
    } catch (error) {
      console.error('Failed to delete item(s):', error);
    }
  };

  const handleRequestDelete = ids => {
    const idsToDelete = Array.isArray(ids) ? ids : [ids];
    const message =
      idsToDelete.length === 1
        ? '确定要删除这条材料吗？'
        : `确定要删除选中的 ${idsToDelete.length} 条材料吗？`;
    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm: () => {
        handleDelete(ids);
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      },
    });
  };

  const handleImport = async text => {
    try {
      const response = await itemsAPI.import(text);
      if (response.imported_count > 0) {
        setItems([...items, ...response.items]);
      }
    } catch (error) {
      console.error('Failed to import items:', error);
    }
  };

  const handlePracticeComplete = async isCorrect => {
    try {
      const stats = await dailyStatsAPI.update(isCorrect);
      setDailyStats({ practiced: stats.practiced, correct: stats.correct });
    } catch (error) {
      console.error('Failed to update daily stats:', error);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center dark:text-white">加载中...</div>;
  }

  if (items.length === 0) {
    return <div className="p-8 text-center dark:text-white">无数据，请添加材料</div>;
  }

  const currentItem = items[currentIndex];
  const learnedCount = items.filter(item => item.learned).length;
  const dailyCorrectRate = dailyStats.practiced > 0 ? Math.round((dailyStats.correct / dailyStats.practiced) * 100) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Cn2En</h1>
          <div className="flex gap-4 text-sm">
            {mode === 'learn' && (
              <span className="text-gray-500 dark:text-gray-400">已学习 {learnedCount} 条</span>
            )}
            {(mode === 'practice' || mode === 'brush') && dailyStats.practiced > 0 && (
              <span className="text-gray-500 dark:text-gray-400">
                今日 {dailyStats.practiced} 题
                <span className="ml-1 text-green-600 dark:text-green-400">
                  {dailyCorrectRate}%
                </span>
              </span>
            )}
          </div>
        </div>

        <Header
          currentIndex={currentIndex}
          itemsLength={items.length}
          mode={mode}
          currentItem={currentItem}
          showList={showList}
          onToggleList={() => setShowList(!showList)}
          onSelectItem={handleSelectItem}
          onShuffle={handleShuffle}
        />

        {mode === 'learn' ? (
          <LearnMode
            currentItem={currentItem}
            onNext={handleNext}
            onPrev={handlePrev}
            onLearn={handleLearn}
          />
        ) : mode === 'practice' ? (
          <PracticeMode
            currentItem={currentItem}
            onNext={handleNext}
            onPrev={handlePrev}
            onComplete={handlePracticeComplete}
            settings={settings}
          />
        ) : mode === 'brush' ? (
          <BrushMode
            currentItem={currentItem}
            onNext={handleNext}
            onPrev={handlePrev}
            onComplete={handlePracticeComplete}
            settings={settings}
          />
        ) : (
          <ManageMode
            items={items}
            onSave={handleSave}
            onImport={handleImport}
            onRequestDelete={handleRequestDelete}
            onSelectItem={handleSelectItem}
          />
        )}

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
        />
      </div>

      <ModeToggle currentMode={mode} onModeChange={handleModeChange} />
    </div>
  );
}

export default App;
