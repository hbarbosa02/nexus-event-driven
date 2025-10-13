# Padrões Angular

## Arquitetura em Camadas

### 1. Standalone Components (Angular v20.2)
Componentes independentes que não dependem de NgModules.

```typescript
// ✅ Estrutura padrão de um Standalone Component
@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, EventCardComponent, PaginationComponent],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  error: string | null = null;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  async loadEvents(): Promise<void> {
    this.loading = true;
    this.error = null;
    
    try {
      const result = await this.eventService.getEvents();
      this.events = result.data;
    } catch (error) {
      this.error = 'Failed to load events';
      console.error('Error loading events:', error);
    } finally {
      this.loading = false;
    }
  }
}
```

### 2. Services
Serviços para comunicação com API e gerenciamento de estado.

```typescript
// ✅ Estrutura padrão de um Service
@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = environment.apiUrl + '/events';

  constructor(private http: HttpClient) {}

  async getEvents(params?: EventQueryParams): Promise<PaginatedResult<Event>> {
    const httpParams = this.buildHttpParams(params);
    
    return this.http.get<PaginatedResult<Event>>(this.apiUrl, { params: httpParams })
      .pipe(
        map(response => ({
          data: response.data.map(event => this.mapEvent(event)),
          pagination: response.pagination
        })),
        catchError(this.handleError)
      )
      .toPromise() as Promise<PaginatedResult<Event>>;
  }

  async getEventById(id: string): Promise<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`)
      .pipe(
        map(event => this.mapEvent(event)),
        catchError(this.handleError)
      )
      .toPromise() as Promise<Event>;
  }

  async createEvent(event: CreateEventRequest): Promise<Event> {
    return this.http.post<Event>(this.apiUrl, event)
      .pipe(
        map(event => this.mapEvent(event)),
        catchError(this.handleError)
      )
      .toPromise() as Promise<Event>;
  }

  private buildHttpParams(params?: EventQueryParams): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return httpParams;
  }

  private mapEvent(event: any): Event {
    return {
      ...event,
      date: new Date(event.date)
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'An error occurred'));
  }
}
```

## Padrões de Roteamento

### App Routes (Standalone)
```typescript
// ✅ Configuração de rotas standalone
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'events',
    loadChildren: () => import('./features/events/events.routes').then(m => m.eventRoutes)
  },
  {
    path: 'examples',
    loadChildren: () => import('./features/examples/examples.routes').then(m => m.exampleRoutes)
  },
  {
    path: 'doc',
    loadChildren: () => import('./pages/doc/doc.routes').then(m => m.docRoutes)
  },
  { path: '**', redirectTo: '/home' }
];
```

### Feature Routes
```typescript
// ✅ Rotas específicas de um feature
export const eventRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/event-list/event-list.component').then(m => m.EventListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/event-form/event-form.component').then(m => m.EventFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/event-detail/event-detail.component').then(m => m.EventDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/event-form/event-form.component').then(m => m.EventFormComponent)
  }
];
```

## Padrões de Componentes

### Smart Components (Container)
```typescript
// ✅ Componente inteligente que gerencia estado
@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [EventListComponent, EventFormComponent, CommonModule],
  template: `
    <div class="event-management">
      <header class="header">
        <h1>Event Management</h1>
        <button (click)="showCreateForm = !showCreateForm" class="btn-primary">
          {{ showCreateForm ? 'Cancel' : 'Create Event' }}
        </button>
      </header>

      <div class="content">
        <app-event-form 
          *ngIf="showCreateForm"
          (eventCreated)="onEventCreated($event)"
          (cancel)="showCreateForm = false">
        </app-event-form>

        <app-event-list 
          [events]="events"
          [loading]="loading"
          (eventSelected)="onEventSelected($event)"
          (eventDeleted)="onEventDeleted($event)">
        </app-event-list>
      </div>
    </div>
  `,
  styleUrls: ['./event-management.component.scss']
})
export class EventManagementComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  showCreateForm = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  async loadEvents(): Promise<void> {
    this.loading = true;
    try {
      const result = await this.eventService.getEvents();
      this.events = result.data;
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      this.loading = false;
    }
  }

  onEventCreated(event: Event): void {
    this.events.unshift(event);
    this.showCreateForm = false;
  }

  onEventSelected(event: Event): void {
    // Navigate to event detail
  }

  onEventDeleted(eventId: string): void {
    this.events = this.events.filter(e => e.id !== eventId);
  }
}
```

### Dumb Components (Presentation)
```typescript
// ✅ Componente de apresentação reutilizável
@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  template: `
    <div class="event-card" [class.event-card--featured]="event.featured">
      <div class="event-card__header">
        <h3 class="event-card__title">{{ event.title }}</h3>
        <span class="event-card__status" [class]="'status-' + event.status">
          {{ event.status | titlecase }}
        </span>
      </div>

      <div class="event-card__body">
        <p class="event-card__description">{{ event.description }}</p>
        
        <div class="event-card__details">
          <div class="event-card__detail">
            <i class="icon-calendar"></i>
            <span>{{ event.date | dateFormat }}</span>
          </div>
          
          <div class="event-card__detail">
            <i class="icon-location"></i>
            <span>{{ event.location }}</span>
          </div>
          
          <div class="event-card__detail">
            <i class="icon-people"></i>
            <span>{{ event.registeredCount }}/{{ event.capacity }}</span>
          </div>
        </div>
      </div>

      <div class="event-card__actions">
        <button 
          class="btn btn--primary"
          (click)="onViewClick()">
          View Details
        </button>
        
        <button 
          *ngIf="canEdit"
          class="btn btn--secondary"
          (click)="onEditClick()">
          Edit
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent {
  @Input({ required: true }) event!: Event;
  @Input() canEdit = false;
  
  @Output() viewClick = new EventEmitter<Event>();
  @Output() editClick = new EventEmitter<Event>();

  onViewClick(): void {
    this.viewClick.emit(this.event);
  }

  onEditClick(): void {
    this.editClick.emit(this.event);
  }
}
```

