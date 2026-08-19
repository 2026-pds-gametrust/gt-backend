export interface ICredential {
  id: string;
  userId: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt?: Date;
}
