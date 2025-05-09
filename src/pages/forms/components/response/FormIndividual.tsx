import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileIcon, ImageIcon, FileTextIcon } from 'lucide-react';
import type { QuestionDto } from '@/api';
import type { FormResponse } from '@/lib/types';

interface FormIndividualProps {
  responses: FormResponse[];
  formQuestions: QuestionDto[];
  currentResponseIndex: number;
  totalItems: number;
  page: number;
  totalPages: number;
  handlePreviousResponse: () => void;
  handleNextResponse: () => void;
}

export function FormIndividual({
  responses,
  formQuestions,
  currentResponseIndex,
  totalItems,
  page,
  totalPages,
  handlePreviousResponse,
  handleNextResponse,
}: FormIndividualProps) {
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Helper to get icon for file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'document':
        return <FileTextIcon className="h-5 w-5" />;
      default:
        return <FileIcon className="h-5 w-5" />;
    }
  };
  
  // Improved file type detection
  const getFileTypeFromUrl = (url: string): string => {
    // Check if it's a base64 encoded string
    if (url.startsWith('data:')) {
      // Extract MIME type from the data URL
      const mimeType = url.split(',')[0].split(':')[1].split(';')[0];
      
      if (mimeType.startsWith('image/')) {
        return 'image';
      } else if (mimeType.startsWith('application/')) {
        return 'document';
      } else {
        return 'file';
      }
    }
    
    // Regular URL handling
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    
    if (imageExtensions.includes(extension)) {
      return 'image';
    } else if (documentExtensions.includes(extension)) {
      return 'document';
    } else {
      return 'file';
    }
  };

  return (
    <>
     {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No responses yet for this form</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Individual Response</h2>
                <div className="text-sm text-muted-foreground">
                  {currentResponseIndex + 1} of {totalItems} responses
                </div>
              </div>
              
              {responses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Response Details</CardTitle>
                    <CardDescription>
                      Submitted on {formatDate(responses[currentResponseIndex].submittedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {formQuestions
                      .sort((a, b) => a.order - b.order)
                      .map((question) => {
                        if (!question.id) return null;
                        const response = responses[currentResponseIndex];
                        const answer = response.data[question.id];
                        
                        return (
                          <div key={question.id} className="space-y-2 border-b pb-4 last:border-0">
                            <Label className="text-sm font-medium">
                              {question.label}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            
                            <div className="mt-1">
                              {/* Display answer based on question type */}
                              {question.type === 'TEXT' && (
                                <div className="text-sm p-2 bg-gray-50 rounded min-h-[2rem]">
                                  {answer || <span className="text-muted-foreground italic">No answer provided</span>}
                                </div>
                              )}
                              
                              {question.type === 'DROPDOWN' && (
                                <div className="text-sm p-2 bg-gray-50 rounded min-h-[2rem]">
                                  {answer || <span className="text-muted-foreground italic">No option selected</span>}
                                </div>
                              )}
                              
                              {question.type === 'FILE' && (
                                <div className="text-sm">
                                  {answer ? (
                                    <div>
                                      {getFileTypeFromUrl(answer) === 'image' ? (
                                        <div className="mt-2">
                                          <img 
                                            src={answer} 
                                            alt={answer.split('/').pop() || 'Image preview'} 
                                            className="max-h-32 max-w-full rounded-md object-contain border border-gray-200" 
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-2">
                                          {getFileIcon(getFileTypeFromUrl(answer))}
                                          <span className="truncate max-w-xs">{answer.split('/').pop()}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground italic">No file uploaded</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>
              )}
              
              <div className="flex justify-between items-center mt-6">
                <Button 
                  variant="outline"
                  onClick={handlePreviousResponse}
                  disabled={currentResponseIndex === 0 && page === 1}
                >
                  Previous Response
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleNextResponse}
                  disabled={(currentResponseIndex === responses.length - 1) && page === totalPages}
                >
                  Next Response
                </Button>
              </div>
            </div>
          )}
    </>
  );
}
