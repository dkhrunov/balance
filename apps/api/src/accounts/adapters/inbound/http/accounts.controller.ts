import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    Account,
    CreateAccountRequest,
    DeleteAccountRequest,
    ListAccountsResponse,
    UpdateAccountRequest,
} from '@balance/contracts/accounts';
import {
    AuthenticatedRequest,
    AuthGuard,
} from '../../../../auth/adapters/inbound/http/guards/auth.guard';
import { CsrfOriginGuard } from '../../../../auth/adapters/inbound/http/guards/csrf-origin.guard';
import {
    CREATE_ACCOUNT_USE_CASE,
    DELETE_ACCOUNT_USE_CASE,
    GET_ACCOUNT_USE_CASE,
    ICreateAccountUseCase,
    IDeleteAccountUseCase,
    IGetAccountUseCase,
    IListAccountsUseCase,
    IUpdateAccountUseCase,
    LIST_ACCOUNTS_USE_CASE,
    UPDATE_ACCOUNT_USE_CASE,
} from '../../../application';
import { CreateAccountDto } from './dto/create-account.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountsController {
    public constructor(
        @Inject(LIST_ACCOUNTS_USE_CASE)
        private readonly listAccountsUseCase: IListAccountsUseCase,
        @Inject(GET_ACCOUNT_USE_CASE)
        private readonly getAccountUseCase: IGetAccountUseCase,
        @Inject(CREATE_ACCOUNT_USE_CASE)
        private readonly createAccountUseCase: ICreateAccountUseCase,
        @Inject(UPDATE_ACCOUNT_USE_CASE)
        private readonly updateAccountUseCase: IUpdateAccountUseCase,
        @Inject(DELETE_ACCOUNT_USE_CASE)
        private readonly deleteAccountUseCase: IDeleteAccountUseCase,
    ) {}

    @Get()
    @UseGuards(AuthGuard)
    public listAccounts(): Promise<ListAccountsResponse> {
        return this.listAccountsUseCase.execute();
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    public getAccount(@Param('id') accountId: string): Promise<Account> {
        return this.getAccountUseCase.execute(accountId);
    }

    @Post()
    @UseGuards(CsrfOriginGuard, AuthGuard)
    public createAccount(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateAccountDto,
    ): Promise<Account> {
        const payload: CreateAccountRequest = {
            name: body.name,
            currency: body.currency,
            initialBalance: body.initialBalance,
            icon: body.icon,
        };

        return this.createAccountUseCase.execute(request.auth.user.id, payload);
    }

    @Put(':id')
    @UseGuards(CsrfOriginGuard, AuthGuard)
    public updateAccount(
        @Req() request: AuthenticatedRequest,
        @Param('id') accountId: string,
        @Body() body: UpdateAccountDto,
    ): Promise<Account> {
        const payload: UpdateAccountRequest = {
            name: body.name,
            icon: body.icon,
            version: body.version,
        };

        return this.updateAccountUseCase.execute(request.auth.user.id, accountId, payload);
    }

    @Delete(':id')
    @UseGuards(CsrfOriginGuard, AuthGuard)
    public deleteAccount(
        @Req() request: AuthenticatedRequest,
        @Param('id') accountId: string,
        @Body() body: DeleteAccountDto,
    ): Promise<Account> {
        const payload: DeleteAccountRequest = {
            version: body.version,
        };

        return this.deleteAccountUseCase.execute(request.auth.user.id, accountId, payload);
    }
}
