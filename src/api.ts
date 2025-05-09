import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface FormQuestionOption {
  id: string;
  value: string;
  label: string;
}

export interface FormQuestion {
  id: string;
  type: 'text' | 'dropdown' | 'file';
  label: string;
  required: boolean;
  order: number;
  options?: FormQuestionOption[]; // Only for dropdown
}

interface QuestionDto {
  id?: string;
  label: string;
  type: 'TEXT' | 'DROPDOWN' | 'FILE';
  order: number;
  required: boolean;
  options?: string[];
  formId?: string;
}

interface CreateFormDto {
  title: string;
  description: string;
  isLocked: boolean;
  previousVersionId: string | null;
  questions: QuestionDto[];
}

interface FormDto {
  id: string;
  title: string;
  description: string;
  slug: string;
  isLocked: boolean;
  version: number;
  _count: {
    responses: number;
  };
  previousVersionId: string | null;
  createdAt: string;
  updatedAt: string;
  questions: QuestionDto[];
}

interface AnswerDto {
  questionId: string;
  value: string | string[];
}

interface FormResponseAnswerDto {
  id: string;
  questionId: string;
  value: string | string[];
  responseId: string;
}

interface FormResponseDto {
  id: string;
  formId: string;
  createdAt: string;
  updatedAt: string;
  values: FormResponseAnswerDto[];
}

interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// Question counts DTO for response statistics
interface QuestionCountDto {
  questionId: string;
  label: string;
  type: 'TEXT' | 'DROPDOWN' | 'FILE';
  counts: Record<string, number>;
}

interface FormQuestionCountsDto {
  formId: string;
  questionCounts: QuestionCountDto[];
}

// Forms API
const formsApi = {
  // Create a new form
  createForm: (data: CreateFormDto) => {
    return axios.post<FormDto>(`${API_BASE_URL}/forms`, data);
  },

  // Update an existing form
  updateForm: (id: string, data: CreateFormDto) => {
    return axios.put<FormDto>(`${API_BASE_URL}/forms/${id}`, data);
  },

  // Get all forms
  getAllForms: () => {
    return axios.get<FormDto[]>(`${API_BASE_URL}/forms`);
  },

  // Search forms with pagination
  searchForms: (params: { keyword?: string; page?: number; limit?: number }) => {
    return axios.get<PaginatedResponse<FormDto>>(`${API_BASE_URL}/forms/search`, { params });
  },

  // Get form by ID
  getFormById: (id: string) => {
    return axios.get<FormDto>(`${API_BASE_URL}/forms/${id}`);
  },

  // Delete form
  deleteForm: (id: string) => {
    return axios.delete<FormDto>(`${API_BASE_URL}/forms/${id}`);
  },
};

// Form Responses API
const formResponsesApi = {
  // Submit a form response
  submitFormResponse: (data: { formId: string; answers: AnswerDto[] }) => {
    return axios.post<FormResponseDto>(`${API_BASE_URL}/form-responses`, data);
  },

  // Get all responses for a form
  getAllResponsesForForm: (formId: string) => {
    return axios.get<FormResponseDto[]>(`${API_BASE_URL}/form-responses/form/${formId}`);
  },

  // Get responses with pagination
  getPaginatedResponsesForForm: (formId: string, params: { page?: number; limit?: number }) => {
    return axios.get<PaginatedResponse<FormResponseDto>>(
      `${API_BASE_URL}/form-responses/form/${formId}/paginated`, 
      { params }
    );
  },

  // Get a specific form response
  getFormResponseById: (id: string) => {
    return axios.get<FormResponseDto>(`${API_BASE_URL}/form-responses/${id}`);
  },

  // Export form responses (returns a downloadable file)
  exportFormResponses: (formId: string) => {
    return axios.get(`${API_BASE_URL}/form-responses/form/${formId}/export`, {
      responseType: 'blob', // Important: This tells axios to process the response as a binary blob
    });
  },

  // Get option counts for all questions in a form
  getFormQuestionCounts: (formId: string) => {
    return axios.get<FormQuestionCountsDto>(`${API_BASE_URL}/form-responses/form/${formId}/questions/counts`);
  },
};

export { 
  formsApi, 
  formResponsesApi, 
  type FormDto, 
  type FormResponseDto, 
  type PaginatedResponse, 
  type QuestionDto, 
  type AnswerDto,
  type QuestionCountDto,
  type FormQuestionCountsDto
};