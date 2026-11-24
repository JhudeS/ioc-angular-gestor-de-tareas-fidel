# Formularis

Els dos formularis són reactius (`ReactiveFormsModule`, `FormGroup` i `FormControl` tipats).

## 1. Formulari de cerca (`TaskFilters`)

Fitxers: `src/app/components/task-filters/task-filters.component.{ts,html,scss}`

### Camps i validadors

| Camp | Control | Validadors síncrons | Validador asíncron |
|---|---|---|---|
| Text de cerca (`#filter-text`) | `text: FormControl<string>` | `Validators.minLength(3)`, `Validators.maxLength(40)` | `termHasResultsValidator` |
| Categoria (`#filter-category`) | `category: FormControl<TaskCategory \| ''>` | — | — |

El text buit és vàlid i vol dir "totes les tasques".

### Validador asíncron

- Fitxer: `src/app/validators/term-has-results.validator.ts`
- Funció: `termHasResultsValidator(taskService)`
- Comprova a l'API (`TaskService.countResults`) si hi ha alguna tasca el títol o la descripció de la qual
  conté el terme. Si no n'hi ha cap, retorna l'error `{ noResults: { term } }`.
- Espera 400 ms (`timer`) abans de consultar. Si l'usuari continua escrivint, Angular cancel·la la
  validació anterior.
- No consulta l'API si el terme té menys de 3 caràcters. Si l'API falla, no bloqueja el formulari:
  el banner d'error ja informa del problema.

### Missatges (només quan correspon)

Es mostren quan el camp és `dirty` o `touched`. Estan associats a l'input amb `aria-describedby`
i `aria-invalid`.

| Situació | Missatge | Rol |
|---|---|---|
| `minlength` | El text de cerca ha de tenir almenys 3 caràcters. | `alert` |
| `maxlength` | El text de cerca no pot tenir més de 40 caràcters. | `alert` |
| Validació asíncrona en curs (`pending`) | Comprovant a l'API si hi ha tasques amb «…»… | `status` |
| `noResults` | No hi ha cap tasca a l'API que contingui «…». | `alert` |
| Validació asíncrona correcta | ✔ Hi ha tasques a l'API que contenen «…». | `status` |

### Debounce i emissió de criteris

```ts
merge(this.form.valueChanges.pipe(debounceTime(SEARCH_DEBOUNCE_MS)), this.immediateSearch)
  .pipe(
    filter(() => !this.hasSyncTextError()),
    map(() => this.currentCriteria()),
    distinctUntilChanged((a, b) => a.text === b.text && a.category === b.category),
    takeUntilDestroyed(),
  )
  .subscribe((criteria) => this.criteriaChange.emit(criteria));
```

- **Debounce: 400 ms** (`SEARCH_DEBOUNCE_MS` a `src/app/config/search.config.ts`).
- Els valors amb errors síncrons no s'emeten.
- `distinctUntilChanged` evita repetir la mateixa consulta.
- Els botons **Cercar** i **Netejar cerca** i els clics a l'historial fan una cerca immediata
  (`immediateSearch`), sense esperar el debounce.
- El component emet `criteriaChange`. `App` el rep i crida `TaskService.search(criteria)`, on el
  `switchMap` fa la petició.

### Botó Netejar cerca

Fa `form.reset()`: text buit, totes les categories, i el camp torna a `pristine`, de manera que
s'amaguen els errors. Després llança la cerca de totes les tasques.

### Historial de cerques

- Un terme es desa quan el camp de text passa a `VALID`, és a dir, quan ha superat la validació síncrona
  **i** l'asíncrona i té 3 caràcters o més (`text.statusChanges`).
- `SearchHistoryService.add()` evita els duplicats consecutius i en guarda 5 com a màxim.
- Es mostra sota el formulari ("Cerques recents"). Cada terme és un botó que el posa al camp i torna a
  cercar. També hi ha un botó **Esborrar historial**.
- Clau de localStorage: `gestor-tasques.historial-cerques`. Hi ha `try/catch` a `search-history.service.ts`
  (mètodes `load`, `save` i `clear`).

## 2. Formulari de nova tasca (`TaskForm`)

Fitxers: `src/app/components/task-form/task-form.component.{ts,html,scss}`

| Camp | Validadors |
|---|---|
| Títol (`#new-title`) | `required`, `minLength(3)`, `maxLength(80)` |
| Descripció (`#new-description`) | `maxLength(300)` |
| Categoria (`#new-category`) | `required` |
| Estat (`#new-status`) | valor inicial `Pendent` |
| Data límit (`#new-due-date`, `type="date"`) | `required` |
| Hores estimades (`#new-hours`, `type="number"`) | `required`, `min(0.5)`, `max(200)` |
| Tasca destacada (`#new-featured`, checkbox) | — |

En enviar el formulari:
- Si és invàlid, `markAllAsTouched()` mostra tots els errors.
- Si és vàlid, crida `TaskService.create()` (**POST**). Mentre desa, el botó queda desactivat ("Desant…").
- Quan acaba bé, mostra "S'ha creat la tasca «…» amb l'id …" (`role="status"`), buida el formulari,
  recarrega el llistat i selecciona la tasca nova al detall.
- Si falla, mostra el missatge d'error (`role="alert"`).

## Accessibilitat

- Cada `input`, `select` i `textarea` té un `label for` associat.
- Hi ha `aria-invalid` i `aria-describedby` als camps amb missatges d'error.
- S'utilitzen `role="alert"` per als errors i `role="status"` / `aria-live` per a la càrrega, els
  resultats i les confirmacions.
- El focus és visible a enllaços, botons i camps (`src/styles.scss`).
