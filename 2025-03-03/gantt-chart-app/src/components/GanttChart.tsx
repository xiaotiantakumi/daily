import React, { useState } from 'react';
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
  onExpanderClick?: (task: Task) => void;
}

const GanttContainer = styled.div`
  height: 80vh;
  width: 100%;
  font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo',
    sans-serif;
`;

const ToolBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ViewSwitcher = styled.div`
  margin-left: auto;
  display: flex;
  gap: 10px;
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
};

// 日本語スタイルを適用する関数
const applyJapaneseStyles = () => {
  // CSSカスタマイズ
  const style = document.createElement('style');
  style.innerHTML = `
    .gantt-container, .calendar-header, .gantt-task-info, .gantt-tooltip {
      font-family: "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", sans-serif;
    }
  `;
  document.head.appendChild(style);
};

const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  onTaskChange,
  onDateChange,
  onProgressChange,
  onTaskDelete,
  onTaskAdd,
  onExpanderClick,
}) => {
  const [view, setView] = useState<ViewMode>(ViewMode.Day);
  const [isChecked] = useState(true);

  // コンポーネントがマウントされたときに日本語スタイルを適用
  React.useEffect(() => {
    applyJapaneseStyles();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTaskChange = (task: Task) => {
    onTaskChange(task);
  };

  const handleTaskDateChange = (task: Task, children: Task[]) => {
    onDateChange(task, children);
  };

  const handleProgressChange = (task: Task) => {
    onProgressChange(task);
  };

  const handleExpanderClick = (task: Task) => {
    if (onExpanderClick) {
      onExpanderClick(task);
    }
  };

  const handleViewChange = (viewMode: ViewMode) => {
    setView(viewMode);
  };

  const handleDelete = (task: Task) => {
    if (onTaskDelete && task.id) {
      onTaskDelete(task.id);
      return true;
    }
    return false;
  };

  return (
    <div>
      <ToolBar>
        <ViewSwitcher>
          <Button
            className={view === ViewMode.Hour ? 'active' : ''}
            onClick={() => handleViewChange(ViewMode.Hour)}
          >
            時間
          </Button>
          <Button
            className={view === ViewMode.Day ? 'active' : ''}
            onClick={() => handleViewChange(ViewMode.Day)}
          >
            日
          </Button>
          <Button
            className={view === ViewMode.Week ? 'active' : ''}
            onClick={() => handleViewChange(ViewMode.Week)}
          >
            週
          </Button>
          <Button
            className={view === ViewMode.Month ? 'active' : ''}
            onClick={() => handleViewChange(ViewMode.Month)}
          >
            月
          </Button>
          <Button
            className={view === ViewMode.Year ? 'active' : ''}
            onClick={() => handleViewChange(ViewMode.Year)}
          >
            年
          </Button>
        </ViewSwitcher>
      </ToolBar>
      <GanttContainer>
        <Gantt
          tasks={tasks}
          viewMode={view}
          onDateChange={handleTaskDateChange}
          onDelete={handleDelete}
          onProgressChange={handleProgressChange}
          onDoubleClick={() => {}}
          onClick={() => {}}
          onExpanderClick={handleExpanderClick}
          listCellWidth={isChecked ? '155px' : ''}
          columnWidth={60}
          todayColor="rgba(74, 144, 226, 0.3)"
          locale="ja-JP"
          preStepsCount={1}
          timeStep={1000 * 60 * 60 * 24}
          fontSize="14px"
          rowHeight={50}
          headerHeight={50}
          barFill={80}
          barCornerRadius={5}
          arrowColor="#ccc"
          arrowIndent={20}
          TooltipContent={({ task }) => (
            <div
              style={{
                padding: '12px',
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            >
              <h4>{task.name}</h4>
              <p>開始: {formatters.taskDate(task.start)}</p>
              <p>終了: {formatters.taskDate(task.end)}</p>
              <p>進捗: {task.progress}%</p>
            </div>
          )}
        />
      </GanttContainer>
    </div>
  );
};

export default GanttChart;
