import { Criteria } from '@/shared/util/types/criteria';
import { EqualOperator } from '@/shared/util/types/criteria/operator';
import { Pagination } from '@/shared/util/types/criteria/pagination';

export abstract class BaseController<QuerySchema> {
  protected parseQueryParamsToCriteria(params: QuerySchema): Criteria {
    const criteria = new Criteria();
    
    // Converter query params em filters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'page' && key !== 'limit') {
        criteria.addFilter({
          field: key,
          operator: new EqualOperator(),
          value: value
        });
      }
    });

    // Configurar paginação
    if ((params as any).page && (params as any).limit) {
      criteria.setPagination(Pagination.fromPage((params as any).page, (params as any).limit));
    }

    return criteria;
  }
}
