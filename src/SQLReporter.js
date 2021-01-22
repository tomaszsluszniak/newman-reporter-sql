const { Sequelize, Model, DataTypes } = require('sequelize');

class Table extends Model {}

class SQLReporter {
  
  constructor(newmanEmitter, reporterOptions, options) {
    this.newmanEmitter = newmanEmitter;
    this.reporterOptions = reporterOptions;
    this.options = options;
    this.context = {
      id: `${new Date().getTime()}-${Math.random()}`,
      currentItem: { index: 0 },
      assertions: {
        total: 0,
        failed: [],
        skipped: []
      },
      list: [],
      debug: this.reporterOptions.sqlDebug || this.reporterOptions.debug || false
    };
    const events = 'start beforeItem item request assertion exception done'.split(' ');
    events.forEach((e) => { if (typeof this[e] == 'function') newmanEmitter.on(e, (err, args) => this[e](err, args)) });

    if (this.context.debug) {
      console.log('[+] Reporter Options', reporterOptions);
    }
  }

  async start(error, args) {
    this.context.dialect = this.reporterOptions.sqlDialect || this.reporterOptions.dialect;
    this.context.server = this.reporterOptions.sqlServer || this.reporterOptions.server;
    this.context.port = this.reporterOptions.sqlPort || this.reporterOptions.port;
    this.context.name = this.reporterOptions.sqlName || this.reporterOptions.name;
    this.context.table = this.reporterOptions.sqlTable || this.reporterOptions.table;
    this.context.username = this.reporterOptions.sqlUsername || this.reporterOptions.username;
    this.context.password = this.reporterOptions.sqlPassword || this.reporterOptions.password;
    this.context.test_name = this.reporterOptions.sqlTest_name || this.reporterOptions.test_name;

    if (!this.context.dialect) {
      throw new Error('[-] ERROR: SQL Dialect is missing! Add --reporter-sql-dialect <dialect>.');
    } else {
      if (!(['mysql', 'mariadb', 'postgres', 'mssql'].includes(this.context.dialect))) {
        throw new Error("[-] ERROR: SQL Dialect has to be one of: 'mysql', 'mariadb', 'postgres', 'mssql'");
      }
    }
    if (!this.context.server) {
      throw new Error('[-] ERROR: SQL Server Address is missing! Add --reporter-sql-server <server-address>.');
    }
    if (!this.context.port) {
      throw new Error('[-] ERROR: SQL Server Port is missing! Add --reporter-sql-port <port-number>.');
    }
    if (!this.context.name) {
      throw new Error('[-] ERROR: SQL Database Name is missing! Add --reporter-sql-name <database-name>.');
    }
    if (!this.context.table) {
      throw new Error('[-] ERROR: SQL Table Name is missing! Add --reporter-sql-table <table-name>.');
    }
    if (!this.context.username) {
      throw new Error('[-] ERROR: SQL Username is missing! Add --reporter-sql-username <user-name>.');
    }
    if (!this.context.password) {
      throw new Error('[-] ERROR: SQL Password is missing! Add --reporter-sql-password <password>.');
    }
    console.log(`[+] Starting collection: ${this.options.collection.name} ${this.context.id}`);
    
    try { 
      let db_connection = await new Sequelize(this.context.name, this.context.username, this.context.password, {
        dialect: this.context.dialect,
        host: this.context.server,
        port: this.context.port,
        username: this.context.username,
        password: this.context.password,
        logging: this.context.debug
      });

      await db_connection.authenticate();

      await Table.init({
        collection_name: { type: DataTypes.STRING, allowNull: false },
        request_name: { type: DataTypes.STRING, allowNull: false },
        test_name: { type: DataTypes.STRING },
        url: { type: DataTypes.STRING, allowNull: false },
        method: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.STRING },
        code: { type: DataTypes.INTEGER },
        response_time: { type: DataTypes.INTEGER },
        response_size: { type: DataTypes.INTEGER },
        response: { type: DataTypes.TEXT },
        test_status: { type: DataTypes.STRING, allowNull: false },
        assertions: { type: DataTypes.INTEGER, allowNull: false },
        failed_count: { type: DataTypes.INTEGER, allowNull: false },
        skipped_count: { type: DataTypes.INTEGER, allowNull: false },
        failed: { type: DataTypes.TEXT, allowNull: false },
        skipped: { type: DataTypes.TEXT, allowNull: false }
      }, {
        sequelize: db_connection,
        tableName: this.context.table
      });

      await Table.sync({ alter: true });
      
    } catch (error) {
      console.log('[-] ERROR:', this.context.debug ? error : error.message);
    }
  }

  beforeItem(error, args) {
    this.context.list.push(this.context.currentItem);

    this.context.currentItem = {
      index: (this.context.currentItem.index + 1),
      name: '',
      data: {}
    };
  }

  request(error, args) {
    const { cursor, item, request } = args;

    console.log(`[${this.context.currentItem.index}] Running ${item.name}`);

    const data = {
      collection_name: this.options.collection.name, 
      request_name: item.name,
      test_name: '',
      url: request.url.toString(),
      method: request.method,
      status: args.response ? args.response.status : null,
      code: args.response ? args.response.code : null,
      response_time: args.response ? args.response.responseTime : null,
      response_size: args.response ? args.response.responseSize : null,
      response: args.response ? args.response.stream.toString('utf-8') : null,
      test_status: 'PASS',
      assertions: 0,
      failed_count: 0,
      skipped_count: 0,
      failed: '',
      skipped: ''
    };

    this.context.currentItem.data = data;
    this.context.currentItem.name = item.name;
  }

  exception(error, args) {
    // TODO: 
  }

  assertion(error, args) {
    this.context.currentItem.data.assertions++;

    if(error) {
      this.context.currentItem.data.test_status = 'FAIL';

      let failMessage = `${error.test} | ${error.name}`;
      if (this.context.debug) {
        failMessage += `: ${error.message}`;
      }
      this.context.currentItem.data.failed += failMessage;
      this.context.currentItem.data.failed_count++;
      if (this.context.debug) {
        this.context.assertions.failed.push(failMessage);
      }
    } else if(args.skipped) {
      if(this.context.currentItem.data.test_status !== 'FAIL') {
        this.context.currentItem.data.test_status = 'SKIP';
      }

      const skipMessage = args.assertion;
      this.context.currentItem.data.skipped += args.assertion;
      this.context.currentItem.data.skipped_count++;
      if (this.context.debug) {
        this.context.assertions.skipped.push(skipMessage); 
      }
    }
  }

  async item(error, args) {
    try {
      var data = this.context.currentItem.data;
      await Table.create({
        collection_name: data.collection_name,
        request_name: data.request_name,
        test_name: data.test_name,
        url: data.url,
        method: data.method,
        status: data.status,
        code: data.code,
        response_time: data.response_time,
        response_size: data.response_size,
        response: data.response,
        test_status: data.test_status,
        assertions: data.assertions,
        failed_count: data.failed_count,
        skipped_count: data.skipped_count,
        failed: data.failed,
        skipped: data.skipped
      });
    } catch (error) {
      console.log('[-] ERROR: While creating SQL connection: ', this.context.debug ? error : error.message);
    }
  }

  done() {
    console.log(`[+] Finished collection: ${this.options.collection.name} (${this.context.id})`);
  }
};

module.exports = SQLReporter;
