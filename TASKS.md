# Tasks

<!-- Очередь реализации Balance. Рядом: [`AGENTS.md`](./AGENTS.md) (как работать) и [`docs/requirements/README.md`](./docs/requirements/README.md) (спеки).
     Формат: https://github.com/tasksmd/tasks.md
     policy: Одна незаблокированная задача за раз; claim — суффикс (@agent-id) на строке задачи.
     policy: Перед кодом прочитать [`AGENTS.md`](./AGENTS.md) и спеки, названные в Details.
     policy: Фича за фичей: контракты и backend этой фичи, затем её frontend, затем следующая. Не копить весь backend до любого frontend. UI фичи не начинать, пока нет её контракта и API. Любое изменение схемы — миграцией.
     policy: Отмечать `- [x]` только когда Acceptance выполнен. После merge закрытые задачи лучше удалять.
     policy: Делать сверху вниз. Первая незакрытая задача без невыполненного Blocked by. Не перескакивать.
     policy: Подсекция — одна фича: BE (контракты + API), затем FE, затем следующая подсекция. -->

### Foundation

- [x] Каркас Nx-монорепо с `apps/web` и `apps/server`
  - **ID**: scaffold-nx-monorepo
  - **Tags**: infra, nx
  - **Details**: Инициализировать Nx workspace; web на React+TS; API на NestJS; базовые libs (`contracts`, заглушки `domain` допустимы; env только в apps, без shared `libs/config`). [`docs/requirements/scope.md`](./docs/requirements/scope.md), ADR-0001, ADR-0011, ADR-0012, [`AGENTS.md`](./AGENTS.md) Target Stack. Вписать реальные команды в [`AGENTS.md`](./AGENTS.md).
  - **Acceptance**: `npx nx graph` работает; проекты `web` и `server` собираются; версия Node совпадает с `.nvmrc`; README описывает, как запустить оба приложения.

- [x] Docker Compose PostgreSQL для локального API
  - **ID**: docker-postgres
  - **Tags**: infra, database
  - **Details**: `docker-compose` (или эквивалент) с Postgres; `.env.example` для подключения; задокументированная команда старта.
  - **Acceptance**: `docker compose up -d` поднимает доступную БД; API подключается через env; секреты не закоммичены.
  - **Blocked by**: scaffold-nx-monorepo

- [x] Каркас общего пакета `libs/dto`
  - **ID**: contracts-skeleton
  - **Tags**: contracts
  - **Details**: TS-библиотека workspace; папки auth, users, accounts, transactions, categories, currencies, common (ошибки и пагинация). Без заглушек budgets/debts/analytics. [`docs/requirements/scope.md`](./docs/requirements/scope.md), [`docs/requirements/contracts.md`](./docs/requirements/contracts.md), [`AGENTS.md`](./AGENTS.md).
  - **Acceptance**: И `server`, и `web` импортируют `@balance/dto`; пустые или placeholder-типы компилируются; граница Nx соблюдена.
  - **Blocked by**: scaffold-nx-monorepo

- [x] Примитивы domain для Money и валюты
  - **ID**: money-currency-domain
  - **Tags**: domain, money
  - **Details**: Decimal-safe `Money` (`amount: string` + валюта); RUB/USD/EUR; помощники точности; unit-тесты. Не использовать JS `number` в арифметике. [`docs/requirements/money.md`](./docs/requirements/money.md), [`docs/requirements/currency.md`](./docs/requirements/currency.md).
  - **Acceptance**: Unit-тесты покрывают сложение, вычитание, сравнение и отклоняют небезопасные пути через `number`; dto экспортирует типы Money и CurrencyCode.
  - **Blocked by**: contracts-skeleton

### Auth

- [x] Схема пользователей и admin seed (без публичной регистрации)
  - **ID**: users-schema
  - **Tags**: backend, auth, database
  - **Details**: Сущность пользователя с хешем пароля и `defaultCurrency`; миграция; пользователи создаются только через seed или admin-путь в БД. [`docs/requirements/auth-security.md`](./docs/requirements/auth-security.md), [`docs/requirements/users-preferences.md`](./docs/requirements/users-preferences.md), ADR-0002.
  - **Acceptance**: Миграция применяется чисто; пользователя можно вставить seed-скриптом; пароль в открытом виде не хранится.
  - **Blocked by**: docker-postgres, money-currency-domain

