import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input';
import { formsApi, type FormDto } from '@/api';
import type { Form } from '@/lib/types.ts';
import { FormCard } from './components/form/FormCard';
import { Pagination } from './components/common/Pagination';

export default function FormsList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const loadForms = async (searchParams: { keyword?: string; page: number; limit: number }) => {
    try {
      setIsLoading(true);
      const response = await formsApi.searchForms(searchParams);
      const fetchedForms: Form[] = response.data.data.map((dto: FormDto) => ({
        id: dto.id,
        name: dto.title,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
        responseCount: dto._count.responses || 0, // Using question count as a placeholder for response count
        questionCount: dto.questions.length || 0 // Add question count
      }));
      
      setForms(fetchedForms);
      setTotalPages(response.data.metadata.totalPages);
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForms({ 
      keyword: searchKeyword,
      page,
      limit 
    });
  }, [page]);

  const handleSearch = () => {
    loadForms({ 
      keyword: searchKeyword,
      page: 1,
      limit 
    });
  }

  const handleDeleteForm = async (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form && confirm(`Are you sure you want to delete this form (${form.name})?\nAll the responses will be deleted.`)) {
      try {
        await formsApi.deleteForm(formId);
        alert('Form deleted successfully');
        loadForms({ 
          keyword: searchKeyword,
          page,
          limit 
        });
      } catch (error) {
        console.error('Failed to delete form:', error);
        alert('Failed to delete the form. Please try again.');
      }
    }
  };

  if (isLoading && page === 1) {
    return <div className="flex justify-center p-8">Loading forms...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forms</h1>
        <Button asChild variant="outline">
          <Link to="/forms/new">Create New Form</Link>
        </Button>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search forms..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <Button className='bg-blue-500 hover:bg-blue-600 text-white' type="submit">Search</Button>
        </form>
      </div>

      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed">
          <p className="mb-4 text-muted-foreground">No forms found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {forms.map((form) => (
              <FormCard key={form.id} form={form} onDelete={handleDeleteForm} />
            ))}
          </div>
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </>
      )}
    </div>
  );
} 