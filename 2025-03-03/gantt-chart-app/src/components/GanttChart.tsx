import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import styled from 'styled-components';
import { GanttTask } from '../types/Task';

interface GanttChartProps {
  tasks: GanttTask[];
  onTaskChange: (task: Task) => void;
  onDateChange: (task: Task, children: Task[]) => void;
  onProgressChange: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskAdd?: (task: Task) => void;
  onTaskSelect?: (task: Task) => void;
  onExpanderClick?: (task: Task) => void;
}

const GanttContainer = styled.div`
  height: 100%;
  width: 100%;
  font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo',
    sans-serif;

  .view-buttons {
    margin-bottom: 10px;
  }

  .view-buttons button {
    margin-right: 5px;
    padding: 5px 10px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
  }

  .view-buttons button:hover {
    background-color: #e0e0e0;
  }
`;

const ControlPanel = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

const ViewButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #357abd;
  }

  &.active {
    background-color: #2c6aa0;
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
`;

const Label = styled.label`
  font-size: 14px;
`;

const DateInput = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo',
    sans-serif;
`;

// 日本語の日付フォーマットオプション
const jpYearFormat = new Intl.DateTimeFormat('ja-JP', { year: 'numeric' });
const jpMonthFormat = new Intl.DateTimeFormat('ja-JP', { month: 'long' });
const jpDateFormat = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// カスタムフォーマッター関数
const formatters = {
  // 年のフォーマット (例: 2023年)
  year: (date: Date) => {
    return jpYearFormat.format(date);
  },
  // 月のフォーマット (例: 1月)
  month: (date: Date) => {
    return jpMonthFormat.format(date);
  },
  // 日付のフォーマット (例: 2023年1月1日)
  day: (date: Date) => {
    return jpDateFormat.format(date);
  },
  // 時間のフォーマット
  hour: (date: Date) => {
    return date.getHours() + '時';
  },
  // タスクの日付表示
  taskDate: (date: Date) => {
    return jpDateFormat.format(date);
  },
  // 週番号のカスタムフォーマット（月ごとの週番号）
  weekNum: (date: Date) => {
    // 月の最初の日を取得
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    // 月の最初の日の曜日（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
    const firstDayOfWeek = firstDayOfMonth.getDay();
    // 現在の日付
    const currentDate = date.getDate();
    // 月の第何週目かを計算（最初の週を1とする）
    const weekOfMonth = Math.ceil((currentDate + firstDayOfWeek) / 7);

    return `${date.getMonth() + 1}月${weekOfMonth}週`;
  },
};

// 日本語スタイルを適用する関数
const applyJapaneseStyles = () => {
  // CSSカスタマイズ
  const style = document.createElement('style');
  style.innerHTML = `
    .gantt-container, .calendar-header, .gantt-task-info, .gantt-tooltip {
      font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif;
    }
    
    /* 週番号の表示をカスタマイズ */
    .calendar-header .day-list .day {
      font-size: 12px;
      white-space: nowrap;
    }
    
    /* スクロールバーのスタイル調整 */
    .gantt-container .gantt-horizontal-scroll {
      overflow-x: auto;
    }
    
    /* スクロール範囲を広げる */
    .gantt-container .gantt-horizontal-container {
      min-width: 150%;
    }
    
    /* 週表示のカスタマイズ */
    .calendar-header .day-list .day:before {
      content: attr(data-week);
    }
  `;
  document.head.appendChild(style);

  // 週番号を表示するためのカスタム処理
  setTimeout(() => {
    // 週番号を追加
    const updateWeekLabels = () => {
      const dayElements = document.querySelectorAll(
        '.calendar-header .day-list .day'
      );
      dayElements.forEach((element) => {
        const dateStr = element.getAttribute('data-date');
        if (dateStr) {
          const date = new Date(dateStr);
          // 月の最初の日を取得
          const firstDayOfMonth = new Date(
            date.getFullYear(),
            date.getMonth(),
            1
          );
          // 月の最初の日の曜日（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
          const firstDayOfWeek = firstDayOfMonth.getDay();
          // 現在の日付
          const currentDate = date.getDate();
          // 月の第何週目かを計算（最初の週を1とする）
          const weekOfMonth = Math.ceil((currentDate + firstDayOfWeek) / 7);

          // 週の最初の日（日曜日）の場合のみ週番号を表示
          if (date.getDay() === 0) {
            const weekLabel = `${date.getMonth() + 1}月${weekOfMonth}週`;
            element.setAttribute('data-week', weekLabel);
            element.classList.add('week-start');
          }
        }
      });
    };

    updateWeekLabels();

    // ビューが変更されたときにも週番号を更新
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'childList' &&
          mutation.target.nodeName === 'DIV'
        ) {
          updateWeekLabels();
        }
      });
    });

    const calendarHeader = document.querySelector('.calendar-header');
    if (calendarHeader) {
      observer.observe(calendarHeader, { childList: true, subtree: true });
    }
  }, 500);
};

