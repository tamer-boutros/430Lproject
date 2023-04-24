
from sqlalchemy import and_, not_, or_
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

from .model.user import FriendSchema, User, user_schema, Friend, friend_schema, friends_schema
from .model.transaction import Transaction, TransactionRequestSchema, TransactionRequests, transaction_schema, transaction_request_schema, transaction_requests_schema


   
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


#exchange rates
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
    
    avgsell = [{'date': date.strftime('%Y-%m-%d'), 'value': round(sum(ratios)/len(ratios), 2)} for date, ratios in sell_dict.items()]
    avgbuy = [{'date': date.strftime('%Y-%m-%d'), 'value': round(sum(ratios)/len(ratios), 2)} for date, ratios in buy_dict.items()]
    
    return jsonify({'avg_sell': avgsell, 'avg_buy': avgbuy}), 200







#Friend Manageemnt APIS

#Get all friends
@app.route('/users/friends', methods=['GET'])
def get_friends():
    
    if extract_auth_token(request):
        
        if decode_token(extract_auth_token(request)):
            
            user_id = decode_token(extract_auth_token(request))
            
            if not user_id:
                
                abort(403)
            #handle the case for whether the request was sent by the user or by the friend
            friends = Friend.query.filter(or_(Friend.user_id==user_id, Friend.friend_id==user_id), Friend.status=='accepted').all()
            friend_ids = [friend.friend_id if friend.user_id==user_id else friend.user_id for friend in friends]
            friends = User.query.filter(User.id.in_(friend_ids)).all()
            
            return friends_schema.jsonify(friends)
     

    else:
        abort(401, 'Authentication token is missing or invalid.')
    
   
    






#Add friend
@app.route('/users/add_friend', methods=['POST'])
def add_friend():
    if extract_auth_token(request):
        
        if decode_token(extract_auth_token(request)):
            
            user_id = decode_token(extract_auth_token(request))
            
            if not user_id:
                
                abort(403)
                
            friend_name = request.json['friend_name']
            friend = User.query.filter_by(user_name=friend_name).first()
            
            if not friend:
                
                return jsonify({'message': 'Friend not found'}), 404
            
        existing_friendship = Friend.query.filter_by(user_id=user_id, friend_id=friend.id).first()
        
        if existing_friendship:
            
            return jsonify({'message': 'Friend request already sent'}), 400
        
        new_friend = Friend(user_id, friend.id, 'pending')
        db.session.add(new_friend)
        db.session.commit()
    
    else:
        
        abort(401, 'Authentication token is missing or invalid.')
        
    return jsonify({'message': 'Friend request sent'}), 201





#Display outgoing and incoming friend requests
@app.route('/users/friend_requests', methods=['GET'])
def get_friend_requests():
    
    if extract_auth_token(request):
        
        if decode_token(extract_auth_token(request)):
            
            user_id = decode_token(extract_auth_token(request))
            
            if not user_id:
                
                abort(403)
                
        friend_data_incoming = db.session.query(User.id, User.user_name).\
            join(Friend, Friend.user_id == User.id).\
            filter(Friend.friend_id == user_id, Friend.status == 'pending').all()
        friend_data_incoming = [{'user_name': user_name, 'request_type': 'incoming'} for id, user_name in friend_data_incoming]
        friend_data_outgoing = db.session.query(User.id, User.user_name).\
            join(Friend, Friend.friend_id == User.id).\
            filter(Friend.user_id == user_id, Friend.status == 'pending').all()
            
        friend_data_outgoing = [{'user_name': user_name, 'request_type': 'outgoing'} for id, user_name in friend_data_outgoing]
        friend_data = friend_data_incoming + friend_data_outgoing
    
        return jsonify(friend_data)
    
    else:
        
        abort(401, 'Authentication token is missing or invalid.')



