export class UserInfo {
    id: string
    login: string
    attributes: UserAttributes
}

export class UserAttributes {
    constructor(
        public editedOn: Date,
        public editedBy: string,
        public name: string
    ) {
    }
}
