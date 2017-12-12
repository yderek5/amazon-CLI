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
// Item Variables
var itemChosen;
var itemQuantity;
var quantityToAdd;
var updatedQuantity;
var isActionDone = false;
// Connect to Database
connection.connect(function(err) {
  if (err) throw err;
  listOptions();
});

function listOptions() {
  inq.prompt([{
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: ['View products for sale', 'View low inventory', 'Add to inventory',
      'Add new product'
    ]
  }]).then(function(inqRes) {
    switch (inqRes.choice) {
      case 'View products for sale':
        isActionDone = true;
        printTable();
        break;
      case 'View low inventory':
        isActionDone = true;
        viewLowInv();
        break;
      case 'Add to inventory':
        addToInv();
        break;
      case 'Add new product':
        addNewProd();
        break;
    }
  });
}

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
        + "$" +  item.price + ".00", item.stock_quantity
        ]
      );
    });
    console.log(table.toString());
  });
  if (isActionDone) {
    connection.end();
  }
}

function viewLowInv() {
  connection.query("SELECT * FROM products WHERE stock_quantity < 5",
    function(err, item) {
      if (err) throw err;
      var table = new Table({
        head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Quantity'],
        colWidths: [20, 20, 20, 20, 20]
      });
      item.forEach(function(item) {
        table.push(
          [item.item_id, item.product_name, item.department_name,
            item.price, item.stock_quantity
          ]
        );
      });
      console.log(table.toString());
    });
  if (isActionDone) {
    connection.end();
  }
}
// Add inventory to items
function addToInv() {
  printTable();
  inq.prompt([{
    type: 'input',
    name: 'whatId',
    message: '\nPlease enter the item ID'
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
          addToInv();
        }
      });
  });
  // Choose quantity to add
  function chooseQuantity() {
    inq.prompt([{
      type: 'input',
      name: 'quantity',
      message: '\nPlease enter the number of units to add',
    }]).then(function(inqRes) {
      // This value is for later use
      quantityToAdd = parseInt(inqRes.quantity);
      // This value is for updating the database with remaining quantity
      updatedQuantity = quantityToAdd + itemQuantity;
      // This calculates the total cost
      connection.query("SELECT * FROM products WHERE item_id=" +
        "'" + itemChosen + "'",
        function(err, res) {
          if (err) {
            console.log(err);
          } else {
            connection.query("UPDATE products SET stock_quantity =" + "'" +
              updatedQuantity + "'" + "WHERE item_id =" + "'" + itemChosen +
              "'");
            console.log("Add Inventory Successful!");
            isActionDone = true;
            printTable();
          }
        });
    });
  }
}

function addNewProd() {
  inq.prompt([{
      type: 'input',
      name: 'productName',
      message: 'Name of Product: '
    },
    {
      type: 'input',
      name: 'departmentName',
      message: 'Name of Department: '
    },
    {
      type: 'input',
      name: 'price',
      message: 'Cost: '
    },
    {
      type: 'input',
      name: 'stockQuantity',
      message: 'Quantity: '
    }
  ]).then(function(inqRes) {
    connection.query("INSERT INTO products SET ?", {
      product_name: inqRes.productName,
      department_name: inqRes.departmentName,
      price: inqRes.price,
      stock_quantity: inqRes.stockQuantity
    });
    console.log("Item successfully added!");
    isActionDone = true;
    printTable();
  });
}