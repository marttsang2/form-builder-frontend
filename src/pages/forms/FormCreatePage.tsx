import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlusIcon } from 'lucide-react';
import { formsApi, type FormDto, type FormQuestion, type QuestionDto } from '@/api';
import { Separator } from '@/components/ui/separator';
import { FormQuestionCard } from './components/form/FormQuestionCard';

export default function CreateFormPage() {
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previousVersionId, setPreviousVersionId] = useState<string | null>(null);
  const [previousForm, setPreviousForm] = useState<FormDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { formId } = useParams<{ formId: string }>();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prevVersionId = params.get('previousVersionId');
    
    if (prevVersionId) {
      setPreviousVersionId(prevVersionId);
      loadPreviousForm(prevVersionId);
    } else if (formId) {
      setIsEditMode(true);
      loadExistingForm(formId);
    } else {
      handleAddQuestion('text');
    }
  }, [location, formId]);
  
  const loadExistingForm = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await formsApi.getFormById(id);
      const form = response.data;
      setPreviousForm(form);
      
      // Pre-fill form data from existing form
      setFormTitle(form.title);
      setFormDescription(form.description);
      setIsLocked(form.isLocked);
      
      // Convert API questions to our format
      const mappedQuestions: FormQuestion[] = form.questions.map(q => ({
        id: q.id || `question-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        // Convert API types to component types
        type: q.type === 'TEXT' ? 'text' : q.type === 'DROPDOWN' ? 'dropdown' : 'file',
        label: q.label,
        required: q.required,
        order: q.order,
        ...(q.type === 'DROPDOWN' && q.options ? {
          options: q.options.map((opt, index) => ({
            id: `option-${Date.now()}-${index}`,
            value: opt,
            label: opt
          }))
        } : {})
      }));
      
      setQuestions(mappedQuestions);
    } catch (error) {
      console.error('Failed to load form:', error);
      alert('Could not load the form. Creating a new form instead.');
      navigate('/forms/new');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadPreviousForm = async (formId: string) => {
    try {
      setIsLoading(true);
      const response = await formsApi.getFormById(formId);
      const form = response.data;
      setPreviousForm(form);
      
      // Pre-fill form data from previous version
      setFormTitle(`${form.title} (New Version)`);
      setFormDescription(form.description);
      
      // Convert API questions to our format
      const mappedQuestions: FormQuestion[] = form.questions.map(q => ({
        id: `question-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        // Convert API types to component types
        type: q.type === 'TEXT' ? 'text' : q.type === 'DROPDOWN' ? 'dropdown' : 'file',
        label: q.label,
        required: q.required,
        order: q.order,
        ...(q.type === 'DROPDOWN' && q.options ? {
          options: q.options.map((opt, index) => ({
            id: `option-${Date.now()}-${index}`,
            value: opt,
            label: opt
          }))
        } : {})
      }));
      
      setQuestions(mappedQuestions);
    } catch (error) {
      console.error('Failed to load previous form version:', error);
      alert('Could not load the previous form version. Creating a new form instead.');
      setPreviousVersionId(null);
      // Add a default text question
      handleAddQuestion('text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = (type: FormQuestion['type']) => {
    const newQuestion: FormQuestion = {
      id: `question-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Unique ID
      type,
      label: '',
      required: false,
      order: questions.length + 1,
      ...(type === 'dropdown' ? { options: [{ id: `option-${Date.now()}`, value: '', label: '' }] } : {}),
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionLabelChange = (questionId: string, label: string) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, label } : q));
  };
  
  const handleQuestionRequiredChange = (questionId: string, required: boolean) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, required } : q));
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.type === 'dropdown') {
        return {
          ...q,
          options: [...(q.options || []), { id: `option-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, value: '', label: '' }],
        };
      }
      return q;
    }));
  };

  const handleOptionChange = (questionId: string, optionId: string, value: string) => {
    console.log(value);
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.type === 'dropdown' && q.options) {
        return {
          ...q,
          options: q.options.map(opt => 
            opt.id === optionId 
              ? { ...opt, value: value, label: value } // Set both value and label to the same value
              : opt
          ),
        };
      }
      return q;
    }));
  };

  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.type === 'dropdown' && q.options) {
        return {
          ...q,
          options: q.options.filter(opt => opt.id !== optionId),
        };
      }
      return q;
    }));
  };

  const handleChangeQuestionType = (questionId: string, newType: FormQuestion['type']) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          type: newType,
          ...(newType === 'dropdown' && !q.options ? { 
            options: [{ id: `option-${Date.now()}`, value: '', label: '' }] 
          } : {}),
          ...(newType !== 'dropdown' ? { options: undefined } : {}),
        };
      }
      return q;
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a form title.');
      return;
    }
    if (questions.some(q => !q.label.trim())) {
      alert('Please ensure all question labels are filled.');
      return;
    }
    
    // Validate dropdown options
    const dropdownWithEmptyOptions = questions.some(q => 
      q.type === 'dropdown' && 
      q.options && 
      q.options.some(opt => !opt.label || !opt.value)
    );
    if (dropdownWithEmptyOptions) {
      alert('Please fill in all dropdown option labels and values.');
      return;
    }

    setIsLoading(true);
    try {
      // Format questions according to API expectations
      const formattedQuestions: QuestionDto[] = questions.map(q => ({
        label: q.label,
        // Convert component types to API types
        type: q.type === 'text' ? 'TEXT' as const : q.type === 'dropdown' ? 'DROPDOWN' as const : 'FILE' as const,
        order: q.order,
        required: q.required,
        options: q.type === 'dropdown' && q.options ? q.options.map(opt => opt.value) : undefined
      }));
      
      const formData = { 
        title: formTitle,
        description: formDescription,
        isLocked: isLocked,
        previousVersionId: previousVersionId,
        questions: formattedQuestions
      };
      
      if (isEditMode && formId) {
        await formsApi.updateForm(formId, formData);
        alert(`Form "${formTitle}" updated successfully!`);
      } else {
        await formsApi.createForm(formData);
        alert(`Form "${formTitle}" created successfully!`);
      }
      
      navigate('/'); 
    } catch (error: any) {
      alert(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/30">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Form' : previousVersionId ? 'Create New Form Version' : 'Create New Form'}
              </CardTitle>
              <CardDescription className="text-gray-700">
                {isEditMode 
                  ? `You are editing form "${previousForm?.title || ''}"`
                  : previousVersionId 
                  ? `You are creating a new version of form "${previousForm?.title || ''}"`
                  : 'Fill in the details below to create your new form.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Form Details Section */}
              <div className="space-y-6">
                <h2 className="font-semibold text-lg text-gray-700">Form Details</h2>
                
                <div>
                  <Label htmlFor="formTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Form Title
                  </Label>
                  <Input
                    id="formTitle"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Customer Feedback Survey"
                    disabled={isLoading}
                    required
                    className="text-lg border-gray-200 focus:border-gray-400"
                  />
                </div>
                
                <div>
                  <Label htmlFor="formDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Form Description
                  </Label>
                  <Textarea
                    id="formDescription"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide a description for this form"
                    disabled={isLoading}
                    className="min-h-24 border-gray-200 focus:border-gray-400"
                  />
                </div>
              </div>
              
              <Separator className="my-6 bg-gray-200" />
              
              {/* Questions Section */}
              <div className="space-y-6">
                <h2 className="font-semibold text-lg text-gray-700">Form Questions ({questions.length})</h2>
                
                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <FormQuestionCard
                        key={question.id}
                        question={question}
                        index={index}
                        isLoading={isLoading}
                        onChangeQuestionType={handleChangeQuestionType}
                        onRemoveQuestion={handleRemoveQuestion}
                        onQuestionLabelChange={handleQuestionLabelChange}
                        onQuestionRequiredChange={handleQuestionRequiredChange}
                        onAddOption={handleAddOption}
                        onOptionChange={handleOptionChange}
                        onRemoveOption={handleRemoveOption}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-gray-200 rounded-md text-center bg-gray-50/30">
                    <p className="text-gray-800">Your form currently has no questions.</p>
                    <p className="text-gray-600 text-xs mt-1">Click on the buttons above to add questions to your form.</p>
                  </div>
                )}
                
                {/* Add Question Button at bottom */}
                {questions.length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <Button 
                      type="button" 
                      variant="default" 
                      className="bg-blue-600 text-white hover:bg-blue-700 w-full" 
                      onClick={() => handleAddQuestion('text')}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" /> Add Question
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2 border-t pt-6 bg-gray-50">
              <Button type="button" variant="outline" onClick={() => navigate('/')} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !formTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Saving...' : isEditMode ? 'Update Form' : previousVersionId ? 'Save New Version' : 'Save Form'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
} 