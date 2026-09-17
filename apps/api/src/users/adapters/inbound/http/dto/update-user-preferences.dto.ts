import { UpdateUserPreferencesRequest } from '@balance/contracts/users';
import { IsIn } from 'class-validator';

/** HTTP body for `PUT /users/me/preferences`; compatible with {@link UpdateUserPreferencesRequest}. */
export class UpdateUserPreferencesDto implements UpdateUserPreferencesRequest {
    @IsIn(['en', 'ru'])
    public locale: UpdateUserPreferencesRequest['locale'];

    @IsIn(['light', 'dark', 'system'])
    public theme: UpdateUserPreferencesRequest['theme'];
}
