import { InvenioTest } from '../../fixtures';
import { expect } from '@playwright/test';

/**
 * Declares the core API regression tests for Invenio records.
 *
 * The suite verifies that listing existing records works and that creating a new
 * metadata-only record, publishing it, and retrieving it again follows the expected flow.
 * @param test The Playwright test fixture enhanced by `InvenioTest`.
 * @param recordsApiPath Optional path to the Records API root endpoint, defaults to `/api/records`.
 */
export function recordsApiTests(test: InvenioTest, recordsApiPath: string = '/api/records') {
    test.describe('API Record Tests', () => {
        test('Should return list of records with correct structure', async ({ request }) => {
            const response = await request.get(recordsApiPath);
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

        test('Should create and publish a new metadata-only record', async ({ request, recordsApiData }) => {
            const defaultRecord = recordsApiData["defaultRecord"];

            // Create a new record
            const response = await request.post(recordsApiPath, {
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
            const publishResponse = await request.post(createdRecord.links?.publish);

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
            const record = await request.get(publishedRecord.links?.self);

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