- [x] API аутентификации JWT (вход, проверка, идентичность)
  - **ID**: auth-jwt
  - **Tags**: backend, auth
  - **Details**: Endpoint входа; access token; guards; Argon2 или bcrypt; JWT payload без чувствительных данных; структурированные ошибки. Контракты запроса и ответа auth. [`docs/requirements/auth-security.md`](./docs/requirements/auth-security.md), [`docs/requirements/contracts.md`](./docs/requirements/contracts.md).
  - **Acceptance**: Вход возвращает JWT; защищённый маршрут отвергает неаутентифицированного; пароли хешируются; типы контракта используются сквозно; есть базовые тесты.
  - **Blocked by**: users-schema, contracts-skeleton

- [ ] Ограничить неудачные попытки входа
  - **ID**: login-attempt-limit
  - **Tags**: backend, auth, security
  - **Details**: [`docs/requirements/auth-security.md`](./docs/requirements/auth-security.md) — защита `POST /auth/login` от подбора пароля.
  - **Acceptance**: 6-я неудача одного email внутри окна даёт 429; другой email всё ещё может войти; успех сбрасывает счётчик email; текст ответа не отличает неизвестный email от неверного пароля; тесты покрывают оба лимита.
  - **Blocked by**: auth-jwt

- [x] Оболочка web-приложения — Carbon, маршруты, вход, хранение JWT
  - **ID**: web-shell-auth
  - **Tags**: frontend, auth, ui
  - **Details**: Desktop-first оболочка (Carbon `lg+`, SideNav и header); страница входа; layout для аутентифицированного пользователя; хранение токена по модели XSS из [`docs/requirements/auth-security.md`](./docs/requirements/auth-security.md). [`docs/requirements/i18n.md`](./docs/requirements/i18n.md), [`docs/requirements/theme.md`](./docs/requirements/theme.md), [`docs/requirements/principles.md`](./docs/requirements/principles.md).
  - **Acceptance**: Пользователь входит через API; защищённые маршруты перенаправляют; виден desktop-хром Carbon; приёмка на широком viewport.
  - **Blocked by**: auth-jwt, scaffold-nx-monorepo

### Preferences

- [x] API настроек пользователя — locale и тема
  - **ID**: user-preferences-api
  - **Tags**: backend, users, preferences
  - **Details**: Хранить `locale` (`en`|`ru`) и `theme` (`light`|`dark`|`system`, по умолчанию `system`) колонками `users`; GET/PUT (или PATCH) `/users/me/preferences`; контракты; миграция; только владелец. [`docs/requirements/users-preferences.md`](./docs/requirements/users-preferences.md), [`docs/requirements/contracts.md`](./docs/requirements/contracts.md).
  - **Acceptance**: Аутентифицированный пользователь читает и обновляет настройки; при отсутствии действуют значения по умолчанию; чужой запрос отвергнут; есть контракты и тесты.
  - **Blocked by**: users-schema, contracts-skeleton, auth-jwt

- [x] i18n (en/ru), переключатель темы Carbon и синхронизация настроек
  - **ID**: i18n-theme-ui
  - **Tags**: frontend, i18n, theme, ui
  - **Details**: Мультиязычный UI; дефолтная локаль на этапе деплоя; переключение языка и темы в приложении; загрузка и сохранение через API настроек. [`docs/requirements/i18n.md`](./docs/requirements/i18n.md), [`docs/requirements/theme.md`](./docs/requirements/theme.md), [`docs/requirements/users-preferences.md`](./docs/requirements/users-preferences.md), [`docs/requirements/principles.md`](./docs/requirements/principles.md).
  - **Acceptance**: Обе локали; переключатель темы на токенах Carbon; `system` следует ОС; настройка переживает перезагрузку и второй браузер.
  - **Blocked by**: web-shell-auth, user-preferences-api

### Currency

- [ ] API справочника валют
  - **ID**: currency-catalog-api
  - **Tags**: backend, currencies, database
  - **Details**: [`docs/requirements/currency.md`](./docs/requirements/currency.md), [`docs/requirements/ERD.md`](./docs/requirements/ERD.md) — таблица `currencies` и read-only API. Миграция создаёт справочник, заполняет RUB/USD/EUR и заменяет `CHECK (currency_code IN ('RUB', 'USD', 'EUR'))` у `accounts.currency_code` и `transactions.currency_code` на внешний ключ к `currencies.key`.
  - **Acceptance**: Миграция создаёт таблицу и три начальные строки; `accounts.currency_code` и `transactions.currency_code` ссылаются на `currencies.key`, старых проверок-списков нет; оба маршрута требуют auth и возвращают хеш; SQL-правка `symbol` меняет `version`; маршрута записи нет; тесты покрывают оба чтения и смену version.
  - **Blocked by**: accounts-api, auth-jwt

