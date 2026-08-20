import { ICredential } from '../entity/interfaces/credential.interface';

export interface ICredentialRepositoryWrite {
  createCredential(credential: ICredential): Promise<ICredential>;
  deleteByUserId(userId: string): Promise<ICredential | null>;
}
