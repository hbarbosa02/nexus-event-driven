import { Resources } from './resources';

export class ResourceNotFoundError extends Error {
  constructor(resource: Resources) {
    super(`${resource} not found`);
    this.name = 'ResourceNotFoundError';
  }
}
