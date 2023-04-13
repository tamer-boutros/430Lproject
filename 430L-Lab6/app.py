
from .db_config import DB_CONFIG
import datetime
import jwt

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import request, json
from flask import jsonify
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from flask import abort
from flask_cors import  CORS

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
    
    START_DATE = datetime.datetime.now() - datetime.timedelta(days=3)
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
 
 
 
 