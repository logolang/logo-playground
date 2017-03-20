import { stay } from '../../utils/async-helpers';
import { FakeDataProvider } from '../../resources/fake-data/fake-data-provider';
import { IUsersRepository } from './users.repository';

import { ICurrentUserProvider } from "app/services/login/current-user.provider";
import { UserInfo } from "app/services/login/user-info";

export class FakeUsersRepository implements IUsersRepository {
    users = FakeDataProvider.getFakeUsers();

    constructor(public currentUser: ICurrentUserProvider) {
    }

    async getAll(overrideAuthToken?: string): Promise<UserInfo[]> {
        await stay(1000);
        return this.users;
    }

    async get(id: string, overrideAuthToken?: string): Promise<UserInfo> {
        const allUsers = await this.getAll(overrideAuthToken);
        const user = allUsers.find(u => u.login == id);
        if (!user) {
            throw new Error(`User was not found by login ${id}`);
        }

        return user;
    }

    async add(entity: UserInfo): Promise<UserInfo> {
        throw new Error('Not implemented');
    }
    async edit(entity: UserInfo): Promise<UserInfo> {
        throw new Error('Not implemented');
    }
    async delete(id: string): Promise<void> {
        throw new Error('Not implemented');
    }
}