import { buildValidCpf } from '../../../../domain/common/types/cpf';
import { UserServiceEntity } from '../../../../domain/identity/entity/user.entity';
import { EUserStatus } from '../../../../domain/identity/entity/enums/EUserStatus';
import { validUserMock } from '../../../__mocks__/user.mock';

describe('when constructing a user entity', () => {
  it('should accept a valid user and normalize email and cpf', () => {
    const cpf = buildValidCpf(123456789);
    const entity = new UserServiceEntity(
      validUserMock({
        email: '  Almera.Codes@Email.COM  ',
        cpf: `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`,
        fullName: '  Ana Silva  ',
      }),
    );
    expect(entity.email).toBe('almera.codes@email.com');
    expect(entity.cpf).toBe(cpf);
    expect(entity.fullName).toBe('Ana Silva');
    expect(entity.status).toBe(EUserStatus.PENDING_VERIFICATION);
  });

  it('should reject fullName shorter than 3 characters', () => {
    expect(
      () => new UserServiceEntity(validUserMock({ fullName: 'Ab' })),
    ).toThrow('fullName must be at least 3 characters');
  });

  it('should reject blank fullName', () => {
    expect(
      () => new UserServiceEntity(validUserMock({ fullName: '   ' })),
    ).toThrow('fullName must be at least 3 characters');
  });

  it('should reject invalid email', () => {
    expect(
      () => new UserServiceEntity(validUserMock({ email: 'not-an-email' })),
    ).toThrow('Please provide a valid email address');
  });

  it('should reject blank email', () => {
    expect(
      () => new UserServiceEntity(validUserMock({ email: '  ' })),
    ).toThrow('Please provide a valid email address');
  });

  it('should reject missing phone', () => {
    expect(
      () => new UserServiceEntity(validUserMock({ phone: '  ' })),
    ).toThrow('phone is required');
  });

  it('should reject invalid CPF', () => {
    expect(
      () => new UserServiceEntity(validUserMock({ cpf: '11111111111' })),
    ).toThrow('Please provide a valid CPF');
  });

  it('should reject birthDate with wrong format', () => {
    expect(
      () => new UserServiceEntity(validUserMock({ birthDate: '15/01/1990' })),
    ).toThrow('birthDate must be YYYY-MM-DD');
  });

  it('should reject birthDate that is not a valid calendar date', () => {
    expect(
      () => new UserServiceEntity(validUserMock({ birthDate: '2024-13-45' })),
    ).toThrow('birthDate is not a valid date');
  });

  it('should reject birthDate in the future', () => {
    expect(
      () => new UserServiceEntity(validUserMock({ birthDate: '2099-01-01' })),
    ).toThrow('birthDate cannot be in the future');
  });
});
