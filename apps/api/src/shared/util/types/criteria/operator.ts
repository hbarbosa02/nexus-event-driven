export abstract class Operator {
  constructor(public readonly type: string) {}
}

export class EqualOperator extends Operator {
  constructor() {
    super('equals');
  }
}

export class NotEqualOperator extends Operator {
  constructor() {
    super('notEquals');
  }
}

export class LikeOperator extends Operator {
  constructor() {
    super('like');
  }
}

export class ContainsOperator extends Operator {
  constructor() {
    super('contains');
  }
}

export class InOperator extends Operator {
  constructor() {
    super('in');
  }
}

export class BetweenOperator extends Operator {
  constructor() {
    super('between');
  }
}

export class GreaterThanOperator extends Operator {
  constructor() {
    super('greaterThan');
  }
}

export class LessThanOperator extends Operator {
  constructor() {
    super('lessThan');
  }
}

export class IsNullOperator extends Operator {
  constructor() {
    super('isNull');
  }
}

export class StartsWithOperator extends Operator {
  constructor() {
    super('startsWith');
  }
}

export class EndsWithOperator extends Operator {
  constructor() {
    super('endsWith');
  }
}
