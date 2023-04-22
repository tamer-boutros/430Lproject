
from .db_config import DB_CONFIG
import datetime


import jwt
import numpy as np

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import request, json
from flask import jsonify
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from flask import abort
from flask_cors import  CORS
from sklearn.linear_model import LinearRegression

SECRET_KEY = "b'|\xe7\xbfU3`\xc4\xec\xa7\xa9zf:}\xb5\xc7\xb9\x139^3@Dv'"


app = Flask(__name__)

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = DB_CONFIG

db = SQLAlchemy(app)

ma = Marshmallow(app)

bcrypt = Bcrypt(app)



app.app_context().push()

from .model.user import User, user_schema
from .model.transaction import Transaction, transaction_schema

   
@app.route('/transaction', methods=['POST'])
def create_transaction():
    

    usd_amount = request.json['usd_amount']
    lbp_amount = request.json['lbp_amount']
    usd_to_lbp = request.json['usd_to_lbp']
    
    if extract_auth_token(request):
       if decode_token(extract_auth_token(request)):
              user_id = decode_token(extract_auth_token(request))
              transaction = Transaction(usd_amount=usd_amount, lbp_amount=lbp_amount, usd_to_lbp=usd_to_lbp, user_id=user_id)
       else:
            abort(403)
    else:
        transaction = Transaction(usd_amount=usd_amount, lbp_amount=lbp_amount, usd_to_lbp=usd_to_lbp)
         
    trans = {
        'usd_amount': usd_amount, 'lbp_amount': lbp_amount, 'usd_to_lbp': usd_to_lbp
             }
  
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify(transaction_schema.dump(trans))


@app.route('/transaction', methods=['GET'])
def  get_transactions():
    
    if extract_auth_token(request):
       if decode_token(extract_auth_token(request)):
              user_id = decode_token(extract_auth_token(request))
              transactions = Transaction.query.filter_by(user_id=user_id).all()
       else:
            abort(403)
    
       return jsonify(transaction_schema.dump(transactions, many=True))
    else:
        abort(403)

   

@app.route('/exchangerate', methods=['GET'])
def getexchangerate():
    
    sellusdtrans = []
    buyusdtrans = []
    
    START_DATE = datetime.datetime.now() - datetime.timedelta(days= 100)
    END_DATE = datetime.datetime.now()
    
    for i in Transaction.query.filter(Transaction.added_date.between(START_DATE, END_DATE),Transaction.usd_to_lbp==True).all():
        
        ratio = i.lbp_amount / i.usd_amount
        sellusdtrans.append(ratio)
        
    if len(sellusdtrans) == 0:
        avgsellusd = None
        
    else:
        avgsellusd = round(sum(sellusdtrans) / len(sellusdtrans),2)
        
    for i in Transaction.query.filter(Transaction.added_date.between(START_DATE, END_DATE),Transaction.usd_to_lbp==False).all():
        
        ratio = i.lbp_amount / i.usd_amount
        
        buyusdtrans.append(ratio)
        
    if len(buyusdtrans) == 0:
        avgbuyusd = None
        
    else:
        avgbuyusd = round(sum(buyusdtrans) / len(buyusdtrans),2)
        
    
    rate = {
         'usd_to_lbp': avgsellusd ,'lbp_to_usd': avgbuyusd
    }
    
    return jsonify(rate), 200


@app.route('/newuser', methods=['POST'])
def create_user():
    
        user_name = request.json['user_name']
        password = request.json['password']
        
        user = User(user_name=user_name, password=password)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify(user_schema.dump(user))
    
@app.route('/authenticate', methods=['POST'])
def authenticate():
        
        user_name = request.json['user_name']
        password = request.json['password']
        
        if not user_name or not password:
            abort(400)
            
        user = User.query.filter_by(user_name=user_name).first()
        
        if not user:
            abort(403)
            
        if user and bcrypt.check_password_hash(user.hashed_password, password):
            return jsonify({'token': create_token(user.id)})
            
        else:
            abort(403)
            
def create_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=4),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
        }
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm='HS256'
    )
    
def extract_auth_token(authenticated_request):
    auth_header = authenticated_request.headers.get('Authorization')
    if auth_header:
        return auth_header.split(" ")[1]
    else:
        return None
    
def decode_token(token):
    payload = jwt.decode(token, SECRET_KEY, 'HS256')
    return payload['sub']
 
 

