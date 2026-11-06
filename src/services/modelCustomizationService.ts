import { apiClient } from './apiClient';

/** Keys are server-defined slots; values are immutable asset-version UUIDs. */
export type CustomizationSelection = Record<string, string | null>;

export interface CustomizationDraft {
  modelOutputId: string;
  fitResultId: string;
  exists: boolean;
  revision: number;
  selection: CustomizationSelection;
  editable: boolean;
  updatedAt: string | null;
}

export interface CustomizationScene {
  modelOutputId: string;
  jobId: string;
  attemptId: string;
  fitResultId: string;
  catalogCode: string;
  bodyPreset: string;
  qualityStatus: string;
  readyForMachine: boolean;
  coordinateSystem: string;
  baseModel: { url: string; sha256: string; fileSizeBytes: number };
  groups: Array<{
    id: string;
    required: boolean;
    exclusive: boolean;
    noneAllowed: boolean;
    assetVersionIds: string[];
  }>;
  assets: Array<{
    assetVersionId: string;
    code: string;
    version: string;
    name: string;
    kind: string;
    slot: string;
    geometryMode: 'shared_transform' | 'fitted_geometry';
    url: string;
    sha256: string;
    sourceSha256: string;
    fileSizeBytes: number;
    thumbnailUrl: string;
    matrixColumnMajor: number[];
  }>;
  defaultSelection: CustomizationSelection;
  customization: CustomizationDraft;
  urlTtlSeconds: number;
  urlsExpireAt: string;
}

export interface SaveCustomization {
  fitResultId: string;
  revision: number;
  selection: CustomizationSelection;
}

const path = (outputId: string) => `/models/${encodeURIComponent(outputId)}`;

export const modelCustomizationService = {
  async getScene(outputId: string, signal?: AbortSignal): Promise<CustomizationScene> {
    const { data } = await apiClient.get<CustomizationScene>(`${path(outputId)}/scene`, { signal, timeout: 30000 });
    return data;
  },
  async getDraft(outputId: string, signal?: AbortSignal): Promise<CustomizationDraft> {
    const { data } = await apiClient.get<CustomizationDraft>(`${path(outputId)}/customization`, { signal, timeout: 30000 });
    return data;
  },
  async save(outputId: string, request: SaveCustomization): Promise<CustomizationDraft> {
    // Explicit save only. Caller handles 409 without silently overwriting another device's draft.
    const { data } = await apiClient.put<CustomizationDraft>(`${path(outputId)}/customization`, request, { timeout: 30000 });
    return data;
  },
};
