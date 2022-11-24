const { v4: uuidv4 } = require('uuid');

class PoemsViewModel{ 
    constructor(PoemId, Title, Text, Likes, Views, isViewedByCurrentUser, isLikedByCurrentUser, CommentIds, AuthorId, Created, UserName, Description){
        this.PoemId = PoemId;
        this.Title = Title;
        this.Text = Text;
        this.Likes = Likes;
        this.Views = Views;
        this.isViewedByCurrentUser = isViewedByCurrentUser;
        this.isLikedByCurrentUser = isLikedByCurrentUser;
        this.CommentIds = CommentIds;
        this.AuthorId = AuthorId;
        this.Created = Created;
        this.UserName = UserName;
        this.Description = Description;
    }
}

module.exports = PoemsViewModel;