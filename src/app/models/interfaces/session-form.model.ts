// Session Form Models

export interface SessionFormItem {
  id_item: number;
  description: string;
  penaltyPoints: number;
  orderIndex: number;
}

export interface SessionFormTemplate {
  id_formular: number;
  id_categ: number;
  maxPoints: number;
  items: SessionFormItem[];
}

export interface MistakeEntry {
  idItem: number;
  count: number;
}

export interface SubmitSessionFormRequest {
  mistakes: MistakeEntry[];
  maxPoints: number;
}

export interface SessionFormResult {
  id: number;
  totalPoints: number;
  maxPoints: number;
  result: 'OK' | 'FAILED';
}

// Extended interface for tracking mistakes in the UI
export interface SessionFormItemWithMistakes extends SessionFormItem {
  mistakeCount: number;
  totalPenalty: number;
}
