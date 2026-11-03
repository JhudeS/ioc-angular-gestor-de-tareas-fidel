# Nom de l'aplicació
Gestor de Tasques
## Autor/a
Fidel Elvira
## Descripció
Aplicació per consultar un conjunt de tasques, filtrar-les per text i categoria, seleccionar-ne una i veure'n el detall.
## Versions utilitzades
- Node.js 26.3.1
- npm 11.16.0
- Angular CLI 22.2.2
- Angular 22.2
- TypeScript 6.0
- Git 2.54.0
## Com crear i executar el projecte
Creació:
ng new ioc-angular-gestor-de-tareas-fidel --routing --style=scss --ssr=false --standalone --file-name-style-guide=2016 --skip-git --package-manager=npm

Instal·lació i execució:
npm install
ng serve
Obre http://localhost:4200

Proves i compilació:
ng test
ng build
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
- src/app/models/tasks.mock.ts: 12 tasques de mostra.

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

## Enllaç del repositori

https://github.com/JhudeS/ioc-angular-gestor-de-tareas-fidel
