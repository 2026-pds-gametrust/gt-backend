import { ICredential } from '../entity/interfaces/credential.interface';

export interface ICredentialRepositoryRead {
  findByUserId(userId: string): Promise<ICredential | null>;
  findCredentialById(id: string): Promise<ICredential | null>;
}
