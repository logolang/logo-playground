export class UserInfo {
    id: string
    attributes: UserAttributes
}

export class UserAttributes {
    constructor(
        public name: string,
        public email: string,
        public imageUrl: string,
    ) {
    }
}