- [ ] UI справочника валют
  - **ID**: currency-catalog-ui
  - **Tags**: frontend, currencies
  - **Details**: [`docs/requirements/currency.md`](./docs/requirements/currency.md) — кэш справочника и выбор валюты в UI.
  - **Acceptance**: Тёплый кэш с той же version не вызывает `GET /currencies`; расхождение version заменяет кэш и открытые списки валют; неудачная проверка version не удаляет кэш; при пустом кэше и неудачной загрузке UI не выдумывает RUB/USD/EUR; символы и локализованные названия рисуются по `key`.
  - **Blocked by**: currency-catalog-api, web-shell-auth, i18n-theme-ui

### Accounts

- [x] Domain и API счетов
  - **ID**: accounts-api
  - **Tags**: backend, accounts
  - **Details**: CRUD счетов с явной валютой, `version` и soft-delete; одно пространство приложения; любой аутентифицированный пользователь может CRUD любой счёт (без владельца и membership). Отдельные счета и договорённость, кто каким пользуется, остаются на пользователях. [`docs/requirements/accounts.md`](./docs/requirements/accounts.md), [`docs/requirements/multi-user.md`](./docs/requirements/multi-user.md), [`docs/requirements/idempotency-concurrency.md`](./docs/requirements/idempotency-concurrency.md), [`docs/requirements/auth-security.md`](./docs/requirements/auth-security.md).
  - **Acceptance**: Аутентифицированный пользователь делает CRUD счетов; валюта обязательна; `version` растёт при обновлении; неаутентифицированный отвергнут; есть контракты, миграция и тесты.
  - **Blocked by**: auth-jwt, money-currency-domain

- [x] UI счетов (online CRUD)
  - **ID**: accounts-ui
  - **Tags**: frontend, accounts
  - **Details**: Список, создание и правка счетов через API/dto; ввод денег и валюты без float; баланс по каждому счёту. Без UI владельца и membership. Desktop-таблицы и формы. [`docs/requirements/accounts.md`](./docs/requirements/accounts.md), [`docs/requirements/multi-user.md`](./docs/requirements/multi-user.md), [`docs/requirements/money.md`](./docs/requirements/money.md). Сделано на Dashboard `/`, отдельной страницы `/accounts` нет.
  - **Acceptance**: Полный CRUD online по контрактам; видны валюта и баланс; empty/loading/error; usable на широком viewport.
  - **Blocked by**: web-shell-auth, accounts-api

### Categories

- [x] API категорий (доход и расход)
  - **ID**: categories-api
  - **Tags**: backend, categories
  - **Details**: Раздельные категории дохода и расхода; CRUD; soft-delete; контракты. Имя иконки есть; подкатегорий и цвета нет. [`docs/requirements/categories.md`](./docs/requirements/categories.md).
  - **Acceptance**: CRUD работает; разделение типов соблюдается; есть authz и тесты.
  - **Blocked by**: auth-jwt

- [x] UI категорий (online CRUD)
  - **ID**: categories-ui
  - **Tags**: frontend, categories
  - **Details**: Список, создание и правка категорий дохода и расхода через API/dto. Desktop-таблицы и формы. [`docs/requirements/categories.md`](./docs/requirements/categories.md), [`docs/requirements/money.md`](./docs/requirements/money.md). Сделано на странице настроек `/settings`, отдельной страницы `/categories` нет.
  - **Acceptance**: Полный CRUD online по контрактам; разделение типов видно; empty/loading/error; usable на широком viewport.
  - **Blocked by**: web-shell-auth, categories-api

### Labels

- [ ] Имена удалённых счетов и категорий в истории
  - **ID**: deleted-reference-labels
  - **Tags**: backend, frontend, accounts, categories
  - **Details**: [`docs/requirements/accounts.md`](./docs/requirements/accounts.md), [`docs/requirements/categories.md`](./docs/requirements/categories.md) — история показывает имя и валюту soft-deleted счёта и имя soft-deleted категории.
  - **Acceptance**: Транзакция на удалённый счёт показывает его имя и валюту, на удалённую категорию — её имя. Эти записи не в активном списке и не выбираются для новой операции. `accountId` и `categoryId` истории не обнуляются.
  - **Blocked by**: accounts-api, categories-api, transactions-income-expense

