import { UserInfo } from 'app/model/entities/user-info';

export const fakeUsers: UserInfo[] = [
    {
        id: 'admin',
        login: 'guest',
        attributes: {
            name: 'Guest',
            editedBy: '',
            editedOn: new Date(0)
        }
    },
]