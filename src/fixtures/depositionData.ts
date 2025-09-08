import { Fill, Save } from '../services/form'


export const defaultDepositionData = {
    "metadataOnlyRecord": [
        new Fill(),
        new Save(
            [
                { "field": "metadata.resource_type", "message": "Missing data for required field." },
                { "field": "metadata.title", "message": "Missing data for required field." },
                { "field": "metadata.creators", "message": "Missing data for required field." }
            ]
        ),
        new Fill(
            ["title", "My metadata only record {order}"],
            ["resourceType", "Dataset"],
            ["creator", { givenName: "Jane", familyName: "Doe" }],
            ["creator", { givenName: "John", familyName: "Doe" }],
        ),
        new Save()
    ]
}

export type DepositionData = typeof defaultDepositionData;