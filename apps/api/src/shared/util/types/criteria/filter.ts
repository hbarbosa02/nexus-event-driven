import { Operator } from './operator';

export class Filter {
  constructor(
    public field: string,
    public operator: Operator,
    public value: unknown
  ) {}
}
