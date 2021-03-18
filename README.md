# newman-reporter-sql

This package based on [vs4vijay/newman-reporter-influxdb](https://github.com/vs4vijay/newman-reporter-influxdb). It was customized to work with multiple SQL Engines such `MySQL`, `MariaDB`, `PostgreSQL` and `Microsoft SQL Server`.

SQL reporter for [Newman](https://github.com/postmanlabs/newman) that sends the test results information to SQL which can be used in Grafana/PowerBI to build dashboard.

<a href="https://www.npmjs.com/package/newman-reporter-sql"><img alt="npm" src="https://badgen.net/badge/release/v1.0.11/red?icon=npm" /></a>
<a href=""><img alt="sequelize" src="https://badgen.net/badge/sequelize/v6.3.5/yellow?icon=npm"/></a>
<img alt="license" src="https://badgen.net/badge/license/MIT/blue">

---

## Getting Started

1. Install `newman`
2. Install `newman-reporter-sql`

---

### Prerequisites

1. `node` and `npm`
2. `newman` - `npm install -g newman`
3. Install the desired SQL engine:
```console
$ npm install --save pg pg-hstore # PostgreSQL
$ npm install --save mysql2
$ npm install --save mariadb
$ npm install --save tedious # Microsoft SQL Server
```

---

## Installation

```console
npm install -g newman-reporter-sql
```

> Installation should be done globally if newman is installed globally, otherwise install without `-g` option.

---

## Usage

Specify `-r sql` option while running the collection

```bash
newman run <collection-url> -r sql \
  --reporter-sql-dialect <mysql | mariadb | postgres | mssql> \
  --reporter-sql-server <server-name> \
  --reporter-sql-port <server-port> \
  --reporter-sql-name <database-name> \
  --reporter-sql-table <table-name> \
  --reporter-sql-username <username> \
  --reporter-sql-password <password>
```

Example:

```
# For Microsoft SQL Server

newman run https://www.getpostman.com/collections/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65-JsLv -r sql \
  --reporter-sql-dialect mssql \
  --reporter-sql-server localhost \
  --reporter-sql-port 1433 \
  --reporter-sql-name newman_reports \
  --reporter-sql-table api_results \
  --reporter-sql-username sa \
  --reporter-sql-password p@ssw0rd
```

### Options:

**Option** | **Remarks**
--- | --- 
`--reporter-sql-dialect` | SQL Engine. One of: `mysql`, `mariadb`, `postgres`, `mssql`.
`--reporter-sql-server` | IP Address or Host of SQL Server.
`--reporter-sql-port` | Port number. Usually: `3306` for MySQL and MariaDB, `5432` for PostgreSQL, `1433` for Microsoft SQL Server.
`--reporter-sql-name` | Database name. Already existing database.
`--reporter-sql-table` | Table name. Table will be created automatically.
`--reporter-sql-username` | Username created for SQL database (e.g. `sa`).
`--reporter-sql-password` | Password of the user (e.g. `p@ssw0rd`).
`--reporter-sql-debug` (*Optional*) | Reporter debug mode (default: `false`).
`--reporter-sql-test-name` (*Optional*) | It can be useful for reporting collected data from a specific test. Example `5 iterations`.

---

## Development

- `npm pack`
- `npm i -g newman-reporter-sql.<version>.tgz`
- OR `make local-install`
