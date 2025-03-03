import React, { useState, useRef, useCallback } from 'react';
import { Task } from 'gantt-task-react';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import GanttChart from './components/GanttChart';
import { GanttTask, GanttData } from './types/Task';
import './App.css';

const AppContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const ButtonGroup = styled.div`
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
`;

const FileInput = styled.input`
  display: none;
`;

function App() {
  const [tasks, setTasks] = useState<GanttTask[]>(getInitialTasks());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 親タスクの期間を子タスクに基づいて更新する関数
  const updateParentTaskDates = useCallback(
    (updatedTasks: GanttTask[]): GanttTask[] => {
      // プロジェクトIDごとに子タスクをグループ化
      const projectChildren: { [key: string]: GanttTask[] } = {};

      // 子タスクを親プロジェクトごとにグループ化
      updatedTasks.forEach((task) => {
        if (task.project) {
          if (!projectChildren[task.project]) {
            projectChildren[task.project] = [];
          }
          projectChildren[task.project].push(task);
        }
      });

      // 各親プロジェクトの期間を子タスクに基づいて更新
      return updatedTasks.map((task) => {
        // プロジェクトタイプのタスクのみ処理
        if (task.type === 'project' && projectChildren[task.id]) {
          const children = projectChildren[task.id];
          if (children.length > 0) {
            // 子タスクの最小開始日と最大終了日を見つける
            let minStart = new Date(8640000000000000); // 最大日付
            let maxEnd = new Date(-8640000000000000); // 最小日付

            children.forEach((child) => {
              if (child.start < minStart) {
                minStart = new Date(child.start);
              }
              if (child.end > maxEnd) {
                maxEnd = new Date(child.end);
              }
            });

            // 親タスクの期間を更新
            return {
              ...task,
              start: minStart,
              end: maxEnd,
            };
          }
        }
        return task;
      });
    },
    []
  );

  const handleTaskChange = (task: Task) => {
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? (task as GanttTask) : t
    );
    setTasks(updatedTasks);
  };

  const handleDateChange = (task: Task, children: Task[]) => {
    let updatedTasks = [...tasks];

    // 変更されたタスクを更新
    updatedTasks = updatedTasks.map((t) => {
      if (t.id === task.id) {
        return { ...t, start: task.start, end: task.end } as GanttTask;
      }
      return t;
    });

    // 子タスクを更新
    if (children && children.length > 0) {
      children.forEach((childTask) => {
        updatedTasks = updatedTasks.map((t) => {
          if (t.id === childTask.id) {
            return {
              ...t,
              start: childTask.start,
              end: childTask.end,
            } as GanttTask;
          }
          return t;
        });
      });
    }

    // 親タスクの期間を更新
    updatedTasks = updateParentTaskDates(updatedTasks);

    setTasks(updatedTasks);
  };

  const handleProgressChange = (task: Task) => {
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? ({ ...t, progress: task.progress } as GanttTask) : t
    );
    setTasks(updatedTasks);
  };

  const handleTaskDelete = (taskId: string) => {
    const filteredTasks = tasks.filter((t) => t.id !== taskId);
    // 親タスクの期間を更新
    const updatedTasks = updateParentTaskDates(filteredTasks);
    setTasks(updatedTasks);
  };

  const handleExpanderClick = (task: Task) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        return { ...t, hideChildren: !t.hideChildren } as GanttTask;
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const handleExportJSON = () => {
    const data: GanttData = { tasks };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'gantt-chart-data.json');
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as GanttData;
          if (data.tasks) {
            // 日付文字列をDateオブジェクトに変換
            const parsedTasks = data.tasks.map((task) => ({
              ...task,
              start: new Date(
                task.start instanceof Date ? task.start : task.start
              ),
              end: new Date(task.end instanceof Date ? task.end : task.end),
            }));
            // 親タスクの期間を更新
            const updatedTasks = updateParentTaskDates(parsedTasks);
            setTasks(updatedTasks);
          }
        } catch (error) {
          console.error('JSONの解析に失敗しました:', error);
          alert(
            'JSONファイルの解析に失敗しました。正しいフォーマットか確認してください。'
          );
        }
      };
      reader.readAsText(file);
    }
    // ファイル選択をリセット
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title>ガントチャートアプリ</Title>
        <ButtonGroup>
          <Button onClick={handleImportClick}>JSONをインポート</Button>
          <FileInput
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileChange}
          />
          <Button onClick={handleExportJSON}>JSONをエクスポート</Button>
        </ButtonGroup>
      </Header>
      <GanttChart
        tasks={tasks}
        onTaskChange={handleTaskChange}
        onDateChange={handleDateChange}
        onProgressChange={handleProgressChange}
        onTaskDelete={handleTaskDelete}
        onExpanderClick={handleExpanderClick}
      />
    </AppContainer>
  );
}

// サンプルデータを生成する関数
function getInitialTasks(): GanttTask[] {
  const currentDate = new Date();
  const tasks: GanttTask[] = [
    {
      id: '1',
      name: 'プロジェクト1',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      progress: 45,
      type: 'project',
      hideChildren: false,
    },
    {
      id: '1-1',
      name: 'タスク1',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
      progress: 100,
      type: 'task',
      project: '1',
    },
    {
      id: '1-2',
      name: 'タスク2',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 6),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      progress: 50,
      type: 'task',
      project: '1',
    },
    {
      id: '1-3',
      name: 'マイルストーン1',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      progress: 0,
      type: 'milestone',
      project: '1',
    },
    {
      id: '2',
      name: 'プロジェクト2',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15),
      progress: 10,
      type: 'project',
      hideChildren: false,
    },
    {
      id: '2-1',
      name: 'タスク3',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
      progress: 40,
      type: 'task',
      project: '2',
    },
    {
      id: '2-2',
      name: 'タスク4',
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 21),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5),
      progress: 0,
      type: 'task',
      project: '2',
      dependencies: ['2-1'],
    },
    {
      id: '2-3',
      name: 'マイルストーン2',
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        15
      ),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15),
      progress: 0,
      type: 'milestone',
      project: '2',
      dependencies: ['2-2'],
    },
  ];

  return tasks;
}

export default App;
