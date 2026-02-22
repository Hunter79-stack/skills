// 钉钉 SDK 类型声明文件

declare module '@alicloud/dingtalk/contact_1_0' {
  export class SearchUserHeaders {
    xAcsDingtalkAccessToken: string;
    constructor(init?: Partial<SearchUserHeaders>);
  }
  
  export class SearchUserRequest {
    queryWord?: string;
    offset?: number;
    size?: number;
    constructor(init?: Partial<SearchUserRequest>);
  }
  
  export interface SearchUserResponseBody {
    list?: string[];  // 返回的是 userid 列表
    totalCount?: number;
    hasMore?: boolean;
  }
  
  export interface SearchUserResponse {
    body?: SearchUserResponseBody;
  }
  
  export default class Client {
    constructor(config: any);
    searchUserWithOptions(
      request: SearchUserRequest,
      headers: SearchUserHeaders,
      runtime: any
    ): Promise<SearchUserResponse>;
  }
}

declare module '@alicloud/dingtalk/oauth2_1_0' {
  export class GetAccessTokenRequest {
    appKey?: string;
    appSecret?: string;
    constructor(init?: Partial<GetAccessTokenRequest>);
  }
  
  export interface GetAccessTokenResponseBody {
    accessToken?: string;
    expireIn?: number;
  }
  
  export interface GetAccessTokenResponse {
    body?: GetAccessTokenResponseBody;
  }
  
  export default class Client {
    constructor(config: any);
    getAccessToken(request: GetAccessTokenRequest): Promise<GetAccessTokenResponse>;
  }
}
