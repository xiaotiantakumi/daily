import { Task } from 'gantt-task-react';

export interface GanttTask extends Task {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  type: 'task' | 'milestone' | 'project';
  isDisabled?: boolean;
  styles?: {
    backgroundColor?: string;
    backgroundSelectedColor?: string;
    progressColor?: string;
    progressSelectedColor?: string;
  };
  dependencies?: string[];
  hideChildren?: boolean;
  displayOrder?: number;
  project?: string;
}

export interface GanttTaskLink {
  id: string;
  source: string;
  target: string;
  type: number;
}

export interface GanttData {
  tasks: GanttTask[];
  links?: GanttTaskLink[];
}
