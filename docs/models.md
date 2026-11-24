# Models i adaptador

## Fitxers

| Fitxer | Contingut |
|---|---|
| `src/app/models/task-api.model.ts` | `TaskApiResponse`: estructura exacta que retorna l'API. `TaskApiRequest`: cos del POST. |
| `src/app/models/task.model.ts` | `Task`: model intern de l'aplicació. `NewTask`, `TaskCategory`, `TaskStatus`, `TaskFilterCriteria`. |
| `src/app/adapters/task.adapter.ts` | `adaptTask()`, `adaptTasks()` (API → intern) i `toTaskApiRequest()` (intern → API). |

## Model de l'API (`TaskApiResponse`)

L'API (`tools/api/tasques.json`) fa servir noms en català i *snake_case*, i les dades poden arribar brutes:
espais sobrants, hores en text (`"1,5"`), descripcions buides o absents, `destacada` absent, codis
de categoria i d'estat en minúscula i dates amb hora.

```ts
interface TaskApiResponse {
  id: string;
  titol: string;
  descripcio?: string;
  categoria: string;        // "estudis"
  data_limit: string;       // "2026-11-24T23:55:00"
  estat: string;            // "en_curs"
  hores_estimades: string;  // "6", "1.5", "1,5"
  destacada?: boolean;
}
```

## Model intern (`Task`)

```ts
interface Task {
  id: string;
  title: string;
  description: string;
  category: 'Feina' | 'Estudis' | 'Casa' | 'Salut' | 'Personal';
  dueDate: string;          // YYYY-MM-DD
  status: 'Pendent' | 'En curs' | 'Completada';
  estimatedHours: number;
  featured: boolean;
}
```

## Taula de mapatge API → model intern

| Camp API | Camp intern | Tipus intern | Transformació aplicada | Valor per defecte |
|---|---|---|---|---|
| `id` | `id` | `string` | `String(id).trim()` (json-server v1 genera ids de text) | — |
| `titol` | `title` | `string` | `trim()` i espais interns col·lapsats | `"Tasca sense títol"` |
| `descripcio` | `description` | `string` | `trim()`; text buit o camp absent es substitueix | `"Sense descripció"` |
| `categoria` | `category` | `TaskCategory` | codi normalitzat (sense accents, minúscula) → etiqueta: `estudis` → `Estudis` | `"Personal"` |
| `data_limit` | `dueDate` | `string` | data amb hora → `YYYY-MM-DD`; dates impossibles (p. ex. 31/02) → `""` | `""` (la vista mostra "Sense data") |
| `estat` | `status` | `TaskStatus` | `en_curs`, `EN CURS` o `en-curs` → `En curs` | `"Pendent"` |
| `hores_estimades` | `estimatedHours` | `number` | conversió segura: accepta coma decimal (`"1,5"` → `1.5`); `NaN` o negatius → valor per defecte | `0` |
| `destacada` | `featured` | `boolean` | només és `true` si l'API envia exactament `true` | `false` |

## Accions de normalització

1. **Neteja d'espais** amb `trim()` (`cleanText`).
2. **Conversió numèrica segura** (`toSafeNumber`).
3. **Valors per defecte** per a camps opcionals o absents.
4. **Normalització de categories i estats** (`normalizeCategory`, `normalizeStatus`).
5. **Dates en format coherent** `YYYY-MM-DD` (`normalizeDate`).
6. **Substitució de textos buits** (títol i descripció).

## Transformació inversa (POST)

`toTaskApiRequest()` converteix una `NewTask` del formulari al format de l'API:
`Estudis` → `estudis`, `En curs` → `en_curs`, `2026-12-20` → `2026-12-20T00:00:00`, `2.5` → `"2.5"`.

## La vista només fa servir dades adaptades

Els components reben sempre `Task`, mai `TaskApiResponse`. Per exemple, a
`src/app/components/task-card/task-card.component.html`:

```html
<app-task-badge [label]="task.category" />
<app-task-badge [label]="task.status" [status]="true" />
<span class="title">{{ task.title }}</span>
<span class="date">
  Data límit: {{ task.dueDate ? (task.dueDate | date: 'dd/MM/yyyy') : 'Sense data' }}
</span>
```

## Proves

`src/app/adapters/task.adapter.spec.ts` comprova la normalització, els valors per defecte i la transformació inversa.