#find average best time to sell and buy usd
@app.route('/best_time', methods=['GET'])
def gettime():
    # Parse the start and end dates
    start_date = datetime.datetime.now() - datetime.timedelta(days=100)
    end_date = datetime.datetime.now()

    # Define lists to hold the best times to sell and buy USD for each day
    best_sell_times = []
    best_buy_times = []

    # Loop through each day in the time period
    current_date = start_date
    
    while current_date <= end_date:
        # Retrieve the transactions for the current day
        transactions = Transaction.query.filter(
            Transaction.added_date >= datetime.datetime.combine(current_date, datetime.time.min),
            Transaction.added_date < datetime.datetime.combine(current_date + datetime.timedelta(days=1), datetime.time.min)
        ).all()

        # Analyze the transactions to find the best time to sell and buy USD
        best_sell_time = None
        best_sell_rate = None
        best_buy_time = None
        best_buy_rate = None
        
        for transaction in transactions:
            
            if transaction.usd_to_lbp:
                # Find the best time to sell USD
                sell_rate = transaction.lbp_amount / transaction.usd_amount
                
                if best_sell_rate is None or sell_rate > best_sell_rate:
                    
                    best_sell_rate = sell_rate
                    best_sell_time = transaction.added_date.time()
            else:
                # Find the best time to buy USD
                buy_rate = transaction.usd_amount / transaction.lbp_amount
                
                if best_buy_rate is None or buy_rate < best_buy_rate:
                    
                    best_buy_rate = buy_rate
                    best_buy_time = transaction.added_date.time()

        # Add the best times to the lists
        if best_sell_time is not None:
            
            best_sell_times.append(best_sell_time)
            
        if best_buy_time is not None:
            
            best_buy_times.append(best_buy_time)

        # Move to the next day
        current_date += datetime.timedelta(days=1)

    # Calculate the average time of all the best sell times
    if len(best_sell_times) > 0:
        
        total_sell_seconds = sum(time.hour * 3600 + time.minute * 60 + time.second for time in best_sell_times)
        average_sell_seconds = int(round(total_sell_seconds / len(best_sell_times)))
        average_sell_time = datetime.time(hour=average_sell_seconds // 3600, minute=(average_sell_seconds // 60) % 60, second=average_sell_seconds % 60)
        sell_result = average_sell_time.strftime('%H:%M:%S')
        
    else:
        sell_result = 'No best sell time found.'

    # Calculate the average time of all the best buy times
    if len(best_buy_times) > 0:
        
        total_buy_seconds = sum(time.hour * 3600 + time.minute * 60 + time.second for time in best_buy_times)
        average_buy_seconds = int(round(total_buy_seconds / len(best_buy_times)))
        average_buy_time = datetime.time(hour=average_buy_seconds // 3600, minute=(average_buy_seconds // 60) % 60, second=average_buy_seconds % 60)
        buy_result = average_buy_time.strftime('%H:%M:%S')
        
    else:
        
        buy_result = 'No best buy time found.'

    # Return the results as a JSON response
    return jsonify({'best_sell_time': sell_result, 'best_buy_time': buy_result})




@app.route('/predict/<int:days>', methods=['GET'])
def predict_future_values(days):
    
    sellusdtrans = []
    buyusdtrans = []
    
    START_DATE = datetime.datetime.now() - datetime.timedelta(days=100)
    END_DATE = datetime.datetime.now()
    
    for i in Transaction.query.filter(Transaction.added_date.between(START_DATE, END_DATE),Transaction.usd_to_lbp==True).all():
        
        ratio = i.lbp_amount / i.usd_amount
        sellusdtrans.append(ratio)
        
    for i in Transaction.query.filter(Transaction.added_date.between(START_DATE, END_DATE),Transaction.usd_to_lbp==False).all():
        
        ratio = i.lbp_amount / i.usd_amount
        buyusdtrans.append(ratio)
    
    X_sell = [[i] for i in range(len(sellusdtrans))]
    X_buy = [[i] for i in range(len(buyusdtrans))]
    y_sell = sellusdtrans
    y_buy = buyusdtrans
    
    model_sell = LinearRegression().fit(X_sell, y_sell)
    model_buy = LinearRegression().fit(X_buy, y_buy)
    
    future_X_sell = [[i] for i in range(len(sellusdtrans), len(sellusdtrans)+days)]
    future_X_buy = [[i] for i in range(len(buyusdtrans), len(buyusdtrans)+days)]
    
    future_sell = model_sell.predict(future_X_sell)
    future_sell_dates = [(END_DATE + datetime.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(1, days+1)]
    future_sell_rounded = [round(val, 2) for val in future_sell.tolist()]
    
    future_buy = model_buy.predict(future_X_buy)
    future_buy_dates = [(END_DATE + datetime.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(1, days+1)]
    future_buy_rounded = [round(val, 2) for val in future_buy.tolist()]
    
    return jsonify({'future_sell': [{'date': d, 'value': v} for d, v in zip(future_sell_dates, future_sell_rounded)], 
                    'future_buy': [{'date': d, 'value': v} for d, v in zip(future_buy_dates, future_buy_rounded)]})

#statistics 
@app.route('/stats', methods=['GET'])
def getstatistics():
    
    sellusdtrans = []
    buyusdtrans = []
    total_usd_sell_volume = 0
    total_usd_buy_volume = 0
    total_lbp_sell_volume = 0
    total_lbp_buy_volume = 0
    total_number_of_transactions = 0

    START_DATE = datetime.datetime.now() - datetime.timedelta(days=100)
    END_DATE = datetime.datetime.now()

    for i in Transaction.query.filter(Transaction.added_date.between(START_DATE, END_DATE), Transaction.usd_to_lbp==True).all():
        
        ratio = i.lbp_amount / i.usd_amount
        sellusdtrans.append(ratio)
        total_usd_sell_volume += i.usd_amount
        total_lbp_buy_volume += i.lbp_amount
        total_number_of_transactions += 1

    if len(sellusdtrans) == 0:
        
        avgsellusd = None
        medsellusd = None
        stdsellusd = None
        volatsellusd = None
        
    else:
        
        avgsellusd = round(sum(sellusdtrans) / len(sellusdtrans), 2)
        medsellusd = round(np.median(sellusdtrans), 2)
        stdsellusd = round(np.std(sellusdtrans), 2)
        volatsellusd = round(np.std(sellusdtrans) / np.mean(sellusdtrans), 2)

    for i in Transaction.query.filter(Transaction.added_date.between(START_DATE, END_DATE), Transaction.usd_to_lbp==False).all():
        
        ratio = i.lbp_amount / i.usd_amount
        buyusdtrans.append(ratio)
        total_usd_buy_volume += i.usd_amount
        total_lbp_sell_volume += i.lbp_amount
        total_number_of_transactions += 1

    if len(buyusdtrans) == 0:
        
        avgbuyusd = None
        medbuyusd = None
        stdbuyusd = None
        volatbuyusd = None
        
    else:
        avgbuyusd = round(sum(buyusdtrans) / len(buyusdtrans), 2)
        medbuyusd = round(np.median(buyusdtrans), 2)
        stdbuyusd = round(np.std(buyusdtrans), 2)
        volatbuyusd = round(np.std(buyusdtrans) / np.mean(buyusdtrans), 2)

    total_usd_volume = total_usd_sell_volume + total_usd_buy_volume
    total_lbp_volume = total_lbp_sell_volume + total_lbp_buy_volume

    stats = {
        
        'sellusd': {
            
            'average': avgsellusd,
            'median': medsellusd,
            'stddev': stdsellusd,
            'volatility': volatsellusd,
            'total_usd_volume': total_usd_sell_volume,
            'total_lbp_volume': total_lbp_buy_volume,
            'total_number_of_transactions': len(sellusdtrans)
            
        },
        'buyusd': {
            
            'average': avgbuyusd,
            'median': medbuyusd,
            'stddev': stdbuyusd,
            'volatility': volatbuyusd,
            'total_usd_volume': total_usd_buy_volume,
            'total_lbp_volume': total_lbp_sell_volume,
            'total_number_of_transactions': len(buyusdtrans)
            
            },
            'total': {
            'total_usd_volume': total_usd_volume,
            'total_lbp_volume': total_lbp_volume,
            '% buy transactions': round((len(buyusdtrans) / total_number_of_transactions) * 100, 2),
            '% sell transactions': round((len(sellusdtrans) / total_number_of_transactions) * 100, 2),
            'total_number_of_transactions': total_number_of_transactions,
            }
            
            }
    
    return jsonify(stats)


@app.route('/getrates/<int:num_days>', methods=['GET'])
def getexchangerates(num_days):
    sellusdtrans = []
    buyusdtrans = []
    
    END_DATE = datetime.datetime.now()
    START_DATE = END_DATE - datetime.timedelta(days=num_days)
    
    for i in Transaction.query.filter(Transaction.added_date.between(START_DATE, END_DATE), Transaction.usd_to_lbp==True).all():
        ratio = i.lbp_amount / i.usd_amount
        sellusdtrans.append((i.added_date.date(), ratio))
    
    for i in Transaction.query.filter(Transaction.added_date.between(START_DATE, END_DATE), Transaction.usd_to_lbp==False).all():
        ratio = i.lbp_amount / i.usd_amount
        buyusdtrans.append((i.added_date.date(), ratio))
    
    sell_dict = {}
    for date, ratio in sellusdtrans:
        if date in sell_dict:
            sell_dict[date].append(ratio)
        else:
            sell_dict[date] = [ratio]
    
    buy_dict = {}
    for date, ratio in buyusdtrans:
        if date in buy_dict:
            buy_dict[date].append(ratio)
        else:
            buy_dict[date] = [ratio]
    
    avgsellusd = {date.strftime('%Y-%m-%d'): round(sum(ratios)/len(ratios), 2) for date, ratios in sell_dict.items()}
    avgbuyusd = {date.strftime('%Y-%m-%d'): round(sum(ratios)/len(ratios), 2) for date, ratios in buy_dict.items()}
    
    return jsonify({'avgsellusd': avgsellusd, 'avgbuyusd': avgbuyusd}), 200

