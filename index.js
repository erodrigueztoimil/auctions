const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "root",
  database: "GREATBAY_DB"
});

connection.connect(function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("connected");
    inquirer
      .prompt([
        {
          type: "list",
          name: "option",
          message: "What do you want to do?",
          choices: ["Post item.", "Bid on item."]
        }
      ])
      .then(answer => {
        console.log(answer);
        if (answer.option == "Post item.") {
          inquirer
            .prompt([
              {
                type: "input",
                name: "item_name",
                message: "Enter name of the item."
              },
              {
                type: "input",
                name: "item_category",
                message: "Enter category of the item."
              },
              {
                type: "number",
                name: "starting_bid",
                message: "Enter starting bid."
              }
            ])
            .then(answers => {
              connection.query(
                "INSERT INTO AUCTION (ITEM_NAME, CATEGORY, STARTING_BID, HIGHEST_BID) VALUES (?, ?, ?, ?)",
                [
                  answers.item_name,
                  answers.item_category,
                  answers.starting_bid,
                  answers.starting_bid
                ],
                function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("Added item to the auctions.");
                  }
                }
              );
            });
        } else if (answer.option == "Bid on item.") {
          connection.query("SELECT ITEM_NAME FROM AUCTION", function(
            err,
            response
          ) {
            if (err) {
              console.log(err);
            } else {
              const array = [];
              response.map(row => {
                array.push(row.ITEM_NAME);
              });

              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "auctions",
                    message: "What item do you want to bid on?",
                    choices: array
                  }
                ])
                .then(function(answer) {
                  inquirer
                    .prompt([
                      {
                        type: "number",
                        name: "new_bid",
                        message: "How much do you want to bid on this item?"
                      }
                    ])
                    .then(bid => {
                      const saved_item_name = answer.auctions;

                      connection.query(
                        `SELECT HIGHEST_BID FROM AUCTION WHERE ITEM_NAME='${saved_item_name}'`,
                        function(err, response) {
                          if (err) {
                            console.log(err);
                          } else {
                            const new_bid = bid.new_bid;
                            const highest_bid = response[0].HIGHEST_BID;

                            if (new_bid < highest_bid) {
                              console.log("Bid is too low!");
                            } else {
                              console.log(saved_item_name);

                              connection.query(
                                `UPDATE AUCTION
                                SET HIGHEST_BID = ${new_bid}
                                WHERE ITEM_NAME = '${saved_item_name}'`,
                                function(err) {
                                  if (err) {
                                    console.log(err);
                                  }
                                }
                              );

                              console.log("Bid placed!");
                            }
                          }
                        }
                      );
                    });
                });
            }
          });
        }
      });
  }
});