### Transactions

- [x] API транзакций — доход и расход и фильтры атрибуции
  - **ID**: transactions-income-expense
  - **Tags**: backend, transactions
  - **Details**: Создание, список, чтение и soft-delete дохода и расхода: accountId, categoryId, Money, transactionDate, необязательное description (до 64), `createdBy`, version. Фильтр списка: все / я / выбранные userIds. Пагинация (предпочтителен cursor). [`docs/requirements/transactions.md`](./docs/requirements/transactions.md), [`docs/requirements/multi-user.md`](./docs/requirements/multi-user.md), [`docs/requirements/contracts.md`](./docs/requirements/contracts.md).
  - **Acceptance**: Суммы decimal-safe; `createdBy` заполнен; фильтры возвращают нужные подмножества; тип категории совпадает; есть пагинация и тесты.
  - **Blocked by**: accounts-api, categories-api

- [x] API транзакций — переводы между счетами
  - **ID**: transactions-transfer
  - **Tags**: backend, transactions
  - **Details**: Перевод не является обычным расходом; атомарная транзакция БД; связанные ноги или отдельная модель; без скрытой конвертации валют. [`docs/requirements/transactions.md`](./docs/requirements/transactions.md), [`docs/requirements/idempotency-concurrency.md`](./docs/requirements/idempotency-concurrency.md).
  - **Acceptance**: Перевод двигает сумму и не считается чистым расходом; частичный сбой невозможен; тесты покрывают атомарность.
  - **Blocked by**: transactions-income-expense

- [x] UI транзакций — доход, расход, перевод и фильтры видимости
  - **ID**: transactions-ui
  - **Tags**: frontend, transactions
  - **Details**: Создание и список транзакций по существующим API/dto; сценарий перевода; ввод денег в decimal; даты; показ `createdBy`; фильтр все / я (выбор конкретных пользователей отложен до API списка пользователей). Desktop-таблицы и формы на Dashboard `/`. [`docs/requirements/transactions.md`](./docs/requirements/transactions.md), [`docs/requirements/multi-user.md`](./docs/requirements/multi-user.md), [`docs/requirements/money.md`](./docs/requirements/money.md).
  - **Acceptance**: Можно записать доход, расход и перевод; списки пагинируются; суммы верны; атрибуция и фильтры работают; usable на широком viewport.
  - **Blocked by**: accounts-ui, categories-ui, transactions-transfer

- [ ] Убрать неиспользуемый фильтр списка `createdBy`
  - **ID**: drop-created-by-list-filter
  - **Tags**: backend, transactions
  - **Details**: [`docs/requirements/transactions.md`](./docs/requirements/transactions.md), [`docs/requirements/multi-user.md`](./docs/requirements/multi-user.md) — query-фильтр все / я / выбранные пользователи web не вызывает. Убрать его из контракта и API. Поле `createdBy` у транзакции остаётся.
  - **Acceptance**: `GET /transactions` не принимает `createdBy`. Параметра нет в `@balance/dto` и в web-клиенте. Список по счёту, типу и cursor работает как раньше. В ответе и в таблице `createdBy` на месте. Спеки больше не требуют этого фильтра. Тесты на `?createdBy=` удалены.
  - **Blocked by**: transactions-income-expense

- [ ] Идемпотентность мутаций транзакций по operationId
  - **ID**: transactions-operation-id
  - **Tags**: backend, transactions
  - **Details**: [`docs/requirements/transactions.md`](./docs/requirements/transactions.md), [`docs/requirements/idempotency-concurrency.md`](./docs/requirements/idempotency-concurrency.md) — `operationId` на создании и удалении дохода, расхода и перевода.
  - **Acceptance**: Повтор того же `operationId` возвращает результат первого применения, без второй записи и без ошибки «дубликат». Другой `operationId` создаёт другую запись. Контракт и тесты покрывают доход, расход, перевод и удаление.
  - **Blocked by**: transactions-transfer

### Optimistic UI

