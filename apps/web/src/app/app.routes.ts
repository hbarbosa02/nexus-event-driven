import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadComponent: () =>
      import("./pages/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "events",
    loadChildren: () =>
      import("./features/events/events.routes").then((m) => m.eventRoutes),
  },
  {
    path: "examples",
    loadChildren: () =>
      import("./features/examples/examples.routes").then(
        (m) => m.exampleRoutes
      ),
  },
  {
    path: "doc",
    loadChildren: () =>
      import("./pages/doc/doc.routes").then((m) => m.docRoutes),
  },
  {
    path: "**",
    redirectTo: "/home",
  },
];
