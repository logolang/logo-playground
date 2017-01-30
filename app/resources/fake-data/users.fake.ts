import { UserInfo } from 'app/model/entities/user-info';

export const fakeUsers: UserInfo[] = [
    {
        id: 'admin',
        login: 'admin',
        attributes: {
            name: 'Admin',
            editedBy: '',
            editedOn: new Date(0)
        }
    },
]