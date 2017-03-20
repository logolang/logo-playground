import { UserInfo } from "app/services/login/user-info";

export const fakeUsers: UserInfo[] = [
    {
        id: 'olek',
        login: 'olek',
        attributes: {
            name: 'Olek',
            editedBy: '',
            editedOn: new Date(0)
        }
    },
    {
        id: 'maksym',
        login: 'maksym',
        attributes: {
            name: 'Maksym',
            editedBy: '',
            editedOn: new Date(0)
        }
    },
]