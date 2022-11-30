const { v4: uuidv4 } = require('uuid');

class UserViewModel{
    
    constructor(Id, NickName, Poems, Subscribers, isSubscribedByCurrentUser, LikedPoems, ViewedPoems){
        this.Id = Id;
        this.NickName = NickName;
        this.Poems = Poems;
        this.Subscribers = Subscribers;
        this.isSubscribedByCurrentUser = isSubscribedByCurrentUser
        this.LikedPoems = LikedPoems
        this.ViewedPoems = ViewedPoems
    }
}

module.exports = UserViewModel