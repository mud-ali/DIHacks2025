/**
 * UI utilities for common patterns like messages and form handling
 */

export type MessageType = "success" | "error" | "info" | "warning";

export interface Message {
  type: MessageType;
  text: string;
}

/**
 * Create a success message
 */
export const createSuccessMessage = (text: string): Message => ({
  type: "success",
  text
});

/**
 * Create an error message
 */
export const createErrorMessage = (text: string): Message => ({
  type: "error", 
  text
});

/**
 * Create an info message
 */
export const createInfoMessage = (text: string): Message => ({
  type: "info",
  text
});

/**
 * Create a warning message
 */
export const createWarningMessage = (text: string): Message => ({
  type: "warning",
  text
});

/**
 * Get CSS classes for message styling
 */
export const getMessageClasses = (type: MessageType): string => {
  const baseClasses = "mb-6 p-4 rounded-lg border";
  
  switch (type) {
    case "success":
      return `${baseClasses} bg-green-900/50 border-green-700 text-green-300`;
    case "error":
      return `${baseClasses} bg-red-900/50 border-red-700 text-red-300`;
    case "info":
      return `${baseClasses} bg-blue-900/50 border-blue-700 text-blue-300`;
    case "warning":
      return `${baseClasses} bg-yellow-900/50 border-yellow-700 text-yellow-300`;
    default:
      return `${baseClasses} bg-slate-900/50 border-slate-700 text-slate-300`;
  }
};
