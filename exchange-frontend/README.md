# Web - Frontend

The following is a general documentatino on how to setup your frontend

## Tools

React JS | HTML | CSS | ApexCharts | MUI | React Icons

## Setup
First Setup your backend according to the decription inside the backend file

second open your project inside your IDE:
1. cd exchange-frontend
2. npm install to install all packages
3. npm start (to run the app)

## Structure:
1. ExchangeRates.js: mainly all components are imported here. (it presents echange rates, transactions and recording a transaction + all other independant components)
2. UserCredentialsDialog.js is the dialog component used for logging in and signing up.
3. Calculator.js: used for converting a certain amount from a currency to another
4. Statistics.js: diplays all stats
5. Predictions.js: displays best time to buy/sell + graph of rates for predictions
6. RateGraphs.js: graphs the exchange rate given the number of days by the user
7. Platform: used for recoding transactions with friends. a user can add other users as friends, and users can accept/reject friend requests. Also, a user can accept/reject a tranasction request
8. RequestTransactions.js: dialog for recording a transaction with a friend
