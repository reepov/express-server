const { v4: uuidv4 } = require('uuid');

class UserViewModel{
    
    constructor(Id, NickName, Poems){
        this.Id = Id;
        this.NickName = NickName;
        this.Poems = Poems
    }
}

module.exports = UserViewModel