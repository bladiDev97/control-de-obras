import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { extname, basename } from 'path';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3: AWS.S3;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = process.env.DYNAMO_REGION || process.env.AWS_REGION || 'us-east-1';
    this.bucketName = process.env.S3_UPLOADS_BUCKET || 'control-de-obras-frontend-808433583479';
    this.s3 = new AWS.S3({ region: this.region });
  }

  public async uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    customName?: string,
  ): Promise<string> {
    let key: string;
    const targetName = customName || file.originalname;

    if (targetName && targetName.trim() && targetName !== 'blob') {
      const ext = extname(targetName) || '.pdf';
      const base = basename(targetName, ext).trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      key = `uploads/${base}${ext}`;
    } else {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      key = `uploads/plano-${uniqueSuffix}${extname(file.originalname) || '.pdf'}`;
    }

    this.logger.log(`Uploading file to S3 bucket [${this.bucketName}] with key: ${key}`);

    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype || 'application/pdf',
    };

    try {
      await this.s3.putObject(params).promise();
      const s3Url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      this.logger.log(`File uploaded successfully to S3: ${s3Url}`);
      return s3Url;
    } catch (err: any) {
      this.logger.error(`Failed to upload file to S3: ${err.message}`, err);
      throw err;
    }
  }

  public async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    let key: string;
    if (fileName && fileName.trim()) {
      const ext = extname(fileName) || '.pdf';
      const base = basename(fileName, ext).trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      key = `uploads/${base}${ext}`;
    } else {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      key = `uploads/plano-${uniqueSuffix}.pdf`;
    }

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: 900, // 15 minutes
      ContentType: contentType || 'application/pdf',
    };

    const uploadUrl = await this.s3.getSignedUrlPromise('putObject', params);
    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

    this.logger.log(`Generated presigned upload URL for key: ${key}`);
    return { uploadUrl, fileUrl };
  }

  public async getFileBuffer(fileUrlOrKey: string): Promise<Buffer> {
    let key = fileUrlOrKey;
    if (fileUrlOrKey.includes('.amazonaws.com/')) {
      key = fileUrlOrKey.split('.amazonaws.com/')[1];
    }
    this.logger.log(`Fetching S3 object buffer for key: ${key}`);
    const res = await this.s3.getObject({ Bucket: this.bucketName, Key: key }).promise();
    return res.Body as Buffer;
  }

  public async getPresignedViewUrl(fileUrlOrKey: string): Promise<string> {
    let key = fileUrlOrKey;
    if (fileUrlOrKey.includes('.amazonaws.com/')) {
      key = fileUrlOrKey.split('.amazonaws.com/')[1];
    }
    key = key.replace(/^\//, '');

    const downloadFilename = basename(key) || 'plano.pdf';

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: 3600, // 1 hour
      ResponseContentType: 'application/pdf',
      ResponseContentDisposition: `inline; filename="${downloadFilename}"`,
    };

    const url = await this.s3.getSignedUrlPromise('getObject', params);
    this.logger.log(`Generated presigned view URL for key: ${key}`);
    return url;
  }

  public async objectExists(fileUrlOrKey: string): Promise<boolean> {
    let key = fileUrlOrKey;
    if (fileUrlOrKey.includes('.amazonaws.com/')) {
      key = fileUrlOrKey.split('.amazonaws.com/')[1];
    }
    key = key.replace(/^\//, '');

    try {
      await this.s3.headObject({ Bucket: this.bucketName, Key: key }).promise();
      return true;
    } catch (e: any) {
      return false;
    }
  }
}

