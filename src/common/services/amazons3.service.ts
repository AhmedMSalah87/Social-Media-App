import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Types } from "mongoose";
import fs from "node:fs";

export class S3Service {
  private readonly client: S3Client;
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_BUCKET_SECRET_KEY!,
      },
    });
  }

  uploadFile = async (
    file: Express.Multer.File,
    folderName: string,
    entityId: Types.ObjectId,
  ) => {
    const fileKey = `uploads/${folderName}/${entityId}/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.client.send(command);
  };

  uploadLargeFile = async (
    file: Express.Multer.File,
    folderName: string,
    entityId: Types.ObjectId,
  ) => {
    const fileKey = `uploads/${folderName}/${entityId}/${Date.now()}-${file.originalname}`;
    const fileStream = fs.createReadStream(file.buffer);
    const command = new Upload({
      client: this.client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
        Body: fileStream,
        ContentType: file.mimetype,
      },
    });

    await command.done();
  };
}
