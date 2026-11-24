# Serveis

## API local

| Dada | Valor |
|---|---|
| Eina | `json-server` 1.0.0-beta (devDependency) |
| Fitxer de dades | `tools/api/tasques.json` (12 tasques) |
| Script | `"api": "json-server tools/api/tasques.json --port 4301"` |
| Comanda | `npm run api` |
| URL base | `http://localhost:4301` |
| Endpoint | `http://localhost:4301/tasques` |

La URL base està centralitzada a `src/environments/environment.ts` (`environment.apiUrl`).
Cap component construeix URLs.

### HttpClient

A Angular 22 `HttpClient` està disponible al injector arrel sense cap configuració. **No** s'ha afegit
`provideHttpClient()` a `app.config.ts` perquè no s'utilitzen interceptors ni opcions addicionals.
`HttpClient` s'injecta per primera vegada a `src/app/services/task.service.ts` amb `inject(HttpClient)`.

## `TaskService` (`src/app/services/task.service.ts`)

Únic responsable de comunicar-se amb l'API.

| Membre | Tipus | Descripció |
|---|---|---|
| `tasks` | `Signal<Task[]>` | Tasques de l'última consulta, ja adaptades i filtrades. |
| `loading` | `Signal<boolean>` | `true` mentre hi ha una consulta en curs. |
| `error` | `Signal<string \| null>` | Missatge d'error de l'última consulta. |
| `lastCriteria` | `Signal<TaskFilterCriteria>` | Últims criteris consultats. |
| `search(criteria)` | `void` | Desa els criteris com a última consulta i els envia al flux de cerca. |
| `retry()` | `void` | Torna a enviar `lastCriteria` al flux (botó **Reintentar** i recàrrega després d'un POST). |
| `getTasks(criteria)` | `Observable<Task[]>` | **GET** `/tasques` (amb `?categoria=` si n'hi ha) + adaptador + filtre de text. |
| `countResults(term)` | `Observable<number>` | Nombre de tasques que contenen el terme (validador asíncron). |
| `create(newTask)` | `Observable<Task>` | **POST** `/tasques` amb `toTaskApiRequest()`; retorna la tasca adaptada i recarrega el llistat. |
| `describeError(error)` | `string` | Converteix un `HttpErrorResponse` en un missatge per a l'usuari. |

### Flux de cerca amb `switchMap`

Al constructor de `TaskService`:

```ts
this.searchRequests.pipe(
  tap(() => { loading = true; error = null; }),
  switchMap((criteria) =>
    this.getTasks(criteria).pipe(
      map((tasks) => ({ tasks, error: null })),
      catchError((error) => of({ tasks: [], error: this.describeError(error) })),
    ),
  ),
  takeUntilDestroyed(),
).subscribe(({ tasks, error }) => { /* actualitza tasks, error i loading = false */ });
```

- `searchRequests` és un `Subject<TaskFilterCriteria>`.
- Si arriba una cerca nova abans que acabi l'anterior, `switchMap` **cancel·la la petició HTTP anterior**.
  Així no es poden mostrar resultats desfasats.
- El `catchError` és **dins** del `switchMap`. Per això un error no talla el flux i, després d'un error,
  es pot continuar cercant o reintentar.

### Estats

| Estat | Com es mostra (a `app.component.html`) |
|---|---|
| Càrrega | `<p class="loading" role="status">Carregant tasques des de l'API…</p>` amb un spinner. |
| Error | Banner `role="alert"` amb el missatge i el botó **Reintentar**. |
| Èxit | `app-task-list` amb el comptador `role="status"` ("S'han trobat N tasques"). |

Per veure l'estat de càrrega amb calma, a les DevTools del navegador: **Network → Throttling → Slow 4G / 3G**.

### Reintentar

El servei recorda els últims criteris (`criteriaState`). `retry()` els torna a enviar al mateix flux,
de manera que es repeteix exactament l'última consulta: mateix text i mateixa categoria.

## `SearchHistoryService` (`src/app/services/search-history.service.ts`)

| Membre | Descripció |
|---|---|
| `history` | `Signal<string[]>` amb els termes més recents primer (màxim 5). |
| `add(term)` | Desa el terme si té 3 caràcters o més i **no és igual a l'últim** (evita duplicats consecutius, sense distingir majúscules). |
| `clear()` | Buida l'historial. |

- Clau de localStorage: `gestor-tasques.historial-cerques`.
- `load()`, `save()` i `clear()` tenen `try/catch`. Si localStorage no està disponible, està ple o té
  JSON corrupte, l'aplicació continua funcionant amb l'historial en memòria.

## Proves

- `src/app/services/task.service.spec.ts`: GET + adaptació, paràmetre `categoria`, cancel·lació amb
  `switchMap`, error + reintent i POST.
- `src/app/services/search-history.service.spec.ts`: persistència, duplicats consecutius, límit de 5,
  dades corruptes i errors de localStorage.
