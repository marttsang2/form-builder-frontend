import { Label } from "@/components/ui/label";
import type { QuestionDto } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormQuestionPreviewProps {
  formName: string;
  question: QuestionDto[];
}

export function FormQuestionPreview({ formName, question }: FormQuestionPreviewProps) {
    const renderQuestionInput = (question: QuestionDto) => {
        switch (question.type) {
          case 'TEXT':
            return (
              <Input 
                type="text" 
                placeholder="Type your answer here" 
                disabled 
                readOnly 
                className="bg-gray-50"
              />
            );
          case 'DROPDOWN':
            return (
              <Select disabled>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {question.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          case 'FILE':
            return (
              <Input 
                type="file" 
                disabled 
                readOnly 
                className="bg-gray-50"
              />
            );
          default:
            return null;
        }
      };

  return (
    <div className="space-y-6">
            {question.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed">
                <p className="text-muted-foreground">This form has no questions</p>
              </div>
            ) : (
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>{formName}</CardTitle>
                  <CardDescription>Preview of the survey form</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {question
                    .sort((a, b) => a.order - b.order)
                    .map((question, index) => (
                      <div key={question.id} className="space-y-2">
                        <Label htmlFor={`question-${question.id}`} className="text-sm font-medium">
                          {index + 1}. {question.label}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {renderQuestionInput(question)}
                      </div>
                    ))}
                </CardContent>
                
                <CardFooter className="flex justify-end border-t pt-4">
                  <Button variant="outline" disabled>Submit</Button>
                </CardFooter>
              </Card>
            )}
          </div>
  );
}
