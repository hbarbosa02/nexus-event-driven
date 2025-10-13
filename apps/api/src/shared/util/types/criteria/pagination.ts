export class Pagination {
  constructor(
    public take: number = 10,
    public skip: number = 0
  ) {}

  static fromPage(page: number, limit: number): Pagination {
    return new Pagination(limit, (page - 1) * limit);
  }
}
