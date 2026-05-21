import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { coursesApi } from '../api/courses';
import { mergeCourses, CourseItem } from '../types/course';

export function useCourses() {
  const productsQuery = useInfiniteQuery({
    queryKey: ['courses', 'products'],
    queryFn: ({ pageParam = 1 }) => coursesApi.getProducts(pageParam as number, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.nextPage ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const usersQuery = useInfiniteQuery({
    queryKey: ['courses', 'users'],
    queryFn: ({ pageParam = 1 }) => coursesApi.getUsers(pageParam as number, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.nextPage ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const courses = useMemo<CourseItem[]>(() => {
    const allProducts = productsQuery.data?.pages.flatMap((p) => p.data) ?? [];
    const allUsers = usersQuery.data?.pages.flatMap((p) => p.data) ?? [];
    if (!allProducts.length || !allUsers.length) return [];
    return mergeCourses(allProducts, allUsers);
  }, [productsQuery.data, usersQuery.data]);

  const isLoading = productsQuery.isLoading || usersQuery.isLoading;
  const isError = productsQuery.isError || usersQuery.isError;
  const error = productsQuery.error ?? usersQuery.error;

  const refetch = () => {
    productsQuery.refetch();
    usersQuery.refetch();
  };

  const fetchNextPage = () => {
    if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
      productsQuery.fetchNextPage();
    }
    if (usersQuery.hasNextPage && !usersQuery.isFetchingNextPage) {
      usersQuery.fetchNextPage();
    }
  };

  const hasNextPage =
    productsQuery.hasNextPage || usersQuery.hasNextPage;

  const isFetchingNextPage =
    productsQuery.isFetchingNextPage || usersQuery.isFetchingNextPage;

  return {
    courses,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
