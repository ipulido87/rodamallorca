import { ImageProcessor } from '../../modules/media/application/image-processor';
import fs from 'fs/promises';
import sharp from 'sharp';
import path from 'path';

jest.mock('fs/promises');
jest.mock('sharp');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

type MockFunction = ReturnType<typeof jest.fn>;

interface MockSharpInstance {
  resize: MockFunction;
  webp: MockFunction;
  toFile: MockFunction;
}

describe('Image Processor', () => {
  let imageProcessor: ImageProcessor;
  let mockSharpInstance: MockSharpInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fs.access to simulate uploads directory exists
    (fs.access as jest.Mock).mockResolvedValue(undefined);

    // Create mock sharp chain
    mockSharpInstance = {
      resize: jest.fn().mockReturnThis(),
      webp: jest.fn().mockReturnThis(),
      toFile: jest.fn().mockResolvedValue({}),
    };

    (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);

    imageProcessor = new ImageProcessor();
  });

  describe('constructor', () => {
    it('should ensure uploads directory exists', async () => {
      // Wait a bit for async constructor to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(fs.access).toHaveBeenCalledWith(
        expect.stringContaining('uploads')
      );
    });

    it('should create uploads directory if it does not exist', async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error('Directory not found'));
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      new ImageProcessor();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads'),
        { recursive: true }
      );
    });
  });

  describe('processImage', () => {
    const mockBuffer = Buffer.from('fake-image-data');
    const originalName = 'test-image.jpg';

    it('should process image and create three sizes', async () => {
      const result = await imageProcessor.processImage(mockBuffer, originalName);

      expect(sharp).toHaveBeenCalledWith(mockBuffer);
      expect(sharp).toHaveBeenCalledTimes(3); // original, medium, thumbnail

      expect(result).toEqual({
        original: '/uploads/test-uuid-1234_original.webp',
        medium: '/uploads/test-uuid-1234_medium.webp',
        thumbnail: '/uploads/test-uuid-1234_thumb.webp',
      });
    });

    it('should create original size (1200x1200)', async () => {
      await imageProcessor.processImage(mockBuffer, originalName);

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      });
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 85 });
    });

    it('should create medium size (600x600)', async () => {
      await imageProcessor.processImage(mockBuffer, originalName);

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(600, 600, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    });

    it('should create thumbnail size (300x300)', async () => {
      await imageProcessor.processImage(mockBuffer, originalName);

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(300, 300, {
        fit: 'inside',
        withoutEnlargement: true,
      });
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 80 });
    });

    it('should save all three images to uploads directory', async () => {
      await imageProcessor.processImage(mockBuffer, originalName);

      expect(mockSharpInstance.toFile).toHaveBeenCalledTimes(3);
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith(
        expect.stringContaining('test-uuid-1234_original.webp')
      );
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith(
        expect.stringContaining('test-uuid-1234_medium.webp')
      );
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith(
        expect.stringContaining('test-uuid-1234_thumb.webp')
      );
    });

    it('should convert images to webp format', async () => {
      await imageProcessor.processImage(mockBuffer, originalName);

      expect(mockSharpInstance.webp).toHaveBeenCalled();
    });

    it('should generate unique file ids', async () => {
      const result = await imageProcessor.processImage(mockBuffer, originalName);

      expect(result.original).toContain('test-uuid-1234');
      expect(result.medium).toContain('test-uuid-1234');
      expect(result.thumbnail).toContain('test-uuid-1234');
    });

    it('should handle processing errors', async () => {
      const error = new Error('Sharp processing failed');
      mockSharpInstance.toFile.mockRejectedValue(error);

      await expect(imageProcessor.processImage(mockBuffer, originalName)).rejects.toThrow(
        'Sharp processing failed'
      );
    });
  });

  describe('deleteImage', () => {
    it('should delete all three sizes of an image', async () => {
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await imageProcessor.deleteImage('/uploads/test-uuid-1234_original.webp');

      expect(fs.unlink).toHaveBeenCalledTimes(3);
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('test-uuid-1234_original.webp')
      );
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('test-uuid-1234_medium.webp')
      );
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('test-uuid-1234_thumb.webp')
      );
    });

    it('should extract file id from image path', async () => {
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await imageProcessor.deleteImage('/uploads/abc123_original.webp');

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('abc123_original.webp')
      );
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('abc123_medium.webp')
      );
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('abc123_thumb.webp')
      );
    });

    it('should handle deletion errors gracefully', async () => {
      (fs.unlink as jest.Mock).mockRejectedValue(new Error('File not found'));

      // Should not throw error
      await expect(
        imageProcessor.deleteImage('/uploads/test-uuid-1234_original.webp')
      ).resolves.not.toThrow();
    });

    it('should handle invalid image paths', async () => {
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      // Should not throw error
      await expect(imageProcessor.deleteImage('invalid-path')).resolves.not.toThrow();
    });

    it('should continue deleting even if some files fail', async () => {
      let callCount = 0;
      (fs.unlink as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error('File not found'));
        }
        return Promise.resolve();
      });

      await imageProcessor.deleteImage('/uploads/test-uuid-1234_original.webp');

      // All three delete attempts should be made
      expect(fs.unlink).toHaveBeenCalledTimes(3);
    });
  });
});