## Padrões de Formulários

### Reactive Forms
```typescript
// ✅ Formulário reativo com validação
@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="event-form">
      <div class="form-group">
        <label for="title">Title *</label>
        <input 
          id="title"
          type="text" 
          formControlName="title"
          [class.error]="eventForm.get('title')?.invalid && eventForm.get('title')?.touched">
        
        <div 
          *ngIf="eventForm.get('title')?.invalid && eventForm.get('title')?.touched"
          class="error-message">
          Title is required and must be between 3-100 characters
        </div>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea 
          id="description"
          formControlName="description"
          rows="4"
          maxlength="500">
        </textarea>
        <div class="char-count">
          {{ eventForm.get('description')?.value?.length || 0 }}/500
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="date">Date *</label>
          <input 
            id="date"
            type="datetime-local" 
            formControlName="date">
        </div>

        <div class="form-group">
          <label for="capacity">Capacity *</label>
          <input 
            id="capacity"
            type="number" 
            formControlName="capacity"
            min="1"
            max="10000">
        </div>
      </div>

      <div class="form-group">
        <label for="location">Location *</label>
        <input 
          id="location"
          type="text" 
          formControlName="location">
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          class="btn btn--secondary"
          (click)="onCancel()">
          Cancel
        </button>
        
        <button 
          type="submit" 
          class="btn btn--primary"
          [disabled]="eventForm.invalid || loading">
          {{ loading ? 'Saving...' : 'Save Event' }}
        </button>
      </div>
    </form>
  `,
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  @Input() event?: Event;
  @Output() eventSaved = new EventEmitter<Event>();
  @Output() cancel = new EventEmitter<void>();

  eventForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.eventForm = this.fb.group({
      title: [
        this.event?.title || '', 
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)]
      ],
      description: [
        this.event?.description || '', 
        [Validators.maxLength(500)]
      ],
      date: [
        this.event?.date ? this.formatDateForInput(this.event.date) : '',
        [Validators.required]
      ],
      location: [
        this.event?.location || '', 
        [Validators.required, Validators.minLength(3), Validators.maxLength(200)]
      ],
      capacity: [
        this.event?.capacity || 1, 
        [Validators.required, Validators.min(1), Validators.max(10000)]
      ]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.eventForm.valid) {
      this.loading = true;
      
      try {
        const formValue = this.eventForm.value;
        const eventData: CreateEventRequest = {
          ...formValue,
          date: new Date(formValue.date)
        };

        const event = this.event 
          ? await this.eventService.updateEvent(this.event.id, eventData)
          : await this.eventService.createEvent(eventData);

        this.eventSaved.emit(event);
      } catch (error) {
        console.error('Error saving event:', error);
      } finally {
        this.loading = false;
      }
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
```

## Padrões de Pipes

### Custom Pipes
```typescript
// ✅ Pipe personalizado para formatação
@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string, format: string = 'medium'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      case 'long':
        return date.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      default:
        return date.toLocaleDateString('pt-BR');
    }
  }
}

