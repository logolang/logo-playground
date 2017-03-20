import { UserInfo } from "app/services/login/user-info";

export interface IUsersRepository {
    getAll(overrideAuthToken?: string): Promise<UserInfo[]>
    get(id: string, overrideAuthToken?: string): Promise<UserInfo>
    add(entity: UserInfo): Promise<UserInfo>
    edit(entity: UserInfo): Promise<UserInfo>
    delete(id: string): Promise<void>
}