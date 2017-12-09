DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
  item_id INT(11) NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(255) NULL,
  department_name VARCHAR(255) NULL,
  price INT NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (item_id)
);
/* Add some test items */
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("Tooth Brush", "Toiletries", 5, 200),("Keyboard", "Technology", 25, 150),
("Wireless Mouse", "Technology", 15, 165),("Toilet Paper", "Toiletries", 10, 350),
("Knife", "Kitchen", 50, 80),("Cheese Grater", "Kitchen", 10, 55),
("Dog Toy", "Pet", 10, 600),("Dog Leash", "Pet", 8, 47),
("Shirt", "Clothing", 25, 400),("Jeans", "Clothing", 80, 245);