// src/lib/bailApi.ts

import { getApiUrl } from "@/lib/api";

export const bailAPI = {
  processBail: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(getApiUrl("/process-bail"), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.detail || `Failed to process bail: ${response.statusText}`
      );
    }

    return response.json();
  },

  getHealth: async (): Promise<any> => {
    const response = await fetch(getApiUrl("/health"));
    if (!response.ok) throw new Error("Health check failed");
    return response.json();
  },

  getCategories: async (): Promise<any> => {
    const response = await fetch(getApiUrl("/categories"));
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  },

  getCaseStatus: async (caseId: string): Promise<any> => {
    const response = await fetch(getApiUrl(`/status/${caseId}`));
    if (!response.ok) throw new Error("Failed to fetch case status");
    return response.json();
  },
};
