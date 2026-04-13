import {
  HydratedDocument,
  Model,
  ProjectionType,
  QueryFilter,
  QueryOptions,
} from "mongoose";

// T represents type of module like user for example
// use abstract to prevent creating instances from it
abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {} // use protected to only inherited to another classes only

  async create(data: Partial<T>): Promise<HydratedDocument<T>> {
    return await this.model.create(data);
  }

  async findOne(
    filter: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findOne(filter, projection, options);
  }
}

export default BaseRepository;
