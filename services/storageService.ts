import { Node, Edge } from '@xyflow/react';

export interface CanvasData {
    nodes: Node[];
    edges: Edge[];
    metadata: {
        version: string;
        title: string;
        createdAt: string;
        updatedAt: string;
    };
}

const STORAGE_KEY = 'mindcanvas-autosave';
const STORAGE_VERSION = '1.0';

export const saveToLocalStorage = (data: CanvasData): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('✅ Canvas auto-saved');
    } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
    }
};

export const loadFromLocalStorage = (): CanvasData | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;

        const parsed = JSON.parse(data);
        console.log('✅ Canvas loaded from autosave');
        return parsed;
    } catch (error) {
        console.error('❌ Failed to load from localStorage:', error);
        return null;
    }
};

export const exportToJSON = (data: CanvasData): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindcanvas-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('✅ Canvas exported to JSON');
};

export const importFromJSON = (file: File): Promise<CanvasData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);

                // Basic validation
                if (!data.nodes || !Array.isArray(data.nodes)) {
                    reject(new Error('Invalid file: missing nodes array'));
                    return;
                }

                if (!data.edges || !Array.isArray(data.edges)) {
                    reject(new Error('Invalid file: missing edges array'));
                    return;
                }

                console.log('✅ Canvas imported from JSON');
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};

export const clearStorage = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Storage cleared');
};

export const createCanvasData = (nodes: Node[], edges: Edge[], title: string = 'Untitled Canvas'): CanvasData => {
    return {
        nodes,
        edges,
        metadata: {
            version: STORAGE_VERSION,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    };
};
