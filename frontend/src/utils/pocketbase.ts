import PocketBase from 'pocketbase';
import { API_ENDPOINTS } from '../consts';

// Create a single instance of PocketBase to reuse across the app
export const pb = new PocketBase(API_ENDPOINTS.POCKETBASE);

// Helper function to handle PocketBase errors
export const handlePocketBaseError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
};
