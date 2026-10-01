import { LOCALES, THEMES, UpdateUserPreferencesRequest } from '@balance/dto/users';
import { ArrayUnique, IsArray, IsIn, IsUUID } from 'class-validator';

/** HTTP body for `PUT /users/me/preferences`; compatible with {@link UpdateUserPreferencesRequest}. */
export class UpdateUserPreferencesDto implements UpdateUserPreferencesRequest {
    @IsIn([...LOCALES])
    public locale: UpdateUserPreferencesRequest['locale'];

    @IsIn([...THEMES])
    public theme: UpdateUserPreferencesRequest['theme'];

    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayUnique()
    public accountOrder: UpdateUserPreferencesRequest['accountOrder'];
}
