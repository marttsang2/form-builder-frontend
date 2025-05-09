import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, Trash2Icon } from "lucide-react";
import type { FormQuestion } from "@/api";

interface FormQuestionCardProps {
  question: FormQuestion;
  index: number;
  isLoading: boolean;
  onChangeQuestionType: (questionId: string, type: FormQuestion['type']) => void;
  onRemoveQuestion: (questionId: string) => void;
  onQuestionLabelChange: (questionId: string, label: string) => void;
  onQuestionRequiredChange: (questionId: string, required: boolean) => void;
  onAddOption: (questionId: string) => void;
  onOptionChange: (questionId: string, optionId: string, label: string) => void;
  onRemoveOption: (questionId: string, optionId: string) => void;
}

export function FormQuestionCard({
  question,
  index,
  isLoading,
  onChangeQuestionType,
  onRemoveQuestion,
  onQuestionLabelChange,
  onQuestionRequiredChange,
  onAddOption,
  onOptionChange,
  onRemoveOption
}: FormQuestionCardProps) {
  return (
    <Card className="bg-white border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 py-2 px-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Select 
            value={question.type} 
            onValueChange={(value) => onChangeQuestionType(question.id, value as FormQuestion['type'])}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[180px] bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Field</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
              <SelectItem value="file">File Upload</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemoveQuestion(question.id)}
            disabled={isLoading}
            aria-label="Remove question"
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <Label htmlFor={`question-label-${question.id}`} className="text-sm font-medium text-gray-700">
            Question Label
          </Label>
          <Input
            id={`question-label-${question.id}`}
            type="text"
            value={question.label}
            onChange={(e) => onQuestionLabelChange(question.id, e.target.value)}
            placeholder={`Enter your question for the ${question.type} field`}
            disabled={isLoading}
            required
            className="mt-1 border-gray-200 focus:border-gray-400"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`question-required-${question.id}`}
            checked={question.required} 
            onCheckedChange={(checked) => onQuestionRequiredChange(question.id, checked === true)}
            className="text-blue-600"
          />
          <Label htmlFor={`question-required-${question.id}`} className="text-sm font-medium leading-none">
            Required question
          </Label>
        </div>

        {/* Dropdown Options */}
        {question.type === 'dropdown' && (
          <div className="mt-4 border rounded-md p-3 bg-gray-50/30 border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-medium text-gray-700">Dropdown Options</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddOption(question.id)}
                disabled={isLoading}
                className="h-7 text-xs border-gray-200 hover:bg-gray-100"
              >
                <PlusIcon className="h-3 w-3 mr-1" /> Add Option
              </Button>
            </div>
            
            {question.options && question.options.length > 0 ? (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) => onOptionChange(question.id, option.id, e.target.value)}
                      placeholder="Option label"
                      className="text-sm border-gray-200 focus:border-gray-400"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveOption(question.id, option.id)}
                      disabled={isLoading || question.options?.length === 1}
                      aria-label="Remove option"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No options added yet.</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
