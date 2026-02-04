import { appConfig } from '../../config';
import { InvenioTest } from '../../fixtures';
import { APIRequestContext, expect } from '@playwright/test';

import path from 'path';
import fs from 'fs';

/**
 * Declares the core API regression tests for Invenio records.
 *
 * The suite verifies that listing existing records works and that creating a new
 * metadata-only record, publishing it, and retrieving it again follows the expected flow.
 * @param test The Playwright test fixture enhanced by `InvenioTest`.
 * @param authUserFilePath Absolute path to the file where the authenticated user
 * state is stored.
 * @param recordsApiPath Optional path to the Records API root endpoint, defaults to `/api/records`.
 */
export function recordsApiTests(test: InvenioTest, authUserFilePath: string, recordsApiPath: string = '/api/records') {
    let apiContext: APIRequestContext;
    const uploadFolderPath = path.resolve(__dirname, "../..", appConfig.dataFolderPath, "UploadFiles");

    test.beforeAll(async ({ createApiContext }) => {
        apiContext = await createApiContext(authUserFilePath);
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    test.describe('API Record Tests', () => {
        test('Should return list of records with correct structure', async () => {
            const response = await apiContext.get(recordsApiPath);
            expect(response.status()).toBe(200);
            expect(await response.json()).toEqual(expect.objectContaining({
                hits: expect.objectContaining({
                    total: expect.any(Number),
                    hits: expect.arrayContaining([expect.objectContaining({
                        id: expect.any(String),
                        metadata: expect.any(Object),
                        created: expect.any(String),
                        updated: expect.any(String),
                    })]),
                }),
            }));
        });

        test('Should create and publish a new metadata-only record', async ({ recordsApiData }) => {
            const defaultRecord = recordsApiData["defaultRecord"];

            // Create a new record
            const response = await apiContext.post(recordsApiPath, {
                data: defaultRecord,
            });

            expect(response.status()).toBe(201);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const createdRecord = await response.json();

            expect(createdRecord, "should not have any errors").not.toHaveProperty("errors");

            const recordObjectMatchers = {
                created: expect.any(String),
                updated: expect.any(String),
                access: expect.objectContaining({
                    ...defaultRecord.access
                }),
                files: expect.objectContaining({
                    ...defaultRecord.files
                }),
                metadata: expect.objectContaining({
                    ...defaultRecord.metadata,
                    creators: defaultRecord.metadata.creators.map(creator => {
                        if (creator.person_or_org.type.toLowerCase() === "personal") {
                            return {
                                person_or_org: {
                                    ...creator.person_or_org,
                                    name: `${creator.person_or_org.family_name}, ${creator.person_or_org.given_name}`
                                },
                            };
                        }
                        return creator;
                    }),
                    resource_type: expect.objectContaining({
                        ...defaultRecord.metadata.resource_type
                    }),
                })
            };

            expect(createdRecord, "should be a draft and match the expected structure").toEqual(expect.objectContaining({
                id: expect.any(String),
                status: "draft",
                is_published: false,
                is_draft: true,
                ...recordObjectMatchers,
            }));

            // Publish the record
            /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
            const publishResponse = await apiContext.post(createdRecord.links?.publish);

            expect(publishResponse.status()).toBe(202);

            const publishedRecord = await publishResponse.json();

            expect(publishedRecord, "should not have any errors").not.toHaveProperty("errors");
            expect(publishedRecord, "should be published and match the expected structure").toEqual(expect.objectContaining({
                id: createdRecord.id,
                status: "published",
                is_published: true,
                is_draft: false,
                ...recordObjectMatchers,
            }));

            // Verify the record is published
            const record = await apiContext.get(publishedRecord.links?.self);

            expect(record.status()).toBe(200);
            expect(await record.json(), "should return again the published record with correct structure").toEqual(expect.objectContaining({
                id: createdRecord.id,
                status: "published",
                is_published: true,
                is_draft: false,
                ...recordObjectMatchers,
                created: publishedRecord.created, // created timestamp should be the same as when published
                updated: publishedRecord.updated, // updated timestamp should be the same as when published
            }));
            /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
        });

        test('Should create and publish a new record with files', async ({ recordsApiData }) => {
            const defaultRecord = {
                ...recordsApiData["defaultRecord"],
                files: {
                    enabled: true,
                },
            };

            // Create a new record
            const createResponse = await apiContext.post(recordsApiPath, {
                data: defaultRecord,
            });

            expect(createResponse.status()).toBe(201);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const createdRecord = await createResponse.json();

            expect(createdRecord, "should not have any errors").not.toHaveProperty("errors");

            const recordObjectMatchers = {
                created: expect.any(String),
                updated: expect.any(String),
                access: expect.objectContaining({
                    ...defaultRecord.access
                }),
                files: expect.objectContaining({
                    ...defaultRecord.files
                }),
                metadata: expect.objectContaining({
                    ...defaultRecord.metadata,
                    creators: defaultRecord.metadata.creators.map(creator => {
                        if (creator.person_or_org.type.toLowerCase() === "personal") {
                            return {
                                person_or_org: {
                                    ...creator.person_or_org,
                                    name: `${creator.person_or_org.family_name}, ${creator.person_or_org.given_name}`
                                },
                            };
                        }
                        return creator;
                    }),
                    resource_type: expect.objectContaining({
                        ...defaultRecord.metadata.resource_type
                    }),
                })
            };

            expect(createdRecord, "should be a draft and match the expected structure").toEqual(expect.objectContaining({
                id: expect.any(String),
                status: "draft",
                is_published: false,
                is_draft: true,
                links: expect.objectContaining({
                    files: expect.any(String),
                }),
                ...recordObjectMatchers,
            }));


            // File upload process (https://inveniordm.docs.cern.ch/reference/file_transfer/)
            /*
                1. Start draft file upload (POST /api/records/draft/{id}/files)
                2. Upload file content (PUT to the 'content' link from previous step)
                3. Commit file upload (POST to the 'commit' link from step 1)
            */

            // File upload with Local transfer method

            // Start draft file upload https://inveniordm.docs.cern.ch/reference/rest_api_drafts_records/#start-draft-file-uploads
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const startFilesUploadResponse = await apiContext.post(createdRecord.links.files, {
                data: [
                    { "key": "Anon.jpg" }
                ],
            });

            expect(startFilesUploadResponse.status()).toBe(201);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const startFilesUploadData = await startFilesUploadResponse.json();

            expect(startFilesUploadData, "should be pending and have links section").toEqual(expect.objectContaining({
                entries: expect.arrayContaining([
                    expect.objectContaining({
                        key: "Anon.jpg",
                        status: "pending",
                        links: expect.objectContaining({
                            content: expect.any(String),
                            self: expect.any(String),
                            commit: expect.any(String),
                        }),
                    }),
                ]),
            }));

            // Upload file content
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const fileUploadResponse = await apiContext.put(startFilesUploadData.entries[0].links.content, {
                headers: {
                    "Content-Type": "application/octet-stream",
                },
                // Read the file content from the UploadFiles folder
                data: fs.readFileSync(path.join(uploadFolderPath, "Anon.jpg")),
            });

            expect(fileUploadResponse.status()).toBe(200);

            // Commit file upload
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const commitFileResponse = await apiContext.post(startFilesUploadData.entries[0].links.commit);

            expect(commitFileResponse.status()).toBe(200);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const committedFileData = await commitFileResponse.json();

            expect(committedFileData, "should be available after commit").toEqual(expect.objectContaining({
                key: "Anon.jpg",
                status: "completed",
                mimetype: "image/jpeg",
                size: expect.any(Number),
                checksum: expect.any(String),
            }));


            // File upload with Fetch transfer method





            // Rest of the publishing process

            // Publish the record
            /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
            const publishResponse = await apiContext.post(createdRecord.links?.publish);

            expect(publishResponse.status()).toBe(202);

            const publishedRecord = await publishResponse.json();

            expect(publishedRecord, "should not have any errors").not.toHaveProperty("errors");
            expect(publishedRecord, "should be published and match the expected structure").toEqual(expect.objectContaining({
                id: createdRecord.id,
                status: "published",
                is_published: true,
                is_draft: false,
                ...recordObjectMatchers,
            }));

            // Verify the record is published
            const record = await apiContext.get(publishedRecord.links?.self);

            expect(record.status()).toBe(200);
            expect(await record.json(), "should return again the published record with correct structure").toEqual(expect.objectContaining({
                id: createdRecord.id,
                status: "published",
                is_published: true,
                is_draft: false,
                ...recordObjectMatchers,
                created: publishedRecord.created, // created timestamp should be the same as when published
                updated: publishedRecord.updated, // updated timestamp should be the same as when published
            }));
            /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
        });
    });
};
