import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Progress, Upload } from "@aws-sdk/lib-storage";
import { Types } from "mongoose";
import fs from "node:fs";

class S3Service {
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

  uploadFile = async (file: Express.Multer.File, fileKey: string) => {
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
    const fileKey = `${folderName}/${entityId}/${Date.now()}-${file.originalname}`;
    const fileStream = fs.createReadStream(file.path);
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

  generatePresignedURL = async (
    path: string,
    fileType: string,
  ): Promise<string> => {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: path,
      ContentType: fileType,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn: 300 });
    return url;
  };

  getFileFromS3 = async (path: string): Promise<GetObjectCommandOutput> => {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: path,
    });

    return await this.client.send(command);
  };

  getFileFromPresignedUrl = async (
    path: string,
    download?: string,
  ): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: path,
      ResponseContentDisposition:
        download === "true"
          ? `attachment; filename="${path.split("/").pop()}"`
          : undefined,
    });

    return await getSignedUrl(this.client, command, { expiresIn: 300 });
  };

  getFilesFromS3 = async (
    folderName: string,
    entityId: Types.ObjectId,
  ): Promise<ListObjectsV2CommandOutput> => {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Prefix: `${folderName}/${entityId}`,
    });

    return await this.client.send(command);
  };

  deleteFileFromS3 = async (
    path: string,
  ): Promise<DeleteObjectCommandOutput> => {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: path,
    });

    return await this.client.send(command);
  };

  deleteFilesFromS3 = async (
    paths: string[],
  ): Promise<DeleteObjectsCommandOutput> => {
    const mappedKeys = paths.map((path) => {
      return { Key: path };
    });
    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Delete: { Objects: mappedKeys },
    });

    return await this.client.send(command);
  };
}

export default new S3Service();
