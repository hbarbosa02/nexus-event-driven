import { Routes } from "@angular/router";

export const eventRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./components/event-list/event-list.component").then(
        (m) => m.EventListComponent
      ),
  },
  {
    path: "create",
    loadComponent: () =>
      import("./components/event-form/event-form.component").then(
        (m) => m.EventFormComponent
      ),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./components/event-detail/event-detail.component").then(
        (m) => m.EventDetailComponent
      ),
  },
  {
    path: ":id/edit",
    loadComponent: () =>
      import("./components/event-form/event-form.component").then(
        (m) => m.EventFormComponent
      ),
  },
];
