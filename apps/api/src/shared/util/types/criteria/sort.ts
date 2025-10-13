export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class Sort {
  constructor(
    public field: string,
    public direction: SortDirection = SortDirection.ASC
  ) {}
}
