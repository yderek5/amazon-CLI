var inq = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '',
  database: 'bamazon'
});

var itemChosen;

connection.connect(function(err) {
  if (err) throw err;
  printTable();
});

function printTable() {
  connection.query("SELECT * FROM products", function(err, item) {
    if (err) throw err;
    item.forEach(function(item) {
      console.log(item.item_id + " | " + item.product_name + " | " +
        item.department_name + " | " + "$" + item.price + ".00" +
        " | " + item.stock_quantity);
    });
    pickItemId();
  });
}

function pickItemId() {
  inq.prompt([{
    type: 'input',
    name: 'whatId',
    message: '\nPlease enter the ID of the item you would like to purchase'
  }]).then(function(inqRes) {
    connection.query("SELECT * FROM products WHERE item_id =" +
      "'" + inqRes.whatId + "'",
      function(err, res) {
        if (err) {
          console.log(err);
        } else if(res.length > 0) {
          console.log(res[0].product_name + ' $' +res[0].price + '.00');
          itemChosen = inqRes.whatId;
          console.log(itemChosen + " this is the chosen item id");
        } else {
          console.log("Sorry, this is not a valid ID please try again");
          pickItemId();
        }
      });
  });
}