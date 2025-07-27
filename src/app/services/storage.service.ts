import { Injectable } from '@angular/core';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private s3: S3Client;
  private readonly bucket  = 'whisperapp-avatars';
  /** ★ Constant base URL so we don’t rely on the Endpoint type */
  private readonly baseUrl =
    'https://48542468def7edf8c67eabac2fa189a4.r2.cloudflarestorage.com';

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.baseUrl,
      credentials: {
        accessKeyId: '9ce85c4035a7cf444071e51005ce1c31',
        secretAccessKey:
          '09d92d176457f9a0360d0a59a87e4e93740f34909b90bf5bf55ef74a5cb0a954',
      },
      forcePathStyle: true, // R2 needs this
    });
  }

  /** Uploads the avatar and returns its public URL. */
  async uploadAvatar(file: File, userId: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const key = `avatars/${userId}/avatar.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: file.type,
        ACL: 'public-read',
      })
    );

    // ★ Build the public URL using the constant
    return `${this.baseUrl}/${this.bucket}/${key}`;
  }

  /** Returns a 1-hour signed URL for reading the file. */
  async getAvatarUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }
}
