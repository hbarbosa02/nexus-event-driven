import { Filter } from './filter';
import { Pagination } from './pagination';
import { Sort } from './sort';

export class Criteria {
  constructor(
    public filters: Filter[] = [],
    public pagination: Pagination = new Pagination(),
    public sorts: Sort[] = []
  ) {}

  addFilter(filter: Filter): void {
    this.filters.push(filter);
  }

  setPagination(pagination: Pagination): void {
    this.pagination = pagination;
  }

  addSort(sort: Sort): void {
    this.sorts.push(sort);
  }
}
