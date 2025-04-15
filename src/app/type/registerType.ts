//req
export interface IRequestRegisterType {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
//res
export interface IResponseRegisterType {
  username: string;
  email: string;
  id: string;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
