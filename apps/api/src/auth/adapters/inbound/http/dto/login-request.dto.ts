import { LoginRequest } from '@balance/contracts/auth';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

/** HTTP body for the login endpoint; compatible with {@link LoginRequest}. */
export class LoginRequestDto implements LoginRequest {
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail()
    public email: string;

    @IsString()
    @MinLength(1)
    public password: string;
}
