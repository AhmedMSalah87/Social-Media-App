import {
  HydratedDocument,
  Model,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Types,
  UpdateQuery,
  UpdateResult,
} from "mongoose";
import { PaginationOptions } from "../../types/pagination.type";

// T represents type of module like user for example
// use abstract to prevent creating instances from it
abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {} // use protected to only inherited to another classes only

  async create(data: Partial<T>): Promise<HydratedDocument<T>> {
    return this.model.create(data);
  }

  async findOne(
    filter: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findOne(filter, projection, options).exec();
  }

  async find(
    filter: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
    pagination?: PaginationOptions,
  ): Promise<HydratedDocument<T>[]> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    return this.model
      .find(filter, projection, options)
      .sort(pagination?.sort)
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async findById(
    id: Types.ObjectId,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findById(id, projection, options).exec();
  }

  async findByIdAndUpdate(
    id: Types.ObjectId,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model
      .findByIdAndUpdate(id, update, {
        returnDocument: "after",
        runValidators: true,
        ...options,
      })
      .exec();
  }

  async findByIdAndDelete(
    id: Types.ObjectId,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findByIdAndDelete(id, options).exec();
  }

  async findOneAndUpdate(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model
      .findOneAndUpdate(filter, update, {
        returnDocument: "after",
        runValidators: true,
        ...options,
      })
      .exec();
  }

  async findOneAndDelete(
    filter: QueryFilter<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findOneAndDelete(filter, options).exec();
  }

  async updateOne(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
  ): Promise<UpdateResult> {
    return this.model.updateOne(filter, update, {
      runValidators: true,
    });
  }
}

export default BaseRepository;
