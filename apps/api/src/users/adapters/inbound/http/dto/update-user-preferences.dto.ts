import { LOCALES, THEMES, UpdateUserPreferencesRequest } from '@balance/contracts/users';
import { IsIn } from 'class-validator';

/** HTTP body for `PUT /users/me/preferences`; compatible with {@link UpdateUserPreferencesRequest}. */
export class UpdateUserPreferencesDto implements UpdateUserPreferencesRequest {
    @IsIn([...LOCALES])
    public locale: UpdateUserPreferencesRequest['locale'];

    @IsIn([...THEMES])
    public theme: UpdateUserPreferencesRequest['theme'];
}
