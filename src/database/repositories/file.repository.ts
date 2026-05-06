import fileModel, { File } from "../models/file.model";
import BaseRepository from "./base.repository";
import { HydratedDocument, Model } from "mongoose";

export class FileRepository extends BaseRepository<File> {
  constructor(model: Model<File> = fileModel) {
    super(model);
  }
}
