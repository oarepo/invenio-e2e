import { ExpectedError } from "../services/form";

export interface FormData {
    data: Array<[string, any]>;
    files: string[];
    errors: Array<ExpectedError>;
}

export const defaultDepositionData: Record<string, FormData> = {
    metadataOnlyRecord: {
        data: [
            ["title", "My metadata only record {order}"],
            ["resourceType", "Dataset"],
            ["creator", { givenName: "Jane", familyName: "Doe" }],
            // ["creator", { givenName: "John", familyName: "Doe" }],
            ["metadataOnly", true] // checked
        ],
        files: [],
        errors: [] // expect no errors
    },
    recordWithFile: {
        data: [
            ["title", "My record with file"],
            ["resourceType", "Dataset"],
            ["creator", { givenName: "Jane", familyName: "Doe" }],
            ["creator", { givenName: "John", familyName: "Doe" }],
            ["metadataOnly", false]
        ],
        files: [
            "Anon.jpg"
        ],
        errors: []
    },
    emptyRecord: {
        data: [],
        files: [],
        errors: [
            // TODO: handle localization
            { "field": "metadata.resource_type", "message": "Missing data for required field." },
            { "field": "metadata.title", "message": "Missing data for required field." },
            { "field": "metadata.creators", "message": "Missing data for required field." }
        ]
    },
};

export type DepositionData = typeof defaultDepositionData;