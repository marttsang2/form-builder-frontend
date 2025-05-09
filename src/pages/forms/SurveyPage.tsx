import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formsApi, formResponsesApi, type FormDto, type AnswerDto } from '@/api';

export default function SubmitFormResponse() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FormDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

  useEffect(() => {
    const loadForm = async () => {
      if (!formId) return;
      
      try {
        setIsLoading(true);
        const response = await formsApi.getFormById(formId);
        setForm(response.data);
        
        // Initialize answers with empty values
        const initialAnswers: Record<string, string | string[]> = {};
        response.data.questions.forEach(question => {
          initialAnswers[question.id!] = '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Failed to load form:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error when user types
    if (errors[questionId]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }
  };

  const handleFileChange = async (questionId: string, files: FileList | null) => {
    if (!files || files.length === 0) {
      handleInputChange(questionId, '');
      return;
    }

    const file = files[0];
    
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [questionId]: 'Only PNG and JPG files are allowed'
      }));
      return;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({
        ...prev,
        [questionId]: `File size should not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }));
      return;
    }
    
    // Convert file to base64 string for simplicity
    // In a real app, you might upload this to a server and store a reference
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      handleInputChange(questionId, base64data);
    };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form) return false;
    
    form.questions.forEach(question => {
      // Skip validation for non-required fields with empty values
      if (!question.required && (!answers[question.id!] || answers[question.id!] === '')) {
        return;
      }
      
      // Validate required fields
      if (question.required && (!answers[question.id!] || answers[question.id!] === '')) {
        newErrors[question.id!] = 'This field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !form || !formId) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format answers for API
      const formattedAnswers: AnswerDto[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value
      }));
      
      await formResponsesApi.submitFormResponse({
        formId,
        answers: formattedAnswers
      });
      
      alert('Form submitted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'TEXT':
        return (
          <Input
            id={`question-${question.id}`}
            value={answers[question.id] as string || ''}
            onChange={e => handleInputChange(question.id, e.target.value)}
            placeholder="Type your answer here"
            disabled={isSubmitting}
            className={errors[question.id] ? 'border-red-500' : ''}
          />
        );
      case 'DROPDOWN':
        return (
          <Select
            value={answers[question.id] as string || ''}
            onValueChange={value => handleInputChange(question.id, value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className={errors[question.id] ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'FILE':
        return (
          <div>
            <Input
              id={`question-${question.id}`}
              type="file"
              onChange={e => handleFileChange(question.id, e.target.files)}
              disabled={isSubmitting}
              className={errors[question.id] ? 'border-red-500' : ''}
              accept=".png,.jpg,.jpeg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Allowed formats: PNG, JPG. Max size: 5MB
            </p>
            {answers[question.id] && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <img 
                  src={answers[question.id] as string} 
                  alt="File preview" 
                  className="h-24 w-auto object-contain rounded border border-gray-200"
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading form...</div>;
  }

  if (!form) {
    return <div className="container mx-auto py-10">Form not found</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{form.title}</CardTitle>
              <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {form.questions
                .sort((a, b) => a.order - b.order)
                .map(question => (
                  <div key={question.id} className="flex flex-col gap-2 text-left">
                    <Label 
                      htmlFor={`question-${question.id}`}
                      className="text-sm font-medium"
                    >
                      {question.order}. {question.label}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderQuestion(question)}
                    {errors[question.id!] && (
                      <p className="text-sm text-red-500">{errors[question.id!]}</p>
                    )}
                  </div>
                ))}
            </CardContent>
            
            <CardFooter className="flex justify-between gap-2 border-t pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Response'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
} 