// ✅ Pipe para truncar texto
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 100, suffix: string = '...'): string {
    if (!value || value.length <= limit) {
      return value;
    }
    
    return value.substring(0, limit).trim() + suffix;
  }
}
```

## Padrões de Diretivas

### Custom Directives
```typescript
// ✅ Diretiva para highlight
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight = '';
  @Input() highlightColor = 'yellow';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}

// ✅ Diretiva para validação de formulário
@Directive({
  selector: '[appFormValidation]',
  standalone: true
})
export class FormValidationDirective {
  @Input() appFormValidation!: AbstractControl;

  @HostBinding('class.error') get hasError(): boolean {
    return this.appFormValidation?.invalid && this.appFormValidation?.touched;
  }

  @HostBinding('class.valid') get isValid(): boolean {
    return this.appFormValidation?.valid && this.appFormValidation?.touched;
  }
}
```

## Padrões de Interceptors

### HTTP Interceptor
```typescript
// ✅ Interceptor para tratamento global de requisições
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private envService: EnvironmentService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adicionar headers padrão
    const apiReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      url: this.envService.get('API_URL') + req.url
    });

    return next.handle(apiReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Redirect to login
        }
        
        return throwError(() => error);
      })
    );
  }
}

// ✅ Interceptor para loading
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private requests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.requests++;
    this.loadingService.setLoading(true);

    return next.handle(req).pipe(
      finalize(() => {
        this.requests--;
        if (this.requests === 0) {
          this.loadingService.setLoading(false);
        }
      })
    );
  }
}
```

## Padrões de Estado

### Service para Estado Global
```typescript
// ✅ Service para gerenciamento de estado
@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  events$ = this.eventsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  // Getters
  get events(): Event[] {
    return this.eventsSubject.value;
  }

  get loading(): boolean {
    return this.loadingSubject.value;
  }

  get error(): string | null {
    return this.errorSubject.value;
  }

  // Actions
  setEvents(events: Event[]): void {
    this.eventsSubject.next(events);
  }

  addEvent(event: Event): void {
    const currentEvents = this.eventsSubject.value;
    this.eventsSubject.next([event, ...currentEvents]);
  }

  updateEvent(updatedEvent: Event): void {
    const currentEvents = this.eventsSubject.value;
    const index = currentEvents.findIndex(e => e.id === updatedEvent.id);
    
    if (index !== -1) {
      currentEvents[index] = updatedEvent;
      this.eventsSubject.next([...currentEvents]);
    }
  }

  removeEvent(eventId: string): void {
    const currentEvents = this.eventsSubject.value;
    this.eventsSubject.next(currentEvents.filter(e => e.id !== eventId));
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  clearError(): void {
    this.errorSubject.next(null);
  }
}
```

## Padrões de Testes

### Unit Tests
```typescript
// ✅ Teste unitário de componente
describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;
  let eventService: jasmine.SpyObj<EventService>;

  beforeEach(async () => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['getEvents']);

    await TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        { provide: EventService, useValue: eventServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    eventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load events on init', async () => {
    // Arrange
    const mockEvents: Event[] = [
      { id: '1', title: 'Test Event', date: new Date(), location: 'Test', capacity: 100, status: 'published' }
    ];
    eventService.getEvents.and.returnValue(Promise.resolve({ data: mockEvents, pagination: {} }));

    // Act
    component.ngOnInit();
    await fixture.whenStable();

    // Assert
    expect(eventService.getEvents).toHaveBeenCalled();
    expect(component.events).toEqual(mockEvents);
    expect(component.loading).toBeFalse();
  });
});
```

### Service Tests
```typescript
// ✅ Teste de service
describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventService]
    });
    
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch events', async () => {
    // Arrange
    const mockEvents: Event[] = [
      { id: '1', title: 'Test Event', date: new Date(), location: 'Test', capacity: 100, status: 'published' }
    ];
    const mockResponse = { data: mockEvents, pagination: {} };

    // Act
    const result = await service.getEvents();

    // Assert
    const req = httpMock.expectOne(`${environment.apiUrl}/events`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    
    expect(result.data).toEqual(mockEvents);
  });
});
```

---

Estes padrões garantem código Angular limpo, testável e manutenível, seguindo as melhores práticas do framework e aproveitando os recursos do Angular v20.2.
