import { Routes } from "@angular/router";

export const exampleRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./components/example-list/example-list.component").then(
        (m) => m.ExampleListComponent
      ),
  },
  {
    path: "create",
    loadComponent: () =>
      import("./components/example-form/example-form.component").then(
        (m) => m.ExampleFormComponent
      ),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./components/example-detail/example-detail.component").then(
        (m) => m.ExampleDetailComponent
      ),
  },
  {
    path: ":id/edit",
    loadComponent: () =>
      import("./components/example-form/example-form.component").then(
        (m) => m.ExampleFormComponent
      ),
  },
];