- [ ] Optimistic UI мутаций и передача operationId
  - **ID**: optimistic-mutations-ui
  - **Tags**: frontend, ui
  - **Details**: [`docs/requirements/principles.md`](./docs/requirements/principles.md), [`docs/requirements/idempotency-concurrency.md`](./docs/requirements/idempotency-concurrency.md) — create/update/delete сразу меняют UI и откатываются при ошибке; клиент шлёт `operationId`.
  - **Acceptance**: Создание и правка счёта, категории и транзакции видны до ответа сервера и после успеха совпадают с ним. Ошибка возвращает прежний UI и показывает сообщение. Повтор мутации транзакции уходит с тем же `operationId` и не создаёт вторую запись.
  - **Blocked by**: transactions-operation-id, accounts-ui, categories-ui, transactions-ui

### i18n

- [ ] Дефолтная локаль на этапе деплоя
  - **ID**: deploy-default-locale
  - **Tags**: frontend, i18n
  - **Details**: [`docs/requirements/i18n.md`](./docs/requirements/i18n.md) — стартовая локаль из переменной деплоя, не зашитый `en`.
  - **Acceptance**: `VITE_DEFAULT_LOCALE=ru` даёт русский до входа и при пустом кэше; `en` и отсутствие переменной оставляют английский; сохранённая настройка пользователя важнее дефолта.
  - **Blocked by**: i18n-theme-ui

### Накопления

- [ ] API целей накоплений
  - **ID**: savings-goals-api
  - **Tags**: backend, savings-goals
  - **Details**: CRUD целей: имя, целевая сумма Money, текущий прогресс (явная сумма или связанный счёт — одна модель), необязательный дедлайн, статус, `createdBy`. Soft-delete общих сущностей. Контракты и миграция. [`docs/requirements/scope.md`](./docs/requirements/scope.md), [`docs/requirements/savings.md`](./docs/requirements/savings.md).
  - **Acceptance**: Создать, обновить и завершить цель через API; decimal-safe; контракты, миграция и тесты; фича Budget не появляется.
  - **Blocked by**: money-currency-domain, accounts-api

- [ ] UI целей накоплений
  - **ID**: savings-goals-ui
  - **Tags**: frontend, savings-goals
  - **Details**: Desktop UI поверх API/dto целей. [`docs/requirements/savings.md`](./docs/requirements/savings.md), [`docs/requirements/principles.md`](./docs/requirements/principles.md).
  - **Acceptance**: Создать, обновить и завершить цель в UI; прогресс виден; empty/loading/error; широкий viewport.
  - **Blocked by**: savings-goals-api, web-shell-auth

### Курсы валют

- [ ] Курсы для конвертации без переписывания истории
  - **ID**: exchange-rates
  - **Tags**: money, backend
  - **Details**: `ExchangeRate`: базовая и котируемая валюта, курс, timestamp, источник. История не пересчитывается текущим курсом без явного выбора. [`docs/requirements/currency.md`](./docs/requirements/currency.md).
  - **Acceptance**: Конвертация принимает timestamp и источник курса; тесты отделяют исторический курс от текущего.
  - **Blocked by**: money-currency-domain

### Аналитика

- [ ] API итогов капитала в валюте отчёта
  - **ID**: capital-analytics-api
  - **Tags**: analytics, money, backend
  - **Details**: Итоги в выбранной валюте отчёта. Смешанные валюты не суммировать без конвертации. Контракты и API. [`docs/requirements/currency.md`](./docs/requirements/currency.md), [`docs/requirements/accounts.md`](./docs/requirements/accounts.md), [`docs/requirements/analytics.md`](./docs/requirements/analytics.md).
  - **Acceptance**: Fixture из нескольких валют даёт верные сконвертированные итоги; контракты и тесты.
  - **Blocked by**: transactions-income-expense, exchange-rates

- [ ] Графики дохода и расхода
  - **ID**: analytics-charts
  - **Tags**: analytics, frontend
  - **Details**: Месяц → доход/расход; разрез по категории; фильтры дата/счёт/`createdBy`/категория. Построить на контрактах capital/analytics. [`docs/requirements/analytics.md`](./docs/requirements/analytics.md). Carbon Charts. Desktop-first.
  - **Acceptance**: Графики рисуются на примерных данных; пустые состояния обработаны; широкий viewport.
  - **Blocked by**: capital-analytics-api, web-shell-auth

### Долги

