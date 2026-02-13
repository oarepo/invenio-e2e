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
        const createResponse = await apiContext.post(recordsApiPath, {
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
    };

    const uploadFileWithLocalTransfer = async (createdRecord: ApiRecordResponse, file: FileUploadDescriptor) => {
        // File upload process (https://inveniordm.docs.cern.ch/reference/file_transfer/)
        /*
            1. Start draft file upload (POST /api/records/draft/{id}/files)
            2. Upload file content (PUT to the 'content' link from previous step)
            3. Commit file upload (POST to the 'commit' link from step 1)
        */

        // Start draft file upload https://inveniordm.docs.cern.ch/reference/rest_api_drafts_records/#start-draft-file-uploads
        const startFilesUploadResponse = await apiContext.post(createdRecord.links.files, {
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

        const fileUploadResponse = await apiContext.put(contentUrl!, {
            headers: {
                "Content-Type": "application/octet-stream",
            },
            data: fileContent,
        });

        expect(fileUploadResponse.status()).toBe(200);

        // Commit file upload
        const commitFileResponse = await apiContext.post(startFilesUploadData.entries[0].links.commit);

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
        // Start draft file upload with fetch method
        const startFetchUploadResponse = await apiContext.post(createdRecord.links.files, {
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
            const fileEntry = startFetchUploadData.entries.find((entry) => entry.key === file.key);
            expect(fileEntry, `expected upload entry for ${file.key}`).toBeDefined();
            const response = await apiContext.get(fileEntry!.links.self);
            if (response.status() !== 200) return false;
            const data = await response.json() as { status?: string };
            if (data.status === "completed") return true;
            return false;
        }, { message: `file transfer of ${file.key} should be completed` }).toBe(true);

        // Commit the fetched file
        const fileEntry = startFetchUploadData.entries.find((entry) => entry.key === file.key);
        expect(fileEntry, `expected upload entry for ${file.key}`).toBeDefined();
        const commitFetchResponse = await apiContext.post(fileEntry!.links.commit);

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
        const startMultipartTransferResponse = await apiContext.post(createdRecord.links.files, {
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
            const response = await apiContext.put(partUrl, {
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

        const commitMultipartResponse = await apiContext.post(multipartEntry!.links.commit);

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
    });
};
