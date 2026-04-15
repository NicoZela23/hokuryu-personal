CREATE TABLE "enrichment_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"data" text NOT NULL,
	"provider" text,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "enrichment_cache_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE INDEX "enrichment_cache_url_idx" ON "enrichment_cache" USING btree ("url");