export interface RoleUser {
  email: string;
  password: string;
}

export interface RoleUsers {
  reader: RoleUser;
  curator: RoleUser;
  manager: RoleUser;
  owner: RoleUser;
}

export const defaultRoleUsers: RoleUsers = {
  reader: {
    email: process.env.INVENIO_READER_EMAIL ?? "reader@example.com",
    password: process.env.INVENIO_READER_PASSWORD ?? "reader-password",
  },
  curator: {
    email: process.env.INVENIO_CURATOR_EMAIL ?? "curator@example.com",
    password: process.env.INVENIO_CURATOR_PASSWORD ?? "curator-password",
  },
  manager: {
    email: process.env.INVENIO_MANAGER_EMAIL ?? "manager@example.com",
    password: process.env.INVENIO_MANAGER_PASSWORD ?? "manager-password",
  },
  owner: {
    email: process.env.INVENIO_OWNER_EMAIL ?? "owner@example.com",
    password: process.env.INVENIO_OWNER_PASSWORD ?? "owner-password",
  },
};