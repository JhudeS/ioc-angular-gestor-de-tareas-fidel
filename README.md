# Nom de l'aplicació
Gestor de Tasques
## Autor/a
Fidel Elvira
## Descripció
Aplicació per consultar tasques des d'una API local, cercar-les per text i categoria (amb validacions i historial de cerques), veure'n el detall i crear-ne de noves.
## Versions utilitzades
- Node.js 26.3.1
- npm 11.16.0
- Angular CLI 22.2.2
- Angular 22.2
- TypeScript 6.0
- RxJS 7.8
- json-server 1.0.0-beta.15 (devDependency)
- Vitest 5.0 (proves unitàries)
- Git 2.54.0
## Com crear i executar el projecte
Creació:
ng new ioc-angular-gestor-de-tareas-fidel --routing --style=scss --ssr=false --standalone --file-name-style-guide=2016 --skip-git --package-manager=npm

Instal·lació:
npm install

Execució (dos terminals):
1. API local: `npm run api` → http://localhost:4301/tasques
2. Angular: `ng serve` (o `npm start`) → http://localhost:4200

Proves i compilació:
npm test
npm run build
## Estat de l'EAC1
- Entorn tècnic verificat.
- Projecte Angular creat amb routing, SCSS i sense SSR.
- Estructura inicial i repositori Git preparats.
- Branques main, ra1-setup, ra2-components, ra3-serveis i ra4-navegacio publicades.
- Pàgina inicial personalitzada a la branca ra1-setup.
## Estat de l'EAC2
Branca de treball: ra2-components

Model i dades:
- src/app/models/task.model.ts: model Task, categories i criteris de filtre.
- src/app/models/tasks.mock.ts: 12 tasques de mostra (substituïdes per l'API a l'EAC3).

Components creats (a src/app/components):
- TaskList (task-list): mostra el comptador, el llistat i el missatge sense resultats.
- TaskCard (task-card): mostra el resum d'una tasca i avisa quan se selecciona.
- TaskBadge (task-badge): mostra la categoria o el distintiu de tasca destacada.
- TaskFilters (task-filters): formulari de cerca per text i categoria amb validacions.
- TaskDetail (task-detail): mostra el detall de la tasca seleccionada.

Accessibilitat i responsive:
- Enllaç de salt al contingut principal i focus visible a enllaços, botons i camps.
- Camps del formulari amb label associat; missatges amb role="alert", role="status" i aria-live.
- Layout de dues columnes en escriptori i d'una sola columna a partir de 768 px d'amplada.

## Estat de l'EAC3
Branca de treball: ra3-serveis (creada a partir de ra2-components)

### API local
- Eina: json-server, instal·lat com a dependència de desenvolupament.
- Fitxer de dades: `tools/api/tasques.json` (12 tasques a la col·lecció `tasques`).
- Script: `"api": "json-server tools/api/tasques.json --port 4301"`.
- URL base: `http://localhost:4301`, centralitzada a `src/environments/environment.ts`.
- Endpoints: `GET /tasques`, `GET /tasques?categoria=estudis`, `POST /tasques`.
- HttpClient: a Angular 22 està disponible per defecte; no s'ha afegit `provideHttpClient()` perquè no hi ha interceptors.

### Models i adaptador
- `src/app/models/task-api.model.ts`: `TaskApiResponse` (resposta exacta de l'API) i `TaskApiRequest` (cos del POST).
- `src/app/models/task.model.ts`: `Task` (model intern), `NewTask`, categories i estats.
- `src/app/adapters/task.adapter.ts`: `adaptTask`, `adaptTasks` i `toTaskApiRequest`. Fa neteja d'espais, conversió numèrica segura, valors per defecte, normalització de categories i estats, i dates en format `YYYY-MM-DD`.

### Serveis
- `src/app/services/task.service.ts` (`TaskService`): GET i POST amb HttpClient, estats `loading`/`error`/`tasks` amb signals, `retry()` de l'última consulta i flux de cerca amb `switchMap`.
- `src/app/services/search-history.service.ts` (`SearchHistoryService`): historial de les 5 últimes cerques vàlides a localStorage (clau `gestor-tasques.historial-cerques`), sense duplicats consecutius i amb `try/catch`.

### Formularis
- `TaskFilters` (`src/app/components/task-filters`): formulari reactiu de cerca amb text (`minLength(3)`, `maxLength(40)`), categoria, validador asíncron `termHasResultsValidator` (`src/app/validators/term-has-results.validator.ts`), debounce de 400 ms, botó Netejar cerca i historial.
- `TaskForm` (`src/app/components/task-form`): formulari reactiu per crear tasques amb POST.

### Errors i accessibilitat
- Banner d'error (`role="alert"`) amb el botó **Reintentar** quan l'API no respon.
- Estat de càrrega amb `role="status"`.
- Plantilles amb `@if`, `@else` i `@for (...; track ...)`.

### Documentació tècnica
- `docs/serveis.md`
- `docs/models.md`
- `docs/formularis.md`

### Proves
`npm test` executa 18 proves amb Vitest: adaptador, TaskService (GET, POST, error, reintent, switchMap), SearchHistoryService (localStorage) i App (càrrega, llistat, banner d'error i reintent).

## Enllaç del repositori

https://github.com/JhudeS/ioc-angular-gestor-de-tareas-fidel

Branca de l'EAC3: https://github.com/JhudeS/ioc-angular-gestor-de-tareas-fidel/tree/ra3-serveis
