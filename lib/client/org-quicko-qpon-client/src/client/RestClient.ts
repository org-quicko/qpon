import { ClientException } from '@org.quicko/core';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { Options } from '../interface';
import { Endpoint } from '../resource';
import { QponCredentials } from '../beans';

export class RestClient {
  protected config: QponCredentials;

  private client: AxiosInstance;

  private baseUrl: string;

  constructor(config: QponCredentials, baseUrl: string) {
    this.client = axios.create();
    this.config = config;
    this.baseUrl = baseUrl;
  }

  async get(options: Options) {
    const headers = {
      'x-api-key': this.config.getApiKey(),
      'x-api-secret': this.config.getApiSecret(),
      ...(options.headers ? options.headers : {}),
    };

    let config: AxiosRequestConfig = {
      headers,
    };

    if (options.headers && options.headers.responseType)
      config = {
        headers,
        responseType: options.headers.responseType,
      };

    return this.client
      .get(Endpoint.build(this.baseUrl, options.url!, options.params, options.queryParams), config)
      .then((response) => {
        if (response.status !== 200) {
          throw new ClientException(response.data.message, response.status);
        }
        return response.data;
      })
      .catch((error) => {
        throw new ClientException(error.response.data.message, error.status);
      });
  }

  async post(url: string, data: unknown, options: Options) {
    const headers = {
      'x-api-key': this.config.getApiKey(),
      'x-api-secret': this.config.getApiSecret(),
      ...(options.headers ? options.headers : {}),
    };

    return this.client
      .post(Endpoint.build(this.baseUrl, url, options.params), data, { headers })
      .then((response) => response.data)
      .catch((error) => {
        throw new ClientException(error.response.data.message, error.response.status);
      });
  }

  async patch(url: string, data: unknown, options: Options) {
    const headers = {
      'x-api-key': this.config.getApiKey(),
      'x-api-secret': this.config.getApiSecret(),
      ...(options.headers ? options.headers : {}),
    };

    return this.client
      .patch(Endpoint.build(this.baseUrl, url, options.params), data, { headers })
      .then((response) => response.data)
      .catch((error) => {
        throw new ClientException(error.response.data.message, error.response.status);
      });
  }

  async delete(url: string, options: Options) {
    const headers = {
      'x-api-key': this.config.getApiKey(),
      'x-api-secret': this.config.getApiSecret(),
      ...(options.headers ? options.headers : {}),
    };

    return this.client
      .delete(Endpoint.build(this.baseUrl, url, options.params), { headers })
      .then((response) => {
        if (response.status !== 200) {
          throw new ClientException(response.data.message, response.status);
        }
        return response.data;
      })
      .catch((error) => {
        throw new ClientException(error.response.data.message, error.response.status);
      });
  }
}