#Manage friend requests
@app.route('/users/request_action/<string:sender_name>', methods=['PUT'])
def accept_reject_friend(sender_name):
    
    if extract_auth_token(request):
        
        if decode_token(extract_auth_token(request)):
            
            user_id = decode_token(extract_auth_token(request))
            
            if not user_id:
                
                abort(403)
                
            sender = User.query.filter_by(user_name=sender_name).first()
            
            if not sender:
                
                return jsonify({'message': 'User not found'}), 404
            
            friend = Friend.query.filter_by(user_id=sender.id, friend_id=user_id).first()
            
            if not friend:
                
                return jsonify({'message': 'Friend request not found'}), 404
            # Check if the current user is the recipient of the friend request
            if friend.friend_id == user_id:
                
                if 'status' not in request.json:
                    
                    return jsonify({'message': 'Missing status parameter'}), 400
                
                status = request.json['status']
                
                if status not in ['accepted', 'rejected']:
                    
                    return jsonify({'message': 'Invalid status parameter'}), 400
                
                friend.status = status
                #delete friend request record from the friend table in case of rejection
                if status == 'rejected':
                    
                    db.session.delete(friend)
                    
                db.session.commit()
                
                return jsonify({'message': 'Friend request {} successfully'.format(status)}), 200
            
            else:
                
                return jsonify({'message': 'You are not authorized to perform this action'}), 403
            
    else:
        
        abort(401, 'Authentication token is missing or invalid.')


#Remove friend
@app.route('/users/remove_friend/<int:friend_id>', methods=['DELETE'])
def remove_friend(friend_id):
    
    if extract_auth_token(request):
        
        if decode_token(extract_auth_token(request)):
            
            user_id = decode_token(extract_auth_token(request))
            
            if not user_id:
                
                abort(403)
    

        
        friend = Friend.query.filter(
            ((Friend.user_id == user_id) & (Friend.friend_id == friend_id)) | 
            ((Friend.user_id == friend_id) & (Friend.friend_id == user_id))
        ).first()
        
        
        if not friend:
            
            return jsonify({'message': 'Friend not found'}), 404
        
        db.session.delete(friend)
        db.session.commit()
        
        return jsonify({'message': 'Friend removed'}), 200
    
    else:
        
        abort(401, 'Authentication token is missing or invalid.')
        
        




#Create transaction request
@app.route('/transaction_request', methods=['POST'])
def create_transaction_request():
    
    if extract_auth_token(request):
        
        if decode_token(extract_auth_token(request)):
            
            user_id = decode_token(extract_auth_token(request))
            
            if not user_id:
                
                abort(403)
            
            sender_id = user_id
            recipient_username = request.json['recipient_username']
            usd_amount = request.json['usd_amount']
            lbp_amount = request.json['lbp_amount']
            usd_to_lbp = request.json['usd_to_lbp']
            
            if not (sender_id and recipient_username):
                
                return jsonify({'error': 'Invalid user ID(s)'}), 400
            
            # Check that sender and recipient are friends
            recipient = User.query.filter_by(user_name=recipient_username).first()
            
            if not recipient:
                
                return jsonify({'error': 'Recipient username not found'}), 400
            
            friendship = Friend.query.filter(
                or_(
                    and_(Friend.user_id == sender_id, Friend.friend_id == recipient.id),
                    and_(Friend.user_id == recipient.id, Friend.friend_id == sender_id)
                ),
                Friend.status == 'accepted'
            ).first()

            if not friendship:
                
                return jsonify({'error': 'Sender and recipient are not friends'}), 400
            
            # Create new transaction request object
            transaction_request = TransactionRequests(
                sender_id=sender_id,
                recipient_id=recipient.id,
                usd_amount=usd_amount,
                lbp_amount=lbp_amount,
                usd_to_lbp=usd_to_lbp
            )
            
            # Add transaction request object to database
            db.session.add(transaction_request)
            db.session.commit()
            
            return jsonify({'message': 'Transaction request created successfully'}), 201
        
    else:
        
        abort(401, 'Authentication token is missing or invalid.')


