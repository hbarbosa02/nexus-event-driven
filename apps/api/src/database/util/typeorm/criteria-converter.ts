import { FindManyOptions, FindOptionsWhere, Like, In, Between, MoreThan, LessThan, IsNull, FindOptionsOrder } from 'typeorm';
import { Criteria, Filter, Sort, SortDirection } from '@/shared/util/types/criteria';
import { EqualOperator, NotEqualOperator, LikeOperator, ContainsOperator, InOperator, BetweenOperator, GreaterThanOperator, LessThanOperator, IsNullOperator, StartsWithOperator, EndsWithOperator } from '@/shared/util/types/criteria/operator';

export class TypeOrmCriteriaConverter {
  convert<T>(criteria: Criteria): FindManyOptions<T> {
    const where: FindOptionsWhere<T> = {};
    
    // Converter filters
    criteria.filters.forEach(filter => {
      where[filter.field] = this.convertFilterValue(filter);
    });

    // Converter sorts
    const order: Record<string, SortDirection> = {};
    criteria.sorts.forEach(sort => {
      order[sort.field] = sort.direction === SortDirection.ASC ? SortDirection.ASC : SortDirection.DESC;
    });

    return {
      where,
      order: Object.keys(order).length > 0 ? order as Record<string, SortDirection> as FindOptionsOrder<T> : undefined,
      take: criteria.pagination.take,
      skip: criteria.pagination.skip,
    };
  }

  private convertFilterValue(filter: Filter): any {
    switch (filter.operator.constructor) {
      case EqualOperator:
        return filter.value;
      
      case NotEqualOperator:
        return filter.value;
      
      case LikeOperator:
        return Like(`%${filter.value}%`);
      
      case ContainsOperator:
        return Like(`%${filter.value}%`);
      
      case StartsWithOperator:
        return Like(`${filter.value}%`);
      
      case EndsWithOperator:
        return Like(`%${filter.value}`);
      
      case InOperator:
        return In(Array.isArray(filter.value) ? filter.value : [filter.value]);
      
      case BetweenOperator:
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          return Between(filter.value[0], filter.value[1]);
        }
        throw new Error('Between operator requires an array with exactly 2 values');
      
      case GreaterThanOperator:
        return MoreThan(filter.value);
      
      case LessThanOperator:
        return LessThan(filter.value);
      
      case IsNullOperator:
        return IsNull();
      
      default:
        return filter.value;
    }
  }
}
