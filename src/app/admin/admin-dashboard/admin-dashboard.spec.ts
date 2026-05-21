import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 6 stat cards', () => {
    expect(component.statCards.length).toBe(6);
  });

  it('should have 6 months of data', () => {
    expect(component.monthlyData.length).toBe(6);
  });

  it('should calculate bar height correctly', () => {
    const height = component.barHeight(component.barMax);
    expect(height).toBe(160);
  });
});
