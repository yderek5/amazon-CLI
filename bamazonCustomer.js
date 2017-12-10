// npm packages
var inq = require('inquirer');
var mysql = require('mysql');
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
var itemQuantity;
var itemPrice;
var totalCost;
// Connect to database
connection.connect(function(err) {
  if (err) throw err;
  printTable();
});
// Print what is currently in the database
function printTable() {
  connection.query("SELECT * FROM products", function(err, item) {
    if (err) throw err;
    item.forEach(function(item) {
      // For each item in the array log the info
      console.log(item.item_id + " | " + item.product_name + " | " +
        item.department_name + " | " + "$" + item.price + ".00" +
        " | " + item.stock_quantity);
    });
    pickItemId();
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
              res[0].stock_quantity);
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
    itemQuantity -= inqRes.quantity;
    // This calculates the total cost
    totalCost = inqRes.quantity * itemPrice;
    connection.query("SELECT * FROM products WHERE item_id=" +
      "'" + itemChosen + "'",
      function(err, res) {
        if (err) {
          console.log(err);
        } else if (quantityRequested < itemQuantity) {
          connection.query("UPDATE products SET stock_quantity =" + "'" +
            itemQuantity + "'" + "WHERE item_id =" + "'" + itemChosen +
            "'");
          console.log("Purchase Successful! " + "Total Cost of Purchase: " +
          "$" + totalCost);
          connection.query("SELECT * FROM products", function(err, item) {
            if (err) throw err;
            item.forEach(function(item) {
              // For each item in the array log the info
              console.log(item.item_id + " | " + item.product_name + " | " +
                item.department_name + " | " + "$" + item.price + ".00" +
                " | " + item.stock_quantity);
            });
          });
          connection.end();
        } else {
          console.log("Sorry, We don't have that much in stock right now");
          pickItemId();
        }
      });
  });
}