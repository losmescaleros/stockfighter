var config = require('./config');
var request = require('request');

var baseUrl = 'https://api.stockfighter.io/ob/api';

// Basic Stockfighter API calls
var getHeartbeat = function(callback){
	var url = baseUrl + '/heartbeat';

	var options = {
		method: 'GET',
		url : url,
		headers: {
			'X-Starfighter-Authorization': config.apiKey
		}
	};

	request(options, callback);
};

var postNewOrder = function(account, venue, stock, price, qty, direction, orderType, callback){
	var url = baseUrl + '/venues/' + venue + '/stocks/' + stock + '/orders';


	var options = {
		method: 'POST',
		url: url,
		json: {
			account: account,
			price: price,
			qty: qty,
			direction: direction,
			orderType: orderType
		},
		headers: {
			'X-Starfighter-Authorization': config.apiKey
		}
	};

	request(options, callback);
};

var getOrderbook = function(venue, stock, callback){
	var url = baseUrl + '/venues/' + venue + '/stocks/' + stock;

	var options = {
		method: 'GET',
		url: url,
		json: {

		},
		headers: {
			'X-Starfighter-Authorization': config.apiKey
		}
	};

	request(options, callback);
};

var getOrderStatus = function(id, venue, stock, callback){
	var url = baseurl + '/venues/' + venue + '/stocks/' + stock + '/orders/' + id;

	var options = {
		method: 'GET',
		url: url,
		json: {
			id: id,
			venue: venue,
			stock: stock
		},
		headers: {
			'X-Starfighter-Authorization': config.apiKey
		}
	};

	request(options, callback);
}

var deleteOrder = function(venue, stock, order, callback){
	var url = baseUrl + '/venues/' + venue + '/stocks/' + stock + '/orders/' + order;

	var options = {
		method: 'DELETE',
		url: url,
		json: {

		},
		headers: {
			'X-Starfighter-Authorization': config.apiKey
		}
	};

	request(options, callback);
};

// Callbacks to perform after API calls

// Default callback for debugging
var defaultCallback = function(error, response, body){
	if(error){
		console.log(error);
	} else {
		console.log(response.statusCode + ': ');
		console.log(body);
	}
};

var logCallback = function(error, response, body){
	if(!error && response.statusCode === 200 && body.ok){
		myOrders.push(body);
	}
}

var main = function(){
	// Level one general strategy: 
	// 1. look at lowest ask size in the book
	setInterval(function(){
		var lowestAsk = -1;
		var askSize = 0;
		getOrderbook(config.venue, config.stock, function(error, response, body){
			if(!error && body.ok && body.asks != null){
				console.log(body.asks);

				var asks = body.asks;
				lowestAsk = asks[0].price;
				askSize = asks[0].qty;
				for(var i = 1; i < asks.length; i++){

					if(asks[i].price < lowestAsk){
						lowestAsk = asks[i].price;
						askSize = asks[i].qty;
					}

				}
				console.log("Lowest Asks: " + lowestAsk);
				console.log("Ask qty: " + askSize);
				var myPrice = lowestAsk + 2;
				var numBuys = askSize / 100;

				for(var i = 0; i < numBuys; i++){
					postNewOrder(config.tradingAccount, config.venue, config.stock, myPrice, 100, "buy", "limit", function(error, response, body){
						console.log("Made an order for " + 100 + " at price " + myPrice);
						if(error){
							console.log(error);
						} else{
							if(body.ok){
								console.log("Successfully bought. ID: " + body.id);
							}
						}
						
					});
					
				}	
			}
		});

	}, 300);
	// 2. buy it for around 90% of the total depth they offer or some relatively 
	// low number, e.g. 10,000
	// 3. let that bid run for like 20 to 30 seconds
	// 4. if the bid is done, good. if not cancel it.
	// 5. sell 30% of the depth for a markup of like 1.1 x the value you bought it for
	
}

main();


