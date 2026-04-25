create table profile
(
    profile_id                      bigserial not null,
    name                            varchar(100) not null,
    description                     varchar(255),
    primary key (profile_id)
);

create table app_user
(
    user_id                         bigserial not null,
    name                            varchar(120) not null,
    login                           varchar(60) not null unique,
    email                           varchar(160) not null unique,
    password_hash                   varchar(255) not null,
    status                          varchar(20) check (status in ('ACTIVE', 'INACTIVE')) not null default 'ACTIVE',
    profile_id                      bigint not null,
    primary key(user_id),

    constraint fk_app_user_profile foreign key (profile_id) references profile(profile_id)
);

create table beneficiary
(
    beneficiary_id                  bigserial not null,
    full_name                       varchar(160) not null,
    cpf                             varchar(14) not null unique,
    address                         varchar(255),
    phone                           varchar(120),
    socioeconomic_data              TEXT,
    beneficiary_status              varchar(20) check (beneficiary_status in ('PENDING', 'APPROVED', 'REJECTED')) not null default 'PENDING',
    approver_user_id                bigint,
    primary key (beneficiary_id),

    constraint fk_beneficiary_approver foreign key (approver_user_id) references app_user(user_id)
);

create table card (
   card_id                         bigserial,
   unique_number                   varchar(64) not null unique,
   beneficiary_id                  bigint not null unique,
   issue_date                      timestamp(6),
   primary key (card_id),

   constraint fk_card_beneficiary foreign key (beneficiary_id) references beneficiary(beneficiary_id)
);

create table category
(
    category_id                     bigserial,
    name                            varchar(100) not null unique,
    primary key (category_id)
);

create table item (
    item_id                         bigserial,
    description                     varchar(200) not null,
    stock_quantity                  int not null default 0 check (stock_quantity >= 0),
    tag_code                        varchar(64) unique,
    primary key (item_id)
);

create table donor (
    donor_id                        bigserial primary key,
    name                            varchar(160) not null,
    cpf_cnpj                        varchar(20) unique,
    contact                         varchar(160)
);

create table donation (
    donation_id                     bigserial,
    donation_date                   timestamp(6) not null default current_timestamp,
    receiver_user_id                bigint not null,
    donor_id                        bigint,
    primary key (donation_id),

    constraint fk_donation_receiver_user foreign key (receiver_user_id) references app_user(user_id),
    constraint fk_donation_donor foreign key (donor_id) references donor(donor_id)
);

create table withdrawal (
    withdrawal_id                   bigserial,
    withdrawal_date                 timestamp(6) not null default current_timestamp,
    beneficiary_id                  bigint not null,
    attendant_user_id               bigint not null,
    primary key (withdrawal_id),

    constraint fk_withdrawal_beneficiary foreign key (beneficiary_id) references beneficiary(beneficiary_id),
    constraint fk_withdrawal_attendant_user foreign key (attendant_user_id) references app_user(user_id)
);

create table item_donated (
     donation_id                     bigint not null,
     item_id                         bigint not null,
     quantity                        int not null check (quantity > 0),
     primary key (donation_id, item_id),

     constraint fk_item_donated_donation foreign key (donation_id) references donation(donation_id),
     constraint fk_item_donated_item foreign key (item_id) references item(item_id)
);

create table item_withdrawn (
     withdrawal_id                   bigint not null,
     item_id                         bigint not null,
     quantity                        int not null check (quantity > 0),
     primary key (withdrawal_id, item_id),

     constraint fk_item_withdrawn_withdrawal foreign key (withdrawal_id) references withdrawal(withdrawal_id),
     constraint fk_item_withdrawn_item foreign key (item_id) references item(item_id)
);