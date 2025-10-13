import { Resources } from './resources';

export class ResourceAlreadyExistsError extends Error {
  constructor(resource: Resources) {
    super(`${resource} already exists`);
    this.name = 'ResourceAlreadyExistsError';
  }
}
