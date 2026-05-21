import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTopbar } from './admin-topbar';

describe('AdminTopbar', () => {
  let component: AdminTopbar;
  let fixture: ComponentFixture<AdminTopbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminTopbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTopbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
