export interface Iuser {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone_number?: string;
  address?: Array<string> | string | undefined;
}

export type defaultProfileType = "DEFAULT";
export type sellerProfileType = "SELLER";
export type adminProfileType = "ADMIN";

export type IUserProfileType =
  | defaultProfileType
  | sellerProfileType
  | adminProfileType;
