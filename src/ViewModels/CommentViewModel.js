const { v4: uuidv4 } = require('uuid');

class CommentViewModel{ 
    constructor(CommentId, UserName, Text, Likes, isLikedByCurrentUser, Created, RepliesId, UpReplyId, PoemId, UserId){
        this.CommentId = CommentId;
        this.UserName = UserName;
        this.Text = Text;
        this.Likes = Likes;
        this.isLikedByCurrentUser = isLikedByCurrentUser;
        this.Created = Created;
        this.RepliesId = RepliesId;
        this.UpReplyId = UpReplyId;
        this.PoemId = PoemId;
        this.UserId = UserId;
    }
}

module.exports = CommentViewModel;