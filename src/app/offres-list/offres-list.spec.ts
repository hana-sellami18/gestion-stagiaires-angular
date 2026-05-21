import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffresList } from './offres-list';

describe('OffresList', () => {
  let component: OffresList;
  let fixture: ComponentFixture<OffresList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OffresList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffresList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
