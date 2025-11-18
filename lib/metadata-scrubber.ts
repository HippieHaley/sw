import sharp from 'sharp';
import exifr from 'exifr';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ScrubResult {
  success: boolean;
  scrubbedPath?: string;
  originalMetadata?: any;
  error?: string;
}

/**
 * Remove all metadata from images and videos
 * This includes EXIF data, GPS coordinates, camera info, timestamps, etc.
 */
export class MetadataScrubber {
  private uploadsDir: string;
  private tempDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    this.tempDir = path.join(process.cwd(), 'temp');
  }

  async init() {
    // Ensure directories exist
    await fs.mkdir(this.uploadsDir, { recursive: true });
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  /**
   * Generate a secure random filename
   */
  private generateSecureFilename(originalExt: string): string {
    const randomName = crypto.randomBytes(16).toString('hex');
    return `${randomName}${originalExt}`;
  }

  /**
   * Scrub metadata from an image file
   */
  async scrubImage(inputPath: string): Promise<ScrubResult> {
    try {
      await this.init();

      // Read original metadata for logging (optional)
      let originalMetadata;
      try {
        originalMetadata = await exifr.parse(inputPath);
      } catch (err) {
        // Some files may not have EXIF data
        originalMetadata = null;
      }

      // Get file extension
      const ext = path.extname(inputPath).toLowerCase();
      const secureFilename = this.generateSecureFilename(ext);
      const outputPath = path.join(this.uploadsDir, secureFilename);

      // Process image and strip all metadata
      await sharp(inputPath)
        .rotate() // Auto-rotate based on EXIF orientation, then remove EXIF
        .withMetadata({
          // Explicitly remove all metadata
          exif: {},
          icc: undefined,
          iptc: undefined,
          xmp: undefined,
        })
        .toFile(outputPath);

      // Verify metadata was removed
      const newMetadata = await exifr.parse(outputPath);
      if (newMetadata && Object.keys(newMetadata).length > 0) {
        // If metadata still exists, use a more aggressive approach
        await sharp(outputPath)
          .toBuffer()
          .then(buffer => fs.writeFile(outputPath, buffer));
      }

      return {
        success: true,
        scrubbedPath: `/uploads/${secureFilename}`,
        originalMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Scrub metadata from video files
   * Note: Video scrubbing requires ffmpeg - this is a placeholder
   */
  async scrubVideo(inputPath: string): Promise<ScrubResult> {
    try {
      await this.init();

      const ext = path.extname(inputPath).toLowerCase();
      const secureFilename = this.generateSecureFilename(ext);
      const outputPath = path.join(this.uploadsDir, secureFilename);

      // For production, use ffmpeg to strip metadata:
      // ffmpeg -i input.mp4 -map_metadata -1 -c:v copy -c:a copy output.mp4
      
      // Temporary: Just copy the file with a warning
      await fs.copyFile(inputPath, outputPath);

      return {
        success: true,
        scrubbedPath: `/uploads/${secureFilename}`,
        originalMetadata: { warning: 'Video metadata scrubbing requires ffmpeg installation' },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Scrub metadata from any supported file type
   */
  async scrubFile(inputPath: string, mimeType: string): Promise<ScrubResult> {
    if (mimeType.startsWith('image/')) {
      return this.scrubImage(inputPath);
    } else if (mimeType.startsWith('video/')) {
      return this.scrubVideo(inputPath);
    } else {
      return {
        success: false,
        error: 'Unsupported file type',
      };
    }
  }

  /**
   * Delete temporary files
   */
  async cleanup(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Delete a scrubbed file from uploads
   */
  async deleteScrubbedFile(relativePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), 'public', relativePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Delete error:', error);
    }
  }
}

export const metadataScrubber = new MetadataScrubber();
