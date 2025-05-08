import { ClientException, LoggerFactory } from '@org.quicko/core';
import winston from 'winston';
import { User as UserBean } from '@org.quicko.qpon/core';
import { instanceToPlain } from 'class-transformer';
import { APIURL } from '../../resource';
import { QponCredentials } from '../../beans';
import { RestClient } from '../RestClient';

export class User extends RestClient {
  private logger: winston.Logger;

  constructor(config: QponCredentials, baseUrl: string) {
    super(config, baseUrl);
    this.logger = this.getLogger();
  }

  async getUser(userId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getUser.name}`);
      this.logger.debug(`Request`, { user_id: userId });

      const response = await super.get({ url: APIURL.FETCH_USER, params: [userId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getUser.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get user', error);
    }
  }

  async getAllUsers(skip: number = 0, take: number = 10) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.getAllUsers.name}`);
      this.logger.debug(`Request`, { skip, take });

      const response = await super.get({
        url: APIURL.FETCH_USER,
        params: [],
        queryParams: { skip: skip, take: take },
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.getAllUsers.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to get users', error);
    }
  }

  async createUser(organizationId: string, data: UserBean) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.createUser.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, data });

      const response = await super.post(APIURL.CREATE_USER, instanceToPlain(data), { params: [organizationId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.createUser.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to create user', error);
    }
  }

  async deleteUser(organizationId: string, userId: string) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.deleteUser.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, user_id: userId });

      const response = await super.delete(APIURL.DELETE_USER, { params: [organizationId, userId] });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.deleteUser.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to delete user', error);
    }
  }

  async updateUser(
    organizationId: string,
    userId: string,
    data: Pick<UserBean, 'name' | 'email' | 'password'>
  ) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateUser.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, user_id: userId, data });

      const response = await super.patch(APIURL.UPDATE_USER, data, {
        params: [organizationId, userId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateUser.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to update user', error);
    }
  }

  async updateUserRole(organizationId: string, userId: string, data: Pick<UserBean, 'role'>) {
    try {
      this.logger.info(`Start Client : ${this.constructor.name},${this.updateUserRole.name}`);
      this.logger.debug(`Request`, { organization_id: organizationId, user_id: userId, data });

      const response = await super.patch(APIURL.UPDATE_USER_ROLE, data, {
        params: [organizationId, userId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(`End Client : ${this.constructor.name},${this.updateUserRole.name}`);

      return response;
    } catch (error) {
      throw new ClientException('Failed to update user role', error);
    }
  }

  async fetchOrganizationsForUser(userId: string) {
    try {
      this.logger.info(
        `Start Client : ${this.constructor.name},${this.fetchOrganizationsForUser.name}`
      );
      this.logger.debug(`Request`, { user_id: userId });

      const response = await super.get({ url: APIURL.FETCH_ORGANIZATIONS_FOR_USER, params: [userId] });

      this.logger.debug(`Response`, response);
      this.logger.info(
        `End Client : ${this.constructor.name},${this.fetchOrganizationsForUser.name}`
      );

      return response;
    } catch (error) {
      throw new ClientException('Failed to fetch organizations for user', error);
    }
  }

  async fetchUsersOfAnOrganization(organizationId: string) {
    try {
      this.logger.info(
        `Start Client : ${this.constructor.name},${this.fetchUsersOfAnOrganization.name}`
      );
      this.logger.debug(`Request`, { organization_id: organizationId });

      const response = await super.get({
        url: APIURL.FETCH_ORGANIZATION_USERS,
        params: [organizationId],
      });

      this.logger.debug(`Response`, response);
      this.logger.info(
        `End Client : ${this.constructor.name},${this.fetchUsersOfAnOrganization.name}`
      );

      return response;
    } catch (error) {
      throw new ClientException('Failed to fetch users for an organization', error);
    }
  }

  public getLogger() {
    if (!this.logger) {
      this.logger = LoggerFactory.getLogger('logger')!;
    }

    return this.logger;
  }
}
