// npm packages
var inq = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');
// Database connection info
var connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '',
  database: 'bamazon'
});
// Variables related to selected item
var itemChosen;
var quantityRequested;
var updatedQuantity;
var itemQuantity;
var itemPrice;
var totalCost;
var isPurchaseMade = false;
// Connect to database
connection.connect(function(err) {
  if (err) throw err;
  printTable();
});
// Print what is currently in the database
function printTable() {
  connection.query("SELECT * FROM products", function(err, item) {
    if (err) throw err;
    var table = new Table({
      head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Quantity'],
      colWidths: [20, 20, 20, 20, 20]
    });
    item.forEach(function(item) {
      // For each item in the array log the info
      table.push(
        [item.item_id, item.product_name, item.department_name,
          item.price, item.stock_quantity
        ]
      );
    });
    console.log(table.toString());
    if(isPurchaseMade) {
      connection.end();
    } else {
      pickItemId();
    }
  });
}
// Pick an item via ID #
function pickItemId() {
  inq.prompt([{
    type: 'input',
    name: 'whatId',
    message: '\nPlease enter the ID of the item you would like to purchase'
  }]).then(function(inqRes) {
    connection.query("SELECT * FROM products WHERE item_id =" +
      "'" + inqRes.whatId + "'",
      function(err, res) {
        // If there's an error log it
        if (err) {
          console.log(err);
        } else
          // If The response is not an empty array
          if (res.length > 0) {
            console.log("You have selected: " +
              res[0].product_name + ' $' + res[0].price + '.00 ' +
              "each " + res[0].stock_quantity + " left");
            itemChosen = inqRes.whatId;
            itemQuantity = res[0].stock_quantity;
            itemPrice = res[0].price;
            chooseQuantity();
          }
        // If the response is an empty array i.e. not a valid ID
        else {
          console.log("Sorry, this is not a valid ID please try again");
          pickItemId();
        }
      });
  });
}
// Choose the quantity of items to purchase
function chooseQuantity() {
  inq.prompt([{
    type: 'input',
    name: 'quantity',
    message: '\nPlease enter the quantity you would like to purchase',
  }]).then(function(inqRes) {
    // This value is for later use
    quantityRequested = inqRes.quantity;
    // This value is for updating the database with remaining quantity
    updatedQuantity = itemQuantity - quantityRequested;
    // This calculates the total cost
    totalCost = inqRes.quantity * itemPrice;
    connection.query("SELECT * FROM products WHERE item_id=" +
      "'" + itemChosen + "'",
      function(err, res) {
        if (err) {
          console.log(err);
        } else if (quantityRequested <= itemQuantity) {
          connection.query("UPDATE products SET stock_quantity =" + "'" +
            updatedQuantity + "'" + "WHERE item_id =" + "'" + itemChosen +
            "'");
          console.log("Purchase Successful! " + "Total Cost of Purchase: " +
            "$" + totalCost);
            isPurchaseMade = true;
            printTable();
        } else if(quantityRequested > itemQuantity) {
          console.log("Sorry, We don't have that much in stock right now");
          pickItemId();
        }
      });
  });
}