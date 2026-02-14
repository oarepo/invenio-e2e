import { appConfig } from '../../config';
import { InvenioTest } from '../../fixtures';
import { APIRequestContext, expect } from '@playwright/test';

import { readFileSync } from 'fs'
import { ReadableStream } from 'node:stream/web';
import { Readable } from 'node:stream';
import crypto from 'crypto'
import path from 'path';

type FileUploadDescriptor = {
    key: string;
    path: string;
    mimetype: string;
};

type Creator = {
    person_or_org: {
        type: string;
        family_name?: string;
        given_name?: string;
        name?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
};

type DefaultRecord = {
    access: Record<string, unknown>;
    files: Record<string, unknown>;
    metadata: {
        creators: Creator[];
        resource_type: Record<string, unknown>;
        [key: string]: unknown;
    };
    [key: string]: unknown;
};

type ApiRecordResponse = {
    id: string;
    links: {
        publish: string;
        self: string;
        files: string;
        [key: string]: string;
    };
    metadata: Record<string, unknown>;
    created: string;
    updated: string;
    [key: string]: unknown;
};

type UploadEntry = {
    key: string;
    status: string;
    transfer?: {
        type: string;
        parts?: number;
    };
    links: {
        content?: string;
        self: string;
        commit: string;
        parts?: Array<{
            part: number;
            url: string;
        }>;
    };
};

type StartUploadResponse = {
    entries: UploadEntry[];
};

type RecordFileEntry = {
    key: string;
    checksum: string;
    mimetype: string;
    size: number;
    status: string;
    [key: string]: unknown;
};

type RecordFilesListResponse = {
    enabled: boolean;
    entries: RecordFileEntry[];
    [key: string]: unknown;
};

/**
 * Declares the core API end-to-end tests for Invenio records.
 * @param test The Playwright test fixture enhanced by `InvenioTest`.
 * @param authUserFilePath Absolute path to the file where the authenticated user
 * state is stored.
 * @param authAdminFilePath Absolute path to the file where the authenticated admin user state is stored.
 * @param recordsApiPath Optional path to the Records API root endpoint, defaults to `/api/records`.
 */
export function recordsApiTests(
    test: InvenioTest, 
    authUserFilePath: string = path.resolve(appConfig.e2eRootPath, appConfig.authUserFilePath),
    authAdminFilePath: string = path.resolve(appConfig.e2eRootPath, appConfig.authAdminFilePath), 
    recordsApiPath: string = '/api/records'
) {
    let userApiContext: APIRequestContext;
    let adminApiContext: APIRequestContext;

    test.beforeAll(async ({ createApiContext }) => {
        userApiContext = await createApiContext(authUserFilePath);
        adminApiContext = await createApiContext(authAdminFilePath);
    });

    test.afterAll(async () => {
        await Promise.allSettled([
            userApiContext.dispose(),
            adminApiContext.dispose(),
        ]);
    });

    // Shared test files used across all upload transfer scenarios.
    const testFiles: FileUploadDescriptor[] = [
        { key: "Anon.jpg", path: path.resolve(__dirname, "../..", appConfig.dataFolderPath, "UploadFiles", "Anon.jpg"), mimetype: "image/jpeg", },
        { key: "logo-invenio-rdm.svg", path: "https://inveniordm.docs.cern.ch/images/logo-invenio-rdm.svg", mimetype: "image/svg+xml", },
        { key: "test.pdf", path: path.resolve(__dirname, "../..", appConfig.dataFolderPath, "api", "test.pdf"), mimetype: "application/pdf", },
        { key: "large-file-5mb.dat", path: "", mimetype: "application/octet-stream", }, // This file will be generated on the fly for testing multipart upload with a large file
    ];

    const buildRecordObjectMatchers = (defaultRecord: DefaultRecord): Record<string, unknown> => ({
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
            creators: defaultRecord.metadata.creators.map((creator) => {
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
    });

    // Creates a draft record and validates common draft response structure.
    const createDraftRecord = async (
        defaultRecord: DefaultRecord,
        expectFilesLink = false,
    ): Promise<{ createdRecord: ApiRecordResponse; recordObjectMatchers: Record<string, unknown> }> => {
        const createResponse = await userApiContext.post(recordsApiPath, {
            data: defaultRecord,
        });

        expect(createResponse.status()).toBe(201);

        const createdRecord = await createResponse.json() as ApiRecordResponse;

        expect(createdRecord, "should not have any errors").not.toHaveProperty("errors");

        const recordObjectMatchers = buildRecordObjectMatchers(defaultRecord);

        const draftRecordMatchers: Record<string, unknown> = {
            id: expect.any(String),
            status: "draft",
            is_published: false,
            is_draft: true,
            ...recordObjectMatchers,
        };

        if (expectFilesLink) {
            draftRecordMatchers.links = expect.objectContaining({
                files: expect.any(String),
            });
        }

        expect(createdRecord, "should be a draft and match the expected structure").toEqual(expect.objectContaining(draftRecordMatchers));

        return {
            createdRecord,
            recordObjectMatchers,
        };
    };

    // Publishes a draft record and validates the final published representation.
    const publishAndVerifyRecord = async (createdRecord: ApiRecordResponse, recordObjectMatchers: Record<string, unknown>) => {
        // Publish the record
        /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
        const publishResponse = await userApiContext.post(createdRecord.links?.publish);

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
        const record = await userApiContext.get(publishedRecord.links?.self);

        expect(record.status()).toBe(200);

        const recordData = await record.json() as ApiRecordResponse;

        expect(recordData, "should return again the published record with correct structure").toEqual(expect.objectContaining({
            id: createdRecord.id,
            status: "published",
            is_published: true,
            is_draft: false,
            ...recordObjectMatchers,
            created: publishedRecord.created, // created timestamp should be the same as when published
            updated: publishedRecord.updated, // updated timestamp should be the same as when published
        }));
        /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
        return recordData;
    };

    const uploadFileWithLocalTransfer = async (createdRecord: ApiRecordResponse, file: FileUploadDescriptor) => {
        // File upload process (https://inveniordm.docs.cern.ch/reference/file_transfer/)
        /*
            1. Start draft file upload (POST /api/records/draft/{id}/files)
            2. Upload file content (PUT to the 'content' link from previous step)
            3. Commit file upload (POST to the 'commit' link from step 1)
        */

        // Start draft file upload https://inveniordm.docs.cern.ch/reference/rest_api_drafts_records/#start-draft-file-uploads
        const startFilesUploadResponse = await userApiContext.post(createdRecord.links.files, {
            data: [
                { "key": file.key, },
            ],
        });

        expect(startFilesUploadResponse.status()).toBe(201);

        const startFilesUploadData = await startFilesUploadResponse.json() as StartUploadResponse;

        expect(startFilesUploadData, "should be pending and have links section").toEqual(expect.objectContaining({
            entries: expect.arrayContaining([
                expect.objectContaining({
                    key: file.key,
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
        const fileContent = readFileSync(file.path);

        const contentUrl = startFilesUploadData.entries[0]?.links.content;
        expect(contentUrl, `content upload link should exist for ${file.key}`).toBeDefined();

        const fileUploadResponse = await userApiContext.put(contentUrl!, {
            headers: {
                "Content-Type": "application/octet-stream",
            },
            data: fileContent,
        });

        expect(fileUploadResponse.status()).toBe(200);

        // Commit file upload
        const commitFileResponse = await userApiContext.post(startFilesUploadData.entries[0].links.commit);

        expect(commitFileResponse.status()).toBe(200);

        const committedFileData = await commitFileResponse.json() as Record<string, unknown>;
        const fileChecksum = crypto.createHash('md5').update(fileContent).digest('hex');

        expect(committedFileData, "should be completed and have valid checksum after commit").toEqual(expect.objectContaining({
            key: file.key,
            status: "completed",
            mimetype: file.mimetype,
            size: expect.any(Number),
            checksum: `md5:${fileChecksum}`,
        }));
    };

    const uploadFileWithFetchTransfer = async (createdRecord: ApiRecordResponse, file: FileUploadDescriptor) => {
        // NOTE: RECORDS_RESOURCES_FILES_ALLOWED_DOMAINS must be configured if using external url (https://inveniordm.docs.cern.ch/reference/file_transfer/#security)
        // Start draft file upload with fetch method (only admins with super-user access can use fetch transfer by default)
        const startFetchUploadResponse = await adminApiContext.post(createdRecord.links.files, {
            data: [{
                key: file.key,
                transfer: {
                    type: "F",
                    url: file.path,
                }
            }],
        });

        expect(startFetchUploadResponse.status()).toBe(201);

        const startFetchUploadData = await startFetchUploadResponse.json() as StartUploadResponse;

        expect(startFetchUploadData, `file ${file.key} should be pending with fetch method`).toEqual(expect.objectContaining({
            entries: expect.arrayContaining([
                expect.objectContaining({
                    key: file.key,
                    status: expect.stringMatching(/pending|completed/), // Depending on timing, the transfer might already be completed
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

        const fetchedFileEntry = startFetchUploadData.entries.find((entry) => entry.key === file.key);

        if (fetchedFileEntry?.status !== "completed") {
            // Wait for the file to be fetched by polling the 'self' link until the status becomes 'completed'
            await expect.poll(async () => {
                const response = await adminApiContext.get(fetchedFileEntry!.links.self);
                if (response.status() !== 200) return false;
                const data = await response.json() as { status?: string };
                if (data.status === "completed") return true;
                return false;
            }, { 
                message: `file transfer of ${file.key} should be completed`,
                intervals: [1000, 3000, 6000, 15000], // Polling intervals in milliseconds
            }).toBe(true);
        }

        // Commit the fetched file
        const commitFetchResponse = await adminApiContext.post(fetchedFileEntry!.links.commit);

        expect(commitFetchResponse.status()).toBe(200);

        const committedFetchData = await commitFetchResponse.json() as Record<string, unknown>;

        // To verify the checksum, fetch the original file and compute the digest locally.
        // With Fetch transfer, the server downloads the file directly, so we do not have the
        // upload payload available in the test process before commit.
        const remoteFileResponse = await fetch(file.path);
        const remoteFileStream = Readable.fromWeb(remoteFileResponse.body as ReadableStream);
        const fetchFileChecksumHash = crypto.createHash('md5');
        for await (const chunk of remoteFileStream) {
            fetchFileChecksumHash.update(chunk as Buffer);
        }
        const fetchFileChecksum = fetchFileChecksumHash.digest('hex');

        expect(committedFetchData, `commit of ${file.key} should be completed with valid checksum`).toEqual(expect.objectContaining({
            key: file.key,
            status: "completed",
            transfer: {
                type: "L",
            },
            mimetype: file.mimetype,
            size: expect.any(Number),
            checksum: `md5:${fetchFileChecksum}`,
        }));
    };

    const uploadFileWithMultipartTransfer = async (
        createdRecord: ApiRecordResponse,
        file: FileUploadDescriptor,
        partsCount: number,
        fileBuffer?: Buffer,
    ) => {
        // For generated files, `fileBuffer` is used; otherwise file contents are read from disk.
        const multipartFileContent = fileBuffer ?? readFileSync(file.path);

        // Start multipart upload
        const startMultipartTransferResponse = await userApiContext.post(createdRecord.links.files, {
            data: [{
                key: file.key,
                size: multipartFileContent.length,
                transfer: {
                    type: "M",
                    parts: partsCount,
                }
            }],
        });

        expect(startMultipartTransferResponse.status()).toBe(201);

        const startMultipartTransferData = await startMultipartTransferResponse.json() as StartUploadResponse;

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

        const multipartEntry = startMultipartTransferData.entries.find(entry => entry.key === file.key);
        expect(multipartEntry, `expected upload entry for ${file.key}`).toBeDefined();
        const partLinks = multipartEntry!.links.parts ?? [];

        expect(partLinks.length, `should have ${partsCount} parts as specified`).toBe(partsCount);

        const uploadPart = async (partUrl: string, data: Buffer) => {
            const response = await userApiContext.put(partUrl, {
                headers: {
                    "Content-Type": "application/octet-stream",
                },
                data,
            });
            return response;
        };

        const partsUploadResponses = await Promise.all(partLinks.map((part, index) => {
            // Split the file into S3_DEFAULT_BLOCK_SIZE chunks, keeping the remainder in the last part.
            const partStart = index * appConfig.s3DefaultBlockSize;
            const partEnd = index === partLinks.length - 1
                ? multipartFileContent.length
                : Math.min((index + 1) * appConfig.s3DefaultBlockSize, multipartFileContent.length);
            const partData = multipartFileContent.subarray(partStart, partEnd);
            return uploadPart(part.url, partData);
        }));

        for (let i = 0; i < partsUploadResponses.length; i++) {
            expect(partsUploadResponses[i].status(), `upload of part ${i + 1} should be successful`).toBe(200);
        }

        const commitMultipartResponse = await userApiContext.post(multipartEntry!.links.commit);

        expect(commitMultipartResponse.status()).toBe(200);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const commitMultipartData = await commitMultipartResponse.json();

        expect(commitMultipartData, `commit of ${file.key} should be completed with valid checksum`).toEqual(expect.objectContaining({
            key: file.key,
            status: "completed",
            transfer: {
                type: "L",
            },
            mimetype: file.mimetype,
            size: multipartFileContent.length,
        }));
    };

    test.describe('API Record Tests', () => {
        test('Should return list of records with correct structure', async () => {
            const response = await userApiContext.get(recordsApiPath);
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
            const defaultRecord = recordsApiData["defaultRecord"] as unknown as DefaultRecord;
            const { createdRecord, recordObjectMatchers } = await createDraftRecord(defaultRecord);
            await publishAndVerifyRecord(createdRecord, recordObjectMatchers);
        });

        test('Should create and publish a new record with local file upload transfer', async ({ recordsApiData }) => {
            const defaultRecord = {
                ...recordsApiData["defaultRecord"],
                files: {
                    enabled: true,
                },
            } as DefaultRecord;

            const { createdRecord, recordObjectMatchers } = await createDraftRecord(defaultRecord, true);
            await uploadFileWithLocalTransfer(createdRecord, testFiles[0]);
            await publishAndVerifyRecord(createdRecord, recordObjectMatchers);
        });

        test('Should create and publish a new record with fetch file upload transfer', async ({ recordsApiData }) => {
            const defaultRecord = {
                ...recordsApiData["defaultRecord"],
                files: {
                    enabled: true,
                },
            } as DefaultRecord;

            const { createdRecord, recordObjectMatchers } = await createDraftRecord(defaultRecord, true);
            await uploadFileWithFetchTransfer(createdRecord, testFiles[1]);
            await publishAndVerifyRecord(createdRecord, recordObjectMatchers);
        });

        test('Should create and publish a new record with multipart file upload transfer (single part)', async ({ recordsApiData }) => {
            const defaultRecord = {
                ...recordsApiData["defaultRecord"],
                files: {
                    enabled: true,
                },
            } as DefaultRecord;

            const { createdRecord, recordObjectMatchers } = await createDraftRecord(defaultRecord, true);
            await uploadFileWithMultipartTransfer(createdRecord, testFiles[2], 1);
            await publishAndVerifyRecord(createdRecord, recordObjectMatchers);
        });

        test('Should create and publish a new record with multipart file upload transfer (two parts)', async ({ recordsApiData }) => {
            const defaultRecord = {
                ...recordsApiData["defaultRecord"],
                files: {
                    enabled: true,
                },
            } as DefaultRecord;

            const { createdRecord, recordObjectMatchers } = await createDraftRecord(defaultRecord, true);

            // S3_DEFAULT_BLOCK_SIZE=5MB is the minimum by default
            // Let's allocate S3_DEFAULT_BLOCK_SIZE + 1/10*S3_DEFAULT_BLOCK_SIZE to ensure we can use exactly 2 parts
            const largeFileBuffer = Buffer.alloc(appConfig.s3DefaultBlockSize + Math.ceil(appConfig.s3DefaultBlockSize / 10), "a");
            await uploadFileWithMultipartTransfer(createdRecord, testFiles[3], 2, largeFileBuffer);
            await publishAndVerifyRecord(createdRecord, recordObjectMatchers);
        });

        test('Should create and publish a new record and then edit metadata successfully', async ({ recordsApiData }) => {
            const defaultRecord = recordsApiData["defaultRecord"] as unknown as DefaultRecord;
            const { createdRecord, recordObjectMatchers } = await createDraftRecord(defaultRecord);
            const publishedRecord = await publishAndVerifyRecord(createdRecord, recordObjectMatchers);

            // First, transition the published record back to draft
            const publishedToDraftResponse = await userApiContext.post(publishedRecord.links.draft);

            expect(publishedToDraftResponse.status()).toBe(201);

            const updatedDefaultRecord = {
                ...defaultRecord,
                metadata: {
                    ...defaultRecord.metadata,
                    title: "Updated Title",
                },
            };
            
            // Then, update the record metadata while in draft state
            const updateResponse = await userApiContext.put((await publishedToDraftResponse.json() as ApiRecordResponse).links.self, {
                data: updatedDefaultRecord,
            });

            expect(updateResponse.status()).toBe(200);

            const updatedRecord = await updateResponse.json() as ApiRecordResponse;

            // Finally, publish the updated record again and verify the changes
            const publishedUpdatedRecord = await publishAndVerifyRecord(updatedRecord, buildRecordObjectMatchers(updatedDefaultRecord));

            expect(publishedUpdatedRecord, "should have the same id").toHaveProperty("id", publishedRecord.id);
            expect(publishedUpdatedRecord, "should have the updated title").toHaveProperty("metadata.title", "Updated Title");
        });

        test('Should create and publish a new version with linked files from previous version and a new id', async ({ recordsApiData }) => {
            const defaultRecord = {
                ...recordsApiData["defaultRecord"],
                files: {
                    enabled: true,
                },
            } as DefaultRecord;

            // Publish initial version with an uploaded file.
            const { createdRecord, recordObjectMatchers } = await createDraftRecord(defaultRecord, true);
            await uploadFileWithLocalTransfer(createdRecord, testFiles[0]);
            const firstPublishedVersion = await publishAndVerifyRecord(createdRecord, recordObjectMatchers);

            // Capture files from first published version.
            const firstVersionFilesResponse = await userApiContext.get(firstPublishedVersion.links.files);
            expect(firstVersionFilesResponse.status()).toBe(200);
            const firstVersionFiles = await firstVersionFilesResponse.json() as RecordFilesListResponse;
            expect(firstVersionFiles.entries.length, 'first version should have uploaded files').toBeGreaterThan(0);

            // Create new draft version.
            const createVersionResponse = await userApiContext.post(firstPublishedVersion.links.versions);
            expect(createVersionResponse.status()).toBe(201);
            const newDraftVersion = await createVersionResponse.json() as ApiRecordResponse;

            const firstVersionIndex = (firstPublishedVersion as { versions?: { index?: number } }).versions?.index;
            const newDraftVersionIndex = (newDraftVersion as { versions?: { index?: number } }).versions?.index;
            const firstParentId = (firstPublishedVersion as { parent?: { id?: string } }).parent?.id;
            const newDraftParentId = (newDraftVersion as { parent?: { id?: string } }).parent?.id;

            expect(newDraftVersion.id, 'new draft version should have a different id').not.toBe(firstPublishedVersion.id);
            expect(newDraftVersion, 'new version should be returned as draft').toEqual(expect.objectContaining({
                is_published: false,
                is_draft: true,
                links: expect.objectContaining({
                    self: expect.any(String),
                    files: expect.any(String),
                    publish: expect.any(String),
                }),
            }));
            expect(newDraftVersion, 'new draft version should not carry publication_date in metadata').not.toHaveProperty('metadata.publication_date');
            expect(newDraftVersion, 'new draft version should not carry metadata.version').not.toHaveProperty('metadata.version');
            expect(firstVersionIndex, 'first published version should provide versions.index').toBeDefined();
            expect(newDraftVersionIndex, 'new draft version should provide versions.index').toBeDefined();
            expect(newDraftVersionIndex, 'new draft version should increment versions.index by 1').toBe((firstVersionIndex as number) + 1);
            expect(firstParentId, 'first version should include parent.id').toBeDefined();
            expect(newDraftParentId, 'new version should include parent.id').toBeDefined();
            expect(newDraftParentId, 'new version should be linked to same parent.id as previous version').toBe(firstParentId);

            // New version draft starts without files.
            const beforeImportFilesResponse = await userApiContext.get(newDraftVersion.links.files);
            expect(beforeImportFilesResponse.status()).toBe(200);
            const beforeImportFiles = await beforeImportFilesResponse.json() as RecordFilesListResponse;
            expect(beforeImportFiles.entries).toHaveLength(0);

            // Link all files from previous version.
            const filesImportResponse = await userApiContext.post(`${newDraftVersion.links.self}/actions/files-import`);
            expect(filesImportResponse.status()).toBe(201);
            const importedDraftFiles = await filesImportResponse.json() as RecordFilesListResponse;

            expect(importedDraftFiles.entries.length, 'draft should contain linked files after import').toBe(firstVersionFiles.entries.length);
            expect(importedDraftFiles.entries, 'linked draft should contain the file from previous version').toEqual(expect.arrayContaining([
                expect.objectContaining({
                    key: testFiles[0].key,
                    status: 'completed',
                }),
            ]));

            // Update metadata in the new draft version to include compulsory publication_date field
            const updateMetadataResponse = await userApiContext.put(newDraftVersion.links.self, {
                data: {
                    ...newDraftVersion,
                    metadata: {
                        ...newDraftVersion.metadata,
                        publication_date: "2026-01-01",
                    },
                },
            });
            expect(updateMetadataResponse.status()).toBe(200);

            // Publish new version.
            const publishNewVersionResponse = await userApiContext.post(newDraftVersion.links.publish);
            expect(publishNewVersionResponse.status()).toBe(202);
            const secondPublishedVersion = await publishNewVersionResponse.json() as ApiRecordResponse;
            const secondPublishedParentId = (secondPublishedVersion as { parent?: { id?: string } }).parent?.id;

            expect(secondPublishedVersion.id, 'published new version should keep new id').toBe(newDraftVersion.id);
            expect(secondPublishedVersion.id, 'published new version id should differ from previous version id').not.toBe(firstPublishedVersion.id);
            expect(secondPublishedVersion, 'new version should be published').toEqual(expect.objectContaining({
                status: 'published',
                is_published: true,
                is_draft: false,
            }));
            expect(secondPublishedParentId, 'published new version should keep same parent.id').toBe(firstParentId);

            // Verify linked files are present in the newly published version.
            const secondVersionFilesResponse = await userApiContext.get(secondPublishedVersion.links.files);
            expect(secondVersionFilesResponse.status()).toBe(200);
            const secondVersionFiles = await secondVersionFilesResponse.json() as RecordFilesListResponse;

            expect(secondVersionFiles.entries.length).toBe(firstVersionFiles.entries.length);

            const firstVersionFile = firstVersionFiles.entries.find((entry) => entry.key === testFiles[0].key);
            const secondVersionFile = secondVersionFiles.entries.find((entry) => entry.key === testFiles[0].key);

            expect(firstVersionFile, `expected file ${testFiles[0].key} in first published version`).toBeDefined();
            expect(secondVersionFile, `expected linked file ${testFiles[0].key} in second published version`).toBeDefined();

            expect(secondVersionFile, 'linked file metadata should be preserved in new version').toEqual(expect.objectContaining({
                key: firstVersionFile!.key,
                checksum: firstVersionFile!.checksum,
                mimetype: firstVersionFile!.mimetype,
                size: firstVersionFile!.size,
                status: 'completed',
            }));
        });

        test('Should create and publish an embargoed restricted record and keep it hidden from unauthenticated users', async ({ recordsApiData, playwright }) => {
            const embargoUntil = '2100-10-01';
            const embargoedRecord = {
                ...recordsApiData["defaultRecord"],
                access: {
                    record: 'restricted',
                    files: 'restricted',
                    embargo: {
                        active: true,
                        until: embargoUntil,
                        reason: 'Integration test embargo',
                    },
                },
            } as DefaultRecord;

            const { createdRecord, recordObjectMatchers } = await createDraftRecord(embargoedRecord);
            const publishedEmbargoedRecord = await publishAndVerifyRecord(createdRecord, recordObjectMatchers);

            expect(publishedEmbargoedRecord).toEqual(expect.objectContaining({
                access: expect.objectContaining({
                    record: 'restricted',
                    files: 'restricted',
                    embargo: expect.objectContaining({
                        active: true,
                        until: embargoUntil,
                    }),
                }),
            }));

            const unauthenticatedApiContext = await playwright.request.newContext({
                baseURL: appConfig.baseURL,
            });

            try {
                // Unauthenticated users should not be able to access the restricted embargoed record directly.
                const unauthGetRecordResponse = await unauthenticatedApiContext.get(publishedEmbargoedRecord.links.self);
                expect(unauthGetRecordResponse.status(), 'restricted embargoed record should not be visible to unauthenticated users').toBe(403);

                // Unauthenticated users should not be able to access files of the restricted embargoed record.
                const unauthGetFilesResponse = await unauthenticatedApiContext.get(publishedEmbargoedRecord.links.files);
                expect(unauthGetFilesResponse.status(), 'files of restricted embargoed record should not be visible to unauthenticated users').toBe(403);

                // Public search should not reveal this restricted embargoed record.
                const unauthSearchResponse = await unauthenticatedApiContext.get(recordsApiPath, {
                    params: {
                        q: `id:${publishedEmbargoedRecord.id}`,
                    },
                });
                expect(unauthSearchResponse.status(), 'search endpoint should be accessible').toBe(200);
                const searchData = await unauthSearchResponse.json() as { hits?: { hits?: Array<{ id?: string }> } };
                const returnedIds = (searchData.hits?.hits ?? []).map((hit) => hit.id);
                expect(returnedIds, 'restricted embargoed record should not appear in unauthenticated search results').not.toContain(publishedEmbargoedRecord.id);
            } finally {
                await unauthenticatedApiContext.dispose();
            }
        });
    });
};