#fetch transaction requests
@app.route('/get_transaction_requests', methods=['GET'])
def get_transaction_requests():
        
    if extract_auth_token(request):
        
        if decode_token(extract_auth_token(request)):
            
            user_id = decode_token(extract_auth_token(request))
            
            if not user_id:
                
                abort(403)
            
            transaction_requests = TransactionRequests.query.filter_by(recipient_id=user_id).all()
            
            return transaction_requests_schema.jsonify(transaction_requests), 200
        
    else:
        
        abort(401, 'Authentication token is missing or invalid.')



# Manage transaction requests
@app.route('/transaction_request/<int:request_id>', methods=['POST'])
def update_transaction_request_status(request_id):

    if extract_auth_token(request):

        if decode_token(extract_auth_token(request)):

            user_id = decode_token(extract_auth_token(request))

            if not user_id:

                abort(403)

            transaction_request = TransactionRequests.query.get(request_id)

            if not transaction_request:

                return jsonify({'error': 'Transaction request not found'}), 404

            if transaction_request.recipient_id != user_id:

                return jsonify({'error': 'You are not authorized to update this transaction request'}), 403

            if transaction_request.status != 'pending':

                return jsonify({'error': 'Transaction request is already {}'.format(transaction_request.status)}), 400

            status = request.json['status']

            if status == 'accepted':
                # Create new transaction objects
                sender_transaction = Transaction(
                    usd_amount=transaction_request.usd_amount,
                    lbp_amount=transaction_request.lbp_amount,
                    usd_to_lbp=transaction_request.usd_to_lbp,
                    user_id=transaction_request.sender_id
                )
                recipient_transaction = Transaction(
                    usd_amount=transaction_request.usd_amount,
                    lbp_amount=transaction_request.lbp_amount,
                    usd_to_lbp= not transaction_request.usd_to_lbp,
                    user_id=transaction_request.recipient_id
                )

                # Add transaction objects to database in case of success
                db.session.add(sender_transaction)
                db.session.add(recipient_transaction)

            transaction_request.status = status
            db.session.commit()

            return jsonify({'message': 'Transaction request updated successfully'}), 200
    else:
        abort(401, 'Authentication token is missing or invalid.')













#Fetch all users that are not friends with the current user
@app.route('/users', methods=['GET'])
# def get_users():
#     # Extract user ID from the authentication token
#         if extract_auth_token(request):
                
#                 if decode_token(extract_auth_token(request)):
                    
#                     user_id = decode_token(extract_auth_token(request))
                    
#                     if not user_id:
                        
#                         abort(403)

#                     subquery = db.session.query(Friend.friend_id).filter(or_(
#                     (Friend.user_id == user_id), (Friend.friend_id == user_id)
#                     )).filter(Friend.status == 'accepted')
#                     users_not_friends = User.query.filter(
#                     User.id != user_id,
#                     not_(User.id.in_(subquery))
#                     )

#         # serialize user data
#         result = user_schema.dump(users_not_friends)
#         print(result)
#         print("hello Id is:    ", user_id)
#         return jsonify(result)

def get_non_friend_users():
    if extract_auth_token(request):
                
                if decode_token(extract_auth_token(request)):
                    
                    user_id = decode_token(extract_auth_token(request))
                    
                    if not user_id:
                        
                        abort(403)  # Replace this with your authentication mechanism


    # Fetch users who are not friends with the current user
                    friends_subquery = db.session.query(Friend.user_id).filter(Friend.friend_id == user_id).union(
                        db.session.query(Friend.friend_id).filter(Friend.user_id == user_id)).subquery()

                    non_friend_users = User.query.filter(User.id != user_id, User.id.notin_(friends_subquery)).all()

                    # Convert results to JSON
                    result = [{"id": user.id, "user_name": user.user_name} for user in non_friend_users]

                    return jsonify(result), 200
