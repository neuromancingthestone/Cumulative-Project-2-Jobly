const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
// Function: sqlForPartialUpdate
//
// Description: 
//  Middleware function that is used in both Users and Companies models
//  to generate variable SQL strings for querying the database.
//
//  Gets passed key/value pairs as dataToUpdate from the JSON body data
//  as well as the proper SQL column names for the data if the JSON
//  data does not match the SQL database names. The keys are then
//  put into an array, and mapped to create an array of strings that
//  can be used to property query the database table.
//
//  The keys can be named anything that match an SQL table column,
//  which allows for updating the database columns and tables easily.
//  Table column names are not hard-coded. 
//
// Returns:
//  Object string of key/value pairs that can be used in the SQL calls. 
//  It's a good way of not hardcoding the database column
//  names into the calls, and checking to see if we can read the
//  code and follow the logic. It's pretty cool, and I'd like to 
//  reuse this code in the future. 

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(function test(colName, idx) {
    return `"${jsToSql[colName] || colName}"=$${idx + 1}`
  });

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function sqlForAllQuery(dataToQuery) {
  const keys = Object.keys(dataToQuery);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(function test(colName, idx) {
    if(colName === 'name') {
      return `LOWER(${colName}) LIKE '%' || LOWER($${idx+1}) || '%'`
    } else {}
    if(colName === 'minEmployees') {
      return `num_employees >= $${idx+1}`
    }
    if(colName === 'maxEmployees') {
      return `num_employees < $${idx+1}`
    }
  });

  return {
    setCols: cols.join(" AND "),
    values: Object.values(dataToQuery),
  };
}

module.exports = { sqlForPartialUpdate, sqlForAllQuery };
