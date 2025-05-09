import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Form } from '@/lib/types';

interface FormCardProps {
  form: Form;
  onDelete?: (formId: string) => void;
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

export function FormCard({ form, onDelete }: FormCardProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(form.id);
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 rounded-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <h3 className="text-lg font-medium">{form.name}</h3>
            <div className="flex text-sm text-muted-foreground gap-4">
              <div>Questions: {form.questionCount}</div>
              <div>Submissions: {form.responseCount}</div>
              <div>Updated: {formatDate(form.updatedAt)}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link to={`/forms/${form.id}/survey`}>
                Survey
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link to={`/forms/${form.id}/responses`}>
                Submissions
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
