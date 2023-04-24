from ..app import db, ma, bcrypt, datetime
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    usd_amount = db.Column(db.Float, nullable=False)
    lbp_amount = db.Column(db.Float, nullable=False)
    usd_to_lbp =db.Column(db.Boolean, nullable=False)
    added_date = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),nullable=True)
    
    
    def __init__(self, usd_amount, lbp_amount, usd_to_lbp, user_id=None):
        super(Transaction, self).__init__(usd_amount=usd_amount,
        lbp_amount=lbp_amount, usd_to_lbp=usd_to_lbp,
        user_id=user_id,
        added_date=datetime.datetime.now())
        
class TransactionSchema(ma.Schema):
    class Meta:
        fields = ("id", "usd_amount", "lbp_amount", "usd_to_lbp", "user_id", "added_date")
        model = Transaction
transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)


class TransactionRequests(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    usd_amount = db.Column(db.Float, nullable=False)
    lbp_amount = db.Column(db.Float, nullable=False)
    usd_to_lbp = db.Column(db.Boolean, nullable=False)
    status = db.Column(db.String(20), default='pending')
    added_date = db.Column(db.DateTime)

    
    def __init__( self, sender_id, recipient_id, usd_amount, lbp_amount, usd_to_lbp):
        super(TransactionRequests, self).__init__( sender_id=sender_id, recipient_id=recipient_id, usd_amount=usd_amount, 
                                                  lbp_amount=lbp_amount, usd_to_lbp=usd_to_lbp, status="pending", 
                                                   added_date=datetime.datetime.now())

    
class TransactionRequestSchema(ma.Schema):
    class Meta:
        fields = ("id", "sender_id", "recipient_id", "usd_amount", "lbp_amount", "usd_to_lbp", "status", "added_date")
        model = TransactionRequests
transaction_request_schema = TransactionRequestSchema()
transaction_requests_schema = TransactionRequestSchema(many=True)