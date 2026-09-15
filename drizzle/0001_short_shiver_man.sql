CREATE TABLE "limitations_debit" (
	"cle" text PRIMARY KEY NOT NULL,
	"jetons" real NOT NULL,
	"dernier_at" timestamp with time zone DEFAULT now() NOT NULL
);
