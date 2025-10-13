import { Routes } from "@angular/router";

export const docRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./doc.component").then((m) => m.DocComponent),
  },
  {
    path: ":section",
    loadComponent: () => import("./doc.component").then((m) => m.DocComponent),
  },
];
