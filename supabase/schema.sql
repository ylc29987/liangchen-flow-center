create table orders(
 id bigint generated always as identity primary key,
 date text,
 project text,
 user_name text,
 income numeric,
 salary numeric,
 traffic_cost numeric,
 profit numeric
);

create table traffic(
 id bigint generated always as identity primary key,
 channel text,
 cost numeric,
 users integer
);

create table reviews(
 id bigint generated always as identity primary key,
 date text,
 summary text,
 problem text,
 plan text
);
