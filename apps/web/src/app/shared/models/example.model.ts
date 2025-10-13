export interface Example {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateExampleRequest {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateExampleRequest {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface ExampleQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  active?: boolean;
}
