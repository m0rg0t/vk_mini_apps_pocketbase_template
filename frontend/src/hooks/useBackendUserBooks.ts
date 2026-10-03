import { useState, useEffect } from 'react';

export interface UserBook {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'completed' | 'want_to_read';
  progress?: number;
  created: string;
  updated: string;
}

export interface UseBackendUserBooksResponse {
  completedBooks: UserBook[];
  readingBooks: UserBook[];
  isEmpty: boolean;
  isFetched: boolean;
  hasCompletedBooks: boolean;
  hasReadingBooks: boolean;
  allBooks: UserBook[];
  loading: boolean;
  error: string | null;
}

export const useBackendUserBooks = (): UseBackendUserBooksResponse => {
  const [completedBooks, setCompletedBooks] = useState<UserBook[]>([]);
  const [allBooks, setAllBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, just return empty arrays
    // TODO: Implement actual API call to fetch user books
    setCompletedBooks([]);
    setAllBooks([]);
    setLoading(false);
    setError(null);
  }, []);

  return {
    completedBooks,
    allBooks,
    readingBooks: allBooks.filter(book => book.status === 'reading'),
    isEmpty: allBooks.length === 0,
    isFetched: !loading,
    hasCompletedBooks: completedBooks.length > 0,
    hasReadingBooks: allBooks.some(book => book.status === 'reading'),
    loading,
    error
  };
};