-- CreateEnum
CREATE TYPE "Kategorie" AS ENUM ('MALBA', 'STUK', 'BETON', 'KOVY', 'TAPETY');

-- CreateTable
CREATE TABLE "Realizace" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nazev" TEXT NOT NULL,
    "lokalita" TEXT NOT NULL,
    "rok" INTEGER NOT NULL,
    "kategorie" "Kategorie" NOT NULL,
    "popis" TEXT NOT NULL DEFAULT '',
    "vybrana" BOOLEAN NOT NULL DEFAULT false,
    "poradi" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Realizace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fotka" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "popisek" TEXT NOT NULL DEFAULT '',
    "poradi" INTEGER NOT NULL DEFAULT 0,
    "realizaceId" TEXT NOT NULL,

    CONSTRAINT "Fotka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clanek" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nadpis" TEXT NOT NULL,
    "perex" TEXT NOT NULL DEFAULT '',
    "titulniFoto" TEXT,
    "datum" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "obsah" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clanek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteTexts" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "heroNadpis" TEXT NOT NULL DEFAULT '',
    "heroPodnadpis" TEXT NOT NULL DEFAULT '',
    "oNasNadpis" TEXT NOT NULL DEFAULT '',
    "oNasText" TEXT NOT NULL DEFAULT '',
    "oNasFoto" TEXT,
    "sluzbyMalba" TEXT NOT NULL DEFAULT '',
    "sluzbyStuk" TEXT NOT NULL DEFAULT '',
    "sluzbyBeton" TEXT NOT NULL DEFAULT '',
    "sluzbyKovy" TEXT NOT NULL DEFAULT '',
    "sluzbyTapety" TEXT NOT NULL DEFAULT '',
    "kontaktEmail" TEXT NOT NULL DEFAULT '',
    "kontaktTelefon" TEXT NOT NULL DEFAULT '',
    "kontaktAdresa" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTexts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Realizace_slug_key" ON "Realizace"("slug");

-- CreateIndex
CREATE INDEX "Realizace_vybrana_idx" ON "Realizace"("vybrana");

-- CreateIndex
CREATE INDEX "Realizace_kategorie_idx" ON "Realizace"("kategorie");

-- CreateIndex
CREATE INDEX "Fotka_realizaceId_idx" ON "Fotka"("realizaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Clanek_slug_key" ON "Clanek"("slug");

-- CreateIndex
CREATE INDEX "Clanek_datum_idx" ON "Clanek"("datum");

-- AddForeignKey
ALTER TABLE "Fotka" ADD CONSTRAINT "Fotka_realizaceId_fkey" FOREIGN KEY ("realizaceId") REFERENCES "Realizace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
