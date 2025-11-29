import { CanvasData } from '../services/storageService';

/**
 * Migrate canvas data from older versions to current version
 */
export const migrateCanvas = (data: any): CanvasData => {
    // Handle data without metadata (v0.x)
    if (!data.metadata || !data.metadata.version) {
        console.log('🔄 Migrating canvas from v0.x to v1.0');
        return {
            nodes: data.nodes || [],
            edges: data.edges || [],
            metadata: {
                version: '1.0',
                title: 'Untitled Canvas',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        };
    }

    // Future version migrations can be added here
    // if (data.metadata.version === '1.0') {
    //   return migrateFrom1To2(data);
    // }

    return data;
};
