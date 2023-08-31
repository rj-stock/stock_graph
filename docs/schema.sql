drop table if exists example;
create table example (
  id  int           primary key,
  name varchar(20) not null unique
);
comment on table  example      is 'Example';
comment on column example.name is 'Name';
