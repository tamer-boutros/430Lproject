from ..app import db, ma, bcrypt
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(30), unique=True)
    hashed_password = db.Column(db.String(128))
    
    def __init__(self, user_name, password):
        
        super(User, self).__init__(user_name=user_name)
        self.hashed_password = bcrypt.generate_password_hash(password)
    
class user_schema(ma.Schema):
    class Meta:
        fields = ("id", "user_name")
        model = User
user_schema = user_schema()


# Friend model
class Friend(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    friend_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(10), nullable=False)

    def __init__(self, user_id, friend_id, status):
        self.user_id = user_id
        self.friend_id = friend_id
        self.status = status

# Friend schema
class FriendSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Friend

friend_schema = FriendSchema()
friends_schema = FriendSchema(many=True)


