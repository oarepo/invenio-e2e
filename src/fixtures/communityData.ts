export interface CommunityDataRecord {
    name: string;
    identifier: string;
}

export const defaultCommunityData: Record<string, CommunityDataRecord> = {
    defaultCommunity: {
        name: "Default Community",
        identifier: "default-community",
    }
};

export type CommunityData = typeof defaultCommunityData;
