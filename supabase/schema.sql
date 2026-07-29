-- WTW Installatie- & Verkoop-ERP — Postgres/Supabase schema
--
-- Eén database voor twee B.V.'s. Elke rij hangt aan een company; RLS zorgt dat
-- een gebruiker alleen de bedrijven ziet waar hij lid van is. De ERP van
-- wtw.nl staat hier bewust buiten.

create type company_id  as enum ('wtw-winkel', 'wtwstore');
create type bestelwijze as enum ('portal', 'email', 'edi');
create type klant_type  as enum ('particulier', 'zakelijk');
create type klant_bron  as enum ('webshop', 'offerte', 'telefoon', 'import');
create type offerte_status as enum ('concept', 'verstuurd', 'akkoord', 'afgewezen', 'verlopen');
create type order_status   as enum ('nieuw', 'ingepland', 'besteld', 'onderweg',
                                    'geleverd', 'gemonteerd', 'gefactureerd', 'geannuleerd');

create table companies (
    id     company_id primary key,
    naam   text not null,
    domein text not null,
    kvk    text,
    btw    text
);

-- Wie mag welk bedrijf zien. Basis voor alle RLS-policies hieronder.
create table company_members (
    user_id uuid       not null references auth.users(id) on delete cascade,
    company company_id not null references companies(id),
    rol     text       not null default 'medewerker',
    primary key (user_id, company)
);

create table leveranciers (
    id           uuid primary key default gen_random_uuid(),
    naam         text not null,
    klantnummer  text,
    email        text,
    telefoon     text,
    levertijd    int  not null default 3,
    korting      numeric(5,2) not null default 0,
    bestelwijze  bestelwijze not null default 'email',
    created_at   timestamptz not null default now()
);

-- Leveranciers zijn gedeeld; deze tabel legt vast wie bij welk bedrijf hoort.
create table leverancier_companies (
    leverancier_id uuid       not null references leveranciers(id) on delete cascade,
    company        company_id not null references companies(id),
    primary key (leverancier_id, company)
);

create table bezorgers (
    id         uuid primary key default gen_random_uuid(),
    naam       text not null,
    plaats     text,
    contact    text,
    telefoon   text,
    rit_tarief numeric(10,2) not null default 0,
    km_tarief  numeric(10,2) not null default 0,
    rayon      text[] not null default '{}'
);

create table producten (
    id             uuid primary key default gen_random_uuid(),
    company        company_id not null references companies(id),
    sku            text not null,
    naam           text not null,
    categorie      text not null,
    inkoop         numeric(10,2) not null default 0,
    verkoop        numeric(10,2) not null default 0,
    btw_tarief     int not null default 21 check (btw_tarief in (0, 9, 21)),
    voorraad       int not null default 0,
    min_voorraad   int not null default 0,
    leverancier_id uuid references leveranciers(id) on delete set null,
    woo_id         bigint,
    actief         boolean not null default true,
    updated_at     timestamptz not null default now(),
    unique (company, sku)
);
create index on producten (company, categorie);

create table klanten (
    id       uuid primary key default gen_random_uuid(),
    company  company_id not null references companies(id),
    naam     text not null,
    type     klant_type not null default 'particulier',
    email    text,
    telefoon text,
    adres    text,
    postcode text,
    plaats   text,
    bron     klant_bron not null default 'offerte',
    created_at timestamptz not null default now()
);
create index on klanten (company, naam);

create table offertes (
    id         uuid primary key default gen_random_uuid(),
    company    company_id not null references companies(id),
    nummer     text not null,
    klant_id   uuid not null references klanten(id),
    status     offerte_status not null default 'concept',
    datum      date not null default current_date,
    geldig_tot date not null default (current_date + 30),
    notitie    text,
    created_at timestamptz not null default now(),
    unique (company, nummer)
);

create table offerte_regels (
    id           uuid primary key default gen_random_uuid(),
    offerte_id   uuid not null references offertes(id) on delete cascade,
    volgorde     int  not null default 0,
    product_id   uuid references producten(id) on delete set null,
    omschrijving text not null,
    aantal       numeric(10,2) not null,
    stukprijs    numeric(10,2) not null,
    btw_tarief   int not null default 21 check (btw_tarief in (0, 9, 21))
);
create index on offerte_regels (offerte_id);

