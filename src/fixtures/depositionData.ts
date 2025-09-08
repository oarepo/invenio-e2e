import { Fill, Save, UploadFile, ExpectErrors } from '../services/form'


export const defaultDepositionData = {
    "metadataOnlyRecord": [
        new Save(),
        new ExpectErrors(
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
            ["metadataOnly", true]
        ),
        new Save(),
        new ExpectErrors([]), // expect no errors
    ],
    "recordWithFile": [
        new Fill(
            ["title", "My record with file"],
            ["resourceType", "Dataset"],
            ["creator", { givenName: "Jane", familyName: "Doe" }],
            ["creator", { givenName: "John", familyName: "Doe" }],
        ),
        new UploadFile("Anon.jpg"),
        new Save(),
        new ExpectErrors([]), // expect no errors
    ]
}

export type DepositionData = typeof defaultDepositionData;