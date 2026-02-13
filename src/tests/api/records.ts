import { appConfig } from '../../config';
import { InvenioTest } from '../../fixtures';
import { APIRequestContext, expect } from '@playwright/test';

import { readFileSync } from 'fs'
import { ReadableStream } from 'node:stream/web';
import { Readable } from 'node:stream';
import crypto from 'crypto'
import path from 'path';

/**
 * Declares the core API regression tests for Invenio records.
 * @param test The Playwright test fixture enhanced by `InvenioTest`.
 * @param authUserFilePath Absolute path to the file where the authenticated user
 * state is stored.
 * @param recordsApiPath Optional path to the Records API root endpoint, defaults to `/api/records`.
 */
export function recordsApiTests(test: InvenioTest, authUserFilePath: string, recordsApiPath: string = '/api/records') {
    let apiContext: APIRequestContext;

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

            const testFiles = [
                { key: "Anon.jpg", path: path.resolve(__dirname, "../..", appConfig.dataFolderPath, "UploadFiles", "Anon.jpg"), mimetype: "image/jpeg", },
                { key: "logo-invenio-rdm.svg", path: "https://inveniordm.docs.cern.ch/images/logo-invenio-rdm.svg", mimetype: "image/svg+xml", },
                { key: "test.pdf", path: path.resolve(__dirname, "../..", appConfig.dataFolderPath, "api", "test.pdf"), mimetype: "application/pdf", },
                { key: "large-file-5mb.dat", path: "", mimetype: "application/octet-stream", }, // This file will be generated on the fly for testing multipart upload with a large file
            ]

            // File upload with Local transfer method

            // Start draft file upload https://inveniordm.docs.cern.ch/reference/rest_api_drafts_records/#start-draft-file-uploads
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const startFilesUploadResponse = await apiContext.post(createdRecord.links.files, {
                data: [
                    { "key": testFiles[0].key, },
                ],
            });

            expect(startFilesUploadResponse.status()).toBe(201);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const startFilesUploadData = await startFilesUploadResponse.json();

            expect(startFilesUploadData, "should be pending and have links section").toEqual(expect.objectContaining({
                entries: expect.arrayContaining([
                    expect.objectContaining({
                        key: testFiles[0].key,
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
            const fileContent = readFileSync(testFiles[0].path);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const fileUploadResponse = await apiContext.put(startFilesUploadData.entries[0].links.content, {
                headers: {
                    "Content-Type": "application/octet-stream",
                },
                // Read the file content from the UploadFiles folder
                data: fileContent,
            });

            expect(fileUploadResponse.status()).toBe(200);

            // Commit file upload
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const commitFileResponse = await apiContext.post(startFilesUploadData.entries[0].links.commit);

            expect(commitFileResponse.status()).toBe(200);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const committedFileData = await commitFileResponse.json();
            const fileChecksum = crypto.createHash('md5').update(fileContent).digest('hex');

            expect(committedFileData, "should be completed and have valid checksum after commit").toEqual(expect.objectContaining({
                key: testFiles[0].key,
                status: "completed",
                mimetype: testFiles[0].mimetype,
                size: expect.any(Number),
                checksum: `md5:${fileChecksum}`,
            }));


            // File upload with Fetch transfer method
            // NOTE: RECORDS_RESOURCES_FILES_ALLOWED_DOMAINS must be configured if using external url (https://inveniordm.docs.cern.ch/reference/file_transfer/#security)

            // Start draft file upload with fetch method
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const startFetchUploadResponse = await apiContext.post(createdRecord.links.files, {
                data: [{
                    key: testFiles[1].key,
                    // Fetch method requires a URL to fetch the file from
                    transfer: {
                        type: "F",
                        // Using Invenio RDM logo as test file to fetch, since it's a stable URL and a small image suitable for testing
                        url: testFiles[1].path,
                    }
                }],
            });

            expect(startFetchUploadResponse.status()).toBe(201);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const startFetchUploadData = await startFetchUploadResponse.json();

            // Verify file was initiated with fetch method
            expect(startFetchUploadData, `file ${testFiles[1].key} should be pending with fetch method`).toEqual(expect.objectContaining({
                entries: expect.arrayContaining([
                    expect.objectContaining({
                        key: testFiles[1].key,
                        status: "pending",
                        transfer: {
                            type: "F",
                        },
                        links: expect.objectContaining({
                            content: expect.any(String),
                            self: expect.any(String),
                            commit: expect.any(String),
                        }),
                    }),
                ]),
            }));

            // Wait for the file to be fetched by polling the 'self' link until the status becomes 'completed'
            await expect.poll(async () => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                const response = await apiContext.get(startFetchUploadData.entries[1].links.self);
                if (response.status() !== 200) return false;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const data = await response.json();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (data.status === "completed") return true;
                return false;
            }, { message: `file transfer of ${testFiles[1].key} should be completed` }).toBe(true);

            // Commit the fetched file
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const commitFetchResponse = await apiContext.post(startFetchUploadData.entries[1].links.commit);
            
            expect(commitFetchResponse.status()).toBe(200);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const committedFetchData = await commitFetchResponse.json();

            // To verify the checksum, we need to fetch the file content from the original URL and calculate its checksum, since with Fetch transfer the file is fetched directly by the server 
            // and we don't have access to the file content in the test to calculate the checksum before commit like we did with Local transfer
            const remoteFileResponse = await fetch(testFiles[1].path);
            const remoteFileStream = Readable.fromWeb(remoteFileResponse.body as ReadableStream);
            const fetchFileChecksumHash = crypto.createHash('md5');
            for await (const chunk of remoteFileStream) {
                fetchFileChecksumHash.update(chunk as Buffer); 
            } 
            const fetchFileChecksum = fetchFileChecksumHash.digest('hex');

            expect(committedFetchData, `commit of ${testFiles[1].key} should be completed with valid checksum`).toEqual(expect.objectContaining({
                key: testFiles[1].key,
                status: "completed",
                transfer: {
                    type: "L",
                },
                mimetype: testFiles[1].mimetype,
                size: expect.any(Number),
                checksum: `md5:${fetchFileChecksum}`,
            }));

            // File upload with Multipart transfer method

            const uploadFileWithMultipartTransfer = async (file: { path: string; key: string; mimetype: string }, partsCount: number, fileBuffer?: Buffer) => {
                const multipartFileContent = fileBuffer ?? readFileSync(file.path);

                // Start multipart upload
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                const startMultipartTransferResponse = await apiContext.post(createdRecord.links.files, {
                    data: [{
                        key: file.key,
                        size: multipartFileContent.length,
                        transfer: {
                            type: "M",
                            parts: partsCount, // For testing purposes, we can specify a small number of parts
                        }
                    }],
                });

                expect(startMultipartTransferResponse.status()).toBe(201);

                const startMultipartTransferData = await startMultipartTransferResponse.json() as { 
                    entries: Array<{
                        key: string;
                        status: string;
                        transfer: {
                            type: string;
                        };
                        links: {
                            parts: Array<{
                                part: number;
                                url: string;
                            }>;
                            self: string;
                            commit: string;
                        };
                    }>;
                };

                // Verify file was initiated with multipart method
                expect(startMultipartTransferData, `file ${file.key} should be pending with multipart method`).toEqual(expect.objectContaining({
                    entries: expect.arrayContaining([
                        expect.objectContaining({
                            key: file.key,
                            status: "pending",
                            transfer: {
                                type: "M",
                                parts: partsCount,
                            },
                            links: expect.objectContaining({
                                parts: expect.arrayContaining([
                                    expect.objectContaining({
                                        part: expect.any(Number),
                                        url: expect.any(String),
                                    }),
                                ]),
                                self: expect.any(String),
                                commit: expect.any(String),
                            }),
                        }),
                    ]),
                }));

                const partLinks = startMultipartTransferData.entries.find(entry => entry.key === file.key)!.links.parts;

                expect(partLinks.length, `should have ${partsCount} parts as specified`).toBe(partsCount);

                const uploadPart = async (partUrl: string, data: Buffer) => {
                    const response = await apiContext.put(partUrl, {
                        headers: {
                            "Content-Type": "application/octet-stream",
                        },
                        data,
                    });
                    return response;
                };

                // Upload parts in parallel
                const partsUploadResponses = await Promise.all(partLinks.map((part, index) => {
                    // For testing, we will split the file into S3_DEFAULT_BLOCK_SIZE sized parts, with the last part taking the remaining bytes
                    const partStart = index * appConfig.s3DefaultBlockSize;
                    const partEnd = index === partLinks.length - 1
                        ? multipartFileContent.length
                        : Math.min((index + 1) * appConfig.s3DefaultBlockSize, multipartFileContent.length);
                    const partData = multipartFileContent.subarray(partStart, partEnd);
                    return uploadPart(part.url, partData);
                }));

                // Verify all parts were uploaded successfully
                for (let i = 0; i < partsUploadResponses.length; i++) {
                    expect(partsUploadResponses[i].status(), `upload of part ${i+1} should be successful`).toBe(200);
                    // expect(await partsUploadResponses[i].json()).toEqual(expect.objectContaining({
                    //     status: "pending",
                    //     transfer: {
                    //         type: "M",
                    //     },
                    // }));
                }

                // Commit multipart upload
                const commitMultipartResponse = await apiContext.post(startMultipartTransferData.entries.find(entry => entry.key === file.key)!.links.commit);

                expect(commitMultipartResponse.status()).toBe(200);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const commitMultipartData = await commitMultipartResponse.json();

                // TODO: Calculate correct multipart checksum
                // const multipartFileChecksum = crypto.createHash('md5').update(multipartFileContent).digest('hex');

                expect(commitMultipartData, `commit of ${file.key} should be completed with valid checksum`).toEqual(expect.objectContaining({
                    key: file.key,
                    status: "completed",
                    transfer: {
                        type: "L", // After successful multipart upload, the transfer type should be updated to Local
                    },
                    mimetype: file.mimetype,
                    size: multipartFileContent.length,
                    // checksum: `md5:${multipartFileChecksum}`,
                }));
            };

            // Test multipart upload with the third test file
            await uploadFileWithMultipartTransfer(testFiles[2], 1);

            // S3_DEFAULT_BLOCK_SIZE=5MB is the minimum by default
            // Let's allocate S3_DEFAULT_BLOCK_SIZE + 1/10*S3_DEFAULT_BLOCK_SIZE to ensure we can use exactly 2 parts
            const largeFileBuffer = Buffer.alloc(appConfig.s3DefaultBlockSize + Math.ceil(appConfig.s3DefaultBlockSize / 10), "a");
            await uploadFileWithMultipartTransfer(testFiles[3], 2, largeFileBuffer);


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
