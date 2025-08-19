// Secure image loading utility with ownership verification
class SecureImageLoader {
  private cache = new Map<string, string>();
  private loadingPromises = new Map<string, Promise<string | null>>();

  async loadImage(format: string, tokenId: string, wallet: string, contract: string, chainId: number = 1): Promise<string | null> {
    const cacheKey = `${format}-${tokenId}-${wallet}-${contract}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Start loading
    const loadingPromise = this.loadImageInternal(format, tokenId, wallet, contract, chainId);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      if (result) {
        this.cache.set(cacheKey, result);
      }
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

      private async loadImageInternal(format: string, tokenId: string, wallet: string, contract: string, chainId: number): Promise<string | null> {
      try {
        const apiUrl = `http://192.168.1.3:3001/api/secure-image/${format}/${tokenId}?wallet=${wallet}&contract=${contract}&chainId=${chainId}`;
      
      const response = await fetch(apiUrl);
      
      if (response.status === 403) {
        console.warn(`Access denied: User doesn't own NFT ${tokenId}`);
        return null;
      }
      
      if (!response.ok) {
        console.warn(`Failed to load image: ${format}/${tokenId}`, response.status);
        return null;
      }
      
      // Convert the response to a blob URL
      const blob = await response.blob();
      return URL.createObjectURL(blob);
      
    } catch (error) {
      console.warn(`Failed to load image: ${format}/${tokenId}`, error);
      return null;
    }
  }

  // Preload specific images (useful for pagination)
  async preloadImages(images: Array<{format: string, tokenId: string, wallet: string, contract: string, chainId?: number}>): Promise<void> {
    const promises = images.map(img => 
      this.loadImage(img.format, img.tokenId, img.wallet, img.contract, img.chainId || 1)
    );
    await Promise.allSettled(promises);
  }

  // Clear cache to free memory
  clearCache(): void {
    // Revoke all blob URLs before clearing cache
    this.cache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.cache.clear();
  }

  // Get cache size for debugging
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const secureImageLoader = new SecureImageLoader();

// Helper functions for specific image types
export const getToxicTransparentImage = (tokenId: string, wallet: string, contract: string, chainId: number = 1): Promise<string | null> => {
  return secureImageLoader.loadImage('toxic-transparent', tokenId, wallet, contract, chainId);
};

export const getPreToxicTransparentImage = (tokenId: string, wallet: string, contract: string, chainId: number = 1): Promise<string | null> => {
  return secureImageLoader.loadImage('pre-toxic-transparent', tokenId, wallet, contract, chainId);
};

export const getPixelArtImage = (tokenId: string, wallet: string, contract: string, chainId: number = 1): Promise<string | null> => {
  return secureImageLoader.loadImage('pixel-art', tokenId, wallet, contract, chainId);
};

export const getGLBFile = (tokenId: string, wallet: string, contract: string, chainId: number = 1): Promise<string | null> => {
  return secureImageLoader.loadImage('glb', tokenId, wallet, contract, chainId);
};

export const getFBXFile = (tokenId: string, wallet: string, contract: string, chainId: number = 1): Promise<string | null> => {
  return secureImageLoader.loadImage('fbx', tokenId, wallet, contract, chainId);
};
