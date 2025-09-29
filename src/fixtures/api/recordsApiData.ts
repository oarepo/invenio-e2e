// TODO: make this complete according to Invenio RDM record schema
export interface RecordsApiDataRecord {
    access: {
        record: string;
        files: string;
    };
    files: {
        enabled: boolean;
    };
    metadata: {
        creators: Array<{
            person_or_org: {
                family_name?: string;
                given_name?: string;
                name?: string;
                type: "personal" | "organizational";
            };
        }>;
        publication_date: string;
        resource_type: {
            id: string;
        };
        title: string;
    };
}

export const defaultRecordsApiData: Record<string, RecordsApiDataRecord> = {
    defaultRecord: {
        access: {
            record: "public",
            files: "public",
        },
        files: {
            enabled: false,
        },
        metadata: {
            creators: [
                {
                    person_or_org: {
                        family_name: "Brown",
                        given_name: "Troy",
                        type: "personal",
                    },
                },
                {
                    person_or_org: {
                        name: "Troy Inc.",
                        type: "organizational",
                    },
                },
            ],
            publication_date: "2020-06-01",
            resource_type: {
                id: "image-photo",
            },
            title: "A Romans story",
        },
    },
};

export type RecordsApiData = typeof defaultRecordsApiData;
