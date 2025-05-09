import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Pie } from 'react-chartjs-2';
import { FileIcon, ImageIcon, FileTextIcon } from 'lucide-react';
import type { QuestionDto, QuestionCountDto } from '@/api';

interface TextResponseData {
  responses: string[];
  totalCount: number;
}

interface FileResponseData {
  fileUrls: Array<{
    url: string;
    type: string;
    fileName: string;
  }>;
  totalCount: number;
}

interface FormAnalysisProps {
  questionCounts: QuestionCountDto[];
  formQuestions: QuestionDto[];
  textResponses: Record<string, TextResponseData>;
  fileResponses: Record<string, FileResponseData>;
  totalItems: number;
}

export function FormAnalysis({ 
  questionCounts, 
  formQuestions, 
  textResponses, 
  fileResponses, 
  totalItems 
}: FormAnalysisProps) {
  // Calculate total responses for a question
  const getTotalResponses = (questionId: string): number => {
    const question = questionCounts.find(q => q.questionId === questionId);
    if (!question) return 0;
    
    return Object.values(question.counts).reduce((sum, count) => sum + count, 0);
  };
  
  // Generate chart data for a question
  const getChartData = (question: QuestionCountDto) => {
    // Find the form question with all options
    const formQuestion = formQuestions.find(q => q.id === question.questionId);
    // Use all available options if found, otherwise use the ones with counts
    const allOptions = formQuestion?.options || Object.keys(question.counts);
    
    // Map all options to their counts (using 0 for options not in question.counts)
    const labels = allOptions;
    const data = allOptions.map(option => question.counts[option] || 0);
    
    // Generate colors - one for each label
    const backgroundColors = [
      'rgba(75, 192, 192, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 205, 86, 0.6)',
      'rgba(201, 203, 207, 0.6)',
    ];
    
    // If we have more options than colors, repeat the colors
    const colors = labels.map((_, i) => backgroundColors[i % backgroundColors.length]);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.6', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  // Configuration for charts
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value * 100) / total);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
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

  return (
    <>
      {totalItems === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed">
          <p className="text-muted-foreground">No responses yet for this form</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold">Response Statistics</h2>
            
            {questionCounts.map((question) => (
              <Card key={question.questionId} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{question.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Dropdown question - Pie chart */}
                  {question.type === 'DROPDOWN' && (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                          {(() => {
                            // Find the form question with all options
                            const formQuestion = formQuestions.find(q => q.id === question.questionId);
                            // Use all available options if found, otherwise use the ones with counts
                            const allOptions = formQuestion?.options || Object.keys(question.counts);
                            
                            return allOptions.map(option => {
                              const count = question.counts[option] || 0;
                              const totalResponses = getTotalResponses(question.questionId);
                              const percentage = totalResponses ? Math.round((count / totalResponses) * 100) : 0;
                              
                              return (
                                <div key={option} className="space-y-1 mb-2">
                                  <div className="flex justify-between text-sm">
                                    <span>{option}</span>
                                    <span>{count} ({percentage}%)</span>
                                  </div>
                                  <Progress value={percentage} className="h-2" />
                                </div>
                              );
                            });
                          })()}
                          <div className="text-sm text-muted-foreground mt-2">
                            Total responses: {getTotalResponses(question.questionId)}
                          </div>
                        </div>
                        <div className="w-full md:w-2/3 h-64 flex items-center justify-center">
                          {getTotalResponses(question.questionId) > 0 && (
                            <Pie 
                              data={getChartData(question)} 
                              options={pieChartOptions}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Text question - List view */}
                  {question.type === 'TEXT' && question.questionId && textResponses[question.questionId] && (
                    <div className="space-y-4">
                      <div className="text-sm mb-2">
                        <p>Total answers: {textResponses[question.questionId].totalCount}</p>
                      </div>
                      <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                        {textResponses[question.questionId].responses.length > 0 ? (
                          textResponses[question.questionId].responses.map((response, index) => (
                            <div key={index} className="p-3 text-sm bg-neutral-100 rounded-sm">
                              {response || <span className="text-muted-foreground italic">Empty response</span>}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-muted-foreground italic">
                            No responses yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* File question - List view with thumbnails */}
                  {question.type === 'FILE' && question.questionId && fileResponses[question.questionId] && (
                    <div className="space-y-4 max-h-[360px] overflow-y-auto">
                      <div className="text-sm mb-2">
                        <p>Total files: {fileResponses[question.questionId].totalCount}</p>
                      </div>
                      {fileResponses[question.questionId].fileUrls.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {fileResponses[question.questionId].fileUrls.map((file, index) => (
                            <div key={index} className="border rounded-md p-2 space-y-2">
                              <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                {file.type === 'image' ? (
                                  <img 
                                    src={file.url} 
                                    alt={file.fileName}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      console.error('Failed to load thumbnail:', file.url);
                                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg==';
                                    }}
                                  />
                                ) : (
                                  <div className="text-gray-500 flex items-center justify-center h-full">
                                    {getFileIcon(file.type)}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs truncate">{file.fileName}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic p-3 border rounded-md">
                          No files uploaded yet
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
