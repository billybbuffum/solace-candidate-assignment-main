import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";

const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  specialties: jsonb("payload").default([]).notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  // Single column indexes for common search fields
  firstNameIdx: index("advocates_first_name_idx").on(table.firstName),
  lastNameIdx: index("advocates_last_name_idx").on(table.lastName),
  cityIdx: index("advocates_city_idx").on(table.city),
  degreeIdx: index("advocates_degree_idx").on(table.degree),
  experienceIdx: index("advocates_experience_idx").on(table.yearsOfExperience),
  
  // Composite indexes for common sorting and filtering patterns
  nameIdx: index("advocates_name_idx").on(table.lastName, table.firstName),
  cityExperienceIdx: index("advocates_city_experience_idx").on(table.city, table.yearsOfExperience),
  degreeExperienceIdx: index("advocates_degree_experience_idx").on(table.degree, table.yearsOfExperience),
  
  // GIN index for JSONB specialties field to enable efficient array searches
  specialtiesIdx: index("advocates_specialties_gin_idx").using("gin", table.specialties),
  
  // Text search indexes for better full-text search performance
  firstNameTextIdx: index("advocates_first_name_text_idx").using("gin", sql`to_tsvector('english', ${table.firstName})`),
  lastNameTextIdx: index("advocates_last_name_text_idx").using("gin", sql`to_tsvector('english', ${table.lastName})`),
  cityTextIdx: index("advocates_city_text_idx").using("gin", sql`to_tsvector('english', ${table.city})`),
  
  // Partial indexes for active records (if we add soft deletes later)
  activeRecordsIdx: index("advocates_active_idx").on(table.id).where(sql`${table.createdAt} IS NOT NULL`),
}));

export { advocates };
