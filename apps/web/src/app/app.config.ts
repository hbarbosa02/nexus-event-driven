import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MarkdownModule } from "ngx-markdown";

import { routes } from "@/app/app.routes";
import { ApiInterceptor } from "@/app/core/interceptors/api.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: "top",
      })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    importProvidersFrom(MarkdownModule.forRoot()),
    ApiInterceptor,
  ],
};
