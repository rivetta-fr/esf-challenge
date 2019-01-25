//connection
//const db = require('./../config/database-pg-local');
//const transporter = require('./../config/nodemailer'); // pass nodemailer for configuration
const pgp = require('pg-promise')(/*options*/);

const cn = {
     // HEROKU
    host:'ec2-54-246-101-215.eu-west-1.compute.amazonaws.com',
    database: 'd8fulkuu7civvb',
    user: 'bhxwatwwqzmctm',
    port : 5432,
    password : '1c979d19ae33cc6632e712f9d344760aca15fcb115066c47159c3251d41512a3',
    uri: 'postgres://bhxwatwwqzmctm:1c979d19ae33cc6632e712f9d344760aca15fcb115066c47159c3251d41512a3@ec2-54-246-101-215.eu-west-1.compute.amazonaws.com:5432/d8fulkuu7civvb'

};
/*
Heroku CLI
heroku pg:psql postgresql-triangular-30470 --app very-road-trip
*/

const db = pgp(cn); // database instance;
/*
parameters ={
                    table: 'account' ,
                    field:  `Ac_Email`,
                    value : emailLow,
                    fieldsValues: {Ac_LocalToken : token , Ac_ExpiresToken : expires.toISOString() }
                };
*/
module.exports.update = function (parameters){
    let msg;
    let sql = `UPDATE $1:name SET ($2:name) = ($2:csv) WHERE ${parameters.condition};`;
    //console.log(sql);
    return db.any(sql, [parameters.table, parameters.fieldsValues] )
        .then( (res) => {
            msg = `Correct update ${parameters.table}.`;
            console.log(msg);
            return msg;
        })
        .catch( (error) => {
            msg = `Error in update ${parameters.table}: ${error.stack}`;
            console.error(msg);
            return msg;
        });
}

module.exports.create = function (table,fieldsValues){
    let msg;
    let field ="";
    return  db.any('INSERT INTO $1:name ($2:name) VALUES($2:csv) RETURNING $3:name;', [table, fieldsValues, field])
        .then( (rows) => {
            msg = `Insert value ${rows[0][field]} in ${table}.`;
            console.log(msg);
            return { id:rows[0][field]};
        })
        .catch( (error) => {
            msg = `Error insert in ${table} : ${error.stack}`;
            console.error(msg);
            return msg;
        });
}

module.exports.getLastId = function (table, field){
    return  db.any('SELECT $1:name FROM $2:name ORDER BY $1:name DESC;', [field, table])
        .then( (rows) => {
            if(rows[0] && rows[0] != null && rows[0] !== undefined){
                return {id:rows[0][field]};
            } else {
                return {id:0};
            }
        })
        .catch( (error) => {
            let msg = `Verify Rec in ${table} : ${error.stack}`;
            console.log(msg);
            return msg;
        });
}

module.exports.list = function (parameters){
    //console.log('listcrud');
    let sort="ASC", orderBy = "", sql ="";
    if(parameters.select && parameters.select != "" && parameters.select !== undefined ){
       sql = `SELECT *, ${parameters.select} FROM ${parameters.table}`;
    } else{
       sql = `SELECT * FROM ${parameters.table}`;
    }

    if(parameters.join && parameters.join != "" && parameters.join !== undefined ){
        sql += ` ${parameters.join}`;
    }
    if(parameters.where && parameters.where != "" && parameters.where !== undefined ){
        sql += ` WHERE ${parameters.where}`;
    }
    if(parameters.sort && parameters.sort != 'ASC' && parameters.sort != ""  && parameters.sort !== undefined ){
        sort = parameters.sort;
    }
    if(parameters.orderBy && parameters.orderBy != "" && parameters.orderBy !== undefined ){
        sql += ` ORDER BY ${parameters.orderBy} ${sort}`;
    }
    if(parameters.limit && parameters.limit != "" && parameters.limit !== undefined ){
        sql += ` LIMIT ${parameters.limit}`;
    }
    sql += ';';
    //console.log(`SQL: ${sql}`);
    return  db.any(sql)
        .then( (rows) => {
            console.log("roxlist",rows);
            return rows;
        })
        .catch( (error) => {
            let msg = `Error select in ${parameters.table} : ${error.stack}`;
            console.log(msg);
            return msg;
        });
}

module.exports.delete = function (table,id){
    let fieldId = table.toLowerCase().substr(0,2)+ '_id';
    return db.any("DELETE FROM $1:name WHERE $2:name = $3;", [table,fieldId,id] )
        .then( (rows) => {
            return rows;
        })
        .catch( (error) => {
            let msg = `Error select in ${parameters.table} : ${error.stack}`;
            console.log(msg);
            return msg;
        });
}
module.exports.deletemore = function (parameters){
    //return db.any(sql, [parameters.table, parameters.fieldsValues] )
    //let fieldId = parameters.table.toLowerCase().substr(0,2)+ '_id';
    return db.any("DELETE FROM $1:name WHERE $2:name = $3;", [parameters.table, parameters.field, parameters.value] )
        .then( (rows) => {
            return rows;
        })
        .catch( (error) => {
            let msg = `Error select in ${parameters.table} : ${error.stack}`;
            console.log(msg);
            return msg;
        });
}
