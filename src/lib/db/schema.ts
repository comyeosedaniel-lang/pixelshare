import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────

export const aiToolEnum = pgEnum("ai_tool", [
  "midjourney",
  "stable_diffusion",
  "dall_e",
  "firefly",
  "leonardo",
  "flux",
  "other",
  "unknown",
]);

export const categoryEnum = pgEnum("category", [
  "character",
  "landscape",
  "abstract",
  "architecture",
  "portrait",
  "sci_fi",
  "fantasy",
  "nature",
  "concept_art",
  "illustration",
  "photo_realistic",
  "other",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewing",
  "resolved",
  "dismissed",
]);

export const reportReasonEnum = pgEnum("report_reason", [
  "copyright",
  "illegal_content",
  "spam",
  "harassment",
  "misleading",
  "other",
]);

// ── Users (NextAuth) ───────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  bio: text("bio"),
  youtubeUrl: varchar("youtube_url", { length: 500 }),
  twitterUrl: varchar("twitter_url", { length: 500 }),
  instagramUrl: varchar("instagram_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  tosAcceptedAt: timestamp("tos_accepted_at", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    uniqueIndex("accounts_provider_idx").on(
      table.provider,
      table.providerAccountId
    ),
    index("accounts_user_idx").on(table.userId),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("verification_tokens_pk").on(table.identifier, table.token),
  ]
);

// ── Images ─────────────────────────────────────────────

export const images = pgTable(
  "images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    aiTool: aiToolEnum("ai_tool").default("unknown"),
    prompt: text("prompt"),
    category: categoryEnum("category").default("other"),

    originalUrl: text("original_url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    fileName: varchar("file_name", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 50 }).notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),

    sha256Hash: varchar("sha256_hash", { length: 64 }).notNull(),
    pHash: varchar("p_hash", { length: 64 }),
    magnetUri: text("magnet_uri"),

    isModerated: boolean("is_moderated").default(false),
    moderationOk: boolean("moderation_ok").default(true),

    downloadCount: integer("download_count").default(0),
    viewCount: integer("view_count").default(0),

    isDeleted: boolean("is_deleted").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("images_user_idx").on(table.userId),
    uniqueIndex("images_sha256_idx").on(table.sha256Hash),
    index("images_phash_idx").on(table.pHash),
    index("images_category_idx").on(table.category),
    index("images_created_idx").on(table.createdAt),
  ]
);

// ── Tags ───────────────────────────────────────────────

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).unique().notNull(),
  },
  (table) => [uniqueIndex("tags_name_idx").on(table.name)]
);

export const imageTags = pgTable(
  "image_tags",
  {
    imageId: uuid("image_id")
      .references(() => images.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    uniqueIndex("image_tags_pk").on(table.imageId, table.tagId),
    index("image_tags_tag_idx").on(table.tagId),
  ]
);

// ── Reports ────────────────────────────────────────────

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    imageId: uuid("image_id")
      .references(() => images.id, { onDelete: "cascade" })
      .notNull(),
    reporterId: uuid("reporter_id")
      .references(() => users.id)
      .notNull(),
    reason: reportReasonEnum("reason").notNull(),
    description: text("description"),
    status: reportStatusEnum("status").default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => [
    index("reports_image_idx").on(table.imageId),
    index("reports_status_idx").on(table.status),
  ]
);

// ── Relations ──────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  images: many(images),
  accounts: many(accounts),
  sessions: many(sessions),
  reports: many(reports),
}));

export const imagesRelations = relations(images, ({ one, many }) => ({
  user: one(users, { fields: [images.userId], references: [users.id] }),
  imageTags: many(imageTags),
  reports: many(reports),
}));

export const imageTagsRelations = relations(imageTags, ({ one }) => ({
  image: one(images, { fields: [imageTags.imageId], references: [images.id] }),
  tag: one(tags, { fields: [imageTags.tagId], references: [tags.id] }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  imageTags: many(imageTags),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  image: one(images, { fields: [reports.imageId], references: [images.id] }),
  reporter: one(users, { fields: [reports.reporterId], references: [users.id] }),
}));
