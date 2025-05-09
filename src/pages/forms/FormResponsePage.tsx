import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs.tsx';
import type { Form, FormResponse } from '@/lib/types.ts';
import { 
  formsApi, 
  formResponsesApi, 
  type FormResponseDto, 
  type QuestionDto,
  type QuestionCountDto
} from '@/api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { FormAnalysis } from './components/response/FormAnalysis';
import { FormIndividual } from './components/response/FormIndividual';
import { FormQuestionPreview } from './components/response/FormQuestionPreview';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface TextResponseData {
  responses: string[];
  totalCount: number;
}

interface FileResponseData {
  fileUrls: { url: string; fileName: string; type: string }[];
  totalCount: number;
}

const getFileTypeFromUrl = (url: string): string => {
  if (url.startsWith('data:')) {
    const mimeType = url.split(',')[0].split(':')[1].split(';')[0];
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('application/')) return 'document';
    return 'file';
  }
  
  const extension = url.split('.').pop()?.toLowerCase() || '';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  
  if (imageExtensions.includes(extension)) return 'image';
  if (documentExtensions.includes(extension)) return 'document';
  return 'file';
};

export default function FormResponses() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [formQuestions, setFormQuestions] = useState<QuestionDto[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  });
  const [activeTab, setActiveTab] = useState("responses");
  const [questionCounts, setQuestionCounts] = useState<QuestionCountDto[]>([]);
  const [textResponses, setTextResponses] = useState<Record<string, TextResponseData>>({});
  const [fileResponses, setFileResponses] = useState<Record<string, FileResponseData>>({});
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);

  const processTextAndFileResponses = useCallback((questions: QuestionDto[], allResponses: FormResponseDto[]) => {
    const textData: Record<string, TextResponseData> = {};
    const fileData: Record<string, FileResponseData> = {};
    
    questions.forEach(question => {
      if (!question.id) return;
      
      if (question.type === 'TEXT') {
        const responses = allResponses
          .map(response => {
            const answer = response.values.find(v => v.questionId === question.id);
            return answer && typeof answer.value === 'string' ? answer.value : null;
          })
          .filter(Boolean) as string[];
        
        textData[question.id] = { responses, totalCount: responses.length };
      } 
      else if (question.type === 'FILE') {
        const fileUrls: { url: string; fileName: string; type: string }[] = [];
        
        allResponses.forEach(response => {
          const answer = response.values.find(v => v.questionId === question.id);
          if (!answer?.value) return;
          
          let fileValue = '';
          let fileName = '';
          
          if (typeof answer.value === 'string') {
            fileValue = answer.value;
            fileName = fileValue.startsWith('data:') 
              ? `file.${fileValue.split(',')[0].split(':')[1].split(';')[0].split('/')[1] || 'file'}`
              : fileValue.split('/').pop() || 'file';
          } else if (Array.isArray(answer.value) && answer.value.length > 0) {
            const firstItem = answer.value[0];
            if (typeof firstItem === 'string') {
              fileValue = firstItem;
              fileName = fileValue.startsWith('data:') ? 'file' : fileValue.split('/').pop() || 'file';
            } else if (firstItem && typeof firstItem === 'object') {
              const fileObj = firstItem as Record<string, any>;
              if ('url' in fileObj && typeof fileObj.url === 'string') {
                fileValue = fileObj.url;
                fileName = 'name' in fileObj ? String(fileObj.name) : (fileObj.url.split('/').pop() || 'file');
              }
            }
          } else if (typeof answer.value === 'object' && answer.value !== null) {
            const fileObj = answer.value as Record<string, any>;
            if ('url' in fileObj && typeof fileObj.url === 'string') {
              fileValue = fileObj.url;
              fileName = 'name' in fileObj ? String(fileObj.name) : (fileObj.url.split('/').pop() || 'file');
            }
          }
              
          if (fileValue) {
            fileUrls.push({
              url: fileValue,
              fileName,
              type: getFileTypeFromUrl(fileValue)
            });
          }
        });
        
        fileData[question.id] = { fileUrls, totalCount: fileUrls.length };
      }
    });
    
    setTextResponses(textData);
    setFileResponses(fileData);
  }, []);

  const loadData = useCallback(async () => {
    if (!formId) return;
    
    try {
      setIsLoading(true);
      const [formDataResponse, responsesDataResponse] = await Promise.all([
        formsApi.getFormById(formId),
        formResponsesApi.getPaginatedResponsesForForm(formId, {
          page: pagination.page,
          limit: pagination.limit
        })
      ]);
      
      const formDto = formDataResponse.data;
      const { data: responsesDto, metadata } = responsesDataResponse.data;
      
      // Set form data
      setFormQuestions(formDto.questions);
      setForm({
        id: formDto.id,
        name: formDto.title,
        createdAt: new Date(formDto.createdAt),
        updatedAt: new Date(formDto.updatedAt),
        responseCount: metadata.totalItems,
      });
      
      setPagination(prev => ({
        ...prev,
        totalPages: metadata.totalPages,
        totalItems: metadata.totalItems
      }));
      
      setResponses(responsesDto.map((dto: FormResponseDto) => ({
        id: dto.id,
        formId: dto.formId,
        submittedAt: new Date(dto.createdAt),
        data: dto.values.reduce((acc, answer) => {
          acc[answer.questionId] = answer.value;
          return acc;
        }, {} as Record<string, any>), 
      })));
      
      if (metadata.totalItems > 0) {
        const [questionCountsResponse, allResponsesData] = await Promise.all([
          formResponsesApi.getFormQuestionCounts(formId),
          formResponsesApi.getAllResponsesForForm(formId)
        ]);
        
        setQuestionCounts(questionCountsResponse.data.questionCounts);
        processTextAndFileResponses(formDto.questions, allResponsesData.data);
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formId, pagination.page, pagination.limit, processTextAndFileResponses]);
  
  const handleNavigateResponse = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (currentResponseIndex < responses.length - 1) {
        setCurrentResponseIndex(currentResponseIndex + 1);
      } else if (pagination.page < pagination.totalPages) {
        setPagination(prev => ({ ...prev, page: prev.page + 1 }));
        setCurrentResponseIndex(0);
      }
    } else {
      if (currentResponseIndex > 0) {
        setCurrentResponseIndex(currentResponseIndex - 1);
      } else if (pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentResponseIndex(0);
  }, [pagination.page, activeTab]);
  
  useEffect(() => {
    if (responses.length > 0 && currentResponseIndex === 0 && pagination.page !== 1) {
      setCurrentResponseIndex(responses.length - 1);
    }
  }, [responses, pagination.page]);

  if (isLoading && pagination.page === 1) {
    return <div className="flex justify-center p-8">Loading responses...</div>;
  }

  if (!form) {
    return <div className="container mx-auto py-10">Form not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{form.name}</h1>
          <p className="text-muted-foreground">Form Management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/">Back to Forms</Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="questions">Form Questions</TabsTrigger>
          <TabsTrigger value="responses">Response Analysis</TabsTrigger>
          <TabsTrigger value="individual">Individual Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="mt-6">
          <FormQuestionPreview 
            formName={form.name}
            question={formQuestions}
          />
        </TabsContent>
        
        <TabsContent value="responses">
          <FormAnalysis 
            questionCounts={questionCounts}
            formQuestions={formQuestions}
            textResponses={textResponses}
            fileResponses={fileResponses}
            totalItems={pagination.totalItems}
          />
        </TabsContent>
        
        <TabsContent value="individual">
          <FormIndividual
            responses={responses}
            formQuestions={formQuestions}
            currentResponseIndex={currentResponseIndex}
            totalItems={pagination.totalItems}
            page={pagination.page}
            totalPages={pagination.totalPages}
            handlePreviousResponse={() => handleNavigateResponse('prev')}
            handleNextResponse={() => handleNavigateResponse('next')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 