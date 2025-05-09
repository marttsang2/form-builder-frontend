import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center mt-4 gap-2">
      <Button 
        variant="outline" 
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <div className="flex items-center text-sm px-4">
        Page {currentPage} of {totalPages}
      </div>
      <Button 
        variant="outline"
        onClick={() => onPageChange(currentPage < totalPages ? currentPage + 1 : currentPage)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}