- [ ] API долгов, кредитов, рассрочек и ипотек
  - **ID**: debts-loans-api
  - **Tags**: backend, debts
  - **Details**: Разное поведение не схлопывать без нужды. Поля: тело, остаток, график, статус. Контракты и миграция. [`docs/requirements/debts.md`](./docs/requirements/debts.md).
  - **Acceptance**: Хотя бы один тип обязательства полностью CRUD, остаток и следующий платёж доступны через API; схема допускает остальные типы; тесты.
  - **Blocked by**: accounts-api, money-currency-domain

- [ ] Базовый UI долгов и кредитов
  - **ID**: debts-loans-ui
  - **Tags**: frontend, debts
  - **Details**: Desktop UI поверх API/dto долгов. [`docs/requirements/debts.md`](./docs/requirements/debts.md), [`docs/requirements/principles.md`](./docs/requirements/principles.md).
  - **Acceptance**: CRUD, остаток и следующий платёж видны в UI; empty/loading/error; широкий viewport.
  - **Blocked by**: debts-loans-api, web-shell-auth

### Импорт и экспорт

- [ ] API импорта и экспорта (JSON/CSV) с предпросмотром
  - **ID**: import-export-api
  - **Tags**: backend, import, export
  - **Details**: Сначала валидация, затем предпросмотр ошибок и дубликатов, затем применение в транзакции, если частичное применение не выбрано явно. Контракты. [`docs/requirements/import-export.md`](./docs/requirements/import-export.md).
  - **Acceptance**: Круговой проход на примерных данных через API; негодный файл отклонён со структурированными ошибками; тесты.
  - **Blocked by**: transactions-income-expense

- [ ] UI импорта и экспорта
  - **ID**: import-export-ui
  - **Tags**: frontend, import, export
  - **Details**: Desktop UI поверх API/dto импорта и экспорта; предпросмотр до применения. [`docs/requirements/import-export.md`](./docs/requirements/import-export.md), [`docs/requirements/principles.md`](./docs/requirements/principles.md).
  - **Acceptance**: Круговой проход из UI на примерных данных; структурированные ошибки показаны; широкий viewport.
  - **Blocked by**: import-export-api, web-shell-auth

### Аудит

- [ ] Журнал аудита финансовых мутаций
  - **ID**: audit-trail
  - **Tags**: backend, audit
  - **Details**: Для важных изменений: актор, сущность, операция, состояние до и после, timestamp. [`docs/requirements/idempotency-concurrency.md`](./docs/requirements/idempotency-concurrency.md), [`docs/requirements/principles.md`](./docs/requirements/principles.md).
  - **Acceptance**: Создание и изменение транзакции пишут запись аудита с актором; секреты не логируются.
  - **Blocked by**: transactions-income-expense

### Категории: подкатегории и цвет

- [ ] Подкатегории и цвет категорий
  - **ID**: category-ux-extensions
  - **Tags**: categories, frontend
  - **Details**: Имя иконки уже есть ([`docs/requirements/categories.md`](./docs/requirements/categories.md)). Подкатегории и цвет требуют расширения контракта и API до UI.
  - **Acceptance**: Создание и список подкатегорий; цвет сохраняется и показывается. Текущее поведение иконки не меняется.
  - **Blocked by**: categories-api

### Пользователи

- [ ] Admin UI для создания пользователей (необязательно; seed в БД остаётся допустимым)
  - **ID**: admin-user-ui
  - **Tags**: auth, frontend
  - **Details**: [`docs/requirements/auth-security.md`](./docs/requirements/auth-security.md) — публичная регистрация по-прежнему не нужна. Использовать существующие контракты auth/user; если endpoint создания администратором отсутствует, сначала расширить backend.
  - **Acceptance**: Уполномоченный администратор создаёт пользователя из UI; пароль хешируется на сервере.
  - **Blocked by**: auth-jwt, web-shell-auth

### Пространства

- [ ] Несколько финансовых пространств (решение не принято)
  - **ID**: multi-space-undecided
  - **Tags**: product, authz
  - **Details**: Решить, нужно ли больше одного финансового пространства или жёсткое деление «личное / общее», `AccountMember` и т.п. **Решения ещё нет; это может не быть построено.** Схему и API не проектировать, пока нет продуктового решения. [`docs/requirements/multi-user.md`](./docs/requirements/multi-user.md).
  - **Acceptance**: Письменное решение: строить или пропустить. Если пропустить — кода нет. Если строить — новые задачи с настоящей моделью, не этот заполнитель.
  - **Blocked by**: accounts-ui, transactions-ui