create table orders (
    id          uuid primary key default gen_random_uuid(),
    company     company_id not null references companies(id),
    nummer      text not null,
    klant_id    uuid not null references klanten(id),
    offerte_id  uuid references offertes(id) on delete set null,
    status      order_status not null default 'nieuw',
    datum       date not null default current_date,
    planning    date,
    bezorger_id uuid references bezorgers(id) on delete set null,
    woo_id      bigint,
    created_at  timestamptz not null default now(),
    unique (company, nummer)
);
create index on orders (company, status);

create table order_regels (
    id           uuid primary key default gen_random_uuid(),
    order_id     uuid not null references orders(id) on delete cascade,
    volgorde     int  not null default 0,
    product_id   uuid references producten(id) on delete set null,
    omschrijving text not null,
    aantal       numeric(10,2) not null,
    stukprijs    numeric(10,2) not null,
    btw_tarief   int not null default 21 check (btw_tarief in (0, 9, 21))
);
create index on order_regels (order_id);

-- Webshop-koppeling per bedrijf. Sleutels staan NIET hier maar in de
-- omgeving van de server (zie .env.example).
create table koppelingen (
    company      company_id primary key references companies(id),
    platform     text not null default 'woocommerce',
    url          text not null,
    laatste_sync timestamptz,
    richting     jsonb not null default
        '{"producten":"erp-naar-shop","voorraad":"erp-naar-shop","orders":"shop-naar-erp"}'
);

-- Auditlog van elke sync-run, zodat je kunt zien wanneer wat is doorgezet.
create table sync_log (
    id       bigserial primary key,
    company  company_id not null references companies(id),
    richting text not null,
    soort    text not null,
    aantal   int  not null default 0,
    fout     text,
    tijd     timestamptz not null default now()
);

/* ----------------------------------------------------------------- RLS ---- */

create or replace function heeft_toegang(c company_id)
returns boolean language sql security definer stable as $$
    select exists (
        select 1 from company_members m
        where m.user_id = auth.uid() and m.company = c
    );
$$;

alter table producten     enable row level security;
alter table klanten       enable row level security;
alter table offertes      enable row level security;
alter table orders        enable row level security;
alter table koppelingen   enable row level security;
alter table sync_log      enable row level security;
alter table offerte_regels enable row level security;
alter table order_regels   enable row level security;

create policy company_scope on producten
    using (heeft_toegang(company)) with check (heeft_toegang(company));
create policy company_scope on klanten
    using (heeft_toegang(company)) with check (heeft_toegang(company));
create policy company_scope on offertes
    using (heeft_toegang(company)) with check (heeft_toegang(company));
create policy company_scope on orders
    using (heeft_toegang(company)) with check (heeft_toegang(company));
create policy company_scope on koppelingen
    using (heeft_toegang(company)) with check (heeft_toegang(company));
create policy company_scope on sync_log
    using (heeft_toegang(company)) with check (heeft_toegang(company));

-- Regels erven de toegang van hun kop.
create policy via_offerte on offerte_regels using (
    exists (select 1 from offertes o where o.id = offerte_id and heeft_toegang(o.company))
) with check (
    exists (select 1 from offertes o where o.id = offerte_id and heeft_toegang(o.company))
);
create policy via_order on order_regels using (
    exists (select 1 from orders o where o.id = order_id and heeft_toegang(o.company))
) with check (
    exists (select 1 from orders o where o.id = order_id and heeft_toegang(o.company))
);

-- Leveranciers en bezorgers zijn gedeeld en niet bedrijfsgevoelig; die blijven
-- leesbaar voor iedere ingelogde gebruiker.

insert into companies (id, naam, domein) values
    ('wtw-winkel', 'WTW-Winkel B.V.', 'wtw-winkel.nl'),
    ('wtwstore',   'WTW Store B.V.',  'wtwstore.com');

insert into koppelingen (company, url) values
    ('wtw-winkel', 'https://wtw-winkel.nl'),
    ('wtwstore',   'https://wtwstore.com');
