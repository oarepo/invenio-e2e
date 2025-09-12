import { InvenioTest } from '../../fixtures';
import { expect } from '@playwright/test';

/**
 * Runs a set of API tests for the Records API.
 * 
 * @param test - The InvenioTest instance to use for the tests.
 * @param context - The authenticated BrowserContext to use for API requests.
 */
export function apiRecordTests(test: InvenioTest) {

    test.describe('API Record Tests', () => {
        test('Should return list of records with correct structure', async ({ request }) => {
            const response = await request.get('/api/records');
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

        test('Should create and publish a new metadata-only record', async ({ request }) => {
            // Create a new record
            const response = await request.post('/api/records', {
                data: {
                    "access": {
                        "record": "public",
                        "files": "public"
                    },
                    "files": {
                        "enabled": false
                    },
                    "metadata": {
                        "creators": [
                            {
                                "person_or_org": {
                                    "family_name": "Brown",
                                    "given_name": "Troy",
                                    "type": "personal"
                                }
                            },
                            {
                                "person_or_org": {
                                    "name": "Troy Inc.",
                                    "type": "organizational"
                                }
                            }
                        ],
                        "publication_date": "2020-06-01",
                        "resource_type": {
                            "id": "image-photo"
                        },
                        "title": "A Romans story"
                    }
                },
            });

            expect(response.status()).toBe(201);

            const createdRecord = await response.json();

            expect(createdRecord, "should not have any errors").not.toHaveProperty("errors");

            const recordObjectMatchers = {
                created: expect.any(String),
                updated: expect.any(String),
                access: expect.objectContaining({
                    record: "public",
                    files: "public"
                }),
                files: expect.objectContaining({
                    enabled: false
                }),
                metadata: expect.objectContaining({
                    creators: [
                        {
                            "person_or_org": {
                                "family_name": "Brown",
                                "given_name": "Troy",
                                "name": "Brown, Troy",
                                "type": "personal"
                            }
                        },
                        {
                            "person_or_org": {
                                "name": "Troy Inc.",
                                "type": "organizational"
                            }
                        }
                    ],
                    publication_date: "2020-06-01",
                    resource_type: expect.objectContaining({
                        id: "image-photo"
                    }),
                    title: "A Romans story"
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
            const publishResponse = await request.post(createdRecord.links.publish);

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
            const record = await request.get(publishedRecord.links.self);

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
        });
    });
};