// 表示期間を計算する関数
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateDateRange = (
  tasks: Task[],
  userStartDate?: Date,
  userEndDate?: Date
): { start: Date; end: Date } => {
  if (!tasks || tasks.length === 0)
    return { start: new Date(), end: new Date() };

  // すべてのタスクの開始日と終了日を取得
  let minDate = new Date(tasks[0].start);
  let maxDate = new Date(tasks[0].end);

  tasks.forEach((task) => {
    const startDate = new Date(task.start);
    const endDate = new Date(task.end);

    if (startDate < minDate) minDate = startDate;
    if (endDate > maxDate) maxDate = endDate;
  });

  return { start: minDate, end: maxDate };
};

// 日付をinput type="date"用にフォーマットする関数
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  onTaskChange,
  onDateChange,
  onProgressChange,
  onTaskDelete,
  onTaskAdd,
  onTaskSelect,
  onExpanderClick,
}) => {
  const [view, setView] = useState<ViewMode>(ViewMode.Month);
  // 初期状態では全てのタスクを表示
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(new Date().setMonth(new Date().getMonth() + 3)),
  });
  const ganttContainerRef = useRef<HTMLDivElement>(null);

  // 日本語スタイルを適用
  useEffect(() => {
    applyJapaneseStyles();

    // スクロール位置を調整して過去の月も表示できるようにする
    const adjustScroll = () => {
      const container = document.querySelector('.gantt-horizontal-scroll');
      if (container) {
        // スクロール位置を少し左に設定して過去の月も見えるようにする
        (container as HTMLElement).scrollLeft = 100;
      }
    };

    // DOMが更新された後にスクロール位置を調整
    setTimeout(adjustScroll, 500);

    // ウィンドウサイズが変更されたときに再適用
    window.addEventListener('resize', applyJapaneseStyles);
    return () => {
      window.removeEventListener('resize', applyJapaneseStyles);
    };
  }, []);

  // タスクをフィルタリング
  useEffect(() => {
    // 日付範囲に基づいてタスクをフィルタリング
    if (tasks.length === 0) {
      setFilteredTasks([]);
      return;
    }

    const filtered = tasks.filter((task) => {
      const taskStart = new Date(task.start);
      const taskEnd = new Date(task.end);
      return (
        (taskStart >= dateRange.start && taskStart <= dateRange.end) ||
        (taskEnd >= dateRange.start && taskEnd <= dateRange.end) ||
        (taskStart <= dateRange.start && taskEnd >= dateRange.end)
      );
    });

    // フィルタリングの結果、タスクがない場合は全てのタスクを表示
    setFilteredTasks(filtered.length > 0 ? filtered : tasks);
  }, [tasks, dateRange]);

  // タスク変更ハンドラー
  const handleTaskChange = (task: Task) => {
    onTaskChange(task);
  };

  // タスク日付変更ハンドラー
  const handleTaskDateChange = (task: Task, children: Task[]) => {
    onDateChange(task, children);
  };

  // 進捗変更ハンドラー
  const handleProgressChange = (task: Task) => {
    onProgressChange(task);
  };

  // エクスパンダークリックハンドラー
  const handleExpanderClick = (task: Task) => {
    if (onExpanderClick) {
      onExpanderClick(task);
    }
  };

  // ビュー変更ハンドラー
  const handleViewChange = (viewMode: ViewMode) => {
    setView(viewMode);
  };

  // 削除ハンドラー
  const handleDelete = (task: Task) => {
    if (onTaskDelete) {
      onTaskDelete(task.id);
    }
  };

  // 開始日変更ハンドラー
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    setDateRange((prev) => ({ ...prev, start: newStartDate }));
  };

  // 終了日変更ハンドラー
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    setDateRange((prev) => ({ ...prev, end: newEndDate }));
  };

  return (
    <div>
      <GanttContainer ref={ganttContainerRef}>
        <ControlPanel>
          <ViewButtons>
            <Button
              onClick={() => handleViewChange(ViewMode.Hour)}
              className={view === ViewMode.Hour ? 'active' : ''}
            >
              時間
            </Button>
            <Button
              onClick={() => handleViewChange(ViewMode.Day)}
              className={view === ViewMode.Day ? 'active' : ''}
            >
              日
            </Button>
            <Button
              onClick={() => handleViewChange(ViewMode.Week)}
              className={view === ViewMode.Week ? 'active' : ''}
            >
              週
            </Button>
            <Button
              onClick={() => handleViewChange(ViewMode.Month)}
              className={view === ViewMode.Month ? 'active' : ''}
            >
              月
            </Button>
            <Button
              onClick={() => handleViewChange(ViewMode.Year)}
              className={view === ViewMode.Year ? 'active' : ''}
            >
              年
            </Button>
          </ViewButtons>

          <DateRangeContainer>
            <Label>表示期間:</Label>
            <DateInput
              type="date"
              value={formatDateForInput(dateRange.start)}
              onChange={handleStartDateChange}
            />
            <span>〜</span>
            <DateInput
              type="date"
              value={formatDateForInput(dateRange.end)}
              onChange={handleEndDateChange}
            />
          </DateRangeContainer>
        </ControlPanel>
        <Gantt
          tasks={filteredTasks}
          viewMode={view}
          onDateChange={handleTaskDateChange}
          onProgressChange={handleProgressChange}
          onDelete={handleDelete}
          onSelect={onTaskSelect}
          onExpanderClick={handleExpanderClick}
          locale="ja-JP"
          columnWidth={60}
          listCellWidth="155px"
          rowHeight={50}
          headerHeight={50}
          barCornerRadius={5}
          barProgressColor="#a3a3ff"
          barProgressSelectedColor="#8282f5"
          barBackgroundColor="#b8c2cc"
          barBackgroundSelectedColor="#aeb8c2"
          projectProgressColor="#7db59a"
          projectProgressSelectedColor="#59a985"
          projectBackgroundColor="#b8c2cc"
          projectBackgroundSelectedColor="#aeb8c2"
          milestoneBackgroundColor="#f1c453"
          milestoneBackgroundSelectedColor="#f29e4c"
          TooltipContent={({ task }) => {
            return (
              <div className="gantt-tooltip">
                <h4>{task.name}</h4>
                <p>開始: {formatters.taskDate(task.start)}</p>
                <p>終了: {formatters.taskDate(task.end)}</p>
                {task.progress !== undefined && (
                  <p>進捗: {Math.round(task.progress * 100)}%</p>
                )}
              </div>
            );
          }}
          // カスタムフォーマッターを使用
          timeStep={1000 * 60 * 60 * 24}
          arrowIndent={20}
          fontFamily="Hiragino Kaku Gothic ProN, Hiragino Sans, Meiryo, sans-serif"
          // 表示範囲を広げるために十分な数のステップを表示
          preStepsCount={30}
        />
      </GanttContainer>
    </div>
  );
};

export default GanttChart;
