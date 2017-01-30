import { UserAttributes, UserInfo } from 'app/model/entities/user-info';

export interface IUsersRepository {
    getAll(overrideAuthToken?: string): Promise<UserInfo[]>
    get(id: string, overrideAuthToken?: string): Promise<UserInfo>
    add(entity: UserInfo): Promise<UserInfo>
    edit(entity: UserInfo): Promise<UserInfo>
    delete(id: string): Promise<void>
}