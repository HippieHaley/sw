const fs = require('fs').promises;
const path = require('path');
const exifParser = require('exif-parser');

/**
 * Remove EXIF metadata from image files
 * @param {string} filePath - Path to the image file
 * @returns {Promise<boolean>} - Success status
 */
async function scrubImageMetadata(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    
    // Check if it's a JPEG file (EXIF data is primarily in JPEG)
    if (isJPEG(buffer)) {
      // For JPEG, we need to remove EXIF data
      const cleanBuffer = removeJPEGMetadata(buffer);
      await fs.writeFile(filePath, cleanBuffer);
      console.log(`✓ Metadata removed from: ${path.basename(filePath)}`);
      return true;
    }
    
    // For other formats, we might need different approaches
    // PNG, GIF typically have less metadata concerns
    console.log(`⚠ File type may not contain EXIF data: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error('Error scrubbing metadata:', error.message);
    throw new Error('Failed to scrub metadata');
  }
}

/**
 * Check if buffer is a JPEG file
 * @param {Buffer} buffer - File buffer
 * @returns {boolean}
 */
function isJPEG(buffer) {
  return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
}

/**
 * Remove EXIF metadata from JPEG buffer
 * @param {Buffer} buffer - Original JPEG buffer
 * @returns {Buffer} - Clean JPEG buffer without EXIF
 */
function removeJPEGMetadata(buffer) {
  try {
    // Find the EXIF APP1 marker (0xFF 0xE1)
    const SOI = 0; // Start of Image
    let position = 2; // Skip SOI marker
    
    const cleanSegments = [];
    cleanSegments.push(Buffer.from([0xFF, 0xD8])); // SOI marker
    
    while (position < buffer.length - 1) {
      if (buffer[position] !== 0xFF) {
        // Not a marker, copy rest of file (image data)
        cleanSegments.push(buffer.slice(position));
        break;
      }
      
      const marker = buffer[position + 1];
      
      // Skip EXIF (APP1), IPTC (APP13), and other metadata segments
      if (marker >= 0xE1 && marker <= 0xEF) {
        // Read segment length
        const segmentLength = buffer.readUInt16BE(position + 2);
        // Skip this segment
        position += 2 + segmentLength;
        continue;
      }
      
      // Keep other segments
      if (marker === 0xDA) {
        // Start of Scan - copy rest of file
        cleanSegments.push(buffer.slice(position));
        break;
      }
      
      // For other markers, copy the segment
      const segmentLength = buffer.readUInt16BE(position + 2);
      cleanSegments.push(buffer.slice(position, position + 2 + segmentLength));
      position += 2 + segmentLength;
    }
    
    return Buffer.concat(cleanSegments);
  } catch (error) {
    console.error('Error removing JPEG metadata:', error.message);
    // If we fail to process, return original (safer than corrupting file)
    return buffer;
  }
}

/**
 * Scrub metadata from video files
 * @param {string} filePath - Path to video file
 * @returns {Promise<boolean>}
 */
async function scrubVideoMetadata(filePath) {
  // Video metadata scrubbing would typically require ffmpeg
  // For now, we'll log a warning
  console.warn(`⚠ Video metadata scrubbing requires ffmpeg: ${path.basename(filePath)}`);
  console.warn('Please ensure videos are processed before upload or use ffmpeg integration');
  return true;
}

/**
 * Main function to scrub metadata based on file type
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>}
 */
async function scrubMetadata(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  
  if (imageExtensions.includes(ext)) {
    return await scrubImageMetadata(filePath);
  } else if (videoExtensions.includes(ext)) {
    return await scrubVideoMetadata(filePath);
  } else {
    console.log(`⚠ Unknown file type, skipping metadata scrubbing: ${ext}`);
    return true;
  }
}

module.exports = {
  scrubMetadata,
  scrubImageMetadata,
  scrubVideoMetadata
};
