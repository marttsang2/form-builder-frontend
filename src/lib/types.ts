export interface Form {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  responseCount: number;
  questionCount?: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  submittedAt: Date;
  data: Record<string, any>;
} 