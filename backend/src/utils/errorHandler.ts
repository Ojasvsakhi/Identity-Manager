import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

export const handleError = (res: Response, error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  
  if (error instanceof QueryFailedError) {
    return res.status(400).json({ 
      message: `Error ${operation}`, 
      error: error.message 
    });
  }

  return res.status(500).json({ 
    message: `Error ${operation}`, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  });
}; 