import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionStages } from './gestion-stages';

describe('GestionStages', () => {
  let component: GestionStages;
  let fixture: ComponentFixture<GestionStages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionStages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionStages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
